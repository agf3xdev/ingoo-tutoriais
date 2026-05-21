(function () {
  const STORAGE_KEY = 'ingoo_tutorials_lang';
  const SUPPORTED = ['pt', 'en', 'es', 'zh'];
  // Vídeos já têm legenda PT queimada — track só para idiomas estrangeiros
  const SUBTITLE_LANGS = ['en', 'es', 'zh'];

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
    const icons = {
      'maquina-online-offline':
        '<g><circle cx="200" cy="125" r="44" fill="none" stroke="%23ED7F39" stroke-width="3" opacity=".4"/><circle cx="200" cy="125" r="28" fill="%23ED7F39"/><circle cx="200" cy="125" r="10" fill="%23000"/></g>',
      'conectar-wifi':
        '<g fill="none" stroke="%23ED7F39" stroke-width="7" stroke-linecap="round"><path d="M140 158 Q200 95 260 158" opacity=".4"/><path d="M158 168 Q200 122 242 168" opacity=".7"/><path d="M176 178 Q200 150 224 178"/><circle cx="200" cy="190" r="7" fill="%23ED7F39" stroke="none"/></g>',
      'configurar-chip':
        '<g><rect x="155" y="88" width="90" height="74" rx="10" fill="none" stroke="%23ED7F39" stroke-width="3"/><rect x="170" y="100" width="60" height="50" rx="3" fill="%23ED7F39"/><g fill="%23000"><rect x="178" y="108" width="44" height="3"/><rect x="178" y="118" width="44" height="3"/><rect x="178" y="128" width="32" height="3"/><rect x="178" y="138" width="38" height="3"/></g></g>',
      'aluguel-cartao':
        '<g><rect x="135" y="92" width="130" height="78" rx="8" fill="none" stroke="%23ED7F39" stroke-width="3"/><rect x="135" y="106" width="130" height="18" fill="%23ED7F39"/><rect x="148" y="138" width="40" height="6" rx="2" fill="%23ED7F39" opacity=".7"/><rect x="148" y="150" width="22" height="6" rx="2" fill="%23ED7F39" opacity=".4"/></g>',
      'retirada-pix':
        '<g><g fill="%23ED7F39"><rect x="165" y="90" width="24" height="24" rx="2"/><rect x="211" y="90" width="24" height="24" rx="2"/><rect x="165" y="136" width="24" height="24" rx="2"/></g><g fill="none" stroke="%23ED7F39" stroke-width="3"><rect x="211" y="136" width="24" height="24" rx="2"/></g><g fill="%23ED7F39" opacity=".5"><rect x="197" y="124" width="4" height="4"/><rect x="223" y="146" width="4" height="4"/></g></g>'
    };
    // Grid SVG pattern + icon centrado
    return `<svg class="bg" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-${slug}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(237,127,57,0.08)" stroke-width="1"/>
        </pattern>
        <radialGradient id="glow-${slug}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(237,127,57,0.25)"/>
          <stop offset="100%" stop-color="rgba(237,127,57,0)"/>
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="%23000"/>
      <rect width="400" height="250" fill="url(%23grid-${slug})"/>
      <rect width="400" height="250" fill="url(%23glow-${slug})"/>
      ${icons[slug] || ''}
    </svg>`;
  }

  function render() {
    const t = window.I18N[state.lang];
    document.documentElement.lang = t.htmlLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key] == null) return;
      if (t[key].includes('<')) el.innerHTML = t[key];
      else el.textContent = t[key];
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const isActive = btn.dataset.lang === state.lang;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const grid = document.getElementById('tutorialsGrid');
    const total = String(t.tutorials.length).padStart(2, '0');
    grid.innerHTML = t.tutorials
      .map((tut, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `
        <button class="card" data-slug="${tut.slug}" type="button" aria-label="${tut.title}">
          <div class="card-thumb">
            ${thumbSvg(tut.slug)}
            <span class="badge">${tut.badge}</span>
            <span class="card-index">${num} <em>/${total}</em></span>
            <span class="play"><span></span></span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${tut.title}</h3>
            <p class="card-desc">${tut.desc}</p>
            <span class="card-foot">${t.watch} <span class="arrow">→</span></span>
          </div>
        </button>`;
      })
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

    SUBTITLE_LANGS.forEach((lng) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = `subtitles/${slug}.${lng}.vtt`;
      track.srclang = lng;
      track.label = { en: 'English', es: 'Español', zh: '中文' }[lng];
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
    // Em PT, o vídeo já tem legenda queimada — nenhum track precisa estar ativo.
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
