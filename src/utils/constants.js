// ─────────────────────────────────────────────────────────────────
// All hardcoded values live here. Change API_BASE to your backend URL.
// ─────────────────────────────────────────────────────────────────

export const API_BASE = '/api/content'; // Vite proxies /api → localhost:3000
export const CDN_BASE = 'https://verses.quran.foundation';

// ── Script / font configurations ──────────────────────────────────
export const SCRIPT_CONFIG = {
  qcf_v2: {
    label:         'QCF V2 – Mushaf',
    type:          'qcf',
    fontVersion:   'v2',
    wordFields:    'code_v2,text_qpc_hafs,line_number,page_number',
    mushaf:        1,
    glyphField:    'code_v2',
    fallbackField: 'text_qpc_hafs',
  },
  qcf_v4: {
    label:         'QCF V4 – Tajweed',
    type:          'qcf',
    fontVersion:   'v4',
    wordFields:    'code_v2,text_qpc_hafs,line_number,page_number',
    mushaf:        19,
    glyphField:    'code_v2',
    fallbackField: 'text_qpc_hafs',
  },
  uthmani: {
    label:         'Uthmani Unicode',
    type:          'unicode',
    fontVersion:   null,
    wordFields:    'text_uthmani,text_qpc_hafs',
    mushaf:        4,
    glyphField:    'text_uthmani',
    fallbackField: 'text_qpc_hafs',
  },
  indopak: {
    label:         'IndoPak Nastaleeq',
    type:          'unicode',
    fontVersion:   null,
    wordFields:    'text_indopak,text_qpc_hafs',
    mushaf:        3,
    glyphField:    'text_indopak',
    fallbackField: 'text_qpc_hafs',
  },
};

// ── Translation options ────────────────────────────────────────────
export const TRANSLATION_OPTIONS = [
  { value: '',    label: 'None' },
  { value: '131', label: 'Sahih International' },
  { value: '95',  label: 'Muhsin Khan' },
  { value: '85',  label: 'Pickthall' },
  { value: '203', label: 'Dr. Mustafa Khattab' },
];

// ── Default preferences ────────────────────────────────────────────
export const DEFAULT_PREFS = {
  script:        'qcf_v2',
  view:          'translation',  // 'translation' | 'reading'
  theme:         'light',        // 'light' | 'sepia' | 'dark'
  scale:         3,              // 1–5
  translation:   '131',
  wbw:           true,
  audioEnabled:  true,
  chapter:       1,
};

// ── All 114 chapter names ──────────────────────────────────────────
export const CHAPTER_NAMES = [
  '',
  'Al-Fatihah','Al-Baqarah','Ali \'Imran','An-Nisa\'','Al-Ma\'idah',
  'Al-An\'am','Al-A\'raf','Al-Anfal','At-Tawbah','Yunus',
  'Hud','Yusuf','Ar-Ra\'d','Ibrahim','Al-Hijr',
  'An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha',
  'Al-Anbya\'','Al-Hajj','Al-Mu\'minun','An-Nur','Al-Furqan',
  'Ash-Shu\'ara\'','An-Naml','Al-Qasas','Al-\'Ankabut','Ar-Rum',
  'Luqman','As-Sajdah','Al-Ahzab','Saba\'','Fatir',
  'Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir',
  'Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah',
  'Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf',
  'Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman',
  'Al-Waqi\'ah','Al-Hadid','Al-Mujadila','Al-Hashr','Al-Mumtahanah',
  'As-Saf','Al-Jumu\'ah','Al-Munafiqun','At-Taghabun','At-Talaq',
  'At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Ma\'arij',
  'Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah',
  'Al-Insan','Al-Mursalat','An-Naba\'','An-Nazi\'at','\'Abasa',
  'At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj',
  'At-Tariq','Al-A\'la','Al-Ghashiyah','Al-Fajr','Al-Balad',
  'Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin',
  'Al-\'Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-\'Adiyat',
  'Al-Qari\'ah','At-Takathur','Al-\'Asr','Al-Humazah','Al-Fil',
  'Quraysh','Al-Ma\'un','Al-Kawthar','Al-Kafirun','An-Nasr',
  'Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas',
];
