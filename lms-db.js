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
  const KEY_COURSES = 'asdos_lms_courses_v3';
  const KEY_INFO = 'asdos_lms_info_settings_v2';
  const KEY_PROMPTS = 'asdos_lms_prompts_v1';
  const KEY_SUPABASE = 'asdos_lms_supabase_config_v1';

  // Default Seed Whitelist (Contoh pembeli Lynk.id untuk testing)
  const DEFAULT_WHITELIST = [
    { email: 'peserta@gmail.com', dateAdded: '2026-10-20T08:00:00.000Z', note: 'Pembeli Lynk.id Batch 1' },
    { email: 'alumni@asdosdigital.com', dateAdded: '2026-10-21T10:30:00.000Z', note: 'Early Bird Lynk.id' },
    { email: 'demo@lynk.id', dateAdded: '2026-10-22T14:15:00.000Z', note: 'Akun Demo Review' }
  ];

  // Default Seed Info & Tools Asdos (Sesuai Database Notion Akademi Animasi Asdos)
  const DEFAULT_INFO = {
    announcements: [
      'Untuk membeli 1000 Flow Credit/Bulan silahkan hubungi Admin Haniyo',
      'Untuk Program Affiliate Akademi Animasi Asdos silahkan hubungi Admin Haniyo'
    ],
    memberHubUrl: 'http://s.id/AsdosMemberHub',
    importantLinks: [
      { title: 'Asdos Member Hub', desc: 'Komunitas & Hub Anggota Asdos', url: 'http://s.id/AsdosMemberHub' },
      { title: 'Google Flow (Generator Gambar & Video)', desc: 'labs.google/fx/tools/flow', url: 'https://labs.google/fx/tools/flow' },
      { title: 'Google AI Studio (Voice Over)', desc: 'aistudio.google.com/generate-speech', url: 'https://aistudio.google.com/generate-speech' },
      { title: 'Leonardo.AI', desc: 'Platform generator alternatif', url: 'https://leonardo.ai/' },
      { title: 'Figma AI Weave', desc: 'Alat bantu visual layout', url: 'https://weave.figma.com/' },
      { title: 'Firefox Relay', desc: 'Pembuat email sementara untuk testing akun', url: 'https://relay.firefox.com/' }
    ],
    toolsAsdos: [
      { name: 'Asdos Fakta Unik (Gemini)', desc: 'Gemini Gem generator topik fakta unik otomatis', url: 'https://gemini.google.com/gem/12VPsc6TiZUe32hk7rYj4bVVtRLjAhTfw?usp=sharing' },
      { name: 'Asdos Fakta Unik GPT (ChatGPT)', desc: 'Custom GPT pembuat skrip 3 adegan terstruktur', url: 'https://chatgpt.com/g/g-6a2018b9bbf8819197fc5ecc837a99d6-asdos-fakta-unik' },
      { name: 'Asdos Design', desc: 'Panduan visual, palet warna, dan aset desain', url: 'https://gemini.google.com/gem/1boLNPNZyXk_QMPV_MVNSzQ5ECg6uf5KM?usp=sharing' },
      { name: 'Asdos Object Talk', desc: 'Generator animasi benda mati berbicara', url: 'https://chatgpt.com/g/g-6a2014888bc88191961fbe2e19ba5544-asdos-object-talk' },
      { name: 'Asdos Cerita', desc: 'Penyusun narasi dongeng & dialog karakter', url: 'https://chatgpt.com/g/g-6a1f84d222d881918f218e22f5984311-asdos-cerita' },
      { name: 'Asdos Affiliate GPT', desc: 'Generator storyboard video promosi & UGC', url: 'https://chatgpt.com/g/g-6a20679037848191a01befec4b0e6e8d-asdos-affiliate-ugc' },
      { name: 'Asdos Video Edukasi', desc: 'Formula skrip konten pengetahuan & edukasi', url: 'https://chatgpt.com/g/g-6a35126955948191ab28a9f7283eedd4-asdos-video-edukasi' },
      { name: 'Asdos Podcast', desc: 'Generator konsep percakapan & podcast 2 arah', url: 'https://chatgpt.com/g/g-6a23d5cef6948191a91a7ce570e58e5b-asdos-podcast' },
      { name: 'Asdos Iklan 1.5 (Gemini)', desc: 'Penyusun panel storyboard iklan komersial', url: 'https://gemini.google.com/gem/1BGY1PuBHfHl80Uy_lRZ9vAzidZ3hLtbi?usp=sharing' }
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

  // Default Categories & Modules (Sesuai Kurikulum Akademi Animasi Asdos)
  const DEFAULT_MODULE_CATEGORIES = [
    {
      categoryTitle: 'Fundamental Animasi AI',
      categorySubtitle: 'Fondasi wajib: ikuti langkah demi langkah untuk membuat karya pertama',
      cards: [
        {
          id: 'card-7hari',
          title: '7 Hari Belajar Animasi AI',
          badge: 'Program Inti (7 Hari)',
          desc: 'Program fundamental terstruktur dari membuat gambar karakter, video gerak di Flow, voice over AI, hingga panggung kelulusan.',
          thumbnail: 'banner-2.jpg',
          type: 'core_7day',
          url: 'v3.2/day1-v3.2.html',
          isFree: false
        },
        {
          id: 'card-perkenalan',
          title: 'Video Perkenalan & Orientasi',
          badge: 'Video Orientasi',
          desc: 'Selamat datang di Akademi Animasi Asdos. Pahami alur belajar santai, fokus buat karakter kucing dulu sebelum proyek kompleks.',
          thumbnail: 'asdos-square.png',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/y7uuQRH_aCw?rel=0&playsinline=1',
          url: '#',
          isFree: true
        },
        {
          id: 'card-alur',
          title: 'Alur Membuat Animasi AI (Berlaku Universal)',
          badge: 'Konsep Mindset',
          desc: 'Mindset alur produksi standar: dari ide cerita, karakter acuan, render klip gerak, hingga editing audio akhir.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/EU0-LG3zQXE?rel=0&playsinline=1',
          url: '#',
          isFree: true
        }
      ]
    },
    {
      categoryTitle: 'Materi 2: Mengenali Berbagai Aplikasi & Web Animasi AI',
      categorySubtitle: 'Panduan teknis Google Flow, YouTube Create, dan platform pendukung',
      cards: [
        {
          id: 'card-flow-generate',
          title: 'Tutorial Google Flow & Manajemen Token',
          badge: 'Modul Interaktif',
          desc: 'Panduan lengkap antarmuka Google Flow, manajemen kredit 0-100 token, dan trik render video tanpa boros kuota.',
          thumbnail: 'banner-2.jpg',
          type: 'interactive_module',
          videoUrl: 'https://www.youtube-nocookie.com/embed/eOZVJUmjjwA?rel=0&playsinline=1',
          url: 'modules/tutorial-flow.html',
          isFree: false
        },
        {
          id: 'card-yt-create',
          title: 'Cara Pakai YouTube Create di HP',
          badge: 'Video Tutorial',
          desc: 'Aplikasi resmi YouTube di HP untuk mengedit video, dubbing suara, dan formula prompt max 900 karakter.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/SdeMH0knyac?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-leonardo',
          title: 'Cara Bikin Animasi AI Pakai Leonardo',
          badge: 'Alternatif Web',
          desc: 'Mencoba platform alternatif Leonardo AI untuk variasi karakter dan gaya visual sinematik (Modul opsional).',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/5-dRbxvYlec?rel=0&playsinline=1',
          url: '#',
          isFree: false
        }
      ]
    },
    {
      categoryTitle: 'Materi 3: Membuat Berbagai Tipe Video Animasi',
      categorySubtitle: 'Praktik produksi video iklan produk, video affiliate UGC, video edukasi, dan dialog bercerita',
      cards: [
        {
          id: 'card-iklan-seedance',
          title: 'Cara Bikin Iklan (Gemini + Seedance 2.0)',
          badge: 'Video Iklan',
          desc: 'Membuat panel storyboard iklan produk di Gemini Gem Asdos Iklan 1.5 lalu render video di Leonardo Seedance.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/Ai9ddkB-bCY?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-affiliate-ugc',
          title: 'Cara Bikin Video Affiliate TikTok / UGC',
          badge: 'Video Affiliate',
          desc: 'Alur 6 langkah dari Asdos Affiliate GPT, generate storyboard di Flow (Nano Banana), hingga render video vertikal 9:16.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/ozI7-rC2gVI?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-video-edukasi',
          title: 'Tutorial Video Edukasi & Pengetahuan',
          badge: 'Video Edukasi',
          desc: 'Membuat konten edukasi fakta menarik dengan struktur 3 adegan menggunakan bantuan Asdos Video Edukasi GPT.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/djFDIvJG08g?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-narasi-cerita',
          title: 'Video Narasi Bercerita dan Dialog',
          badge: 'Storytelling',
          desc: 'Menyusun animasi kisah fiksi dan dongeng dengan dialog antartokoh memanfaatkan Asdos Cerita GPT.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/FwCu0RuVmvE?rel=0&playsinline=1',
          url: '#',
          isFree: false
        }
      ]
    },
    {
      categoryTitle: 'Materi 4: Tutorial Tambahan & Optimasi Medsos',
      categorySubtitle: 'Strategi tembus algoritma TikTok, penambahan followers, character sheet, dan voice over',
      cards: [
        {
          id: 'card-algoritma-tiktok',
          title: 'Penghancur Algoritma TikTok',
          badge: 'Strategi Medsos',
          desc: 'Solusi akun terkena shadowban, views mentok di bawah 200, dan trik memancing algoritma rekomendasi FYP.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/BqsBpcJ68Hk?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-1000-followers',
          title: 'Cara Tembus 1000 Followers Pertama',
          badge: 'Growth Akun',
          desc: 'Langkah taktis bagi kreator baru untuk mencapai 1000 followers pertama agar fitur keranjang kuning dan live terbuka.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/cm8bxLwLnVA?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-prompting-segala',
          title: 'Formula Prompting Segala Jenis Video',
          badge: 'Mastery Prompt',
          desc: 'Rumus universal menyusun prompt visual karakter, pencahayaan, dan kamera untuk berbagai tema video animasi.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/dLb719vkG6k?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-voice-over',
          title: 'Cara Membuat Voice Over (Google AI Studio)',
          badge: 'Audio & Dubbing',
          desc: 'Panduan membuat rekaman suara narasi berbahasa Indonesia yang jernih dan natural secara gratis.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/iZ7lQFOsQwk?rel=0&playsinline=1',
          url: '#',
          isFree: false
        },
        {
          id: 'card-gabung-edit',
          title: 'Cara Menggabungkan & Edit Video',
          badge: 'Editing Final',
          desc: 'Menyatukan klip animasi hasil generate dari Flow dengan audio narasi dan musik latar menjadi video utuh.',
          thumbnail: 'banner-2.jpg',
          type: 'single_video',
          videoUrl: 'https://www.youtube-nocookie.com/embed/4_tAKLSC9Ws?rel=0&playsinline=1',
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

    if (addedCount > 0) {
      saveWhitelist(currentList);
      pushWhitelistToSupabase(validEmails, defaultNote);
    }
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
      let data = JSON.parse(raw);
      let changed = false;

      // Pastikan data selalu sinkron dengan kurikulum terbaru (4 kategori dari DEFAULT_MODULE_CATEGORIES)
      if (!Array.isArray(data) || data.length < DEFAULT_MODULE_CATEGORIES.length) {
        data = DEFAULT_MODULE_CATEGORIES;
        changed = true;
      } else {
        DEFAULT_MODULE_CATEGORIES.forEach((defCat, catIdx) => {
          if (!data[catIdx]) {
            data[catIdx] = defCat;
            changed = true;
          } else {
            defCat.cards.forEach(defCard => {
              const existingCard = data[catIdx].cards.find(c => c.id === defCard.id);
              if (!existingCard) {
                data[catIdx].cards.push(defCard);
                changed = true;
              } else {
                // Selalu perbarui URL, tipe, dan videoUrl dari default resmi
                if (existingCard.url !== defCard.url || existingCard.type !== defCard.type || existingCard.videoUrl !== defCard.videoUrl) {
                  existingCard.url = defCard.url;
                  existingCard.type = defCard.type;
                  existingCard.videoUrl = defCard.videoUrl;
                  existingCard.title = defCard.title;
                  existingCard.badge = defCard.badge;
                  existingCard.desc = defCard.desc;
                  changed = true;
                }
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
  const DEFAULT_SUPABASE = {
    url: 'https://jxfvwrhwidtidasctiif.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZnZ3cmh3aWR0aWRhc2N0aWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNDAzMjMsImV4cCI6MjEwODgxNjMyM30.hqFF5CJQpXC7YE0wYA5cxYSvUuJLZHjDMH7_hIqlAlE'
  };

  function cleanSupabaseUrl(url) {
    if (!url) return '';
    return url.trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
  }

  function getSupabaseConfig() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY_SUPABASE) || '{}');
      if (stored.url && stored.anonKey) {
        return {
          url: cleanSupabaseUrl(stored.url),
          anonKey: stored.anonKey.trim(),
          updatedAt: stored.updatedAt
        };
      }
      return DEFAULT_SUPABASE;
    } catch(e) {
      return DEFAULT_SUPABASE;
    }
  }

  function saveSupabaseConfig(url, anonKey) {
    const cfg = {
      url: cleanSupabaseUrl(url || DEFAULT_SUPABASE.url),
      anonKey: (anonKey || DEFAULT_SUPABASE.anonKey).trim(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(KEY_SUPABASE, JSON.stringify(cfg));
    if (cfg.url && cfg.anonKey) {
      setTimeout(syncWhitelistFromSupabase, 100);
    }
    return cfg;
  }

  async function syncWhitelistFromSupabase() {
    const cfg = getSupabaseConfig();
    if (!cfg || !cfg.url || !cfg.anonKey) return false;
    try {
      const cleanUrl = cleanSupabaseUrl(cfg.url);
      const resp = await fetch(`${cleanUrl}/rest/v1/whitelist_students?select=email,note,created_at`, {
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`
        }
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const cur = getWhitelist();
        const existing = new Set(cur.map(x => x.email.toLowerCase()));
        let changed = false;
        data.forEach(item => {
          if (item.email && !existing.has(item.email.toLowerCase())) {
            cur.push({
              email: item.email.toLowerCase(),
              dateAdded: item.created_at || new Date().toISOString(),
              note: item.note || 'Supabase Cloud'
            });
            existing.add(item.email.toLowerCase());
            changed = true;
          }
        });
        if (changed) {
          saveWhitelist(cur);
          if (typeof window !== 'undefined' && window.renderWhitelistTable) {
            window.renderWhitelistTable();
          }
        }
        return true;
      }
    } catch(err) {}
    return false;
  }

  async function pushWhitelistToSupabase(emailsArray, note = 'Input Admin Lynk.id') {
    const cfg = getSupabaseConfig();
    if (!cfg || !cfg.url || !cfg.anonKey) return false;
    try {
      const cleanUrl = cleanSupabaseUrl(cfg.url);
      const payload = emailsArray.map(em => ({
        email: em.toLowerCase(),
        note: note
      }));
      const resp = await fetch(`${cleanUrl}/rest/v1/whitelist_students`, {
        method: 'POST',
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify(payload)
      });
      return resp.ok;
    } catch(e) {
      return false;
    }
  }

  async function testSupabaseConnection() {
    const cfg = getSupabaseConfig();
    if (!cfg || !cfg.url || !cfg.anonKey) {
      return { success: false, message: 'URL atau Anon Key belum diisi.' };
    }
    try {
      const cleanUrl = cleanSupabaseUrl(cfg.url);
      const resp = await fetch(`${cleanUrl}/rest/v1/whitelist_students?select=count`, {
        headers: {
          'apikey': cfg.anonKey,
          'Authorization': `Bearer ${cfg.anonKey}`
        }
      });
      if (resp.ok) {
        return { success: true, message: 'Koneksi ke Supabase Berhasil! Tabel terhubung dengan aman.' };
      } else {
        const errText = await resp.text();
        return { success: false, message: `Gagal (${resp.status}): ${errText}` };
      }
    } catch(e) {
      return { success: false, message: `Gagal terhubung: ${e.message}` };
    }
  }

  async function syncAllLocalWhitelistToSupabase() {
    const list = getWhitelist();
    if (!list || list.length === 0) return { success: true, count: 0 };
    const emails = list.map(x => x.email);
    const ok = await pushWhitelistToSupabase(emails, 'Sinkronisasi Awal');
    return { success: ok, count: emails.length };
  }

  // Auto-sync whitelist on load
  if (typeof window !== 'undefined') {
    setTimeout(syncWhitelistFromSupabase, 400);
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

-- Kebijakan Akses Publik (Aman dengan Anon Key)
CREATE POLICY "Akses publik baca whitelist" ON public.whitelist_students FOR SELECT USING (true);
CREATE POLICY "Akses publik tulis whitelist" ON public.whitelist_students FOR INSERT WITH CHECK (true);
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
    syncWhitelistFromSupabase,
    pushWhitelistToSupabase,
    testSupabaseConnection,
    syncAllLocalWhitelistToSupabase,
    SUPABASE_SQL_SCHEMA,
    exportAllData,
    importAllData
  };

})(window);
