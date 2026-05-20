import React from 'react';
import styled from 'styled-components';
import { useApp, A } from '../context/AppContext';
import { CHAPTER_NAMES } from '../utils/constants';

const Bar = styled.nav`
  background: ${p => p.theme.teal};
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  gap: 12px;
`;

const Brand = styled.span`
  font-family: 'UthmanicHafs', serif;
  font-size: 18px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const SurahSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 420px;
`;

const SurahLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.6);
  white-space: nowrap;
`;

const SurahSelect = styled.select`
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 0;

  /* Style the dropdown options (browser-dependent) */
  option {
    background: #1d5c63;
    color: #fff;
  }

  &:focus {
    background: rgba(255,255,255,0.22);
  }
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${p => p.$loading ? '#e8b84b' : '#4ade80'};
  flex-shrink: 0;
  animation: ${p => p.$loading ? 'navPulse 1s infinite' : 'none'};
  @keyframes navPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
`;

const Links = styled.div`
  display: flex;
  gap: 5px;
  flex-shrink: 0;
`;

const NavBtn = styled.a`
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
  font-size: 11px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
  &:hover { background: rgba(255,255,255,0.22); }

  @media (max-width: 600px) { display: none; }
`;

export default function Navigation({ isLoading }) {
  const { state, dispatch } = useApp();

  const handleChange = (e) => {
    dispatch({ type: A.SET_CHAPTER, payload: Number(e.target.value) });
  };

  return (
    <Bar>
      <Brand>☽ Quran</Brand>

      <SurahSelector>
        <SurahLabel>Surah</SurahLabel>
        <LoadingDot $loading={isLoading} title={isLoading ? 'Loading…' : 'Ready'} />
        <SurahSelect value={state.chapter} onChange={handleChange}>
          {CHAPTER_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}. {name}</option>
          ))}
        </SurahSelect>
      </SurahSelector>

      <Links>
        <NavBtn href="/content-explorer.html">Explorer</NavBtn>
        <NavBtn href="/dashboard">User APIs</NavBtn>
      </Links>
    </Bar>
  );
}
