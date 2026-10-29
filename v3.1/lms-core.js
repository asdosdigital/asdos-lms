/**
 * ASDOS DIGITAL ACADEMY — LMS CORE JAVASCRIPT ENGINE (V2.0)
 * Includes:
 * 1. Global Toast & Confetti System
 * 2. Unified State Management & Legacy Sync
 * 3. Mobile Curriculum Drawer (Peta Materi 7 Hari)
 * 4. Paired Bottom Navigation (Prev / Next)
 * 5. Lite YouTube Façade (Anti-lag, Memory Saver untuk HP)
 */

// ==========================================================================
// 1. DATA KURIKULUM RESMI (TERINTEGRASI DENGAN DECK KARTU V3.1)
// ==========================================================================
window.ASDOS_CURRICULUM = [
  { day: 1, title: 'Kenalan dengan Flow', desc: 'Gambar & edit kucing pertama', url: 'v3.2/day1-v3.2.html', key: 'asdos_day1_preview_steps_v2', posKey: 'asdos_day1_v3_position', steps: 4 },
  { day: 2, title: 'Bikin Character Sheet', desc: 'Karakter konsisten multi-view', url: 'v3.2/day2-v3.2.html', key: 'asdos_day2_steps_v3', posKey: 'asdos_day2_v3_position', steps: 4 },
  { day: 3, title: 'Gabungkan Dua Referensi', desc: 'Gambar + karakter jadi video', url: 'v3.2/day3-v3.2.html', key: 'asdos_day3_steps_v3', posKey: 'asdos_day3_v3_position', steps: 4 },
  { day: 4, title: 'Video Fakta Unik', desc: 'Skrip ChatGPT & 3 adegan Flow', url: 'v3.2/day4-v3.2.html', key: 'asdos_day4_steps_v3', posKey: 'asdos_day4_v3_position', steps: 5 },
  { day: 5, title: 'Voice Over & Dialog AI', desc: 'Audio narasi natural AI Studio', url: 'v3.2/day5-v3.2.html', key: 'asdos_day5_steps_v3', posKey: 'asdos_day5_v3_position', steps: 3 },
  { day: 6, title: 'Edit Video di Canva', desc: 'Susun klip, audio & export MP4', url: 'v3.2/day6-v3.2.html', key: 'asdos_day6_steps_v3', posKey: 'asdos_day6_v3_position', steps: 5 },
  { day: 7, title: 'Panggung Karya & Kelulusan', desc: 'Kartu prestasi IG & langkah baru', url: 'v3.2/day7-v3.2.html', key: 'asdos_day7_steps_v3', posKey: 'asdos_day7_v3_position', steps: 4 }
];

// ==========================================================================
// 2. UNIFIED STATE MANAGEMENT (SINKRONISASI LOKAL & GLOBAL V3.1)
// ==========================================================================
const LMS_STATE_KEY = 'asdos_lms_unified_state_v1';

window.getLmsProgress = function() {
  let state = {};
  try {
    state = JSON.parse(localStorage.getItem(LMS_STATE_KEY) || '{}');
  } catch(e) { state = {}; }

  // Sync dengan storage keys per hari di v3.1 maupun legacy
  window.ASDOS_CURRICULUM.forEach(item => {
    let stepsArr = [];
    try {
      const raw = localStorage.getItem(item.key);
      if (raw) stepsArr = JSON.parse(raw);
    } catch(e){}

    // Periksa card position dari deck v3.1 (posKey)
    try {
      const pos = parseInt(localStorage.getItem(item.posKey), 10);
      if (!isNaN(pos)) {
        if (pos >= item.steps + 1) {
          // Siswa telah menyelesaikan seluruh misi dan sampai di kartu penutup/wisuda
          stepsArr = Array(item.steps).fill(true);
        } else if (pos >= 1 && (!Array.isArray(stepsArr) || stepsArr.length < item.steps)) {
          // Sedang berjalan di tengah misi
          stepsArr = Array.from({ length: item.steps }, (_, idx) => pos >= idx + 2);
        }
      }
    } catch(e){}

    if (Array.isArray(stepsArr) && stepsArr.length > 0) {
      state['day' + item.day] = stepsArr;
    }
  });

  return state;
};

