import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Brain, RefreshCcw, Edit3, Settings2, List, Moon, Scroll, Sun, LogIn } from 'lucide-react';
import { useApp, A } from '../context/AppContext';
import { CHAPTER_NAMES } from '../utils/constants';

/* ─── shell ──────────────────────────────────────────────────────── */
const Bar = styled.header`
  background: ${p => p.theme.surface};
  border-bottom: 1px solid ${p => p.theme.border};
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;
const BrandMark = styled.span`
  font-family: 'UthmanicHafs', serif;
  font-size: 24px;
  color: ${p => p.theme.teal};
  line-height: 1;
`;
const BrandName = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: ${p => p.theme.ink};
`;
export const NavBrand = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
`;

export const NavLogo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--teal); /* Uses the --teal CSS variable */
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'UthmanicHafs', serif;
  font-size: 18px;
  color: #fff;
  line-height: 1;
`;

export const NavName = styled.span`
  font-family: 'Lora', serif;
  font-weight: 600;
  font-size: 17px;
  color: var(--ink); /* Uses the --ink CSS variable */
  letter-spacing: -0.2px;
`;
const Sep = styled.div`
  width: 1px;
  height: 20px;
  background: ${p => p.theme.border};
  flex-shrink: 0;
`;

/* surah select */
const SurahWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 340px;
`;

const SurahSelect = styled.select`
  flex: 1;
  min-width: 0;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.theme.border};
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${p => p.theme.teal}; }
`;

const Dot = styled.span`
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => p.$loading ? p.theme.gold : '#22c55e'};
  opacity: ${p => p.$loading ? 1 : 0.7};
  animation: ${p => p.$loading ? 'topDot 1s infinite' : 'none'};
  @keyframes topDot { 0%,100%{opacity:1} 50%{opacity:.25} }
`;

/* tabs */
const Tabs = styled.nav`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  @media(max-width: 600px) { display: none; }
`;

const TabBtn = styled.button`
  padding: 5px 12px;
  border-radius: 7px;
  border: none;
  background: ${p => p.$active ? p.theme.teal : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.muted};
  font-size: 12px;
  font-weight: ${p => p.$active ? 700 : 400};
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
  &:hover { background: ${p => p.$active ? p.theme.teal : p.theme.border}; }
`;

const TopActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
`;

const PageAction = styled.button`
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid ${p => p.$active ? p.theme.teal : p.theme.border};
  background: ${p => p.$active ? p.theme.teal : p.theme.surface2};
  color: ${p => p.$active ? '#fff' : p.theme.ink};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  &:hover { background: ${p => p.$active ? p.theme.teal : p.theme.surface}; }
  @media(max-width: 600px) {
    padding: 8px 10px;
    font-size: 11px;
    ${p => p.$hideOnMobile ? 'display: none;' : ''}
  }
`;

const AuthButton = styled(PageAction)`
  white-space: nowrap;
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &[title] {
    cursor: pointer;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 999px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: ${p => p.theme.surface2};
  color: ${p => p.theme.teal};
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.span`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MobileNav = styled.nav`
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 110;
  background: ${p => p.theme.surface};
  border-top: 1px solid ${p => p.theme.border};
  padding: 10px 10px max(env(safe-area-inset-bottom), 10px);
  gap: 8px;
  justify-content: space-between;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.08);
  @media (max-width: 600px) {
    display: flex;
  }
`;

const MobileNavButton = styled.button`
  flex: 1;
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid ${p => p.$active ? 'transparent' : p.theme.border};
  background: ${p => p.$active ? p.theme.teal : p.theme.surface2};
  color: ${p => p.$active ? '#fff' : p.theme.muted};
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 6px;
  transition: background 0.15s, color 0.15s, transform 0.15s;
  white-space: nowrap;
  box-shadow: ${p => p.$active ? '0 8px 24px rgba(29,92,99,0.14)' : 'none'};
  transform: ${p => p.$active ? 'translateY(-1px)' : 'none'};
  &:hover { background: ${p => p.$active ? p.theme.teal : p.theme.border}; }
`;

