import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useApp, A } from '../context/AppContext';
import { SCRIPT_CONFIG, TRANSLATION_OPTIONS } from '../utils/constants';

/* ── Styled ─────────────────────────────────────────────────────── */
const Sidebar = styled.aside`
  background: ${p => p.theme.surface};
  border-left: 1px solid ${p => p.theme.border};
  padding: 20px 16px;
  overflow-y: auto;
  position: sticky;
  top: 56px;
  max-height: calc(100vh - 56px);
  direction: ltr;

  @media (max-width: 768px) {
    position: static;
    max-height: none;
    border-left: none;
    border-bottom: 1px solid ${p => p.theme.border};
  }
`;

const Section = styled.div`margin-bottom: 20px;`;

const Heading = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.theme.muted};
  margin-bottom: 10px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 8px;
  font-size: 13px;
  color: ${p => p.theme.ink};
  background: ${p => p.theme.bg};
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  &:focus { border-color: ${p => p.theme.gold}; }
`;

const ChipGroup = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;

const Chip = styled.button`
  padding: 5px 11px;
  border-radius: 999px;
  border: 1.5px solid ${p => p.$active ? p.theme.teal  : p.theme.border};
  background:          ${p => p.$active ? p.theme.teal  : p.theme.surface};
  color:               ${p => p.$active ? '#fff'        : p.theme.muted};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  &:hover { border-color: ${p => p.theme.teal}; }
`;

const ThemeChip = styled(Chip)`
  border-color: ${p => p.$active ? p.theme.gold : p.theme.border};
  background:   ${p => p.$active ? 'transparent' : p.theme.surface};
  color:        ${p => p.$active ? p.theme.gold  : p.theme.muted};
`;

const RangeWrap = styled.div`margin-bottom: 4px;`;
const Range = styled.input`
  width: 100%; cursor: pointer; accent-color: ${p => p.theme.teal};
`;
const RangeVal = styled.div`
  text-align: center;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  color: ${p => p.theme.gold};
  margin-top: 2px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
`;
const ToggleLabel = styled.span`font-size: 13px; color: ${p => p.theme.ink};`;

const ToggleWrap = styled.label`
  position: relative;
  width: 38px; height: 22px; flex-shrink: 0;
  input { opacity: 0; width: 0; height: 0; }
`;
const Slider = styled.span`
  position: absolute; inset: 0;
  border-radius: 999px;
  background: ${p => p.$on ? p.theme.teal : '#ccc'};
  cursor: pointer;
  transition: background 0.2s;
  &::before {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    left: ${p => p.$on ? '19px' : '3px'};
    bottom: 3px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s;
  }
`;

/* ── Component ───────────────────────────────────────────────────── */
export default function Controls() {
  const { state, dispatch } = useApp();
  const set = useCallback((action, value) => dispatch({ type: action, payload: value }), [dispatch]);

  return (
    <Sidebar>

      {/* Script / Font */}
      <Section>
        <Heading>Script / Font</Heading>
        <ChipGroup>
          {Object.entries(SCRIPT_CONFIG).map(([key, cfg]) => (
            <Chip key={key} $active={state.script === key} onClick={() => set(A.SET_SCRIPT, key)}>
              {cfg.label}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      {/* Theme */}
      <Section>
        <Heading>Theme</Heading>
        <ChipGroup>
          {[['light','☀ Light'],['sepia','📜 Sepia'],['dark','🌙 Dark']].map(([v,l]) => (
            <ThemeChip key={v} $active={state.theme === v} onClick={() => set(A.SET_THEME, v)}>{l}</ThemeChip>
          ))}
        </ChipGroup>
      </Section>

      {/* Font scale */}
      <Section>
        <Heading>Font Scale</Heading>
        <RangeWrap>
          <Range type="range" min={1} max={5} step={1} value={state.scale}
            onChange={e => set(A.SET_SCALE, Number(e.target.value))} />
        </RangeWrap>
        <RangeVal>{state.scale} / 5</RangeVal>
      </Section>

      {/* Translation */}
      <Section>
        <Heading>Translation</Heading>
        <Select value={state.translation} onChange={e => set(A.SET_TRANSLATION, e.target.value)}>
          {TRANSLATION_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Section>

      {/* Toggles */}
      <Section>
        <Heading>Options</Heading>
        {[
          [A.SET_WBW,   state.wbw,         'Word-by-word tooltip'],
          [A.SET_AUDIO, state.audioEnabled, 'Audio player'],
        ].map(([action, val, label]) => (
          <ToggleRow key={action}>
            <ToggleLabel>{label}</ToggleLabel>
            <ToggleWrap>
              <input type="checkbox" checked={val} onChange={e => set(action, e.target.checked)} />
              <Slider $on={val} />
            </ToggleWrap>
          </ToggleRow>
        ))}
      </Section>

    </Sidebar>
  );
}
