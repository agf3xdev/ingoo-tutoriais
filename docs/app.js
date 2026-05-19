(function () {
  const STORAGE_KEY = 'ingoo_tutorials_lang';
  const SUPPORTED = ['pt', 'en', 'es', 'zh'];

  function detectLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || 'pt').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('es')) return 'es';
    if (nav.startsWith('en')) return 'en';
    return 'pt';
  }

  const state = { lang: detectLang() };

  function thumbSvg(slug) {
    const palettes = {
      'maquina-online-offline': ['#2563eb', '#0a1f44'],
      'conectar-wifi': ['#06b6d4', '#0a1f44'],
      'configurar-chip': ['#8b5cf6', '#0a1f44'],
      'aluguel-cartao': ['#f59e0b', '#0a1f44'],
      'retirada-pix': ['#10b981', '#0a1f44']
    };
    const icons = {
      'maquina-online-offline':
        '<circle cx="200" cy="125" r="34" fill="rgba(255,255,255,.95)"/><circle cx="200" cy="125" r="14" fill="#10b981"/>',
      'conectar-wifi':
        '<g fill="none" stroke="rgba(255,255,255,.95)" stroke-width="8" stroke-linecap="round"><path d="M150 145 Q200 100 250 145"/><path d="M165 158 Q200 125 235 158"/><circle cx="200" cy="172" r="6" fill="rgba(255,255,255,.95)" stroke="none"/></g>',
      'configurar-chip':
        '<rect x="160" y="95" width="80" height="60" rx="10" fill="rgba(255,255,255,.95)"/><rect x="172" y="107" width="56" height="36" rx="4" fill="#0a1f44"/><path d="M180 113 h40 M180 125 h40 M180 137 h40" stroke="rgba(255,255,255,.4)" stroke-width="2"/>',
      'aluguel-cartao':
        '<rect x="140" y="95" width="120" height="70" rx="8" fill="rgba(255,255,255,.95)"/><rect x="140" y="110" width="120" height="14" fill="#0a1f44"/><rect x="152" y="140" width="30" height="6" rx="2" fill="#0a1f44"/>',
      'retirada-pix':
        '<g fill="rgba(255,255,255,.95)"><rect x="170" y="95" width="22" height="22" rx="3"/><rect x="208" y="95" width="22" height="22" rx="3"/><rect x="170" y="133" width="22" height="22" rx="3"/><rect x="208" y="133" width="22" height="22" rx="3"/></g>'
    };
    const [c1, c2] = palettes[slug] || ['#2563eb', '#0a1f44'];
    return `<svg class="bg" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g-${slug}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect width="400" height="250" fill="url(#g-${slug})"/>
      ${icons[slug] || ''}
    </svg>`;
  }

  function render() {
    const t = window.I18N[state.lang];
    document.documentElement.lang = t.htmlLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const isActive = btn.dataset.lang === state.lang;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const grid = document.getElementById('tutorialsGrid');
    grid.innerHTML = t.tutorials
      .map(
        (tut) => `
        <button class="card" data-slug="${tut.slug}" type="button" aria-label="${tut.title}">
          <div class="card-thumb">
            ${thumbSvg(tut.slug)}
            <span class="badge">${tut.badge}</span>
            <span class="play"><span></span></span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${tut.title}</h3>
            <p class="card-desc">${tut.desc}</p>
            <span class="card-foot">${t.watch} →</span>
          </div>
        </button>`
      )
      .join('');

    grid.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', () => openVideo(card.dataset.slug));
    });
  }

  function openVideo(slug) {
    const t = window.I18N[state.lang];
    const tut = t.tutorials.find((x) => x.slug === slug);
    if (!tut) return;

    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    const title = document.getElementById('modalTitle');

    title.textContent = tut.title;
    video.innerHTML = '';
    const source = document.createElement('source');
    source.src = `videos/${slug}.mp4`;
    source.type = 'video/mp4';
    video.appendChild(source);

    SUPPORTED.forEach((lng) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = `subtitles/${slug}.${lng}.vtt`;
      track.srclang = lng;
      track.label = { pt: 'Português', en: 'English', es: 'Español', zh: '中文' }[lng];
      if (lng === state.lang) track.default = true;
      video.appendChild(track);
    });

    video.load();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const tracks = video.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].language === state.lang ? 'showing' : 'disabled';
      }
      video.play().catch(() => {});
    }, 100);
  }

  function closeVideo() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    video.pause();
    video.removeAttribute('src');
    video.innerHTML = '';
    video.load();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.lang = btn.dataset.lang;
        localStorage.setItem(STORAGE_KEY, state.lang);
        render();
      });
    });

    document.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closeVideo);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeVideo();
    });

    render();
  });
})();
