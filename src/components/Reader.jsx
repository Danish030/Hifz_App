import React, { useMemo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useApp, A } from '../context/AppContext';
import { SCRIPT_CONFIG } from '../utils/constants';
import { groupWordsByLine } from '../utils/helpers';
import { useFontLoader } from '../hooks/useFontLoader';
import { useTooltip } from '../hooks/useTooltip';
import WordSpan from './WordSpan';
import Tooltip from './Tooltip';
import FootnotePopup from './FootnotePopup';
import { fetchFootnote } from '../utils/api';

/* ── Font-size scale (matches CSS vars from original) ────────────── */
const SCALE_FS = { 1:'4vw', 2:'5vw', 3:'28px', 4:'36px', 5:'46px' };
const SCALE_LH = { 1:2.2,  2:2.3,   3:2.6,    4:2.8,    5:3.0    };

/* ── Styled ─────────────────────────────────────────────────────── */
const Outer = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 32px 48px;
  direction: rtl;
  background: ${p => p.theme.bg};

  @media (max-width: 768px) { padding: 20px 16px; }
`;

const EmptyState = styled.div`
  padding: 80px 20px;
  text-align: center;
  direction: ltr;
  .icon { font-size: 48px; opacity: 0.25; margin-bottom: 12px; }
  .text { font-size: 14px; color: ${p => p.theme.muted}; }
`;

const SkeletonLine = styled.div`
  height: 32px;
  border-radius: 6px;
  margin-bottom: 14px;
  background: linear-gradient(90deg,
    ${p => p.theme.border} 25%,
    rgba(0,0,0,0.03) 50%,
    ${p => p.theme.border} 75%);
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
  @keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0 50%} }
`;

const ChapterHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  direction: rtl;
`;
const ReaderToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 18px;
  margin-top:-20px;
  direction: ltr;
`;
const ModeGroup = styled.div`
  display: inline-flex;
  gap: 4px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 999px;
`;
const ModeButton = styled.button`
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: ${p => p.$active ? p.theme.teal : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.muted};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: ${p => p.$active ? p.theme.teal : p.theme.border}; }
`;
const ModeLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
`;
const ChapterArabic = styled.span`
  font-family: 'UthmanicHafs', serif;
  font-size: 40px;
  color: ${p => p.theme.teal};
  display: block;
  margin-bottom: 4px;
`;
const ChapterEn = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: ${p => p.theme.muted};
  direction: ltr;
  display: block;
  text-align: center;
`;
const Bismillah = styled.div`
  font-family: 'UthmanicHafs', serif;
  font-size: 32px;
  color: ${p => p.theme.ink};
  text-align: center;
  direction: rtl;
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid ${p => p.theme.border};
`;

/* ── Translation view ───────────────────────────────────────────── */
const VerseBlock = styled.div`
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid ${p => p.theme.border};
  &:last-child { border-bottom: none; }
`;
const ArabicLine = styled.div`
  font-size: ${p => p.$fs};
  line-height: ${p => p.$lh};
  direction: rtl;
  text-align: right;
  margin-bottom: 12px;
`;
const VerseNumBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 1.5px solid ${p => p.theme.gold};
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: ${p => p.theme.gold};
  margin-right: 8px;
  direction: ltr;
  vertical-align: middle;
  flex-shrink: 0;
`;
const TranslationText = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: ${p => p.theme.muted};
  line-height: 1.8;
  direction: ltr;
  text-align: left;
  margin-top: 8px;
  sup[foot_note] {
    cursor: pointer;
    color: ${p => p.theme.gold};
    font-size: 0.75em;
  }
`;

/* ── Reading (Mushaf) view ──────────────────────────────────────── */
const MushafPage = styled.div`margin-bottom: 40px;`;
const PageLabel  = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: ${p => p.theme.muted};
  text-align: center;
  direction: ltr;
  margin-bottom: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
const MushafLine = styled.div`
  display: flex;
  justify-content: center;
  align-items: baseline;
  direction: rtl;
  font-size: ${p => p.$fs};
  line-height: ${p => p.$lh};
  flex-wrap: wrap;
