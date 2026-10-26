/**
 * ASDOS DIGITAL ACADEMY — LMS DATA & WHITELIST ENGINE (V2.0)
 * Handles:
 * 1. Whitelist Verification for Lynk.id Buyer Emails
 * 2. Student Authentication & Dynamic Level Progression
 * 3. Course Modules (Fundamental 7 Hari as 1 Unified Track + Additional Modules)
 * 4. Notion-style Info, Tools & Prompt Bank Management
 * 5. Cloud Database (Supabase) Adapter & Backup Export/Import
 */

(function(window) {
  'use strict';

  // Storage Keys
  const KEY_WHITELIST = 'asdos_lms_whitelist_v1';
  const KEY_SESSION = 'asdos_lms_student_session_v1';
  const KEY_COURSES = 'asdos_lms_courses_v2';
  const KEY_INFO = 'asdos_lms_info_settings_v1';
  const KEY_PROMPTS = 'asdos_lms_prompts_v1';
  const KEY_SUPABASE = 'asdos_lms_supabase_config_v1';

  // Default Seed Whitelist (Contoh pembeli Lynk.id untuk testing)
  const DEFAULT_WHITELIST = [
    { email: 'peserta@gmail.com', dateAdded: '2026-10-20T08:00:00.000Z', note: 'Pembeli Lynk.id Batch 1' },
    { email: 'alumni@asdosdigital.com', dateAdded: '2026-10-21T10:30:00.000Z', note: 'Early Bird Lynk.id' },
    { email: 'demo@lynk.id', dateAdded: '2026-10-22T14:15:00.000Z', note: 'Akun Demo Review' }
  ];

  // Default Seed Info & Tools Asdos (Sesuai Screenshot Notion)
  const DEFAULT_INFO = {
    announcements: [
      'Untuk membeli 1000 Flow Credit/Bulan silahkan japri Haniyo',
      'Untuk Program Affiliate Akademi Animasi Asdos silahkan japri Haniyo'
    ],
    memberHubUrl: 'https://wa.me/6281289795589?text=Halo%20Kak%20Haniyo%2C%20saya%20ingin%20gabung%20Asdos%20Member%20Hub',
    importantLinks: [
      { title: 'WhatsApp Admin Haniyo', desc: 'Konsultasi & Bantuan Kendala Praktik', url: 'https://wa.me/6281289795589?text=Halo%20Admin%20Haniyo%2C%20saya%20butuh%20bantuan%20belajar' },
      { title: 'Google Flow (Tools Gambar & Video)', desc: 'labs.google/fx/tools/flow', url: 'https://labs.google/fx/tools/flow' },
      { title: 'Google AI Studio (Voice Over)', desc: 'aistudio.google.com/generate-speech', url: 'https://aistudio.google.com/generate-speech' }
    ],
    toolsAsdos: [
      { name: 'Asdos Fakta Unik', desc: 'Generator topik fakta menarik otomatis', url: 'https://wa.me/6281289795589?text=Buka%20Asdos%20Fakta%20Unik' },
      { name: 'Asdos Fakta Unik GPT', desc: 'Custom GPT pembuat skrip 3 adegan', url: 'https://chatgpt.com/' },
      { name: 'Asdos Design', desc: 'Panduan visual & pemilihan warna', url: 'https://canva.com' },
      { name: 'Asdos Object Talk', desc: 'Generator karakter benda hidup', url: 'https://labs.google/fx/tools/flow' },
      { name: 'Asdos Cerita', desc: 'Penyusun narasi dongeng & edukasi', url: 'https://chatgpt.com/' }
    ]
  };

  // Default Seed Prompts Bank (Untuk Tab "Prompt" di Dashboard Siswa)
  const DEFAULT_PROMPTS = [
    {
      id: 'prompt-1',
      title: 'Prompt Day 1 — Gambar Kucing di Taman (Rasio 9:16)',
      targetTool: 'Google Flow',
      description: 'Gunakan ini di Google Flow untuk membuat gambar pertama yang tajam dan nyaman di layar HP.',
      promptText: 'Seekor kucing oren duduk santai di taman kecil penuh bunga warna-warni. Cahaya matahari pagi yang hangat, warna cerah dan bersih, gaya animasi 3D lembut, rasio vertikal 9:16, resolusi tinggi.'
    },
    {
      id: 'prompt-2',
      title: 'Prompt Day 2 — Karakter Konsisten (Character Sheet 3 Sudut)',
      targetTool: 'Google Flow',
      description: 'Format acuan paten agar tokoh animasi tidak berubah bentuk wajahnya di setiap adegan.',
      promptText: 'Professional 3D character turnaround sheet of an Indonesian boy named Budi, 9 years old, wearing green t-shirt and dark jeans. Showing 3 angles: front view, side view, and 3/4 view. Clean white studio background, neutral lighting, consistent proportions, high resolution, 9:16.'
    },
    {
      id: 'prompt-3',
      title: 'Prompt Day 4 — Skrip Fakta Unik 3 Adegan (ChatGPT)',
      targetTool: 'ChatGPT',
      description: 'Kirimkan perintah ini ke ChatGPT untuk merumuskan fakta menarik + prompt visual Flow sekaligus.',
      promptText: 'Tolong buatkan 1 skrip video fakta unik tentang lebah madu yang terdiri dari 3 adegan pendek (masing-masing 3-4 detik). Untuk tiap adegan, sertakan: 1 kalimat narasi suara dan 1 deskripsi prompt visual dalam bahasa Inggris untuk dibuat di Flow dengan format vertikal 9:16.'
    },
    {
      id: 'prompt-4',
      title: 'Prompt Day 7 — Formula Eksplorasi Karya Lanjutan',
      targetTool: 'Flow & ChatGPT',
      description: 'Rumus membuat tema animasi baru setelah menyelesaikan kelas fundamental 7 hari.',
      promptText: '[Subjek Karakter] + [Aktivitas Utama] + [Latar Tempat & Suasana] + [Pencahayaan & Warna] + [Gaya Visual 3D Halus] + [Format 9:16]'
    }
  ];

  // Default Categories & Modules (Sesuai Screenshot Notion)
  const DEFAULT_MODULE_CATEGORIES = [
    {
      categoryTitle: 'Fundamental Animasi AI',
      categorySubtitle: 'Fondasi wajib: ikuti langkah demi langkah untuk membuat karya pertama',
      cards: [
        {
          id: 'card-7hari',
          title: '7 Hari Belajar Animasi AI',
          badge: 'Program Inti (7 Hari)',
          desc: 'Program fundamental lengkap dari membuat gambar, karakter konsisten, klip adegan, voice over AI, hingga panggung kelulusan.',
          thumbnail: 'banner-2.jpg',
          type: 'core_7day',
          url: 'v3.1/day1-v3.1.html',
          isFree: false
        },
        {
          id: 'card-perkenalan',
          title: 'Video Perkenalan',
          badge: 'Video Orientasi',
          desc: 'Selamat datang di Akademi Animasi Asdos. Pahami alur belajar santai tanpa terburu-buru.',
          thumbnail: 'asdos-square.png',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/tgp7gr5Qf8s?rel=0&playsinline=1',
          url: 'v3.1/day1-v3.1.html',
          isFree: true
        },
        {
          id: 'card-alur',
          title: 'Alur Membuat Animasi AI (Berlaku di Semua Tools)',
          badge: 'Konsep Mindset',
          desc: 'Mindset alur produksi: dari satu ide, menjadi gambar acuan, diubah jadi klip gerak, hingga disatukan bersama suara.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/8JPgKps5s10?rel=0&playsinline=1',
          url: 'v3.1/day1-v3.1.html',
          isFree: true
        }
      ]
    },
    {
      categoryTitle: 'Materi 2: Mengenali Berbagai Aplikasi & Web Animasi AI',
      categorySubtitle: 'Eksplorasi alat bantu tambahan setelah menguasai modul fundamental',
      cards: [
        {
          id: 'card-yt-create',
          title: 'Cara Pakai YouTube Create',
          badge: 'Video Tutorial',
          desc: 'Aplikasi resmi YouTube di HP untuk mengedit video dan memberi efek suara gratis tanpa watermark.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/tgp7gr5Qf8s?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-flow-generate',
          title: 'Cara Generate Pakai Flow Lanjutan',
          badge: 'Tips Praktik',
          desc: 'Mendalami pengaturan kamera, rasio aspek, dan trik variasi gerakan di Google Flow.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/ahtYHSTSNeM?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-leonardo',
          title: 'Cara Bikin Animasi AI Pakai Leonardo',
          badge: 'Alternatif Web',
          desc: 'Mencoba platform alternatif Leonardo AI untuk variasi karakter dan gaya gambar sinematik.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/gUmTEnx0hOg?rel=0&playsinline=1',
          url: '#',
          isFree: false
        }
      ]
    }
  ];

  // ==========================================================================
  // WHITELIST MANAGEMENT
  // ==========================================================================
  function getWhitelist() {
    try {
      const data = localStorage.getItem(KEY_WHITELIST);
      if (!data) {
        localStorage.setItem(KEY_WHITELIST, JSON.stringify(DEFAULT_WHITELIST));
        return DEFAULT_WHITELIST;
      }
      return JSON.parse(data);
    } catch(e) {
      return DEFAULT_WHITELIST;
    }
  }

  function saveWhitelist(list) {
    try {
      localStorage.setItem(KEY_WHITELIST, JSON.stringify(list));
      return true;
    } catch(e) {
      return false;
    }
  }

  function addWhitelistBatch(inputString, defaultNote = 'Input Admin Lynk.id') {
    if (!inputString) return { added: 0, total: 0 };
    const rawTokens = inputString.split(/[\r\n,;\s]+/);
    const validEmails = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    rawTokens.forEach(token => {
      const cleaned = token.trim().toLowerCase();
      if (cleaned && emailRegex.test(cleaned)) {
        validEmails.push(cleaned);
      }
    });

    const currentList = getWhitelist();
    const existingEmails = new Set(currentList.map(item => item.email.toLowerCase()));
    let addedCount = 0;
    const now = new Date().toISOString();

    validEmails.forEach(email => {
      if (!existingEmails.has(email)) {
        currentList.push({
          email: email,
          dateAdded: now,
          note: defaultNote
        });
        existingEmails.add(email);
        addedCount++;
      }
    });

    if (addedCount > 0) saveWhitelist(currentList);
    return { added: addedCount, total: currentList.length };
  }

  function removeWhitelistEmail(email) {
    const list = getWhitelist();
    const target = email.trim().toLowerCase();
    const filtered = list.filter(item => item.email.toLowerCase() !== target);
    saveWhitelist(filtered);
    return filtered.length;
  }

  function isEmailWhitelisted(email) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const list = getWhitelist();
    return list.some(item => item.email.toLowerCase() === clean);
  }

  // ==========================================================================
  // STUDENT SESSION & LEVEL PROGRESSION
  // ==========================================================================
  function getCurrentStudent() {
    try {
      const session = localStorage.getItem(KEY_SESSION);
      if (!session) return null;
      return JSON.parse(session);
    } catch(e) {
      return null;
    }
  }

  function loginStudent(email, name = '') {
    if (!email) return { success: false, reason: 'Email wajib diisi.' };
    const cleanEmail = email.trim().toLowerCase();

    if (!isEmailWhitelisted(cleanEmail)) {
      return {
        success: false,
        reason: 'not_whitelisted',
        message: 'Email belum terdaftar di whitelist Lynk.id. Pastikan memakai email yang sama saat membeli kelas.'
      };
    }

    let displayName = name.trim();
    if (!displayName) {
      const parts = cleanEmail.split('@')[0].replace(/[._-]+/g, ' ');
      displayName = parts.charAt(0).toUpperCase() + parts.slice(1);
    }

    const studentSession = {
      email: cleanEmail,
      name: displayName,
      loggedInAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(KEY_SESSION, JSON.stringify(studentSession));
    } catch(e){}

    return { success: true, student: studentSession };
  }

  function logoutStudent() {
    try {
      localStorage.removeItem(KEY_SESSION);
    } catch(e){}
    return true;
  }

  // Hitung Level Siswa berdasarkan jumlah hari tuntas
  function getStudentLevel(completedDays = 0) {
    if (completedDays >= 7) {
      return {
        levelNumber: 4,
        title: 'Level 4: Kreator Animasi Mandiri',
        statusBadge: 'Alumni Terverifikasi',
        badgeSvg: 'assets/badges/level-4.svg',
        desc: 'Selamat! Anda telah menuntaskan seluruh materi 7 hari dan siap berkarya secara mandiri.'
      };
    }
    if (completedDays >= 4) {
      return {
        levelNumber: 3,
        title: 'Level 3: Perangkai Adegan & Suara',
        statusBadge: 'Tingkat Menengah',
        badgeSvg: 'assets/badges/level-3.svg',
        desc: 'Hebat! Anda sudah menguasai pembuatan alur cerita fakta dan integrasi narasi suara AI.'
      };
    }
    if (completedDays >= 2) {
      return {
        levelNumber: 2,
        title: 'Level 2: Penjelajah Gambar & Karakter',
        statusBadge: 'Tingkat Dasar Lanjutan',
        badgeSvg: 'assets/badges/level-2.svg',
        desc: 'Bagus sekali! Anda telah belajar membuat gambar dan karakter yang konsisten.'
      };
    }
    return {
      levelNumber: 1,
      title: 'Level 1: Pemula Antusias',
      statusBadge: 'Langkah Pertama',
      badgeSvg: 'assets/badges/level-1.svg',
      desc: 'Selamat datang! Mari mulai praktik langkah demi langkah dari Day 1.'
    };
  }

  function isDayAccessible(dayNumber) {
    if (dayNumber === 1 || dayNumber === '1') return true;
    const student = getCurrentStudent();
    if (!student || !student.email) return false;
    return isEmailWhitelisted(student.email);
  }

  // ==========================================================================
  // MODULES & CATEGORIES MANAGEMENT
  // ==========================================================================
  function getModuleCategories() {
    try {
      const raw = localStorage.getItem(KEY_COURSES);
      if (!raw) {
        localStorage.setItem(KEY_COURSES, JSON.stringify(DEFAULT_MODULE_CATEGORIES));
        return DEFAULT_MODULE_CATEGORIES;
      }
      const data = JSON.parse(raw);
      // Auto-migrate legacy preview links to v3.1
      let changed = false;
      if (Array.isArray(data)) {
        data.forEach(cat => {
          if (Array.isArray(cat.cards)) {
            cat.cards.forEach(card => {
              if (card.url && card.url.includes('day1-preview.html')) {
                card.url = 'v3.1/day1-v3.1.html';
                changed = true;
              }
            });
          }
        });
      }
      if (changed) {
        localStorage.setItem(KEY_COURSES, JSON.stringify(data));
      }
      return data;
    } catch(e) {
      return DEFAULT_MODULE_CATEGORIES;
    }
  }

  function saveModuleCategories(categories) {
    localStorage.setItem(KEY_COURSES, JSON.stringify(categories));
    return categories;
  }

  function addCardToCategory(categoryIndex, cardData) {
    const list = getModuleCategories();
    if (categoryIndex >= 0 && categoryIndex < list.length) {
      if (!cardData.id) cardData.id = 'card-' + Date.now();
      list[categoryIndex].cards.push(cardData);
      saveModuleCategories(list);
      return true;
    }
    return false;
  }

  function createNewCategory(title, subtitle = '') {
    const list = getModuleCategories();
    list.push({
      categoryTitle: title,
      categorySubtitle: subtitle,
      cards: []
    });
    saveModuleCategories(list);
    return list;
  }

  // ==========================================================================
  // INFORMASI & TOOLS SETTINGS
  // ==========================================================================
  function getInfoSettings() {
    try {
      const raw = localStorage.getItem(KEY_INFO);
      if (!raw) {
        localStorage.setItem(KEY_INFO, JSON.stringify(DEFAULT_INFO));
        return DEFAULT_INFO;
      }
      return JSON.parse(raw);
    } catch(e) {
      return DEFAULT_INFO;
    }
  }

  function saveInfoSettings(data) {
    localStorage.setItem(KEY_INFO, JSON.stringify(data));
    return data;
  }

  // ==========================================================================
  // PROMPTS BANK MANAGEMENT
  // ==========================================================================
  function getPrompts() {
    try {
      const raw = localStorage.getItem(KEY_PROMPTS);
      if (!raw) {
        localStorage.setItem(KEY_PROMPTS, JSON.stringify(DEFAULT_PROMPTS));
        return DEFAULT_PROMPTS;
      }
      return JSON.parse(raw);
    } catch(e) {
      return DEFAULT_PROMPTS;
    }
  }

  function savePrompts(list) {
    localStorage.setItem(KEY_PROMPTS, JSON.stringify(list));
    return list;
  }

  function addPrompt(promptObj) {
    const list = getPrompts();
    if (!promptObj.id) promptObj.id = 'prompt-' + Date.now();
    list.push(promptObj);
    savePrompts(list);
    return promptObj;
  }

  function deletePrompt(id) {
    const list = getPrompts();
    const filtered = list.filter(p => p.id !== id);
    savePrompts(filtered);
    return filtered;
  }

  // ==========================================================================
  // SUPABASE CONFIG & BACKUP
  // ==========================================================================
  function getSupabaseConfig() {
    try {
      return JSON.parse(localStorage.getItem(KEY_SUPABASE) || '{}');
    } catch(e) {
      return {};
    }
  }

  function saveSupabaseConfig(url, anonKey) {
    const cfg = { url: (url || '').trim(), anonKey: (anonKey || '').trim(), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY_SUPABASE, JSON.stringify(cfg));
    return cfg;
  }

  const SUPABASE_SQL_SCHEMA = `-- =====================================================================
-- ASDOS DIGITAL ACADEMY — SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di: Supabase Console -> SQL Editor -> New Query
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.whitelist_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  note TEXT DEFAULT 'Pembelian Lynk.id',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_whitelist_email ON public.whitelist_students(email);

CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.course_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  badge TEXT,
  description TEXT,
  thumbnail TEXT,
  video_url TEXT,
  target_url TEXT,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  progress_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_active TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_email, course_id)
);

ALTER TABLE public.whitelist_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses publik untuk kategori kursus" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Akses publik untuk kartu materi" ON public.course_cards FOR SELECT USING (true);
`;

  function exportAllData() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      whitelist: getWhitelist(),
      categories: getModuleCategories(),
      info: getInfoSettings(),
      prompts: getPrompts(),
      unifiedState: JSON.parse(localStorage.getItem('asdos_lms_unified_state_v1') || '{}')
    }, null, 2);
  }

  function importAllData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.whitelist)) saveWhitelist(data.whitelist);
      if (Array.isArray(data.categories)) saveModuleCategories(data.categories);
      if (data.info) saveInfoSettings(data.info);
      if (Array.isArray(data.prompts)) savePrompts(data.prompts);
      if (data.unifiedState) localStorage.setItem('asdos_lms_unified_state_v1', JSON.stringify(data.unifiedState));
      return { success: true };
    } catch(e) {
      return { success: false, error: e.message };
    }
  }

  // Expose to window
  window.LMS_DB = {
    getWhitelist,
    saveWhitelist,
    addWhitelistBatch,
    removeWhitelistEmail,
    isEmailWhitelisted,
    getCurrentStudent,
    loginStudent,
    logoutStudent,
    getStudentLevel,
    isDayAccessible,
    getModuleCategories,
    saveModuleCategories,
    addCardToCategory,
    createNewCategory,
    getInfoSettings,
    saveInfoSettings,
    getPrompts,
    savePrompts,
    addPrompt,
    deletePrompt,
    getSupabaseConfig,
    saveSupabaseConfig,
    SUPABASE_SQL_SCHEMA,
    exportAllData,
    importAllData
  };

})(window);
