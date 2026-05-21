import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useApp } from '../../context/AppContext';
import { SCRIPT_CONFIG, API_BASE } from '../../utils/constants';
import { fetchChapterAudio } from '../../utils/api';

/* ── Styled ─────────────────────────────────────────────────────── */
const Panel = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 14px;
  padding: 24px;
  direction: ltr;
  margin-top: 20px;
`;
const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${p => p.theme.teal};
  margin-bottom: 4px;
`;
const Subtitle = styled.p`
  font-size: 12px;
  color: ${p => p.theme.muted};
  margin-bottom: 20px;
  line-height: 1.5;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;
const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  white-space: nowrap;
`;
const Select = styled.select`
  padding: 7px 10px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 8px;
  font-size: 13px;
  color: ${p => p.theme.ink};
  background: ${p => p.theme.bg};
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.gold}; }
`;
const NumInput = styled.input`
  width: 64px;
  padding: 7px 10px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 8px;
  font-size: 13px;
  color: ${p => p.theme.ink};
  background: ${p => p.theme.bg};
  outline: none;
  &:focus { border-color: ${p => p.theme.gold}; }
`;
const Btn = styled.button`
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  background: ${p => p.$danger ? '#c0392b' : p.theme.teal};
  color: #fff;
  opacity: ${p => p.disabled ? 0.45 : 1};
  transition: opacity 0.15s, background 0.15s;
  &:hover:not(:disabled) { opacity: 0.85; }
`;
const ProgressBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: ${p => p.theme.border};
  overflow: hidden;
  margin-bottom: 12px;
`;
const ProgressFill = styled.div`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.theme.teal};
  transition: width 0.3s;
`;
const CounterText = styled.div`
  font-size: 12px;
  color: ${p => p.theme.muted};
  margin-bottom: 14px;
`;
const VerseDisplay = styled.div`
  font-family: 'UthmanicHafs', 'Traditional Arabic', serif;
  font-size: 28px;
  line-height: 2.4;
  direction: rtl;
  text-align: right;
  padding: 16px;
  background: ${p => p.theme.bg};
  border-radius: 10px;
  border: 1px solid ${p => p.theme.border};
  min-height: 80px;
`;
const ActiveWord = styled.span`
  background: rgba(200,146,42,0.25);
  border-radius: 3px;
  padding: 0 2px;
  transition: background 0.15s;
`;
const InactiveWord = styled.span`padding: 0 2px;`;
const ErrorMsg = styled.p`
  font-size: 13px;
  color: #c0392b;
  margin-top: 8px;
