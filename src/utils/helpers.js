import { DEFAULT_PREFS } from './constants';

/**
 * Groups words from all verses by Mushaf page + line number.
 * Returns a sorted array of { pageNum, lineNum, words[] }.
 * Word order is preserved (API guarantees correct order).
 */
export function groupWordsByLine(verses) {
  const lineMap = new Map();

  verses.forEach(verse => {
    (verse.words || []).forEach(word => {
      const key = `${word.page_number}-${word.line_number}`;
      if (!lineMap.has(key)) {
        lineMap.set(key, { pageNum: word.page_number, lineNum: word.line_number, words: [] });
      }
      lineMap.get(key).words.push({ ...word, verseKey: verse.verse_key });
    });
  });

  return Array.from(lineMap.values()).sort((a, b) =>
    a.pageNum !== b.pageNum ? a.pageNum - b.pageNum : a.lineNum - b.lineNum
  );
}

/** Capitalize first letter of a string */
export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/** Local storage helpers – persist user preferences */
const PREFS_KEY = 'qf_reader_prefs';

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const { user, ...rest } = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...rest };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs) {
  try {
    // Don't persist verses/chapterMeta/user/bookmarks/collections – only UI state
    const { verses, chapterMeta, user, bookmarks, collections, ...toSave } = prefs; // eslint-disable-line no-unused-vars
    localStorage.setItem(PREFS_KEY, JSON.stringify(toSave));
  } catch { /* quota exceeded or private mode */ }
}

/** Strip HTML tags from translation text for plain-text uses */
export function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || '';
}

/** Build verse fetch query params from current prefs */
export function buildVerseParams(prefs, scriptConfig, page = 1, perPage = 50) {
  const params = new URLSearchParams({
    words: 'true',
    word_fields: scriptConfig.wordFields,
    mushaf: scriptConfig.mushaf,
    per_page: perPage,
    page,
  });
  if (prefs.translation) params.set('translations', prefs.translation);
  return params.toString();
}
