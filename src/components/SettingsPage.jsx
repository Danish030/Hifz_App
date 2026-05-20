import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp, A } from '../context/AppContext';
import Controls from './Controls';
import { fetchCurrentUser, fetchBookmarks, fetchCollections } from '../utils/api';

const Outer = styled.div`
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: 28px 24px 180px;
  min-height: calc(100vh - 56px);
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};

  @media (max-width: 768px) {
    padding: 20px 16px 180px;
  }
`;

const Header = styled.div`
  max-width: 960px;
  margin: 0 auto 26px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleGroup = styled.div`
  min-width: 220px;
  width: 100%;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const Title = styled.h1`
  font-size: clamp(26px, 4vw, 34px);
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: ${p => p.theme.muted};
  line-height: 1.75;
  max-width: 640px;
`;

const Card = styled.div`
  flex: 1;
  min-width: 280px;
  width: 100%;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
`;

const CardHeading = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${p => p.theme.ink};
  margin-bottom: 14px;
`;

const CardText = styled.div`
  font-size: 14px;
  color: ${p => p.theme.muted};
  line-height: 1.75;
`;

const Button = styled.button`
  margin-top: 20px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: none;
  background: ${p => p.$danger ? '#dc2626' : p.theme.teal};
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${p => p.$danger ? '#b91c1c' : p.theme.tealD}; }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const bookmarks = state.bookmarks || [];
  const collections = state.collections || [];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = () => navigate('/login');

  const handleLogout = async () => {
    try {
      setError(null);
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      setError('Unable to sign out.');
    } finally {
      dispatch({ type: A.SET_USER, payload: null });
      dispatch({ type: A.SET_BOOKMARKS, payload: [] });
      dispatch({ type: A.SET_COLLECTIONS, payload: [] });
      navigate('/login');
    }
  };

  const refreshAccountData = async () => {
    if (!state.user) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const user = await fetchCurrentUser();
      const [bookmarks, collections] = await Promise.all([fetchBookmarks(), fetchCollections()]);
      dispatch({ type: A.SET_USER, payload: user });
      dispatch({ type: A.SET_BOOKMARKS, payload: Array.isArray(bookmarks) ? bookmarks : [] });
      dispatch({ type: A.SET_COLLECTIONS, payload: Array.isArray(collections) ? collections : [] });
    } catch (err) {
      setError(err.message || 'Unable to refresh account data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (state.user && !bookmarks.length && !collections.length) {
      refreshAccountData();
    }
  }, [state.user]);

  const formatItemTitle = item => {
    if (!item) return 'Unknown item';
    return item.verse_key || item.name || item.title || item?.id || JSON.stringify(item);
  };

  const formatBookmarkMeta = item => {
    const verseKey = item.verse_key || item?.verseKey || item?.verse_key;
    const title = verseKey ? `${verseKey}` : item.title || item.name;
    return title || 'Bookmark';
  };

  return (
    <Outer>
      <Header>
        <TitleGroup>
          <Title>Settings</Title>
          <Description>
            Manage your reading preferences, account access, and Quran Foundation data in one place.
          </Description>
        </TitleGroup>
        <Card>
          <CardHeading>Account</CardHeading>
          <CardText>
            {state.user ? (
              <>
                Signed in as <strong>{state.user.name || state.user.email}</strong>.
                <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                  {state.user.email}
                </div>
              </>
            ) : (
              <>You are currently signed out. Signing in unlocks your bookmarks, collections, and reading progress.</>
            )}
          </CardText>
          {error ? <CardText style={{ color: '#b91c1c' }}>{error}</CardText> : null}
          <Button $danger={!!state.user} onClick={state.user ? handleLogout : handleLogin}>
            {state.user ? 'Sign out' : 'Sign in'}
          </Button>
          {state.user ? (
            <Button style={{ marginTop: 10 }} onClick={refreshAccountData} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing…' : 'Refresh account data'}
            </Button>
          ) : null}
        </Card>
      </Header>

      <SettingsGrid>
        <Card>
          <CardHeading>Preferences</CardHeading>
          <CardText>
            Customize the script, translation, font size, and audio behavior used throughout the app.
          </CardText>
          <Controls />
        </Card>
      </SettingsGrid>

      {state.user && (
        <div style={{ marginTop: '24px', maxWidth: '1080px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Card>
            <CardHeading>Bookmarks & Collections</CardHeading>
            <CardText>
              {bookmarks.length || collections.length
                ? 'Your Quran Foundation bookmarks and collections are available below.'
                : 'Your Quran Foundation bookmarks and collections will appear once they are fetched from your account.'}
            </CardText>
          </Card>

          <SettingsGrid style={{ marginTop: '20px' }}>
            <Card>
              <CardHeading>Bookmarks</CardHeading>
              <CardText>
                {bookmarks.length ? `Showing ${Math.min(bookmarks.length, 6)} of ${bookmarks.length} bookmarks.` : 'No bookmarks found.'}
              </CardText>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 16, gap: 10, display: 'grid' }}>
                {bookmarks.slice(0, 6).map((item, idx) => (
                  <li key={`bm-${idx}`} style={{ padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                    <strong>{formatBookmarkMeta(item)}</strong>
                    {item?.chapter ? <div style={{ color: '#6b7280', fontSize: '12px' }}>Chapter {item.chapter}</div> : null}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeading>Collections</CardHeading>
              <CardText>
                {collections.length ? `Showing ${Math.min(collections.length, 6)} of ${collections.length} collections.` : 'No collections found.'}
              </CardText>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 16, gap: 10, display: 'grid' }}>
                {collections.slice(0, 6).map((item, idx) => (
                  <li key={`col-${idx}`} style={{ padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                    <strong>{formatItemTitle(item)}</strong>
                    {item?.description ? <div style={{ color: '#6b7280', fontSize: '12px' }}>{item.description}</div> : null}
                  </li>
                ))}
              </ul>
            </Card>
          </SettingsGrid>
        </div>
      )}
    </Outer>
  );
}
