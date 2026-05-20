import { createGlobalStyle } from 'styled-components';

export const THEMES = {
  light: {
    bg: '#faf6ef',
    surface: '#ffffff',
    surface2: '#f4ede0',
    ink: '#1a1614',
    body: '#3d3530',
    muted: '#7a726c',
    border: 'rgba(0,0,0,0.08)',
    gold: '#c8922a',
    goldL: '#fef3e0',
    teal: '#1d5c63',
    tealD: '#14424a',
    tealL: '#e8f4f5',
    shadow: 'rgba(29,92,99,0.08)',
  },
  sepia: {
    bg: '#f4ecd8',
    surface: '#ede3cb',
    surface2: '#e5daba',
    ink: '#3b2a14',
    body: '#4d3d2a',
    muted: '#7a6548',
    border: 'rgba(0,0,0,0.10)',
    gold: '#b07d28',
    goldL: '#f9f0e0',
    teal: '#1d5c63',
    tealD: '#14424a',
    tealL: '#ece1c8',
    shadow: 'rgba(0,0,0,0.12)',
  },
  dark: {
    bg: '#0f0e0c',
    surface: '#1c1a17',
    surface2: '#2a2723',
    ink: '#e8ddd0',
    body: '#c4bbb1',
    muted: '#a09890',
    border: 'rgba(255,255,255,0.10)',
    gold: '#e8b84b',
    goldL: '#3d3520',
    teal: '#2a7a82',
    tealD: '#1d5c63',
    tealL: '#1a2a2c',
    shadow: 'rgba(0,0,0,0.40)',
  },
};

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'UthmanicHafs';
    src: url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2') format('woff2'),
         url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf') format('truetype');
    font-display: swap;
  }
  @font-face {
    font-family: 'IndoPak';
    src: url('https://verses.quran.foundation/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2') format('woff2');
    font-display: swap;
  }

  :root {
    --bg: ${p => p.theme.bg};
    --surface: ${p => p.theme.surface};
    --surface2: ${p => p.theme.surface2};
    --ink: ${p => p.theme.ink};
    --body: ${p => p.theme.body};
    --muted: ${p => p.theme.muted};
    --border: ${p => p.theme.border};
    --gold: ${p => p.theme.gold};
    --gold-l: ${p => p.theme.goldL};
    --teal: ${p => p.theme.teal};
    --teal-d: ${p => p.theme.tealD};
    --teal-l: ${p => p.theme.tealL};
    --shadow: ${p => p.theme.shadow};
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${p => p.theme.bg};
    color:      ${p => p.theme.body};
    font-family: 'DM Sans', system-ui, sans-serif;
    min-height: 100vh;
    transition: background 0.25s, color 0.25s;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lora', serif;
    color: ${p => p.theme.ink};
  }

  button {
    font-family: inherit;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${p => p.theme.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${p => p.theme.muted}; }
`;
