# Quran Reader – React App

Full-featured Quran reader built with React 19 + Vite + styled-components,
backed by the localhost:3000 Express backend.

## Quick Start

```bash
# 1. Start the Express backend (provides content API proxy + OAuth auth)
cd ../qf-auth
cp .env.example .env      # fill in QF_CLIENT_ID, QF_CLIENT_SECRET
npm install && npm start  # runs on http://localhost:3000

# 2. Start the React dev server
cd ../quran-reader-react
npm install
npm run dev               # http://localhost:5173
```

Vite proxies all /api/* requests to http://localhost:3000.

## Build for Production

```bash
npm run build   # outputs to dist/
npm run preview # preview locally
```

## Architecture

src/
  App.jsx                       Root – ThemeProvider + data loading + tab routing
  context/AppContext.jsx         useReducer global state + localStorage persistence
  components/
    GlobalStyles.js             styled-components theme tokens (light/sepia/dark)
    Navigation.jsx
    Controls.jsx                Sidebar controls
    Reader.jsx                  Translation view + Mushaf reading view
    StatusBar.jsx
    AudioBar.jsx                Sticky bottom audio player
    WordSpan.jsx                Word renderer (QCF / Unicode / fallback)
    Tooltip.jsx                 Word-by-word tooltip via React Portal
    FootnotePopup.jsx           Footnote overlay via React Portal
  hooks/
    useFontLoader.js            Per-page QCF font loading
    useTooltip.js               Mouse-tracking tooltip position
  features/
    drill/AudioRepeatDrill.jsx  Loop verse N times with word highlighting
    quiz/BlankFillQuiz.jsx      Blank-fill Arabic word quiz
  utils/
    constants.js                API_BASE, SCRIPT_CONFIG, CHAPTER_NAMES
    helpers.js                  groupWordsByLine, localStorage, buildVerseParams
    api.js                      axios calls to backend proxy
