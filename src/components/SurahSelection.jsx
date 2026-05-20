import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useApp, A } from '../context/AppContext';
import { CHAPTER_NAMES } from '../utils/constants';

const Outer = styled.div`
  padding: 28px 24px 180px;
  min-height: calc(100vh - 56px);
  background: ${p => p.theme.bg};
  color: ${p => p.theme.ink};

  @media (max-width: 768px) { padding: 20px 16px 180px; }
`;

const Header = styled.div`
  max-width: 900px;
  margin: 0 auto 28px;
`;

const Title = styled.h1`
  font-size: clamp(26px, 4vw, 34px);
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 15px;
  color: ${p => p.theme.muted};
  line-height: 1.7;
  max-width: 720px;
`;

const Search = styled.input`
  width: 100%;
  max-width: 420px;
  margin-top: 20px;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 14px;
  background: ${p => p.theme.surface};
  color: ${p => p.theme.ink};
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${p => p.theme.teal}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 28px;
`;

const Card = styled.button`
  text-align: left;
  border-radius: 18px;
  border: 1px solid ${p => p.$active ? p.theme.teal : p.theme.border};
  background: ${p => p.$active ? p.theme.surface2 : p.theme.surface};
  padding: 18px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  box-shadow: ${p => p.$active ? '0 12px 30px rgba(29,92,99,0.08)' : 'none'};
  &:hover { transform: translateY(-1px); border-color: ${p => p.theme.teal}; }
`;

const ChapterNumber = styled.div`
  font-family: 'Lora', serif;
  font-size: 26px;
  color: ${p => p.theme.teal};
  margin-bottom: 8px;
`;

const ChapterName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.ink};
  margin-bottom: 8px;
`;

const ChapterMeta = styled.div`
  font-size: 13px;
  color: ${p => p.theme.muted};
  line-height: 1.5;
`;

export default function SurahSelection({ onOpenSurah }) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');

  const chapters = useMemo(() => CHAPTER_NAMES.slice(1)
    .map((name, index) => ({ number: index + 1, name }))
    .filter(ch => ch.name.toLowerCase().includes(query.toLowerCase()) || ch.number.toString() === query.trim()),
    [query]
  );

  const handleSelect = (chapter) => {
    dispatch({ type: A.SET_CHAPTER, payload: chapter });
    if (onOpenSurah) onOpenSurah();
  };

  return (
    <Outer>
      <Header>
        <Title>Surah Selection</Title>
        <Description>
          Browse all 114 chapters by name, then open the chapter for reading or memorization.
          Use the search box to jump directly to any Surah number or title.
        </Description>
        <Search
          placeholder="Search Surah name or number..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </Header>

      <Grid>
        {chapters.map(ch => (
          <Card
            key={ch.number}
            $active={state.chapter === ch.number}
            onClick={() => handleSelect(ch.number)}
          >
            <ChapterNumber>{ch.number}</ChapterNumber>
            <ChapterName>{ch.name}</ChapterName>
            <ChapterMeta>{state.chapter === ch.number ? 'Current surah loaded' : 'Tap to open this Surah'}</ChapterMeta>
          </Card>
        ))}
      </Grid>
    </Outer>
  );
}
