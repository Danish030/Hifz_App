import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useApp } from '../context/AppContext';

const Outer = styled.div`
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: 28px 24px 120px;
  min-height: calc(100vh - 52px);
  color: ${p => p.theme.ink};
  background: ${p => p.theme.bg};
`;

const Heading = styled.div`
  max-width: 760px;
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: clamp(30px, 4vw, 42px);
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: ${p => p.theme.muted};
  line-height: 1.75;
  max-width: 720px;
`;

const Button = styled.button`
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  border: none;
  background: ${p => p.theme.teal};
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  &:hover { transform: translateY(-1px); background: ${p => p.theme.tealD}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-top: 24px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.04);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
`;

const CardMeta = styled.div`
  color: ${p => p.theme.muted};
  font-size: 14px;
  line-height: 1.7;
`;

const List = styled.ul`
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: grid;
  gap: 14px;
`;

const Item = styled.li`
  padding: 14px 16px;
  border-radius: 18px;
  background: ${p => p.theme.surface2};
  border: 1px solid ${p => p.theme.border};
  color: ${p => p.theme.ink};
`;

const ItemTitle = styled.div`
  font-weight: 700;
  margin-bottom: 6px;
`;

const ItemDetail = styled.div`
  color: ${p => p.theme.muted};
  font-size: 13px;
  line-height: 1.6;
`;

export default function AccountPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const bookmarks = state.bookmarks || [];
  const collections = state.collections || [];

  const formatItem = item => {
    if (!item) return 'Unknown item';
    return item.verse_key || item.name || item.title || item.id || JSON.stringify(item);
  };

  return (
    <Outer>
      <Heading>
        <Title>Account & bookmarks</Title>
        <Description>
          Connect your Quran Foundation account to load bookmarks, collections, reading progress, and preferences.
          Once authenticated, this page will surface the data fetched from your account via the backend-protected user API.
        </Description>
        {!state.user && (
          <Button onClick={() => navigate('/login')}>Sign in to load bookmarks</Button>
        )}
      </Heading>

      {state.user ? (
        <>
          <Grid>
            <Card>
              <CardTitle>Bookmarks</CardTitle>
              <CardMeta>
                {bookmarks.length
                  ? `Showing ${Math.min(bookmarks.length, 8)} of ${bookmarks.length} bookmarks retrieved from your account.`
                  : 'No bookmarks were retrieved yet. Log in and refresh the page if needed.'}
              </CardMeta>
              <List>
                {bookmarks.length
                  ? bookmarks.slice(0, 8).map((item, index) => (
                    <Item key={item.id || item.verse_key || index}>
                      <ItemTitle>{formatItem(item)}</ItemTitle>
                      {item.chapter ? <ItemDetail>Chapter {item.chapter}</ItemDetail> : null}
                    </Item>
                  ))
                  : <Item>No bookmarks found.</Item>}
              </List>
            </Card>

            <Card>
              <CardTitle>Collections</CardTitle>
              <CardMeta>
                {collections.length
                  ? `Showing ${Math.min(collections.length, 8)} of ${collections.length} collections.`
                  : 'No collections were retrieved yet. Log in and refresh the page if needed.'}
              </CardMeta>
              <List>
                {collections.length
                  ? collections.slice(0, 8).map((item, index) => (
                    <Item key={item.id || index}>
                      <ItemTitle>{formatItem(item)}</ItemTitle>
                      {item.description ? <ItemDetail>{item.description}</ItemDetail> : null}
                    </Item>
                  ))
                  : <Item>No collections found.</Item>}
              </List>
            </Card>
          </Grid>
        </>
      ) : null}
    </Outer>
  );
}
