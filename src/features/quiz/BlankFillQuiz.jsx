import React, { useState, useCallback, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { PenLine, Keyboard, RefreshCw, CheckCheck, Eye, Shuffle, ArrowLeftRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { stripHtml } from '../../utils/helpers';

/* ── Arabic helpers ───────────────────────────────────────────────── */
function norm(str = '') {
  return str.replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0671/g,'\u0627').replace(/[\u0622\u0623\u0625]/g,'\u0627')
    .replace(/\u0629/g,'\u0647').replace(/\u0649/g,'\u064A').trim();
}

/* ── Animations ───────────────────────────────────────────────────── */
const shake = keyframes`0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}`;
const pop   = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.12)}`;

/* ── Shared styled ────────────────────────────────────────────────── */
const Wrap = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${p => p.theme.teal};
`;

const Hint = styled.p`
  font-size: 12px;
  color: ${p => p.theme.muted};
  margin-top: 2px;
`;

/* Mode toggle */
const ModePill = styled.div`
  display: flex;
  padding: 3px;
  background: ${p => p.theme.border};
  border-radius: 10px;
  gap: 2px;
`;
const ModeBtn = styled.button`
  padding: 5px 13px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: ${p => p.$active ? p.theme.teal : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.muted};
  display: flex; align-items: center; gap: 5px;
`;

/* Controls row */
const CtrlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  white-space: nowrap;
`;

const VerseSelect = styled.select`
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border-radius: 9px;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};
  font-size: 13px;
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.teal}; }
`;

const NumBtn = styled.button`
  width: 28px; height: 28px;
  border-radius: 7px;
  border: 1.5px solid ${p => p.$active ? p.theme.teal : p.theme.border};
  background: ${p => p.$active ? `${p.theme.teal}18` : 'transparent'};
  color: ${p => p.$active ? p.theme.teal : p.theme.muted};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
`;

/* Action buttons */
const Btn = styled.button`
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.$primary ? 'transparent' : p.theme.border};
  background: ${p => p.$primary ? p.theme.teal : p.theme.surface};
  color: ${p => p.$primary ? '#fff' : p.theme.ink};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; gap: 5px;
  transition: all 0.15s;
  &:disabled { opacity: 0.4; cursor: default; }
  &:not(:disabled):hover { opacity: 0.85; }
`;

const Score = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${p => p.$ok ? '#16a34a' : p.theme.muted};
  margin-left: auto;
  animation: ${p => p.$ok ? pop : 'none'} 0.4s ease;
`;

/* Arabic display box */
const ArabicBox = styled.div`
  font-family: 'UthmanicHafs', 'Traditional Arabic', serif;
  font-size: 28px;
  line-height: 2.4;
  direction: rtl;
  text-align: right;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};
  min-height: 80px;
`;

const WordSpan = styled.span`padding: 0 3px;`;

const BlankSpan = styled.span`
  display: inline-block;
  padding: 0 2px;
  font-weight: 700;
  color: ${p => p.$ok ? '#16a34a' : p.$wrong ? '#dc2626' : p.theme.teal};
  animation: ${p => p.$ok ? pop : p.$wrong ? shake : 'none'} 0.35s ease;
`;

const BlankInput = styled.input`
  font-family: 'UthmanicHafs', serif;
  font-size: 24px;
  text-align: center;
  direction: rtl;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${p =>
    p.$ok ? '#16a34a' : p.$wrong ? '#dc2626' : p.theme.gold};
  color: ${p => p.$ok ? '#16a34a' : p.$wrong ? '#dc2626' : p.theme.ink};
  outline: none;
  padding: 0 4px;
  transition: border-color 0.2s, color 0.2s;
  animation: ${p => p.$wrong ? shake : 'none'} 0.35s ease;
  vertical-align: middle;
`;

const TransBox = styled.div`
  font-size: 13px;
  color: ${p => p.theme.muted};
  line-height: 1.7;
  padding-top: 10px;
  border-top: 1px solid ${p => p.theme.border};
`;

/* Letter mode */
const LetterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${p => p.theme.border};
  &:last-child { border-bottom: none; }
  flex-wrap: wrap;
`;

const MaskedWord = styled.span`
  font-family: 'UthmanicHafs', serif;
  font-size: 20px;
  direction: rtl;
  color: ${p => p.theme.ink};
  min-width: 70px;
  text-align: right;
