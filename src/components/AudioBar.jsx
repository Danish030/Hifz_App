import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const Bar = styled.div`
  background: ${p => p.theme.surface};
  border-top: 1px solid ${p => p.theme.border};
  padding: 10px 20px;
  display: ${p => p.$visible ? 'flex' : 'none'};
  align-items: center;
  gap: 12px;
  direction: ltr;
  flex-shrink: 0;

  @media (max-width: 600px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 72px;
    z-index: 105;
    margin: 0;
    padding: 10px 16px;
    box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
  }
`;

const AudioLabel = styled.span`
  font-size: 12px;
  color: ${p => p.theme.muted};
  white-space: nowrap;
`;

const StyledAudio = styled.audio`
  flex: 1;
  height: 32px;
  min-width: 0;
`;

export default function AudioBar({ audioUrl, label, visible }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  return (
    <Bar $visible={visible && !!audioUrl}>
      <AudioLabel>{label || 'Audio'}</AudioLabel>
      <StyledAudio ref={audioRef} controls preload="none" />
    </Bar>
  );
}
