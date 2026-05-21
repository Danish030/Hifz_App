import axios from 'axios';
import { API_BASE, BACKEND_BASE } from '../utils/constants';

const http = axios.create({ baseURL: API_BASE, timeout: 15000 });

/** Fetch current authenticated user from backend session */
export async function fetchCurrentUser() {
  const { data } = await axios.get(`${BACKEND_BASE}/auth/me`, { withCredentials: true });
  return data?.user || data;
}

/** Fetch user bookmarks */
export async function fetchBookmarks() {
  const { data } = await axios.get(`${BACKEND_BASE}/api/user/bookmarks`, { withCredentials: true });
  return data?.bookmarks || data?.data || data || [];
}

/** Fetch user collections */
export async function fetchCollections() {
  const { data } = await axios.get(`${BACKEND_BASE}/api/user/collections`, { withCredentials: true });
  return data?.collections || data?.data || data || [];
}

/** Fetch chapter metadata */
export async function fetchChapterMeta(chapterNumber) {
  const { data } = await http.get(`/chapters/${chapterNumber}`);
  return data.chapter || data;
}

/** Fetch verses with word data for font rendering */
export async function fetchVerses(chapterNumber, queryString) {
  const { data } = await http.get(`/verses/by_chapter/${chapterNumber}?${queryString}`);
  return data.verses || [];
}

/** Fetch chapter audio (reciter 1 = Abu Bakr al-Shatri) */
export async function fetchChapterAudio(chapterNumber, reciterId = 1) {
  const { data } = await http.get(`/audio/chapter/${reciterId}/${chapterNumber}`);
  return data.audio_file?.audio_url || null;
}

/** Fetch a footnote by its ID */
export async function fetchFootnote(id) {
  // Footnotes are at the raw content API path
  const { data } = await http.get(
    `/foot_notes/${id}`,
    { timeout: 8000 }
  );
  return data?.footNote?.text || data?.foot_note?.text || null;
}