`;

/* ── Component ──────────────────────────────────────────────────── */
export default function Reader({ isLoading }) {
  const { state, dispatch } = useApp();
  const { verses, chapterMeta, script, view, theme, scale, wbw, translation, chapter } = state;
  const set = useCallback((type, payload) => dispatch({ type, payload }), [dispatch]);

  const cfg = SCRIPT_CONFIG[script];
  const fs  = SCALE_FS[scale] || '28px';
  const lh  = SCALE_LH[scale] || 2.6;

  /* Font loading – only for QCF scripts */
  const loadedPages = useFontLoader(
    cfg.type === 'qcf' ? verses : [],
    cfg.fontVersion,
    theme,
  );

  /* Tooltip */
  const { tooltip, show: showTip, hide: hideTip, move: moveTip } = useTooltip();

  /* Footnote popup */
  const [footnote, setFootnote] = useState(null);

  const handleFootnoteClick = useCallback(async (id) => {
    try {
      const text = await fetchFootnote(id);
      setFootnote(text || 'No content available.');
    } catch {
      setFootnote('Could not load footnote.');
    }
  }, []);

  /* Grouped lines for Mushaf reading view */
  const mushaflLines = useMemo(
    () => (view === 'reading' ? groupWordsByLine(verses) : []),
    [verses, view],
  );

  /* ── Empty / loading states ──────────────────────────────────── */
  if (isLoading) {
    return (
      <Outer>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonLine key={i} />)}
      </Outer>
    );
  }

  if (!verses.length) {
    return (
      <Outer>
        <EmptyState>
          <div className="icon">☽</div>
          <div className="text">Select a Surah and click "Load Chapter"</div>
        </EmptyState>
      </Outer>
    );
  }

  const renderToolbar = () => (
    <ReaderToolbar>
      <ModeGroup>
        <ModeButton $active={view === 'translation'} onClick={() => set(A.SET_VIEW, 'translation')}>
          Verse-by-verse
        </ModeButton>
        <ModeButton $active={view === 'reading'} onClick={() => set(A.SET_VIEW, 'reading')}>
          Mushaf
        </ModeButton>
      </ModeGroup>
    </ReaderToolbar>
  );

  /* ── Shared word renderer ────────────────────────────────────── */
  const renderWord = (word, idx) => (
    <React.Fragment key={word.id ?? `${word.verseKey}-${word.position}-${idx}`}>
      <WordSpan
        word={word}
        scriptConfig={cfg}
        isFontLoaded={loadedPages.has(word.page_number)}
        theme={theme}
        onMouseEnter={wbw ? showTip : undefined}
        onMouseLeave={wbw ? hideTip : undefined}
        onMouseMove={moveTip}
      />
      {' '}
    </React.Fragment>
  );

  /* ── Translation view ─────────────────────────────────────────── */
  const renderTranslationView = () => verses.map(verse => (
    <VerseBlock key={verse.id}>
      <ArabicLine $fs={fs} $lh={lh}>
        <VerseNumBadge>{verse.verse_number}</VerseNumBadge>
        {(verse.words || []).map((w, i) =>
          renderWord({ ...w, verseKey: verse.verse_key }, i)
        )}
      </ArabicLine>

      {translation && verse.translations?.[0] && (
        <TranslationText
          dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
          onClick={e => {
            const sup = e.target.closest('sup[foot_note]');
            if (sup) handleFootnoteClick(sup.getAttribute('foot_note'));
          }}
        />
      )}
    </VerseBlock>
  ));

  /* ── Mushaf reading view ──────────────────────────────────────── */
  const renderReadingView = () => {
    const pages = [...new Set(mushaflLines.map(l => l.pageNum))];
    return pages.map(pageNum => {
      const pageLines = mushaflLines.filter(l => l.pageNum === pageNum);
      return (
        <MushafPage key={pageNum}>
          <PageLabel>Page {pageNum}</PageLabel>
          {pageLines.map(line => (
            <MushafLine
              key={`${line.pageNum}-${line.lineNum}`}
              $fs={fs} $lh={lh}
            >
              {line.words.map((w, i) => renderWord(w, i))}
            </MushafLine>
          ))}
        </MushafPage>
      );
    });
  };

  const showBismillah = chapter !== 9 && chapter !== 1;

  return (
    <>
      <Outer>
        {renderToolbar()}

        {/* Chapter header */}
        {chapterMeta && (
          <ChapterHeader>
            <ChapterArabic>{chapterMeta.name_arabic}</ChapterArabic>
            <ChapterEn>
              {chapterMeta.translated_name?.name} · Surah {chapter}
            </ChapterEn>
          </ChapterHeader>
        )}

        {showBismillah && (
          <Bismillah>بِسۡمِ اللهِ الرَّحۡمٰنِ الرَّحِيۡمِ</Bismillah>
        )}

        {view === 'translation' ? renderTranslationView() : renderReadingView()}
      </Outer>

      {/* Portals */}
      {wbw && <Tooltip tooltip={tooltip} />}
      <FootnotePopup text={footnote} onClose={() => setFootnote(null)} />
    </>
  );
}
