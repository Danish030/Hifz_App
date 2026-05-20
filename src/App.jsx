import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp, A } from './context/AppContext';
import { THEMES, GlobalStyles } from './components/GlobalStyles';
import { SCRIPT_CONFIG } from './utils/constants';
import { buildVerseParams } from './utils/helpers';
import { fetchCurrentUser, fetchBookmarks, fetchCollections, fetchChapterMeta, fetchVerses, fetchChapterAudio } from './utils/api';

import TopBar              from './components/TopBar';
import StatusBar           from './components/StatusBar';
import Reader              from './components/Reader';
import AudioBar            from './components/AudioBar';
import AudioRepeatDrill    from './features/drill/AudioRepeatDrill';
import BlankFillQuiz       from './features/quiz/BlankFillQuiz';
import MemorizationEngine  from './features/memorization/MemorizationEngine';
import SurahSelection      from './components/SurahSelection';
import SettingsPage        from './components/SettingsPage';
import LandingPage         from './components/LandingPage';
import Login               from './components/Login';
import styled from 'styled-components';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: ${p => p.theme.bg};
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0;
  @media (max-width: 600px) {
    padding-bottom: 140px;
  }
`;

function QuranApp() {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loadedRef  = useRef(null);
  const scriptRef  = useRef(state.script);

  const loadChapter = useCallback(async (chapter) => {
    const cfg = SCRIPT_CONFIG[state.script];
    setIsLoading(true);
    dispatch({ type: A.SET_STATUS,       payload: { type: 'loading', msg: `Loading Surah ${chapter}…` } });
    dispatch({ type: A.SET_CHAPTER_META, payload: null });
    dispatch({ type: A.SET_AUDIO_URL,    payload: null });
    try {
      const meta = await fetchChapterMeta(chapter);
      dispatch({ type: A.SET_CHAPTER_META, payload: meta });

      const pageSize = 50;
      const totalVerses = meta?.verses_count || 0;
      const totalPages = totalVerses ? Math.ceil(totalVerses / pageSize) : 1;

      const firstPageParams = buildVerseParams({ ...state, chapter }, cfg, 1, pageSize);
      const firstVerses = await fetchVerses(chapter, firstPageParams);
      let allVerses = [...firstVerses];
      dispatch({ type: A.SET_VERSES, payload: allVerses });

      if (totalPages > 1) {
        const pageRequests = [];
        for (let page = 2; page <= totalPages; page += 1) {
          pageRequests.push(
            fetchVerses(chapter, buildVerseParams({ ...state, chapter }, cfg, page, pageSize))
              .then(verses => ({ page, verses }))
          );
        }

        const pageResults = await Promise.all(pageRequests);
        pageResults.sort((a, b) => a.page - b.page);

        allVerses = pageResults.reduce((acc, current) => acc.concat(current.verses), allVerses);
        dispatch({ type: A.SET_VERSES, payload: allVerses });
      }

      loadedRef.current = chapter;
      dispatch({ type: A.SET_STATUS, payload: {
        type: 'ok',
        msg: `Surah ${chapter} · ${meta?.translated_name?.name || ''} · ${allVerses.length} verses`,
      }});

      if (state.audioEnabled) {
        fetchChapterAudio(chapter)
          .then(url => { if (url) dispatch({ type: A.SET_AUDIO_URL, payload: url }); })
          .catch(() => {});
      }
    } catch (err) {
      dispatch({ type: A.SET_STATUS, payload: { type: 'err', msg: `Error: ${err.message}` } });
    } finally {
      setIsLoading(false);
    }
  }, [state, dispatch]);

  // Auto-load on chapter change
  useEffect(() => {
    if (state.chapter !== loadedRef.current) loadChapter(state.chapter);
  }, [state.chapter]); // eslint-disable-line

  // Load current user session once and prefetch account data
  useEffect(() => {
    let active = true;
    async function loadSession() {
      try {
        const user = await fetchCurrentUser();
        if (!active) return;
        if (user && Object.keys(user).length) {
          const name = user.name || user.firstName || user.first_name || user.email || 'Account';
          dispatch({ type: A.SET_USER, payload: { ...user, name } });

          try {
            const [bookmarks, collections] = await Promise.all([
              fetchBookmarks(),
              fetchCollections(),
            ]);
            if (!active) return;
            dispatch({ type: A.SET_BOOKMARKS, payload: Array.isArray(bookmarks) ? bookmarks : [] });
            dispatch({ type: A.SET_COLLECTIONS, payload: Array.isArray(collections) ? collections : [] });
          } catch {
            if (!active) return;
            dispatch({ type: A.SET_BOOKMARKS, payload: [] });
            dispatch({ type: A.SET_COLLECTIONS, payload: [] });
          }
        } else {
          dispatch({ type: A.SET_USER, payload: null });
          dispatch({ type: A.SET_BOOKMARKS, payload: [] });
          dispatch({ type: A.SET_COLLECTIONS, payload: [] });
        }
      } catch {
        if (!active) return;
        dispatch({ type: A.SET_USER, payload: null });
        dispatch({ type: A.SET_BOOKMARKS, payload: [] });
        dispatch({ type: A.SET_COLLECTIONS, payload: [] });
      }
    }

    loadSession();
    return () => { active = false; };
  }, [dispatch]);

  // Reload on script change
  useEffect(() => {
    if (state.script !== scriptRef.current && loadedRef.current !== null) {
      scriptRef.current = state.script;
      loadChapter(state.chapter);
    }
  }, [state.script]); // eslint-disable-line

  const theme = THEMES[state.theme] || THEMES.light;

  const AppLayout = ({ children, showAudio = true }) => (
    <Shell>
      <TopBar isLoading={isLoading} />
      <StatusBar />
      <Main>{children}</Main>
      {showAudio && (
        <AudioBar
          audioUrl={state.audioUrl}
          label={`Surah ${state.chapter}${state.chapterMeta?.translated_name?.name ? ` · ${state.chapterMeta.translated_name.name}` : ''}`}
          visible={state.audioEnabled}
        />
      )}
    </Shell>
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<LandingPage onOpenApp={() => navigate('/surah')} />} />
        <Route path="/reader" element={<AppLayout><Reader isLoading={isLoading} /></AppLayout>} />
        <Route path="/hifz" element={<AppLayout showAudio={false}><MemorizationEngine /></AppLayout>} />
        <Route path="/drill" element={<AppLayout showAudio={false}><AudioRepeatDrill /></AppLayout>} />
        <Route path="/quiz" element={<AppLayout showAudio={false}><BlankFillQuiz /></AppLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/surah" element={<AppLayout showAudio={false}><SurahSelection onOpenSurah={() => navigate('/reader')} /></AppLayout>} />
        <Route path="/settings" element={<AppLayout showAudio={false}><SettingsPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <QuranApp />
      </BrowserRouter>
    </AppProvider>
  );
}
