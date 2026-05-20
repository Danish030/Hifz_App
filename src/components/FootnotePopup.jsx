import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 400;
  display: ${p => p.$visible ? 'flex' : 'none'};
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,0.25);
`;

const Popup = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 8px 30px ${p => p.theme.shadow};
  max-width: 480px;
  width: 100%;
  direction: ltr;
  font-size: 13px;
  line-height: 1.7;
  color: ${p => p.theme.ink};
  position: relative;
`;

const Close = styled.button`
  position: absolute;
  top: 12px; right: 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.theme.muted};
  font-size: 16px;
  line-height: 1;
  padding: 0;
  &:hover { color: ${p => p.theme.ink}; }
`;

const Title = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.gold};
  margin-bottom: 8px;
`;

export default function FootnotePopup({ text, onClose }) {
  const visible = !!text;

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  return ReactDOM.createPortal(
    <Overlay $visible={visible} onClick={onClose}>
      <Popup onClick={e => e.stopPropagation()}>
        <Title>Footnote</Title>
        <Close onClick={onClose} aria-label="Close footnote">✕</Close>
        <div dangerouslySetInnerHTML={{ __html: text || '' }} />
      </Popup>
    </Overlay>,
    document.body
  );
}