window.saveLmsDayProgress = function(dayNumber, stepsArray) {
  const state = getLmsProgress();
  state['day' + dayNumber] = stepsArray;
  try {
    localStorage.setItem(LMS_STATE_KEY, JSON.stringify(state));
  } catch(e){}

  // Simpan juga ke key spesifik v3.1
  const item = window.ASDOS_CURRICULUM.find(c => c.day === dayNumber);
  if (item && item.key) {
    try { localStorage.setItem(item.key, JSON.stringify(stepsArray)); } catch(e){}
  }
};

window.isDayCompleted = function(dayNumber) {
  const item = window.ASDOS_CURRICULUM.find(c => c.day === dayNumber);
  if (!item) return false;

  // Cek posisi kartu v3.1
  if (item.posKey) {
    try {
      const pos = parseInt(localStorage.getItem(item.posKey), 10);
      if (!isNaN(pos) && pos >= item.steps + 1) return true;
    } catch(e){}
  }

  const progress = window.getLmsProgress();
  const arr = progress['day' + dayNumber];
  if (!Array.isArray(arr)) return false;
  const count = arr.filter(Boolean).length;
  return count >= item.steps;
};

// ==========================================================================
// 3. TOAST, COPY & CONFETTI
// ==========================================================================
window.showToast = function(text) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
};

window.copyElementText = function(id, label) {
  const source = document.getElementById(id);
  if (!source) return;
  const text = (source.innerText || source.textContent || '').trim();
  if (!text) {
    showToast('Belum ada teks untuk disalin.');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast(label + ' berhasil disalin!');
  }).catch(() => {
    const range = document.createRange();
    range.selectNodeContents(source);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    showToast('Teks dipilih. Silakan tekan Ctrl+C atau Salin.');
  });
};

window.checkQuiz = function(btn, isCorrect, feedbackText) {
  const card = btn.closest('.quiz-card');
  if (!card) return;
  const opts = card.querySelectorAll('.quiz-opt');
  opts.forEach(o => {
    o.disabled = true;
    o.style.cursor = 'default';
  });
  
  const fb = card.querySelector('.quiz-feedback');
  if (fb) {
    fb.style.display = 'block';
    if (isCorrect) {
      btn.classList.add('correct');
      fb.className = 'quiz-feedback success';
      fb.innerHTML = '<strong>Tepat sekali!</strong> ' + feedbackText;
      if (typeof fireConfetti === 'function') fireConfetti();
    } else {
      btn.classList.add('wrong');
      fb.className = 'quiz-feedback error';
      fb.innerHTML = '<strong>Hampir tepat!</strong> ' + feedbackText;
    }
  }
};

window.fireConfetti = function() {
  let c = document.getElementById('confettiCanvas');
  if (!c) {
    c = document.createElement('canvas');
    c.id = 'confettiCanvas';
    c.style.position = 'fixed';
    c.style.top = '0';
    c.style.left = '0';
    c.style.width = '100vw';
    c.style.height = '100vh';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '9999';
    document.body.appendChild(c);
  }
  const cx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const pieces = [];
  const colors = ['#246b52', '#c9ec78', '#f6d38d', '#e8a427', '#ffffff', '#84b963'];
  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: Math.random() * c.width,
      y: Math.random() * -c.height * 0.5,
      w: Math.random() * 9 + 5,
      h: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 3,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function loop() {
    cx.clearRect(0, 0, c.width, c.height);
    pieces.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot * Math.PI / 180);
      cx.fillStyle = p.color;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });

    frames++;
    if (frames < 140) {
      requestAnimationFrame(loop);
    } else {
      cx.clearRect(0, 0, c.width, c.height);
    }
  }
  loop();
};

