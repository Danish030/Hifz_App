import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadPrefs, savePrefs } from '../utils/helpers';

// ── Action types ───────────────────────────────────────────────────
export const A = {
  SET_PREFS:        'SET_PREFS',   // bulk update (e.g. load from localStorage)
  SET_SCRIPT:       'SET_SCRIPT',
  SET_VIEW:         'SET_VIEW',
  SET_THEME:        'SET_THEME',
  SET_SCALE:        'SET_SCALE',
  SET_TRANSLATION:  'SET_TRANSLATION',
  SET_WBW:          'SET_WBW',
  SET_AUDIO:        'SET_AUDIO',
  SET_CHAPTER:      'SET_CHAPTER',
  SET_VERSES:       'SET_VERSES',
  SET_CHAPTER_META: 'SET_CHAPTER_META',
  SET_STATUS:       'SET_STATUS',   // { type: 'idle'|'loading'|'ok'|'err', msg }
  SET_AUDIO_URL:    'SET_AUDIO_URL',
  SET_USER:         'SET_USER',
  SET_BOOKMARKS:    'SET_BOOKMARKS',
  SET_COLLECTIONS:  'SET_COLLECTIONS',
};

function reducer(state, { type, payload }) {
  switch (type) {
    case A.SET_PREFS:        return { ...state, ...payload };
    case A.SET_SCRIPT:       return { ...state, script: payload };
    case A.SET_VIEW:         return { ...state, view: payload };
    case A.SET_THEME:        return { ...state, theme: payload };
    case A.SET_SCALE:        return { ...state, scale: payload };
    case A.SET_TRANSLATION:  return { ...state, translation: payload };
    case A.SET_WBW:          return { ...state, wbw: payload };
    case A.SET_AUDIO:        return { ...state, audioEnabled: payload };
    case A.SET_CHAPTER:      return { ...state, chapter: payload };
    case A.SET_VERSES:       return { ...state, verses: payload };
    case A.SET_CHAPTER_META: return { ...state, chapterMeta: payload };
    case A.SET_STATUS:       return { ...state, status: payload };
    case A.SET_AUDIO_URL:    return { ...state, audioUrl: payload };
    case A.SET_USER:         return { ...state, user: payload };
    case A.SET_BOOKMARKS:    return { ...state, bookmarks: payload };
    case A.SET_COLLECTIONS:  return { ...state, collections: payload };
    default: return state;
  }
}

const INITIAL = {
  ...loadPrefs(),
  verses:      [],
  chapterMeta: null,
  status:      { type: 'idle', msg: 'Select a Surah and click Load.' },
  audioUrl:    null,
  user:        null,
  bookmarks:   [],
  collections: [],
  chapterMeta: null,
  status:      { type: 'idle', msg: 'Select a Surah and click Load.' },
  audioUrl:    null,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // Persist UI prefs on every state change
  useEffect(() => { savePrefs(state); }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