`;

export default function AudioRepeatDrill() {
  const { state } = useApp();
  const { verses, chapter } = state;

  const [verseIdx,     setVerseIdx]     = useState(0);
  const [repeatCount,  setRepeatCount]  = useState(3);
  const [currentRep,   setCurrentRep]   = useState(0);
  const [running,      setRunning]      = useState(false);
  const [activeWord,   setActiveWord]   = useState(null); // word position index
  const [error,        setError]        = useState('');
  const [audioMeta,    setAudioMeta]    = useState(null); // { audio_url, timestamps }

  const audioRef = useRef(null);
  const repRef   = useRef(0);
  const stopRef  = useRef(false);

  /* ── Fetch audio with timestamps on verse/chapter change ───────── */
  useEffect(() => {
    if (!chapter || !verses.length) return;
    setAudioMeta(null);
    setError('');

    (async () => {
      try {
        // segments=true gives per-word timestamps
        const res = await fetch(
          `${API_BASE}/audio/chapter/1/${chapter}?segments=true`
        );
        const d = await res.json();
        setAudioMeta(d.audio_file || null);
      } catch {
        setError('Could not load audio for this chapter.');
      }
    })();
  }, [chapter, verses.length]);

  /* ── Word highlight via timestamps ───────────────────────────── */
  const onTimeUpdate = useCallback(() => {
    if (!audioRef.current || !audioMeta?.timestamps) return;
    const ms = audioRef.current.currentTime * 1000;
    const verse = verses[verseIdx];
    if (!verse) return;

    const verseKey = verse.verse_key;
    const ts = audioMeta.timestamps.find(t => t.verse_key === verseKey);
    if (!ts?.segments) return;

    // Find which word segment we're in
    let found = null;
    for (const [wordIdx, startMs, endMs] of ts.segments) {
      if (ms >= startMs && ms <= endMs) { found = wordIdx; break; }
    }
    setActiveWord(found);
  }, [audioMeta, verseIdx, verses]);

  /* ── Start drill ───────────────────────────────────────────────── */
  const startDrill = useCallback(async () => {
    if (!audioMeta?.audio_url || !verses[verseIdx]) return;
    setError('');
    setRunning(true);
    stopRef.current = false;
    repRef.current  = 0;

    const verse     = verses[verseIdx];
    const ts        = audioMeta.timestamps?.find(t => t.verse_key === verse.verse_key);
    const startSec  = ts ? ts.timestamp_from / 1000 : 0;
    const endSec    = ts ? ts.timestamp_to   / 1000 : null;

    const audio = audioRef.current;
    audio.src   = audioMeta.audio_url;
    await audio.load();

    const playOnce = () => new Promise((resolve, reject) => {
      if (stopRef.current) { resolve(); return; }
      audio.currentTime = startSec;
      audio.play().catch(reject);

      const onEnd = () => {
        audio.removeEventListener('ended', onEnd);
        resolve();
      };
      const onTime = () => {
        if (endSec && audio.currentTime >= endSec) {
          audio.pause();
          audio.removeEventListener('timeupdate', onTime);
          resolve();
        }
      };
      audio.addEventListener('ended', onEnd);
      if (endSec) audio.addEventListener('timeupdate', onTime);
    });

    for (let i = 0; i < repeatCount; i++) {
      if (stopRef.current) break;
      repRef.current = i + 1;
      setCurrentRep(i + 1);
      await playOnce();
      if (!stopRef.current && i < repeatCount - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setRunning(false);
    setActiveWord(null);
    setCurrentRep(0);
  }, [audioMeta, verseIdx, verses, repeatCount]);

  const stopDrill = useCallback(() => {
    stopRef.current = true;
    audioRef.current?.pause();
    setRunning(false);
    setActiveWord(null);
    setCurrentRep(0);
  }, []);

  /* ── Render verse words with highlighting ─────────────────────── */
  const renderVerseWords = () => {
    const verse = verses[verseIdx];
    if (!verse) return null;
    return (verse.words || []).map((w, i) => {
      const text = w.text_qpc_hafs || w.text_uthmani || '';
      if (activeWord !== null && w.position === activeWord) {
        return <ActiveWord key={i}>{text} </ActiveWord>;
      }
      return <InactiveWord key={i}>{text} </InactiveWord>;
    });
  };

  if (!verses.length) {
    return (
      <Panel>
        <Title>🔁 Audio Repeat Drill</Title>
        <Subtitle>Load a chapter first to use this feature.</Subtitle>
      </Panel>
    );
  }

  const pct = repeatCount > 0 ? (currentRep / repeatCount) * 100 : 0;

  return (
    <Panel>
      <Title>🔁 Audio Repeat Drill</Title>
      <Subtitle>
        Select a verse and loop count. The drill plays the verse repeatedly —
        each word is highlighted as it is recited.
      </Subtitle>

      <Row>
        <Label>Verse</Label>
        <Select
          value={verseIdx}
          onChange={e => { setVerseIdx(Number(e.target.value)); stopDrill(); }}
          disabled={running}
        >
          {verses.map((v, i) => (
            <option key={v.id} value={i}>
              {v.verse_key} – {(v.words||[]).slice(0,4).map(w=>w.text_qpc_hafs||'').join(' ')}…
            </option>
          ))}
        </Select>

        <Label>Repeat</Label>
        <NumInput
          type="number" min={1} max={20} value={repeatCount}
          onChange={e => setRepeatCount(Math.max(1, Number(e.target.value)))}
          disabled={running}
        />
        <Label>×</Label>
      </Row>

      {running && (
        <>
          <CounterText>
            Repetition {currentRep} / {repeatCount}
          </CounterText>
          <ProgressBar><ProgressFill $pct={pct} /></ProgressBar>
        </>
      )}

      <VerseDisplay>{renderVerseWords()}</VerseDisplay>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Row style={{ marginTop: 16, marginBottom: 0 }}>
        <Btn onClick={startDrill} disabled={running || !audioMeta}>
          {running ? 'Playing…' : '▶ Start Drill'}
        </Btn>
        {running && (
          <Btn $danger onClick={stopDrill}>■ Stop</Btn>
        )}
      </Row>

      {/* Hidden audio element driven by drill logic */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        style={{ display: 'none' }}
      />
    </Panel>
  );
}
