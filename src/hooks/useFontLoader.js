import { useState, useEffect, useRef } from 'react';
import { CDN_BASE } from '../utils/constants';


// Module-level cache so fonts survive component remounts
const fontCache = new Set();

/**
 * Loads QCF per-page fonts for all unique page numbers in the verses array.
 * Returns a Set of page numbers whose fonts are ready to use.
 *
 * Rules (from QF font rendering docs):
 *  - V2: COLRv1 woff2 per page
 *  - V4: COLRv1 for Chrome/Safari, OT-SVG dark variant for Firefox dark mode
 *  - End markers always use Unicode UthmanicHafs — never load QCF for them
 *  - Load only the pages needed — never all 604 upfront
 */
export function useFontLoader(verses, fontVersion, theme) {
  const [loadedPages, setLoadedPages] = useState(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!verses?.length || !fontVersion) return;

    // Collect unique page numbers from non-end-marker words
    const pageNumbers = new Set();
    verses.forEach(verse => {
      (verse.words || []).forEach(word => {
        if (word.page_number && word.char_type_name !== 'end') {
          pageNumbers.add(word.page_number);
        }
      });
    });

    if (!pageNumbers.size) return;

    const isFirefox = navigator.userAgent.includes('Firefox');

    async function loadAll() {
      const newly = new Set(loadedPages);

      await Promise.all([...pageNumbers].map(async page => {
        const cacheKey = `${page}-${fontVersion}-${theme}`;
        if (fontCache.has(cacheKey)) { newly.add(page); return; }

        let url;
        if (fontVersion === 'v4') {
          url = (isFirefox && theme === 'dark')
            ? `${CDN_BASE}/fonts/quran/hafs/v4/ot-svg/dark/woff2/p${page}.woff2`
            : `${CDN_BASE}/fonts/quran/hafs/v4/colrv1/woff2/p${page}.woff2`;
        } else {
          url = `${CDN_BASE}/fonts/quran/hafs/${fontVersion}/woff2/p${page}.woff2`;
        }

        try {
          const fontName = `p${page}-${fontVersion}`;
          const ff = new FontFace(fontName, `url('${url}')`);
          ff.display = 'block';
          await ff.load();
          document.fonts.add(ff);

          // Inject Tajweed palette CSS once per font
          if (fontVersion === 'v4') injectTajweedPalette(fontName);

          fontCache.add(cacheKey);
          newly.add(page);
        } catch (e) {
          console.warn(`Font p${page}-${fontVersion} failed:`, e);
        }
      }));

      if (mountedRef.current) setLoadedPages(new Set(newly));
    }

    loadAll();
  }, [verses, fontVersion, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  return loadedPages;
}

function injectTajweedPalette(fontFamily) {
  const id = `palette-${fontFamily}`;
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = `
    @font-palette-values --TajweedLight { font-family:'${fontFamily}'; base-palette:0; }
    @font-palette-values --TajweedDark  { font-family:'${fontFamily}'; base-palette:1; }
    @font-palette-values --TajweedSepia { font-family:'${fontFamily}'; base-palette:2; }
  `;
  document.head.appendChild(s);
}
