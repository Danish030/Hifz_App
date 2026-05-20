import React, { useState, useCallback, useMemo, useReducer, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { Eye, EyeOff, RotateCcw, ChevronRight, ChevronLeft, Scissors, Link2, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { stripHtml } from '../../utils/helpers';

/* ── Method config ────────────────────────────────────────────────── */
export const METHODS = {
  '20/20': { label: '20 / 20', desc: '20 looking → 20 memory', lookingReps: 20, memoryReps: 20, unitReviewEvery: null },
  '3x3':   { label: '3 × 3',  desc: '3 looking → 3 memory (unit review every 3)', lookingReps: 3,  memoryReps: 3,  unitReviewEvery: 3 },
  '3-10':  { label: '3 – 10', desc: '10 looking → 3 memory', lookingReps: 10, memoryReps: 3,  unitReviewEvery: null },
};

/* ── Reducer ──────────────────────────────────────────────────────── */
const INIT = { method: '20/20', currentStep: 'looking', repetitionCount: 0,
               verseIdx: 0, chunkIdx: null, isReviewing: false,
               versesSeenInUnit: 0, bridgeMode: false };

function reducer(s, a) {
  const m = METHODS[s.method];
  switch (a.type) {
    case 'SET_METHOD': return { ...INIT, method: a.payload };
    case 'SET_VERSE':  return { ...s, verseIdx: a.payload, repetitionCount: 0, currentStep: 'looking', chunkIdx: null, isReviewing: false };
    case 'NEXT_REP': {
      const limit = s.currentStep === 'looking' ? m.lookingReps : m.memoryReps;
      const next  = s.repetitionCount + 1;
      if (next < limit) return { ...s, repetitionCount: next };
      if (s.currentStep === 'looking') return { ...s, currentStep: 'memory', repetitionCount: 0 };
      const seen = s.versesSeenInUnit + 1;
      return { ...s, currentStep: 'looking', repetitionCount: 0, versesSeenInUnit: seen,
               isReviewing: !!(m.unitReviewEvery && seen % m.unitReviewEvery === 0), chunkIdx: null };
    }
    case 'PREV_REP': {
      if (s.repetitionCount > 0) return { ...s, repetitionCount: s.repetitionCount - 1 };
      if (s.currentStep === 'memory') return { ...s, currentStep: 'looking', repetitionCount: m.lookingReps - 1 };
      return s;
    }
    case 'RESET':      return { ...s, currentStep: 'looking', repetitionCount: 0, chunkIdx: null, isReviewing: false };
    case 'SET_CHUNK':  return { ...s, chunkIdx: a.payload, currentStep: 'looking', repetitionCount: 0 };
    case 'CLR_CHUNK':  return { ...s, chunkIdx: null };
    case 'DISMISS_REVIEW': return { ...s, isReviewing: false };
    case 'TOGGLE_BRIDGE':  return { ...s, bridgeMode: !s.bridgeMode };
    default: return s;
  }
}

/* ── Styled components (all using theme tokens) ───────────────────── */
const Wrap = styled.div`
  max-width: 740px;
  margin: 0 auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

/* Method pills */
const MethodGroup = styled.div`
  display: flex;
  padding: 3px;
  background: ${p => p.theme.border};
  border-radius: 10px;
  gap: 2px;
`;
const MethodBtn = styled.button`
  padding: 5px 14px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: ${p => p.$active ? p.theme.teal : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.muted};
`;

/* Icon buttons */
const IconBtn = styled.button`
  width: 34px; height: 34px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.$active ? p.theme.gold : p.theme.border};
  background: ${p => p.$active ? `${p.theme.gold}18` : p.theme.surface};
  color: ${p => p.$active ? p.theme.gold : p.theme.muted};
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
  &:hover { border-color: ${p => p.theme.teal}; color: ${p => p.theme.teal}; }
`;

/* Verse selector */
const VerseSelect = styled.select`
  flex: 1;
  padding: 7px 10px;
  border-radius: 9px;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};
  font-size: 13px;
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.teal}; }
`;

const NavBtn = styled.button`
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.surface};
  color: ${p => p.theme.muted};
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  &:disabled { opacity: 0.3; cursor: default; }
  &:not(:disabled):hover { border-color: ${p => p.theme.teal}; color: ${p => p.theme.teal}; }
