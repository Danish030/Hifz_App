import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BACKEND_BASE } from '../utils/constants';

const pageScopes = [
  { key: 'bookmark', label: 'bookmark' },
  { key: 'collection', label: 'collection' },
  { key: 'reading_session', label: 'reading_session' },
  { key: 'preference', label: 'preference' },
];

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--cream, #faf6ef);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PanelLeft = styled.section`
  position: relative;
  overflow: hidden;
  padding: 64px 56px;
  background: #1d5c63;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;

  &::before {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,146,42,0.18) 0%, transparent 70%);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const PanelRight = styled.section`
  padding: 64px 56px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

const BrandIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #1d5c63;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: #fff;
`;

const BrandName = styled.span`
  font-family: 'Amiri', serif;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.02em;
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
const ArabicQuote = styled.div`
  font-family: 'Amiri', serif;
  font-size: 42px;
  line-height: 1.4;
  color: rgba(255,255,255,0.9);
  direction: rtl;
  text-align: right;
  margin-bottom: 24px;
`;

const ArabicRef = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  text-align: right;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const FeaturesList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.8);
  font-size: 14px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e8b84b;
    flex-shrink: 0;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
`;

const CardEyebrow = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8922a;
  margin-bottom: 10px;
`;

const CardTitle = styled.h1`
  font-family: 'Amiri', serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: #1a1614;
  margin-bottom: 8px;
`;

const CardSub = styled.p`
  font-size: 14px;
  color: #6b6460;
  line-height: 1.6;
  margin-bottom: 36px;
`;

const ErrorBanner = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  background: #fdf0f0;
  border: 1px solid #e8b4b4;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #8b2020;
  margin-bottom: 20px;
`;

const ScopeSection = styled.div`
  margin-bottom: 28px;
`;

const ScopeLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a7f78;
  margin-bottom: 12px;
`;

const ScopeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const ScopeChip = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid ${props => (props.checked ? '#c8922a' : 'rgba(200,146,42,0.25)')};
  background: ${props => (props.checked ? 'rgba(200,146,42,0.06)' : '#fff')};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  transition: border-color 0.15s, background 0.15s;
  font-size: 13px;
  color: #1a1614;
  user-select: none;
  opacity: ${props => (props.locked ? 0.6 : 1)};
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid ${props => (props.checked ? '#c8922a' : '#ccc')};
  background: ${props => (props.checked ? '#c8922a' : 'transparent')};
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
`;

const LoginButton = styled.a`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 24px;
  background: #1d5c63;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.15s, transform 0.1s;
  margin-bottom: 16px;

  &:hover {
    background: #174950;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    opacity: 0.7;
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #9a918c;
  line-height: 1.5;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  font-size: 12px;
  color: #c0b8b2;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(200,146,42,0.25);
  }
`;

const FlowSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  font-size: 13px;
  color: #6b6460;
`;

const StepNum = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f5efe6;
  color: #c8922a;
  font-size: 11px;
  font-weight: 600;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const Login = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [selectedScopes, setSelectedScopes] = useState({
    bookmark: true,
    collection: true,
    reading_session: true,
    preference: true,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (state.user) {
      navigate('/settings');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setError(`Authentication error: ${decodeURIComponent(err).replace(/_/g, ' ')}`);
    }
  }, [state.user, navigate]);

  const loginUrl = useMemo(() => {
    const scopes = [
      'openid',
      'offline_access',
      ...pageScopes.filter(scope => selectedScopes[scope.key]).map(scope => scope.key),
    ].join(' ');
    return `${BACKEND_BASE}/auth/login?scope=${encodeURIComponent(scopes)}`;
  }, [selectedScopes]);

  const toggleScope = useCallback((scopeKey) => {
    setSelectedScopes(prev => ({ ...prev, [scopeKey]: !prev[scopeKey] }));
  }, []);

  return (
    <Page>
      <PanelLeft>
        <div style={{ position: 'relative', zIndex: 1 }}> {/* Added zIndex to ensure brand is above ::before pseudo-element */}
          <Brand>
            <BrandIcon>ح</BrandIcon>
            <BrandName>Hifz</BrandName>
          </Brand>

          <ArabicQuote>﴿ إِنَّ هَـٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ﴾</ArabicQuote>
          <ArabicRef>Al-Isra 17:9</ArabicRef>
        </div>

        <FeaturesList>
          <FeatureItem>Bookmarks synced across all devices</FeatureItem>
          <FeatureItem>Reading progress and streak tracking</FeatureItem>
          <FeatureItem>Personal collections and annotations</FeatureItem>
          <FeatureItem>Preferences saved to the cloud</FeatureItem>
          <FeatureItem>Single sign-on with Quran.com</FeatureItem>
        </FeaturesList>
      </PanelLeft>

      <PanelRight>
        <Card>
          <CardEyebrow>User APIs · OAuth2 + PKCE</CardEyebrow>
          <CardTitle>Sign in to continue</CardTitle>
          <CardSub>
            Authenticate with your Quran Foundation account to access
            bookmarks, collections, reading progress, and preferences.
          </CardSub>

          <ErrorBanner visible={!!error}>{error}</ErrorBanner>

          <ScopeSection>
            <ScopeLabel>Request access to</ScopeLabel>
            <ScopeGrid>
              <ScopeChip checked locked>
                <input type="checkbox" name="scope" value="openid" checked disabled style={{ display: 'none' }} />
                <Dot checked />
                openid
              </ScopeChip>
              <ScopeChip checked locked>
                <input type="checkbox" name="scope" value="offline_access" checked disabled style={{ display: 'none' }} />
                <Dot checked />
                offline_access
              </ScopeChip>
              {pageScopes.map(scope => (
                <ScopeChip
                  key={scope.key}
                  checked={selectedScopes[scope.key]}
                  onClick={() => toggleScope(scope.key)}
                >
                  <input
                    type="checkbox"
                    name="scope"
                    value={scope.key}
                    checked={selectedScopes[scope.key]}
                    readOnly
                    style={{ display: 'none' }}
                  />
                  <Dot checked={selectedScopes[scope.key]} />
                  {scope.label}
                </ScopeChip>
              ))}
            </ScopeGrid>
          </ScopeSection>

          <LoginButton href={loginUrl}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            Continue with Quran Foundation
          </LoginButton>

          <SecurityNote>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              Secured with Authorization Code + PKCE. Your credentials are never
              shared with this app — authentication happens on Quran Foundation's
              servers.
            </span>
          </SecurityNote>

          <Divider>how it works</Divider>

          <FlowSteps>
            <Step><StepNum>1</StepNum>PKCE + state + nonce generated client-side</Step>
            <Step><StepNum>2</StepNum>Redirect to hosted QF login page</Step>
            <Step><StepNum>3</StepNum>Authorization code sent to backend</Step>
            <Step><StepNum>4</StepNum>Backend exchanges code (CLIENT_SECRET stays hidden)</Step>
            <Step><StepNum>5</StepNum>id_token nonce verified · tokens stored server-side</Step>
          </FlowSteps>
        </Card>
      </PanelRight>
    </Page>
  );
};

export default Login;