`;

const LetterBtn = styled.button`
  width: 38px; height: 38px;
  border-radius: 9px;
  border: 1.5px solid ${p =>
    p.$ok    ? '#16a34a' :
    p.$wrong ? '#dc2626' :
    p.$sel   ? p.theme.teal :
    p.theme.border};
  background: ${p =>
    p.$ok    ? '#dcfce7' :
    p.$wrong ? '#fee2e2' :
    p.$sel   ? `${p.theme.teal}18` :
    p.theme.bg};
  color: ${p =>
    p.$ok    ? '#16a34a' :
    p.$wrong ? '#dc2626' :
    p.theme.ink};
  font-family: 'UthmanicHafs', serif;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s;
  &:disabled { cursor: default; }
  &:not(:disabled):hover { border-color: ${p => p.theme.teal}; }
`;

/* ── Write mode ────────────────────────────────────────────────────── */
function WriteMode({ verse, blankCount, translation }) {
  const words       = useMemo(() => (verse?.words||[]).filter(w=>w.char_type_name==='word'), [verse]);
  const [quiz, setQ]      = useState(null);
  const [revealed, setRev] = useState(false);
  const refs               = useRef({});

  const generate = useCallback(() => {
    if (!words.length) return;
    const n = Math.min(blankCount, words.length);
    const blanks = new Set([...words].sort(()=>Math.random()-.5).slice(0,n).map(w=>w.position));
    setQ({ words, blanks, answers: Object.fromEntries([...blanks].map(p=>[p,''])), states: Object.fromEntries([...blanks].map(p=>[p,'idle'])) });
    setRev(false);
  }, [words, blankCount]);

  const check = useCallback((pos) => {
    if (!quiz || revealed) return;
    const w = quiz.words.find(w=>w.position===pos);
    const ok = quiz.answers[pos] && norm(quiz.answers[pos]) === norm(w?.text_qpc_hafs||w?.text_uthmani||'');
    setQ(q => ({ ...q, states: { ...q.states, [pos]: ok ? 'ok' : quiz.answers[pos] ? 'wrong' : 'idle' } }));
  }, [quiz, revealed]);

  const checkAll = useCallback(() => {
    if (!quiz) return;
    const states = {};
    quiz.words.forEach(w => {
      if (!quiz.blanks.has(w.position)) return;
      const ok = quiz.answers[w.position] && norm(quiz.answers[w.position]) === norm(w.text_qpc_hafs||w.text_uthmani||'');
      states[w.position] = ok ? 'ok' : 'wrong';
    });
    setQ(q => ({ ...q, states }));
  }, [quiz]);

  const score = quiz ? Object.values(quiz.states).filter(s=>s==='ok').length : 0;
  const total = quiz?.blanks.size || 0;
  const allOk = total > 0 && score === total;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <CtrlRow>
        <Btn $primary onClick={generate}><Shuffle size={13}/>{quiz?'New Quiz':'Start Quiz'}</Btn>
        {quiz && <>
          <Btn onClick={checkAll} disabled={revealed}><CheckCheck size={13}/>Check</Btn>
          <Btn onClick={()=>{checkAll();setRev(true);}} disabled={revealed}><Eye size={13}/>Reveal</Btn>
          <Score $ok={allOk}>{score}/{total}{allOk?' 🎉':''}</Score>
        </>}
      </CtrlRow>

      {quiz && (
        <ArabicBox>
          {quiz.words.map((w, i) => {
            const text = w.text_qpc_hafs || w.text_uthmani || '';
            if (!quiz.blanks.has(w.position)) return <WordSpan key={i}>{text} </WordSpan>;
            const st = quiz.states[w.position]||'idle';
            if (revealed) return <BlankSpan key={i} $ok={st==='ok'} $wrong={st==='wrong'}>{text} </BlankSpan>;
            return (
              <span key={i} style={{ verticalAlign:'middle' }}>
                <BlankInput ref={el=>{refs.current[w.position]=el;}}
                  value={quiz.answers[w.position]||''}
                  $ok={st==='ok'} $wrong={st==='wrong'}
                  onChange={e=>setQ(q=>({...q,answers:{...q.answers,[w.position]:e.target.value},states:{...q.states,[w.position]:'idle'}}))}
                  onBlur={()=>check(w.position)}
                  onKeyDown={e=>{if(e.key==='Enter'){check(w.position);e.target.blur();}}}
                  dir="rtl" placeholder="؟"
                  style={{ width:`${Math.max(2.5,(text.length||3)*1.15)}rem` }}
                />{' '}
              </span>
            );
          })}
        </ArabicBox>
      )}
      {quiz && translation && <TransBox>{translation}</TransBox>}
    </div>
  );
}

/* ── Letters mode ─────────────────────────────────────────────────── */
const ARABIC_CHARS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';

function LettersMode({ verse, blankCount, translation }) {
  const words          = useMemo(() => (verse?.words||[]).filter(w=>w.char_type_name==='word'), [verse]);
  const [quiz, setQ]   = useState(null);
  const [rev, setRev]  = useState(false);

  const generate = useCallback(() => {
    if (!words.length) return;
    const n = Math.min(blankCount, words.length);
    const items = [...words].sort(()=>Math.random()-.5).slice(0,n).map(w => {
      const clean  = norm(w.text_qpc_hafs||w.text_uthmani||'');
      const chars  = [...clean];
      const eligible = chars.map((_,i)=>i).filter(i=>i>0 && /[\u0600-\u06FF]/.test(chars[i]));
      const gapIdx = eligible.length ? eligible[Math.floor(Math.random()*eligible.length)] : 1;
      const correct = chars[gapIdx];
      const masked  = chars.map((c,i)=>i===gapIdx?'□':c).join('');
      const dist    = new Set();
      while (dist.size < 3) { const d=ARABIC_CHARS[Math.floor(Math.random()*ARABIC_CHARS.length)]; if(d!==correct) dist.add(d); }
      const choices = [...dist,correct].sort(()=>Math.random()-.5);
      return { word:w, clean, masked, correct, choices, selected:null };
    });
    setQ({ words, blanks:new Set(items.map(it=>it.word.position)), items, map:Object.fromEntries(items.map(it=>[it.word.position,it])) });
    setRev(false);
  }, [words, blankCount]);

  const pick = useCallback((pos, ch) => {
    if (rev) return;
    setQ(q=>({ ...q, map:{ ...q.map, [pos]:{ ...q.map[pos], selected:ch } } }));
  }, [rev]);

  const items  = quiz ? Object.values(quiz.map) : [];
  const score  = items.filter(it=>it.selected===it.correct).length;
  const allOk  = items.length>0 && score===items.length;

  // Build verse display with gaps
  const verseDisplay = quiz ? quiz.words.map((w,i) => {
    const text = w.text_qpc_hafs||w.text_uthmani||'';
    if (!quiz.blanks.has(w.position)) return <WordSpan key={i}>{text} </WordSpan>;
    const it  = quiz.map[w.position];
    const sel = it.selected;
    const ok  = sel===it.correct;
    const show = rev || sel!==null;
    const disp = it.masked.replace('□', show ? (rev?it.correct:sel) : '□');
    return <BlankSpan key={i} $ok={show&&ok} $wrong={show&&sel&&!ok}>{disp} </BlankSpan>;
  }) : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <CtrlRow>
        <Btn $primary onClick={generate}><Shuffle size={13}/>{quiz?'New Quiz':'Start Quiz'}</Btn>
        {quiz && items.length>0 && <>
          <Btn onClick={()=>setRev(true)} disabled={rev}><Eye size={13}/>Reveal</Btn>
          <Score $ok={allOk}>{score}/{items.length}{allOk?' 🎉':''}</Score>
        </>}
      </CtrlRow>

      {quiz && <>
        <ArabicBox>{verseDisplay}</ArabicBox>

        <div style={{ display:'flex', flexDirection:'column' }}>
          {items.map((it,i) => (
            <LetterRow key={i}>
              <MaskedWord dir="rtl">{it.masked}</MaskedWord>
              <div style={{ display:'flex', gap:6 }}>
                {it.choices.map((ch,j) => {
                  const sel  = it.selected===ch;
                  const ok   = ch===it.correct;
                  const show = rev || it.selected!==null;
                  return (
                    <LetterBtn key={j}
                      onClick={() => pick(it.word.position, ch)}
                      disabled={it.selected!==null || rev}
                      $sel={sel && !show}
                      $ok={show && ok}
                      $wrong={show && sel && !ok}>
                      {ch}
                    </LetterBtn>
                  );
                })}
              </div>
            </LetterRow>
          ))}
        </div>

        {translation && <TransBox>{translation}</TransBox>}
      </>}
    </div>
  );
}

/* ── Word Order Mode ──────────────────────────────────────────────── */

/* Tile that can be "placed" or "unplaced" */
const Tile = styled.button`
  font-family: 'UthmanicHafs', 'Traditional Arabic', serif;
  font-size: 22px;
  line-height: 1.9;
  direction: rtl;
  padding: 5px 14px;
  border-radius: 9px;
  border: 1.5px solid ${p =>
    p.$correct ? '#16a34a' :
    p.$wrong   ? '#dc2626' :
    p.$placed  ? p.theme.teal :
    p.theme.border};
  background: ${p =>
    p.$correct ? '#dcfce720' :
    p.$wrong   ? '#fee2e220' :
    p.$placed  ? `${p.theme.teal}18` :
    p.theme.bg};
  color: ${p =>
    p.$correct ? '#16a34a' :
    p.$wrong   ? '#dc2626' :
    p.theme.ink};
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  transition: all 0.15s;
  animation: ${p => p.$correct ? pop : p.$wrong ? shake : 'none'} 0.35s ease;
  &:not(:disabled):hover {
    border-color: ${p => p.theme.teal};
    transform: translateY(-2px);
    box-shadow: 0 4px 10px ${p => p.theme.shadow};
  }