const MobileNavIcon = styled.span`
  font-size: 14px;
  line-height: 1;
`;

const MobileNavLabel = styled.span`
  line-height: 1.2;
  font-size: 10px;
`;

/* right controls */
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
`;

const ThemePill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.surface2};
  color: ${p => p.theme.muted};
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  &:hover { background: ${p => p.theme.surface}; transform: translateY(-1px); }
  svg { display: block; }
`;

const TABS = [
  { key: 'reader', icon: <BookOpen size={14} />, label: 'Reader'   },
  { key: 'hifz',    icon: <Brain size={14} />,    label: 'Memorize' },
  { key: 'drill',   icon: <RefreshCcw size={14} />, label: 'Drill'    },
  { key: 'quiz',    icon: <Edit3 size={14} />,     label: 'Quiz'     },
];

const MOBILE_TABS = [
  ...TABS,
  { key: 'surah', icon: <List size={14} />, label: 'Browse' },
];

export default function TopBar({ isLoading }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'surah';
  const themeNext = { light: 'sepia', sepia: 'dark', dark: 'light' }[state.theme] || 'light';
  const themeIcons = {
    light: <Sun size={14} />, sepia: <Scroll size={14} />, dark: <Moon size={14} />,
  };
  const themeLabel = { light: 'Light', sepia: 'Sepia', dark: 'Dark' }[state.theme] || 'Light';
  const nextThemeLabel = { light: 'Sepia', sepia: 'Dark', dark: 'Light' }[state.theme] || 'Light';
  const set = (type, payload) => dispatch({ type, payload });

  const go = (route) => navigate(`/${route}`);

  return (
    <>
    <Bar>
    <NavBrand href="go('surah')">
      <NavLogo>ح</NavLogo>
      <NavName>Hifz</NavName>
    </NavBrand>

      <SurahWrap>
        <Dot $loading={isLoading} title={isLoading ? 'Loading…' : 'Ready'} />
        <SurahSelect value={state.chapter}
          onChange={e => set(A.SET_CHAPTER, Number(e.target.value))}>
          {CHAPTER_NAMES.slice(1).map((name, i) => (
            <option key={i+1} value={i+1}>{i+1}. {name}</option>
          ))}
        </SurahSelect>
      </SurahWrap>

      <Sep />

      <Tabs>
        {TABS.map(t => (
          <TabBtn key={t.key} $active={currentPath === t.key}
            type="button"
            onClick={() => go(t.key)}>
            {t.icon} {t.label}
          </TabBtn>
        ))}
      </Tabs>

      <TopActions>
        <ThemePill onClick={() => set(A.SET_THEME, themeNext)} title={`Switch to ${nextThemeLabel}`}>
          {themeIcons[state.theme]} {themeLabel}
        </ThemePill>
        <PageAction $active={currentPath === 'surah'} $hideOnMobile type="button" onClick={() => go('surah')}>
          <List size={14} /> 
        </PageAction>
        <PageAction $active={currentPath === 'settings'} type="button" onClick={() => go('settings')}>
          <Settings2 size={14} /> 
        </PageAction>
        <AuthButton
          $active={currentPath === 'login'}
          type="button"
          onClick={() => go(state.user ? 'settings' : 'login')}
          title={state.user ? `${state.user.name || 'Account'}\n${state.user.email || ''}` : 'Login to Quran Foundation'}
          aria-label={state.user ? `Account: ${state.user.name || 'Account'}` : 'Login'}
        >
          {state.user ? (
            <UserAvatar>{(state.user.name || 'U').slice(0, 2).toUpperCase()}</UserAvatar>
          ) : (
            <>
              <LogIn size={14} /> Login
            </>
          )}
        </AuthButton>
      </TopActions>
    </Bar>

    <MobileNav>
      {MOBILE_TABS.map(t => (
        <MobileNavButton key={t.key} $active={currentPath === t.key}
          onClick={() => go(t.key)}>
          <MobileNavIcon>{t.icon}</MobileNavIcon>
          <MobileNavLabel>{t.label}</MobileNavLabel>
        </MobileNavButton>
      ))}
    </MobileNav>
    </>
  );
}