// ==========================================================================
// 4. DRAWER KURIKULUM (PETA MATERI 7 HARI)
// ==========================================================================
window.initCurriculumDrawer = function(currentDayNumber) {
  // 1. Sisipkan tombol trigger ke Header jika belum ada
  const topin = document.querySelector('.topin');
  if (topin && !document.getElementById('btnOpenDrawer')) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'btnOpenDrawer';
    trigger.className = 'btn-drawer-trigger';
    trigger.setAttribute('aria-label', 'Buka Peta Materi 7 Hari');
    trigger.innerHTML = '<span>Peta Materi</span>';
    trigger.onclick = () => window.toggleDrawer(true);

    const backLink = topin.querySelector('.back');
    if (backLink) {
      if (window.LMS_DB && window.LMS_DB.getCurrentStudent()) {
        backLink.href = 'dashboard.html';
        backLink.textContent = '← Ruang Belajar';
      }
      topin.insertBefore(trigger, backLink);
    } else {
      topin.appendChild(trigger);
    }
  }

  // 2. Buat struktur Drawer jika belum ada di DOM
  if (!document.getElementById('lmsDrawerBackdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'lmsDrawerBackdrop';
    backdrop.className = 'lms-drawer-backdrop';
    backdrop.onclick = (e) => {
      if (e.target === backdrop) window.toggleDrawer(false);
    };

    const drawer = document.createElement('aside');
    drawer.className = 'lms-drawer';
    drawer.innerHTML = `
      <div class="drawer-header">
        <h3>Peta Belajar 7 Hari</h3>
        <button type="button" class="drawer-close" aria-label="Tutup" onclick="window.toggleDrawer(false)">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <nav class="drawer-list" id="drawerListNav"></nav>
    `;
    backdrop.appendChild(drawer);
    document.body.appendChild(backdrop);
  }

  window.renderDrawerItems(currentDayNumber);
};

window.toggleDrawer = function(open) {
  const backdrop = document.getElementById('lmsDrawerBackdrop');
  if (!backdrop) return;
  backdrop.classList.toggle('active', !!open);
  document.body.style.overflow = open ? 'hidden' : '';
};

