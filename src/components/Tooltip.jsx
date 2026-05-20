import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Bubble = styled.div`
  position: fixed;
  z-index: 500;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px ${p => p.theme.shadow};
  font-size: 13px;
  direction: ltr;
  text-align: left;
  max-width: 220px;
  pointer-events: none;
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.12s;
  left: ${p => p.$x}px;
  top:  ${p => p.$y}px;
`;

const Arabic = styled.div`
  font-family: 'UthmanicHafs', serif;
  font-size: 22px;
  direction: rtl;
  text-align: right;
  margin-bottom: 4px;
  color: ${p => p.theme.ink};
`;

const Translation = styled.div`
  font-size: 12px;
  color: ${p => p.theme.muted};
  line-height: 1.5;
`;

const Translit = styled.div`
  font-size: 11px;
  color: ${p => p.theme.gold};
  font-style: italic;
  margin-top: 2px;
`;

export default function Tooltip({ tooltip }) {
  const { visible, x, y, word } = tooltip;

  return ReactDOM.createPortal(
    <Bubble $visible={visible} $x={x} $y={y}>
      {word && (
        <>
          <Arabic>{word.text_qpc_hafs || word.text_uthmani || ''}</Arabic>
          <Translation>{word.translation?.text || ''}</Translation>
          <Translit>{word.transliteration?.text || ''}</Translit>
        </>
      )}
    </Bubble>,
    document.body
  );
}