`;

/* Main card */
const Card = styled.div`
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 16px;
  background: ${p => p.theme.surface};
  overflow: hidden;
  position: relative;
`;

const StepBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid ${p => p.theme.border};
  background: ${p => p.$memory
    ? `${p.theme.gold}12`
    : `${p.theme.teal}0e`};
  color: ${p => p.$memory ? p.theme.gold : p.theme.teal};
`;

const BadgeRight = styled.span`
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: ${p => p.theme.muted};
`;

/* Arabic text */
const ArabicBox = styled.div`
  font-family: 'UthmanicHafs', 'Traditional Arabic', serif;
  font-size: 30px;
  line-height: 2.2;
  direction: rtl;
  text-align: right;
  padding: 20px 20px 12px;
  color: ${p => p.theme.ink};
  min-height: 90px;
  transition: filter 0.3s;
  filter: ${p => p.$blur ? 'blur(6px)' : 'none'};
  cursor: ${p => p.$blur ? 'pointer' : 'default'};
  user-select: none;
  &:hover { filter: none; }
`;

const BridgeBox = styled(ArabicBox)`
  opacity: 0.35;
  font-size: 22px;
  padding-bottom: 4px;
  border-bottom: 1px dashed ${p => p.theme.border};
  min-height: unset;
`;

const TranslationBox = styled.div`
  font-size: 13px;
  color: ${p => p.theme.muted};
  line-height: 1.7;
  padding: 0 18px 14px;
  border-top: 1px solid ${p => p.theme.border};
  padding-top: 10px;
  margin-top: 4px;
`;

/* Progress area */
const ProgressArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid ${p => p.theme.border};
  flex-wrap: wrap;
`;

const Dots = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 80px;
`;

const Dot = styled.span`
  width: 8px; height: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  background: ${p =>
    p.$done   ? (p.$memory ? p.theme.gold : p.theme.teal) :
    p.$active ? (p.$memory ? `${p.theme.gold}60` : `${p.theme.teal}60`) :
    p.theme.border};
  ${p => p.$active && css`
    box-shadow: 0 0 0 2px ${p.$memory ? p.theme.gold : p.theme.teal}40;
  `}
`;

const RepLabel = styled.span`
  font-size: 11px;
  color: ${p => p.theme.muted};
  white-space: nowrap;
`;

/* Control buttons */
const CtrlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`;

const Btn = styled.button`
  padding: ${p => p.$primary ? '8px 18px' : '7px 12px'};
  border-radius: 9px;
  border: 1.5px solid ${p => p.$primary ? 'transparent' : p.theme.border};
  background: ${p => p.$primary ? p.theme.teal : p.theme.surface};
  color: ${p => p.$primary ? '#fff' : p.theme.muted};
  font-size: 13px;
  font-weight: ${p => p.$primary ? 700 : 500};
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.15s;
  &:hover { opacity: 0.85; }
  &:active { transform: scale(0.97); }
`;

/* SVG ring */
function Ring({ current, total, memory }) {
  const size = 56, r = 22;
  const circ = 2 * Math.PI * r;
  const pct  = total > 0 ? current / total : 0;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
        strokeWidth={4} style={{ color: 'var(--border, #eee)', opacity: 0.4 }} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={memory ? '#c8922a' : '#1d5c63'} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.3s' }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill={memory ? '#c8922a' : '#1d5c63'}
        fontFamily="inherit">{current}</text>
      <text x={size/2} y={size/2 + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize="8.5" fill="#999" fontFamily="inherit">/{total}</text>
    </svg>
  );
}

/* Chunk panel */
const ChunkPanel = styled.div`
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 12px;
  background: ${p => p.theme.surface};
  padding: 12px 14px;
`;

const ChunkHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${p => p.theme.muted};
`;

const ClearLink = styled.button`
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: ${p => p.theme.teal};
  background: none; border: none; cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const ChunkPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 6px;
`;

const ChunkPill = styled.button`
  font-family: 'UthmanicHafs', serif;
  font-size: 18px;
  line-height: 1.8;
  direction: rtl;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.$active ? p.theme.teal : p.theme.border};
  background: ${p => p.$active ? `${p.theme.teal}18` : p.theme.bg};
  color: ${p => p.theme.ink};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${p => p.theme.teal}; }
`;