window.renderDrawerItems = function(currentDayNumber) {
  const list = document.getElementById('drawerListNav');
  if (!list) return;

  const progress = getLmsProgress();
  const currentStudent = window.LMS_DB ? window.LMS_DB.getCurrentStudent() : null;
  const isWhitelisted = currentStudent && window.LMS_DB ? window.LMS_DB.isEmailWhitelisted(currentStudent.email) : false;

  list.innerHTML = window.ASDOS_CURRICULUM.map(item => {
    const arr = progress['day' + item.day] || [];
    const count = Array.isArray(arr) ? arr.filter(Boolean).length : 0;
    const isDone = window.isDayCompleted ? window.isDayCompleted(item.day) : (count >= item.steps);
    const isActive = item.day === currentDayNumber;
    const isLockedByPaywall = item.day > 1 && !isWhitelisted;

    let statusLabel = isDone ? 'Selesai' : `${count}/${item.steps}`;
    if (isActive && !isDone) statusLabel = 'Sedang dibuka';
    if (isLockedByPaywall && !isDone) statusLabel = '[Khusus Lynk.id]';

    const checkSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    const lockSvg = `<svg class="ico-lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

    return `
      <a href="${item.url}" class="drawer-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}">
        <span class="d-num">${isDone ? checkSvg : isLockedByPaywall ? lockSvg : 'D' + item.day}</span>
        <div class="d-info">
          <strong>Day ${item.day} · ${item.title}</strong>
          <small>${item.desc}</small>
        </div>
        <span class="d-status">${statusLabel}</span>
      </a>
    `;
  }).join('');
};

// ==========================================================================
// 5. UNIVERSAL VIDEO CONTROLLER & LITE YOUTUBE ENGINE
// ==========================================================================
window.ensureVideoApiEnabled = function(container = document) {
  try {
    const root = container || document;
    const iframes = root.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      let src = iframe.src || '';
      if (src && (src.includes('youtube') || src.includes('youtu.be'))) {
        if (!src.includes('enablejsapi=1')) {
          src += (src.includes('?') ? '&' : '?') + 'enablejsapi=1';
          iframe.src = src;
        }
      }
    });
  } catch(e) {}
};

window.stopAllDeckVideos = function(container = document) {
  try {
    const root = container || document;
    // 1. YouTube & iframe embeds
    const iframes = root.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const src = iframe.getAttribute('src') || iframe.src || '';
        if (src && (src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo'))) {
          // A. Kirim perintah pause dan stop via postMessage
          try {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
          } catch(e) {}

          // B. Ganti node iframe di DOM agar browser seketika mematikan audio track & proses rendering video
          const parent = iframe.parentNode;
          if (parent) {
            const clone = iframe.cloneNode(true);
            let cleanSrc = src.replace(/([?&])autoplay=1(&|$)/g, '$1').replace(/[?&]$/, '');
            if (!cleanSrc.includes('enablejsapi=1')) {
              cleanSrc += (cleanSrc.includes('?') ? '&' : '?') + 'enablejsapi=1';
            }
            clone.src = cleanSrc;
            parent.replaceChild(clone, iframe);
          }
        }
      } catch(err) {}
    });

    // 2. Video HTML5 native
    const videos = root.querySelectorAll('video');
    videos.forEach(v => {
      try {
        v.pause();
        v.currentTime = 0;
      } catch(e) {}
    });

    // 3. Audio HTML5 native
    const audios = root.querySelectorAll('audio');
    audios.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch(e) {}
    });
  } catch(e) {}
};

window.initLiteYouTubePlayers = function() {
  const iframes = document.querySelectorAll('.video-step iframe[src*="youtube"]');
  iframes.forEach(iframe => {
    const parent = iframe.closest('.video-step');
    if (!parent || parent.dataset.liteInit) return;
    parent.dataset.liteInit = 'true';

    const src = iframe.src;
    const match = src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) return;
    const ytId = match[1];

    // Sembunyikan iframe asli terlebih dahulu
    iframe.style.display = 'none';

    // Buat Lite Façade
    const facade = document.createElement('div');
    facade.className = 'lite-yt-facade';
    facade.setAttribute('role', 'button');
    facade.setAttribute('tabindex', '0');
    facade.setAttribute('aria-label', 'Putar Video Tutorial');
    facade.innerHTML = `
      <img class="lite-yt-thumb" src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="Thumbnail Tutorial" loading="lazy">
      <div class="lite-yt-play">▶</div>
      <div class="lite-yt-badge">▶ Putar Tutorial (9:16)</div>
    `;

    const startPlay = () => {
      facade.remove();
      iframe.style.display = 'block';
      let autoSrc = src;
      if (!autoSrc.includes('autoplay=1')) {
        autoSrc += (autoSrc.includes('?') ? '&' : '?') + 'autoplay=1';
      }
      iframe.src = autoSrc;
    };

    facade.addEventListener('click', startPlay);
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startPlay();
      }
    });

    parent.appendChild(facade);
  });
};

// ==========================================================================
// 6. OVERALL LMS PROGRESS HELPER
// ==========================================================================
window.getOverallLmsProgress = function() {
  let completedDays = 0;
  let nextDayToLearn = 1;
  let nextDayUrl = 'v3.1/day1-v3.1.html';
  let foundNext = false;

  window.ASDOS_CURRICULUM.forEach(item => {
    const isDone = window.isDayCompleted(item.day);
    if (isDone) {
      completedDays++;
    } else if (!foundNext) {
      nextDayToLearn = item.day;
      nextDayUrl = item.url;
      foundNext = true;
    }
  });

  if (!foundNext) {
    nextDayToLearn = 7;
    nextDayUrl = 'v3.1/day7-v3.1.html';
  }

  return {
    completedDays,
    totalDays: window.ASDOS_CURRICULUM.length,
    percent: Math.round((completedDays / window.ASDOS_CURRICULUM.length) * 100),
    nextDayToLearn,
    nextDayUrl
  };
};

// ==========================================================================
// 7. PAIRED BOTTOM NAVIGATION (DINONAKTIFKAN KARENA SUDAH ADA DI BAR BAWAH)
// ==========================================================================
window.initPairedBottomNav = function(currentDayNumber) {
  // Dinonaktifkan sesuai permintaan pengguna karena navigasi sudah ada di sticky bottom bar / kartu evaluasi
  return;
};

// ==========================================================================
// 8. PAYWALL & WHITELIST ACCESS GATE
// ==========================================================================
window.checkDayAccess = function(currentDayNumber) {
  // Day 1 selalu gratis
  if (currentDayNumber <= 1) return true;

  if (!window.LMS_DB) return true; // Graceful fallback jika DB belum dimuat

  const isAccessAllowed = window.LMS_DB.isDayAccessible(currentDayNumber);
  if (isAccessAllowed) return true;

  // Tampilkan Gate Modal jika terkunci
  let gateModal = document.getElementById('lmsGateModal');
  if (!gateModal) {
    const isInV3 = location.pathname.toLowerCase().includes('v3');
    const day1Url = isInV3 ? 'day1-v3.1.html' : 'v3.1/day1-v3.1.html';
    const dashUrl = isInV3 ? '../dashboard.html' : 'dashboard.html';

    gateModal = document.createElement('div');
    gateModal.id = 'lmsGateModal';
    gateModal.className = 'lms-gate-backdrop';
    gateModal.innerHTML = `
      <div class="lms-gate-card">
        <div class="lms-gate-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2>Modul Khusus Peserta Terdaftar</h2>
        <p>Materi <strong>Day ${currentDayNumber}</strong> merupakan bagian dari kelas penuh. Khusus untuk peserta yang sudah mendaftar via Lynk.id.</p>
        
        <div class="lms-gate-form">
          <label for="lmsGateEmail">Sudah beli di Lynk.id? Masukkan email pembelian:</label>
          <div class="lms-gate-input-row">
            <input type="email" id="lmsGateEmail" class="lms-gate-input" placeholder="contoh: nama@gmail.com" autofocus>
            <button type="button" id="lmsGateSubmit" class="lms-gate-btn">Verifikasi</button>
          </div>
          <div id="lmsGateError" class="lms-gate-error">Email belum terdaftar di whitelist. Pastikan email sama dengan saat checkout Lynk.id.</div>
        </div>

        <div class="lms-gate-actions">
          <a href="https://lynk.id/asdos.digital/k1k66ww0zg4p" target="_blank" rel="noopener noreferrer" class="lms-gate-buy-btn">
            Beli Akses di Lynk.id &rarr;
          </a>
          <a href="https://wa.me/6281289795589?text=Halo%20Tim%20Asdos%2C%20saya%20butuh%20bantuan%20terkait%20pembelian%20modul%20Kelas%20Animasi%20AI%207%20Hari" target="_blank" rel="noopener noreferrer" class="lms-gate-wa-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#128C7E"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span>Hubungi Mentor via WhatsApp</span>
          </a>
          <div style="display:flex;justify-content:center;gap:16px;margin-top:12px">
            <a href="${day1Url}" class="lms-gate-back-link">&larr; Kembali ke Day 1 (Gratis)</a>
            <a href="${dashUrl}" class="lms-gate-back-link">Ruang Belajar &rarr;</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(gateModal);

    // Kunci scroll halaman belakang
    document.body.style.overflow = 'hidden';

    const emailInput = document.getElementById('lmsGateEmail');
    const submitBtn = document.getElementById('lmsGateSubmit');
    const errBox = document.getElementById('lmsGateError');

    const handleVerify = () => {
      const email = (emailInput.value || '').trim();
      if (!email) {
        errBox.textContent = 'Harap isi alamat email pembelian.';
        errBox.style.display = 'block';
        return;
      }

      const res = window.LMS_DB.loginStudent(email);
      if (res.success) {
        errBox.style.display = 'none';
        if (window.showToast) {
          window.showToast('Verifikasi berhasil! Selamat datang, ' + res.student.name + '. Akses Day ' + currentDayNumber + ' terbuka.');
        }
        gateModal.remove();
        document.body.style.overflow = '';
      } else {
        errBox.textContent = res.message || 'Email belum terdaftar di whitelist Lynk.id.';
        errBox.style.display = 'block';
      }
    };

    submitBtn.addEventListener('click', handleVerify);
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleVerify();
      }
    });
  }

  return false;
};

// Auto-run pada halaman materi
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Cek silent restore trusted device session
  if (window.LMS_DB && window.LMS_DB.checkTrustedDeviceSession && !window.LMS_DB.getCurrentStudent()) {
    await window.LMS_DB.checkTrustedDeviceSession();
  }

  // Deteksi hari aktif dari title atau filename (mendukung Day 2 v3.1, day2-v3.1, day2-preview)
  const match = location.pathname.match(/day\s*(\d+)/i) || document.title.match(/day\s*(\d+)/i);
  const currentDay = match ? parseInt(match[1], 10) : 0;
  if (currentDay > 1) {
    // 1. Cek paywall gate khusus Day 2 ke atas
    window.checkDayAccess(currentDay);
  }
  if (currentDay > 0) {
    // 2. Inisialisasi drawer jika ada
    if (window.initCurriculumDrawer) window.initCurriculumDrawer(currentDay);
    if (window.initLiteYouTubePlayers) window.initLiteYouTubePlayers();
    if (window.ensureVideoApiEnabled) window.ensureVideoApiEnabled();
  } else {
    if (window.ensureVideoApiEnabled) window.ensureVideoApiEnabled();
  }
});