`;

const TileZone = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;   /* RTL flow */
  gap: 6px;
  min-height: 56px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.5px dashed ${p => p.$active ? p.theme.teal : p.theme.border};
  background: ${p => p.$active ? `${p.theme.teal}06` : 'transparent'};
  transition: border-color 0.2s, background 0.2s;
  align-items: center;
`;

const ZoneLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  margin-bottom: 6px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${p => p.theme.border};
  margin: 4px 0;
`;

function WordOrderMode({ verse, translation }) {
  const words = useMemo(() =>
    (verse?.words || []).filter(w => w.char_type_name === 'word'),
  [verse]);

  // Each item: { id, text, originalIdx }
  const makeItems = useCallback(() =>
    words.map((w, i) => ({
      id:          `${w.position ?? i}-${i}`,
      text:        w.text_qpc_hafs || w.text_uthmani || '',
      originalIdx: i,
    })),
  [words]);

  const [bank,     setBank]     = useState([]);   // shuffled pool (bottom)
  const [answer,   setAnswer]   = useState([]);   // user's placed order (top)
  const [checked,  setChecked]  = useState(false);
  const [result,   setResult]   = useState([]);   // per-tile: 'correct'|'wrong'|null

  // Generate: shuffle word bank, clear answer
  const generate = useCallback(() => {
    const items = makeItems();
    setBank([...items].sort(() => Math.random() - 0.5));
    setAnswer([]);
    setChecked(false);
    setResult([]);
  }, [makeItems]);

  // Move tile from bank → answer (append RTL: unshift so display flows correctly)
  const pickFromBank = useCallback((id) => {
    if (checked) return;
    setBank(b => b.filter(t => t.id !== id));
    setAnswer(a => {
      const tile = bank.find(t => t.id === id);
      return tile ? [...a, tile] : a;
    });
  }, [bank, checked]);

  // Move tile from answer → bank
  const returnToBank = useCallback((id) => {
    if (checked) return;
    setAnswer(a => a.filter(t => t.id !== id));
    setBank(b => {
      const tile = answer.find(t => t.id === id);
      return tile ? [...b, tile] : b;
    });
  }, [answer, checked]);

  // Check: compare answer order to original order
  const check = useCallback(() => {
    if (!answer.length) return;
    const res = answer.map((tile, i) => tile.originalIdx === i ? 'correct' : 'wrong');
    setResult(res);
    setChecked(true);
  }, [answer]);

  // Reveal: place all words in correct order
  const reveal = useCallback(() => {
    const items = makeItems();
    setAnswer(items);
    setBank([]);
    const res = items.map(() => 'correct');
    setResult(res);
    setChecked(true);
  }, [makeItems]);

  const correctCount = result.filter(r => r === 'correct').length;
  const allCorrect   = checked && correctCount === answer.length && answer.length === words.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <CtrlRow>
        <Btn $primary onClick={generate}><Shuffle size={13} />{answer.length || bank.length ? 'New Quiz' : 'Start Quiz'}</Btn>
        {(answer.length > 0 || bank.length > 0) && <>
          <Btn onClick={check}   disabled={checked || bank.length > 0}><CheckCheck size={13} />Check</Btn>
          <Btn onClick={reveal}  disabled={checked}><Eye size={13} />Reveal</Btn>
          <Btn onClick={generate}><RefreshCw size={13} />Reset</Btn>
          {checked && (
            <Score $ok={allCorrect}>{correctCount}/{words.length}{allCorrect ? ' 🎉' : ''}</Score>
          )}
        </>}
      </CtrlRow>

      {(answer.length > 0 || bank.length > 0) && (<>

        {/* Answer zone — user builds the verse here */}
        <div>
          <ZoneLabel>Your order</ZoneLabel>
          <TileZone $active={answer.length > 0}>
            {answer.length === 0
              ? <span style={{ fontSize: 13, opacity: 0.35, fontFamily: 'sans-serif', direction: 'ltr' }}>
                  Tap words below to place them here
                </span>
              : answer.map((tile, i) => (
                  <Tile key={tile.id}
                    $placed={!checked}
                    $correct={checked && result[i] === 'correct'}
                    $wrong  ={checked && result[i] === 'wrong'}
                    disabled={checked}
                    onClick={() => returnToBank(tile.id)}
                    title="Tap to return">
                    {tile.text}
                  </Tile>
                ))
            }
          </TileZone>
        </div>

        {!checked && bank.length > 0 && <Divider />}

        {/* Word bank — shuffled pool */}
        {!checked && (
          <div>
            <ZoneLabel>Word bank</ZoneLabel>
            <TileZone>
              {bank.map(tile => (
                <Tile key={tile.id}
                  onClick={() => pickFromBank(tile.id)}
                  title="Tap to place">
                  {tile.text}
                </Tile>
              ))}
            </TileZone>
          </div>
        )}

        {translation && <TransBox>{translation}</TransBox>}
      </>)}
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────────────── */
export default function BlankFillQuiz() {
  const { state }       = useApp();
  const { verses }      = state;
  const [verseIdx,  setV] = useState(0);
  const [blankCount,setB] = useState(3);
  const [mode, setMode]   = useState('order');

  const verse = verses[verseIdx]||null;
  const trans = verse?.translations?.[0] ? stripHtml(verse.translations[0].text) : '';

  if (!verses.length) return (
    <Wrap style={{ alignItems:'center', justifyContent:'center', paddingTop:60 }}>
      <PenLine size={36} strokeWidth={1} style={{ opacity:0.3 }} />
      <p style={{ fontSize:14, opacity:0.5 }}>Load a chapter first.</p>
    </Wrap>
  );

  return (
    <Wrap>
      <Header>
        <div>
          <Title>Blank-Fill Quiz</Title>
          <Hint>{mode==='write' ? 'Type the missing Arabic word.' : mode==='letters' ? 'Tap the correct missing letter.' : 'Arrange the words in the correct order.'}</Hint>
        </div>
        <ModePill>
          <ModeBtn $active={mode==='order'}   onClick={()=>setMode('order')}>  <ArrowLeftRight size={12}/>Order</ModeBtn>
          <ModeBtn $active={mode==='write'}   onClick={()=>setMode('write')}>  <PenLine size={12}/>Write</ModeBtn>
          <ModeBtn $active={mode==='letters'} onClick={()=>setMode('letters')}><Keyboard size={12}/>Letters</ModeBtn>
        </ModePill>
      </Header>

      <CtrlRow>
        <Label>Verse</Label>
        <VerseSelect value={verseIdx} onChange={e=>setV(Number(e.target.value))}>
          {verses.map((v,i)=><option key={v.id||i} value={i}>{v.verse_key}</option>)}
        </VerseSelect>
      </CtrlRow>

      {mode !== 'order' && (
        <CtrlRow>
          <Label>Blanks</Label>
          {[1,2,3,4,5].map(n=>(
            <NumBtn key={n} $active={blankCount===n} onClick={()=>setB(n)}>{n}</NumBtn>
          ))}
        </CtrlRow>
      )}

      <div style={{ borderRadius:12, border:`1.5px solid`, borderColor:'var(--border)', background:'var(--surface)', padding:16 }}>
        {mode==='order'
          ? <WordOrderMode verse={verse} translation={trans}/>
          : mode==='write'
          ? <WriteMode   verse={verse} blankCount={blankCount} translation={trans}/>
          : <LettersMode verse={verse} blankCount={blankCount} translation={trans}/>}
      </div>
    </Wrap>
  );
}
