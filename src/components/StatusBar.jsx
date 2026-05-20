import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useApp } from '../context/AppContext';

const pulse = keyframes`
  0%,100% { opacity:1; } 50% { opacity:0.3; }
`;

const Bar = styled.div`
  padding: 7px 20px;
  background: rgba(29,92,99,0.07);
  border-bottom: 1px solid ${p => p.theme.border};
  font-size: 12px;
  color: ${p => p.theme.muted};
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  flex-shrink: 0;
  direction: ltr;
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p =>
    p.$type === 'ok'      ? '#27ae60' :
    p.$type === 'err'     ? '#c0392b' :
    p.$type === 'loading' ? '#e8b84b' :
    '#aaa'};
  animation: ${p => p.$type === 'loading' ? pulse : 'none'} 1s infinite;
`;

export default function StatusBar() {
  const { state } = useApp();
  const { type, msg } = state.status;
  return (
    <Bar>
      <Dot $type={type} />
      <span>{msg}</span>
    </Bar>
  );
}
