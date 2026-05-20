import React, { memo } from 'react';
import styled from 'styled-components';
import { capitalize } from '../utils/helpers';

const Span = styled.span`
  display: inline-block;
  cursor: pointer;
  padding: 0 3px;
  border-radius: 4px;
  transition: background 0.15s;
  &:hover { background: rgba(200,146,42,0.12); }
`;

const EndMarker = styled(Span)`
  font-family: 'UthmanicHafs', 'Traditional Arabic', serif !important;
  font-size: 0.75em;
  color: ${p => p.theme.muted};
`;

/**
 * Renders a single Quranic word span.
 *
 * Critical rules from QF font docs:
 *  - `char_type_name === 'end'` → always UthmanicHafs Unicode (verse number glyph)
 *  - QCF glyph codes MUST use dangerouslySetInnerHTML (not textContent)
 *  - Font family = `p{page_number}-{version}` once the per-page font is loaded
 *  - Fallback (fonts not yet loaded) → show text_qpc_hafs with opacity 0.8
 */
const WordSpan = memo(function WordSpan({
  word,
  scriptConfig,
  isFontLoaded,
  theme,           // 'light' | 'sepia' | 'dark'  (for Tajweed palette)
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}) {
  const isEnd = word.char_type_name === 'end';

  // ── End markers always use Unicode ──────────────────────────────
  if (isEnd) {
    return (
      <EndMarker
        style={{ fontFamily: "'UthmanicHafs','Traditional Arabic',serif" }}
        data-verse-key={word.verseKey}
      >
        {word.text_qpc_hafs || word.text_uthmani || ''}
      </EndMarker>
    );
  }

  const isQcf = scriptConfig.type === 'qcf';
  const fontVer = scriptConfig.fontVersion;

  const handlers = {
    onMouseEnter: e => onMouseEnter?.(word, e),
    onMouseLeave: onMouseLeave,
    onMouseMove:  e => onMouseMove?.(e),
  };

  // ── QCF: font loaded → inject glyph with innerHTML ──────────────
  if (isQcf && isFontLoaded && word.page_number) {
    const fontFamily = `p${word.page_number}-${fontVer}`;
    const palette = fontVer === 'v4'
      ? `--Tajweed${capitalize(theme)}`
      : undefined;

    return (
      <Span
        style={{
          fontFamily,
          ...(palette ? { fontPalette: palette } : {}),
        }}
        data-v4={fontVer === 'v4' ? '1' : undefined}
        data-verse-key={word.verseKey}
        data-page={word.page_number}
        // QCF glyph codes must use innerHTML — NOT textContent
        dangerouslySetInnerHTML={{ __html: word[scriptConfig.glyphField] || '' }}
        {...handlers}
      />
    );
  }

  // ── QCF: font loading → fallback Unicode ────────────────────────
  if (isQcf) {
    return (
      <Span
        style={{ fontFamily: "'UthmanicHafs','Traditional Arabic',serif", opacity: 0.8 }}
        data-verse-key={word.verseKey}
        {...handlers}
      >
        {word.text_qpc_hafs || ''}
      </Span>
    );
  }

  // ── Unicode scripts (Uthmani / IndoPak) ─────────────────────────
  return (
    <Span
      data-verse-key={word.verseKey}
      {...handlers}
    >
      {word[scriptConfig.glyphField] || word[scriptConfig.fallbackField] || ''}
    </Span>
  );
});

export default WordSpan;
