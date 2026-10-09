// Apresentação da splash e dos ícones do app Victa.
// A animação dos celulares vem de src/timeline.js — a mesma fonte que gera o Lottie.
(function () {
  const S = window.VictaSplash;
  const D = S.DURATION;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmtMs = (ms) => `${Math.round(ms).toLocaleString('pt-BR')} ms`;

  // Fases da animação: [a, b] é o intervalo real; [s0, s1] é a faixa sem sobreposição usada na barra.
  const PHASES = [
    { n: 1, name: 'Contorno', a: 150, b: 950, s0: 0, s1: 900, c: '#C5F167',
      d: 'As duas hastes do V são desenhadas como traço, de cima para baixo. A haste curta sai 150 ms depois.' },
    { n: 2, name: 'Preenchimento', a: 900, b: 1300, s0: 900, s1: 1100, c: '#42CF00',
      d: 'O V é preenchido em verde mata enquanto o traço se dissolve.' },
    { n: 3, name: 'Pulso e anel', a: 1100, b: 1750, s0: 1100, s1: 1450, c: '#8521AB',
      d: 'O V cresce 7% e volta. Um anel neon se abre do centro e some.' },
    { n: 4, name: 'Câmera', a: 1450, b: 2050, s0: 1450, s1: 1600, c: '#007C27',
      d: 'A câmera recua e desliza do isotipo (80 pt de altura) para o logotipo (180 pt de largura).' },
    { n: 5, name: 'Letras', a: 1600, b: 2260, s0: 1600, s1: 2260, c: '#00512A',
      d: 'i, c, t e a saem de trás do V, uma a cada 80 ms, deslizando para o lugar.' },
  ];
  const HOLD_LABEL = { s0: 2260, s1: D, name: 'Pausa final', c: '#B9C2B2' };

  // ---------- celulares ----------
  const ICONS = {
    signal: '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>',
    wifi: '<svg viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.8 6.8 0 0 0 8 4a6.8 6.8 0 0 0-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.5c-.6 0-1.1.2-1.5.6L8 11.6l1.5-1.7c-.4-.4-.9-.6-1.5-.6Z"/></svg>',
    battery: '<svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="8" rx="1.8"/><path d="M25 4v4c.8-.3 1.3-1.1 1.3-2S25.8 4.3 25 4Z" opacity=".45"/></svg>',
    batteryA: '<svg viewBox="0 0 8 13"><path d="M2.5 0h3v1.2H7a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2.2a1 1 0 0 1 1-1h1.5Z"/></svg>',
  };
  function phoneShell(kind, content) {
    const bar = kind === 'ios'
      ? `<div class="statusbar"><span>9:41</span><span class="icons">${ICONS.signal}${ICONS.wifi}${ICONS.battery}</span></div><div class="island"></div>`
      : `<div class="statusbar"><span>12:30</span><span class="icons">${ICONS.wifi}${ICONS.signal}${ICONS.batteryA}</span></div><div class="punch"></div>`;
    return `<div class="screen">${content}${bar}<div class="homebar"></div></div>`;
  }
  const SIZE = { ios: [393, 852], android: [412, 917] };

  // ---------- player: um relógio por tela ----------
  class Player {
    constructor({ autoplay = true, once = false } = {}) {
      this.targets = [];
      this.listeners = [];
      this.t = REDUCED ? D : 0;
      this.playing = autoplay && !REDUCED;
      this.speed = 1;
      this.once = once;
      this.range = null; // [a, b] para tocar só uma fase
      this.hold = 800;
    }
    add(el, W, H) { const tg = { el, W, H }; this.targets.push(tg); return tg; }
    on(fn) { this.listeners.push(fn); }
    render(ms = this.t) {
      this.t = ms;
      const c = clamp(ms, 0, D);
      for (const tg of this.targets) {
        tg.el.innerHTML = S.frameSVG(c, tg.W, tg.H).svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
      }
      this.listeners.forEach((fn) => fn(c, this));
    }
    step(dt) {
      if (!this.playing) return;
      const [a, b] = this.range || [0, D];
      let next = this.t + dt * this.speed;
      if (next > b + (this.range ? 450 : this.hold)) {
        if (this.once) { this.playing = false; next = D; this.listeners.forEach((fn) => fn(D, this)); return this.render(D); }
        next = a;
      }
      this.render(next);
    }
    setPlaying(p) { this.playing = p; this.listeners.forEach((fn) => fn(clamp(this.t, 0, D), this)); }
    replay() { this.render(this.range ? this.range[0] : 0); this.setPlaying(true); }
  }

  const players = {}; // por índice de slide

  // ---------- 1 · capa ----------
  const cover = new Player({ once: true });
  const coverTarget = cover.add($('#coverStage'), 600, 560);
  function sizeCover() {
    const el = $('#coverStage');
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    coverTarget.H = 560;
    coverTarget.W = Math.round(560 * (r.width / r.height));
    cover.render();
  }
  players[1] = cover;

  // ---------- 2 · splash nos aparelhos ----------
  const devices = new Player();
  $$('[data-player="devices"] [data-phone]').forEach((ph) => {
    const kind = ph.dataset.phone;
    ph.innerHTML = phoneShell(kind, '<div class="splash"></div>');
    devices.add($('.splash', ph), ...SIZE[kind]);
  });
  buildControls($('[data-player="devices"] [data-controls]'), devices);
  players[2] = devices;

  function buildControls(root, player) {
    root.innerHTML = `
      <div class="ctrl-row">
        <button class="btn btn-ink btn-small play-btn" data-act="play"></button>
        <button class="btn btn-ghost btn-small" data-act="replay">↺ Repetir</button>
        <div class="seg" role="radiogroup" aria-label="Velocidade">
          <button role="radio" aria-checked="true" data-speed="1">1×</button>
          <button role="radio" aria-checked="false" data-speed="0.5">0,5×</button>
          <button role="radio" aria-checked="false" data-speed="0.25">0,25×</button>
        </div>
        <span class="time" aria-live="off"></span>
      </div>
      <div class="scrub-wrap">
        <input class="scrub" type="range" min="0" max="${D}" step="1" value="0" aria-label="Posição na animação">
        <div class="phase-strip"></div>
      </div>`;
    const strip = $('.phase-strip', root);
    [...PHASES, HOLD_LABEL].forEach((p) => {
      const b = document.createElement('button');
      b.style.left = (p.s0 / D) * 100 + '%';
      b.style.width = ((p.s1 - p.s0) / D) * 100 + '%';
      b.style.setProperty('--c', p.c);
      b.textContent = p.n ? `${p.n} ${p.name}` : p.name;
      b.title = p.n ? `${p.n} · ${p.name} — ${p.d}` : `${p.name}: logotipo completo até ${fmtMs(D)}`;
      b.onclick = () => { player.render(p.a ?? p.s0); };
      strip.appendChild(b);
    });
    const playBtn = $('[data-act="play"]', root);
    const scrub = $('.scrub', root);
    const time = $('.time', root);
    playBtn.onclick = () => player.setPlaying(!player.playing);
    $('[data-act="replay"]', root).onclick = () => player.replay();
    $$('[data-speed]', root).forEach((b) => (b.onclick = () => {
      player.speed = +b.dataset.speed;
      $$('[data-speed]', root).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    }));
    scrub.oninput = () => { player.setPlaying(false); player.render(+scrub.value); };
    player.on((t, p) => {
      scrub.value = t;
      playBtn.textContent = p.playing ? '❚❚ Pausar' : '▶ Tocar';
      time.textContent = `${fmtMs(t)} · frame ${String(Math.round((t / 1000) * 60)).padStart(3, '0')} / ${Math.round((D / 1000) * 60)}`;
    });
  }

  // ---------- 3 · anatomia ----------
  const anatomy = new Player();
  const anaPhone = $('[data-player="anatomy"] [data-phone]');
  anaPhone.innerHTML = phoneShell('ios', '<div class="splash"></div>');
  anatomy.add($('.splash', anaPhone), ...SIZE.ios);
  players[3] = anatomy;

  const ROWS = [
    ['vLong.trim', 'Haste longa · traço', 1],
    ['vShort.trim', 'Haste curta · traço', 1],
    ['v.fill', 'V · preenchimento', 2],
    ['v.stroke', 'V · traço some', 2],
    ['ring.o', 'Anel neon', 3],
    ['cam.scale', 'Escala do V', 3],
    ['cam.anchor', 'Câmera → logotipo', 4],
    ['i.o', 'Letra i', 5],
    ['c.o', 'Letra c', 5],
    ['t.o', 'Letra t', 5],
    ['a.o', 'Letra a', 5],
  ];
  const phasesEl = $('#phases');
  PHASES.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'phase';
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-pressed', 'false');
    b.style.setProperty('--c', p.c);
    b.dataset.n = p.n;
    b.innerHTML = `<span class="n">0${p.n}</span><b>${p.name}</b><p>${p.d}</p><span class="t">${p.a}–${p.b} ms</span>`;
    b.onclick = () => selectPhase(anatomy.range && anatomy.range.n === p.n ? null : p);
    phasesEl.appendChild(b);
  });

  const gantt = $('#gantt');
  let ganttHTML = '';
  ROWS.forEach(([key, label, ph]) => {
    const kfs = S.TRACKS[key];
    const t0 = kfs[0][0], t1 = kfs[kfs.length - 1][0];
    const c = PHASES[ph - 1].c;
    // a escala tem duas partes: pulso (fase 3) e recuo junto com a câmera (fase 4)
    const bar = `<span class="g-bar" data-ph="${ph}" style="--c:${c};left:${(t0 / D) * 100}%;width:${((t1 - t0) / D) * 100}%"></span>`;
    const dots = kfs.map(([t]) => `<span class="g-kf" style="left:${(t / D) * 100}%"></span>`).join('');
    ganttHTML += `<div class="g-row"><span class="lbl" title="${label}">${label}</span><span class="g-track">${bar}${dots}</span></div>`;
  });
  let ticks = '';
  for (let t = 0; t <= D; t += 400) ticks += `<span style="left:${(t / D) * 100}%">${t === 0 ? '0' : (t / 1000).toLocaleString('pt-BR') + ' s'}</span>`;
  ganttHTML += `<div class="g-axis"><span></span><span class="ticks">${ticks}</span></div><span class="g-head" id="gHead"></span>`;
  gantt.innerHTML = ganttHTML;
  const gHead = $('#gHead');
  const firstTrack = $('.g-track', gantt);
  const ganttTime = $('#ganttTime');
  const phaseNow = $('#phaseNow');

  anatomy.on((t, p) => {
    gHead.style.left = firstTrack.offsetLeft + (t / D) * firstTrack.offsetWidth + 'px';
    const active = PHASES.filter((ph) => t >= ph.a && t <= ph.b).map((ph) => ph.name.toLowerCase());
    ganttTime.textContent = `${fmtMs(t)} · ${p.playing ? 'tocando' : 'pausado'}${p.speed !== 1 ? ` · ${p.speed}×` : ''}`;
    if (!p.range) phaseNow.textContent = active.length ? `Agora: ${active.join(' + ')}` : t < 150 ? 'Agora: só o verde (= splash nativa)' : 'Agora: logotipo completo';
  });
  function selectPhase(p) {
    $$('.phase', phasesEl).forEach((b) => b.setAttribute('aria-pressed', String(!!p && +b.dataset.n === p.n)));
    $$('.g-bar', gantt).forEach((b) => b.classList.toggle('dim', !!p && +b.dataset.ph !== p.n));
    if (p) {
      anatomy.range = [Math.max(0, p.a - 150), Math.min(D, p.b + 150)];
      anatomy.range.n = p.n;
      phaseNow.textContent = `Em loop: ${p.n} · ${p.name}`;
      anatomy.render(anatomy.range[0]);
      anatomy.setPlaying(true);
    } else {
      anatomy.range = null;
      anatomy.replay();
    }
  }
  $('#phaseAll').onclick = () => selectPhase(null);
  let dragging = false;
  const seekFromEvent = (e) => {
    const r = firstTrack.getBoundingClientRect();
    const f = clamp((e.clientX - r.left) / r.width, 0, 1);
    if (anatomy.range) selectPhaseSilently();
    anatomy.setPlaying(false);
    anatomy.render(f * D);
  };
  function selectPhaseSilently() {
    anatomy.range = null;
    $$('.phase', phasesEl).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    $$('.g-bar', gantt).forEach((b) => b.classList.remove('dim'));
  }
  gantt.addEventListener('pointerdown', (e) => { dragging = true; gantt.setPointerCapture(e.pointerId); seekFromEvent(e); });
  gantt.addEventListener('pointermove', (e) => dragging && seekFromEvent(e));
  gantt.addEventListener('pointerup', () => (dragging = false));
  gantt.addEventListener('pointercancel', () => (dragging = false));

  // ---------- 4 · implementação: abas de código ----------
  const tabs = $$('.tabs [role="tab"]');
  tabs.forEach((tab) => (tab.onclick = () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    $$('.tab-panel').forEach((p) => (p.hidden = p.dataset.panel !== tab.dataset.tab));
  }));
  $('#copyCode').onclick = async (e) => {
    const panel = $$('.tab-panel').find((p) => !p.hidden);
    try {
      await navigator.clipboard.writeText(panel.textContent);
      e.target.textContent = 'Copiado ✓';
    } catch (_) {
      e.target.textContent = 'Selecione e copie';
    }
    setTimeout(() => (e.target.textContent = 'Copiar código'), 1600);
  };

  // ---------- 5 · ícones iOS ----------
  const PH_LIGHT = ['#F6C9A6', '#A9D4F5', '#F4AFC0', '#BEE6C9', '#EADB9F', '#CCC4F2', '#F7B98F', '#A3DCD6', '#D9D4CB', '#9FC3F0', '#F2D0E6', '#C8E39E', '#FFD58A', '#B7C7D9', '#E8B4A0'];
  const PH_DARK = ['#3A3F47', '#2F4054', '#4A3640', '#2E4A3A', '#4A4430', '#3B3752', '#4E3A2E', '#2B4744', '#3E3C38', '#2C3D58', '#4A3A48', '#3A4A2E', '#544630', '#36404C', '#4C3A34'];
  const iosHome = $('#iosHome');
  let iosApps = '';
  for (let i = 0; i < 16; i++) {
    if (i === 13) iosApps += '<div class="app victa"><span class="ic"><img src="assets/icons/ios-default.svg" alt="Ícone Victa"><span class="tint"></span></span><span class="lb">Victa</span></div>';
    else iosApps += `<div class="app"><span class="ic" data-i="${i % 15}"></span><span class="lb"></span></div>`;
  }
  iosHome.innerHTML = phoneShell('ios', `<div class="home light"><div class="home-grid">${iosApps}</div><div class="search-pill"></div><div class="dock">${'<span class="ic" data-i="X"></span>'.repeat(4).replace(/X/g, () => Math.floor(Math.random() * 15))}</div></div>`);
  const IOS_MODES = {
    default: { icon: 'ios-default.svg', dark: false, cap: 'Tela de início · modo claro' },
    dark: { icon: 'ios-dark.svg', dark: true, cap: 'Tela de início · modo escuro' },
    tinted: { icon: 'ios-tinted.svg', dark: true, cap: 'Tela de início · tingida' },
    mono: { icon: 'ios-monochrome.svg', dark: false, cap: 'Versão de uma cor · referência' },
  };
  let tint = '#F2B33D';
  let iosMode = 'default';
  function paintIOS() {
    const m = IOS_MODES[iosMode];
    const home = $('.home', iosHome);
    home.className = 'home ' + (m.dark ? 'dark' : 'light');
    $('.screen', iosHome).classList.toggle('on-dark', m.dark);
    $$('.ic[data-i]', iosHome).forEach((ic, k) => {
      const i = +ic.dataset.i;
      ic.style.setProperty('--ph', iosMode === 'tinted' ? `color-mix(in srgb, ${tint} 22%, #121212)` : (m.dark ? PH_DARK : PH_LIGHT)[i]);
    });
    const victa = $('.app.victa', iosHome);
    $('img', victa).src = 'assets/icons/' + m.icon;
    const tl = $('.tint', victa);
    tl.style.setProperty('--tint', tint);
    tl.style.opacity = iosMode === 'tinted' ? 1 : 0;
    victa.classList.remove('pulse'); void victa.offsetWidth; victa.classList.add('pulse');
    $('#iosHomeCaption').textContent = m.cap;
    $('#tintPicker').hidden = iosMode !== 'tinted';
  }
  $$('#iosVariants [role="radio"]').forEach((b) => (b.onclick = () => {
    iosMode = b.dataset.mode;
    $$('#iosVariants [role="radio"]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    paintIOS();
  }));
  $$('#tintPicker button').forEach((b) => (b.onclick = () => {
    tint = getComputedStyle(b).getPropertyValue('--c').trim();
    $$('#tintPicker button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    paintIOS();
  }));
  paintIOS();

  // ---------- 6 · ícones Android ----------
  const adaptiveHTML = () => `
    <div class="lyr bg"><img src="assets/icons/android-background.svg" alt=""></div>
    <div class="lyr fg"><img src="assets/icons/android-foreground.svg" alt=""></div>
    <div class="lyr themed"><svg viewBox="0 0 512 512" style="fill:#2F4A25"><use href="#v-glyph"/></svg></div>
    <span class="safe"></span>`;
  const big = $('#adaptiveBig');
  big.innerHTML = adaptiveHTML();
  big.setAttribute('role', 'img');
  big.setAttribute('aria-label', 'Ícone adaptável montado');
  const androidHome = $('#androidHome');
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  let andApps = '';
  for (let i = 0; i < 8; i++) {
    if (i === 5) andApps += `<div class="app victa"><div class="adaptive">${adaptiveHTML()}</div><span class="lb">Victa</span></div>`;
    else andApps += `<div class="app"><span class="ic" style="--ph:${PH_LIGHT[(i * 3) % 15]}"></span><span class="lb"></span></div>`;
  }
  androidHome.innerHTML = phoneShell('android', `<div class="home android-home" data-mask="circle"><div class="clock">12:30</div><div class="date">${dateStr}</div><div class="home-grid">${andApps}</div><div class="gsearch"></div></div>`);
  const adaptives = [big, $('.adaptive', androidHome)];
  const MASK_NAMES = { circle: 'círculo', squircle: 'squircle', rounded: 'quadrado arredondado', drop: 'gota' };
  let mask = 'circle';
  function paintAndroid() {
    const safe = $('#safeToggle').checked;
    const themed = $('#themedToggle').checked;
    adaptives.forEach((a) => {
      a.className = a.className.replace(/\bm-\w+/g, '').trim() + ' m-' + mask;
      a.classList.toggle('show-safe', safe);
      a.classList.toggle('is-themed', themed);
    });
    const home = $('.android-home', androidHome);
    home.dataset.mask = mask;
    home.classList.toggle('themed-on', themed);
    $('#androidHomeCaption').textContent = `Tela de início · recorte em ${MASK_NAMES[mask]}${themed ? ' · ícones temáticos' : ''}`;
    $('#androidNote').innerHTML = themed
      ? '<b>Ícone temático:</b> o Android usa a camada monocromática só como <b>máscara</b> e pinta com as cores do papel de parede. Por isso ela deve ter só o V, sem fundo.'
      : '<b>Na entrega:</b> fundo e frente separados, 108 × 108 dp (512 × 512 px no template). O V fica dentro do círculo central de 66 dp; o resto pode ser cortado.';
  }
  $$('#maskSeg [role="radio"]').forEach((b) => (b.onclick = () => {
    mask = b.dataset.mask;
    $$('#maskSeg [role="radio"]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    paintAndroid();
  }));
  $('#safeToggle').onchange = paintAndroid;
  $('#themedToggle').onchange = paintAndroid;
  paintAndroid();
  // paralaxe: o Android move as camadas em sentidos opostos ao tocar e arrastar
  if (!REDUCED) {
    big.addEventListener('pointermove', (e) => {
      const r = big.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      $('.fg', big).style.transform = `translate(${x * 10}%, ${y * 10}%)`;
      $('.bg', big).style.transform = `translate(${-x * 4}%, ${-y * 4}%)`;
      $('.themed', big).style.transform = `translate(${x * 10}%, ${y * 10}%)`;
    });
    big.addEventListener('pointerleave', () => $$('.lyr', big).forEach((l) => (l.style.transform = '')));
  }

  // ---------- 7 · lottie ----------
  let lottieAnim = null, lottieTried = false, lottieWanted = true, lottieTimer = null;
  const lottieBtn = $('#lottiePlay');
  async function initLottie() {
    if (lottieTried) return;
    lottieTried = true;
    const fallback = $('#lottieFallback');
    try {
      if (!window.lottie) throw new Error('lottie-web não carregou');
      const res = await fetch('assets/lottie/victa-splash.json');
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();
      const data = JSON.parse(text);
      const kb = (new Blob([text]).size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
      $('#lottieKb').textContent = `${kb} KB`;
      const frames = data.op - data.ip;
      const meta = [
        ['Quadro', `${data.w} × ${data.h}`],
        ['Taxa', `${data.fr} fps`],
        ['Duração', `${(frames / data.fr).toLocaleString('pt-BR')} s · ${frames} frames`],
        ['Tamanho', `${kb} KB · ${data.layers.length} camadas`],
      ];
      $('#lottieMeta').innerHTML = meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
      lottieAnim = window.lottie.loadAnimation({ container: $('#lottieCanvas'), renderer: 'svg', loop: false, autoplay: false, animationData: data });
      lottieAnim.addEventListener('complete', () => {
        clearTimeout(lottieTimer);
        lottieTimer = setTimeout(() => { if (lottieWanted && current === 7) lottieAnim.goToAndPlay(0, true); }, 900);
      });
      if (REDUCED) { lottieWanted = false; lottieAnim.goToAndStop(frames - 1, true); }
      syncLottie();
    } catch (err) {
      fallback.hidden = false;
      lottieBtn.disabled = true;
    }
  }
  function syncLottie() {
    if (!lottieAnim) return;
    const on = lottieWanted && current === 7;
    if (on) lottieAnim.play(); else lottieAnim.pause();
    lottieBtn.textContent = lottieWanted ? '❚❚ Pausar' : '▶ Tocar';
  }
  lottieBtn.onclick = () => { lottieWanted = !lottieWanted; syncLottie(); };
  $('#lottieBg').onchange = (e) => $('#lottieCanvas').classList.toggle('green', e.target.checked);
  $('#lottieBounds').onchange = (e) => $('#lottieBox').classList.toggle('bounds', e.target.checked);
  $('#lottieBox').classList.add('bounds');

  // ---------- navegação ----------
  const slides = $$('.slide');
  const N = slides.length;
  const dots = $('#dots');
  slides.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button aria-label="Ir para ${i + 1}: ${s.dataset.title}"><span class="lbl">${s.dataset.title}</span></button>`;
    li.firstChild.onclick = () => go(i + 1);
    dots.appendChild(li);
  });
  let current = 0;
  function go(n) {
    n = clamp(n | 0, 1, N);
    if (n === current) return;
    const prev = current;
    current = n;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === n - 1);
      s.classList.toggle('is-before', i < n - 1);
      s.setAttribute('aria-hidden', String(i !== n - 1));
      s.inert = i !== n - 1;
    });
    $$('button', dots).forEach((b, i) => (i === n - 1 ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    $('#counter').textContent = `${String(n).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    $('#progressBar').style.width = (n / N) * 100 + '%';
    $('#prev').disabled = n === 1;
    $('#next').disabled = n === N;
    document.body.dataset.slide = n;
    if (location.hash !== `#/${n}`) history.replaceState(null, '', `#/${n}`);
    // cada tela recomeça a própria animação ao entrar
    const p = players[n];
    if (p && prev) {
      if (n === 1) { sizeCover(); p.replay(); }
      else if (!REDUCED && !p.playing) p.replay();
    }
    if (n === 1) sizeCover();
    if (n === 3) anatomy.render();
    if (n === 7) initLottie();
    syncLottie();
  }
  $('#prev').onclick = () => go(current - 1);
  $('#next').onclick = () => go(current + 1);
  $$('[data-goto]').forEach((b) => (b.onclick = () => go(+b.dataset.goto)));
  window.addEventListener('hashchange', () => go(+(location.hash.match(/\d+/) || [1])[0]));

  const helpBtn = $('#helpBtn'), help = $('#help');
  helpBtn.onclick = () => { help.hidden = !help.hidden; helpBtn.setAttribute('aria-expanded', String(!help.hidden)); };

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' && e.target.type !== 'checkbox' && e.target.type !== 'range';
    if (typing) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { if (e.target.type === 'range') return; e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { if (e.target.type === 'range') return; e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(1); }
    else if (e.key === 'End') { e.preventDefault(); go(N); }
    else if (/^[1-9]$/.test(e.key) && +e.key <= N) go(+e.key);
    else if (e.key === 'Escape') { help.hidden = true; helpBtn.setAttribute('aria-expanded', 'false'); }
    else if (e.key === ' ' || e.key.toLowerCase() === 'r') {
      const p = players[current];
      if (current === 7 && e.key === ' ') { e.preventDefault(); lottieBtn.click(); return; }
      if (!p || (tag === 'button' && e.key === ' ')) return;
      e.preventDefault();
      if (e.key === ' ') p.setPlaying(!p.playing); else p.replay();
    }
  });

  // um único relógio: só a tela visível anima
  let last = null;
  function tick(now) {
    if (last !== null) {
      const dt = Math.min(now - last, 64);
      const p = players[current];
      if (p) p.step(dt);
    }
    last = now;
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', () => { if (current === 1) sizeCover(); if (current === 3) anatomy.render(); });

  Object.values(players).forEach((p) => p.render());
  go(+(location.hash.match(/\d+/) || [1])[0]);
  requestAnimationFrame(tick);
})();