/* Unit review overlay */
const Overlay = styled.div`
  position: absolute; inset: 0;
  background: ${p => p.theme.bg};
  border-radius: 14px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
`;

const OverlayTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${p => p.theme.teal};
  margin-bottom: 4px;
`;

const ReviewVerse = styled.div`
  width: 100%;
  font-family: 'UthmanicHafs', serif;
  font-size: 24px;
  line-height: 2;
  direction: rtl;
  text-align: right;
  color: ${p => p.theme.ink};
  padding: 10px 14px;
  border-radius: 10px;
  background: ${p => p.theme.bg};
  border: 1.5px solid ${p => p.theme.border};
`;

const ContinueBtn = styled(Btn)`background: ${p => p.theme.teal}; color: #fff; border-color: transparent;`;

/* ── Helpers ─────────────────────────────────────────────────────── */
function wordsText(words) {
  return (words || []).filter(w => w.char_type_name !== 'end')
    .map(w => w.text_qpc_hafs || w.text_uthmani || '').join(' ');
}

function chunkArray(words, size) {
  const real = (words || []).filter(w => w.char_type_name === 'word');
  const out = [];
  for (let i = 0; i < real.length; i += size) out.push(real.slice(i, i + size));
  return out;
}

/* ── Component ───────────────────────────────────────────────────── */
export default function MemorizationEngine() {
  const { state: app } = useApp();
  const { verses }     = app;
  const [eng, dis]     = useReducer(reducer, INIT);
  const [chunkSize, setChunkSize] = useState(3);

  const verse     = verses[eng.verseIdx] || null;
  const prevVerse = eng.verseIdx > 0 ? verses[eng.verseIdx - 1] : null;
  const method    = METHODS[eng.method];
  const isMemory  = eng.currentStep === 'memory';
  const stepLimit = isMemory ? method.memoryReps : method.lookingReps;

  const chunks   = useMemo(() => chunkArray(verse?.words, chunkSize), [verse, chunkSize]);
  const unitVers = useMemo(() => {
    if (!method.unitReviewEvery) return [];
    return verses.slice(Math.max(0, eng.verseIdx - method.unitReviewEvery + 1), eng.verseIdx + 1);
  }, [eng.verseIdx, verses, method]);

  const displayText = eng.chunkIdx !== null && chunks[eng.chunkIdx]
    ? chunks[eng.chunkIdx].map(w => w.text_qpc_hafs || w.text_uthmani || '').join(' ')
    : wordsText(verse?.words);

  const translation = verse?.translations?.[0] ? stripHtml(verse.translations[0].text) : '';

  // keyboard shortcuts
  useEffect(() => {
    const h = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); dis({ type: 'NEXT_REP' }); }
      if (e.key === 'ArrowLeft') dis({ type: 'PREV_REP' });
      if (e.key === 'r') dis({ type: 'RESET' });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!verses.length) return (
    <Wrap style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
      <Layers size={36} strokeWidth={1} style={{ opacity: 0.3 }} />
      <p style={{ fontSize: 14, opacity: 0.5 }}>Load a chapter first.</p>
    </Wrap>
  );

  return (
    <Wrap>

      {/* ── Method + Bridge ───────────────────────────────────── */}
      <Row>
        <MethodGroup>
          {Object.entries(METHODS).map(([k, m]) => (
            <MethodBtn key={k} $active={eng.method === k}
              onClick={() => dis({ type: 'SET_METHOD', payload: k })}>
              {m.label}
            </MethodBtn>
          ))}
        </MethodGroup>
        <IconBtn $active={eng.bridgeMode} onClick={() => dis({ type: 'TOGGLE_BRIDGE' })} title="Bridge mode">
          <Link2 size={15} />
        </IconBtn>
        <span style={{ fontSize: 11, opacity: 0.5 }}>
          {method.desc}
        </span>
      </Row>

      {/* ── Verse selector ────────────────────────────────────── */}
      <Row>
        <NavBtn disabled={eng.verseIdx === 0}
          onClick={() => dis({ type: 'SET_VERSE', payload: eng.verseIdx - 1 })}>
          <ChevronLeft size={16} />
        </NavBtn>
        <VerseSelect value={eng.verseIdx}
          onChange={e => dis({ type: 'SET_VERSE', payload: Number(e.target.value) })}>
          {verses.map((v, i) => (
            <option key={v.id || i} value={i}>
              {v.verse_key} — {(v.words||[]).slice(0,4).map(w=>w.text_qpc_hafs||'').join(' ')}
            </option>
          ))}
        </VerseSelect>
        <NavBtn disabled={eng.verseIdx >= verses.length - 1}
          onClick={() => dis({ type: 'SET_VERSE', payload: eng.verseIdx + 1 })}>
          <ChevronRight size={16} />
        </NavBtn>
      </Row>

      {/* ── Main card ─────────────────────────────────────────── */}
      <Card>
        {eng.isReviewing && (
          <Overlay>
            <OverlayTitle>✓ Unit Review — {unitVers.length} verses completed</OverlayTitle>
            {unitVers.map((v, i) => (
              <ReviewVerse key={i}>{wordsText(v.words)}</ReviewVerse>
            ))}
            <ContinueBtn onClick={() => dis({ type: 'DISMISS_REVIEW' })}>Continue</ContinueBtn>
          </Overlay>
        )}

        {/* Step indicator */}
        <StepBadge $memory={isMemory}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isMemory ? <EyeOff size={13} /> : <Eye size={13} />}
            {isMemory ? 'From Memory' : 'Looking'}
          </span>
          <BadgeRight>{verse?.verse_key} · {method.label}</BadgeRight>
        </StepBadge>

        {/* Bridge */}
        {eng.bridgeMode && prevVerse && (
          <BridgeBox>{wordsText(prevVerse.words)}</BridgeBox>
        )}

        {/* Arabic */}
        <ArabicBox $blur={isMemory} title={isMemory ? 'Hover to peek' : ''}>
          {displayText || <span style={{ fontSize: 14, opacity: 0.4, fontFamily: 'sans-serif' }}>No text</span>}
        </ArabicBox>

        {/* Translation */}
        {translation && <TranslationBox>{translation}</TranslationBox>}

        {/* Progress + controls */}
        <ProgressArea>
          <Ring current={eng.repetitionCount + 1} total={stepLimit} memory={isMemory} />
          <Dots>
            {Array.from({ length: stepLimit }).map((_, i) => (
              <Dot key={i}
                $done={i < eng.repetitionCount}
                $active={i === eng.repetitionCount}
                $memory={isMemory} />
            ))}
          </Dots>
          <RepLabel>rep {eng.repetitionCount + 1}/{stepLimit}</RepLabel>
          <CtrlGroup>
            <Btn onClick={() => dis({ type: 'PREV_REP' })} title="← Prev rep">
              <ChevronLeft size={16} />
            </Btn>
            <Btn onClick={() => dis({ type: 'RESET' })} title="R – Reset">
              <RotateCcw size={15} />
            </Btn>
            <Btn $primary onClick={() => dis({ type: 'NEXT_REP' })}>
              Next <ChevronRight size={16} />
            </Btn>
          </CtrlGroup>
        </ProgressArea>
      </Card>

      {/* ── Chunk panel ───────────────────────────────────────── */}
      {chunks.length > 1 && (
        <ChunkPanel>
          <ChunkHeader>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <Scissors size={12} /> Chunks ({chunks.length} × {chunkSize} words)
            </span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {[2,3,4,5].map(n => (
                <button key={n} onClick={() => { setChunkSize(n); dis({ type:'CLR_CHUNK' }); }}
                  style={{
                    width:22, height:22, borderRadius:5, border:'none', cursor:'pointer',
                    fontSize:11, fontWeight:700,
                    background: chunkSize===n ? '#1d5c63' : 'transparent',
                    color: chunkSize===n ? '#fff' : 'inherit',
                  }}>
                  {n}
                </button>
              ))}
              {eng.chunkIdx !== null && (
                <ClearLink onClick={() => dis({ type:'CLR_CHUNK' })}>✕ clear</ClearLink>
              )}
            </div>
          </ChunkHeader>
          <ChunkPills>
            {chunks.map((ch, i) => (
              <ChunkPill key={i} $active={eng.chunkIdx === i}
                onClick={() => dis({ type: eng.chunkIdx===i ? 'CLR_CHUNK' : 'SET_CHUNK', payload: i })}>
                {ch.slice(0,3).map(w=>w.text_qpc_hafs||'').join(' ')}
              </ChunkPill>
            ))}
          </ChunkPills>
        </ChunkPanel>
      )}

    </Wrap>
  );
}
