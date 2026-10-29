/* Общее поведение уроков: док снизу, появление слайдов, видео, таймер, чек-лист и игра-выбор. */
(function () {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  window.L = { pick, shuffle };

  /* ===== Картинки: если не загрузилась — эмодзи ===== */
  document.querySelectorAll('.ph img').forEach(img => {
    img.referrerPolicy = 'no-referrer';
    const fail = () => img.parentElement.classList.add('noimg');
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
    img.addEventListener('error', fail);
  });

  /* ===== Док + появление слайдов ===== */
  const links = [...document.querySelectorAll('.dock a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function show(s) {
    if (s.dataset.done) return;
    s.dataset.done = '1';
    s.classList.add('in');
    s.querySelectorAll('.rv').forEach((el, i) => { el.style.animationDelay = (i * 0.09).toFixed(2) + 's'; });
  }
  if ('IntersectionObserver' in window) {
    let current = null;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (!en.isIntersecting) return; show(en.target); current = en.target.id; });
      if (current) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }, { threshold: 0, rootMargin: '-12% 0px -12% 0px' });
    document.querySelectorAll('.slide').forEach(s => io.observe(s));
  } else {
    document.querySelectorAll('.slide').forEach(show);
  }
  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  /* ===== Игра-выбор: L.quiz(элемент, раунды) =====
     раунд: { q: 'html вопроса', a: ['🍦','мороженое'], o: [['🧸','мишка'], ...], why: 'пояснение' }
     или с постоянным порядком вариантов: { q, opts: [['👶','малыш'], ...], ans: 0, why } */
  L.quiz = function (root, rounds) {
    root.innerHTML =
      '<div class="qz-count"></div><div class="qz-q"></div><div class="qz-opts"></div><div class="qz-why"></div>' +
      '<div class="center"><button class="play-btn" type="button">Дальше ➜</button></div>';
    const cnt = root.querySelector('.qz-count'), q = root.querySelector('.qz-q'),
          opts = root.querySelector('.qz-opts'), why = root.querySelector('.qz-why'), next = root.querySelector('.play-btn');
    let i = 0;
    function render() {
      const r = rounds[i];
      cnt.textContent = (i + 1) + ' / ' + rounds.length;
      q.innerHTML = r.q; why.innerHTML = '';
      const all = r.opts ? r.opts : shuffle([r.a, ...r.o]);
      const right = r.opts ? r.opts[r.ans] : r.a;
      opts.className = 'qz-opts n' + all.length;
      opts.innerHTML = '';
      all.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'qz-opt';
        b.innerHTML = '<span class="em">' + o[0] + '</span><span class="t">' + (o[1] || '') + '</span>';
        b.addEventListener('click', () => {
          if (o === right) {
            b.classList.add('yes');
            opts.querySelectorAll('.qz-opt').forEach(x => { if (x !== b) x.classList.add('no'); });
            if (r.why) why.innerHTML = '<span>' + r.why + '</span>';
          } else { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); }
        });
        opts.appendChild(b);
      });
      next.textContent = i === rounds.length - 1 ? 'Сначала ↺' : 'Дальше ➜';
    }
    next.addEventListener('click', () => { i = (i + 1) % rounds.length; render(); });
    render();
  };

  /* ===== Чек-лист ===== */
  const cks = [...document.querySelectorAll('.ck')];
  const ckDone = document.getElementById('ckDone');
  cks.forEach(c => c.addEventListener('click', () => {
    c.classList.toggle('on');
    if (ckDone) ckDone.classList.toggle('on', cks.every(x => x.classList.contains('on')));
  }));

  /* ===== Таймер ===== */
  const timer = document.getElementById('timer');
  if (timer) {
    const arc = document.getElementById('tArc'), tTime = document.getElementById('tTime'), tEm = document.getElementById('tEm');
    const C = 2 * Math.PI * 52;
    arc.style.strokeDasharray = C; arc.style.strokeDashoffset = 0;
    let total = 0, left = 0, tv = null;
    const fmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    const icons = (timer.dataset.icons || '✏️,🎨,🖍️').split(',');
    function render() {
      tTime.textContent = fmt(left);
      arc.style.strokeDashoffset = total ? C * (1 - left / total) : 0;
      const p = total ? left / total : 1;
      tEm.textContent = !total ? icons[0] : left === 0 ? '🎉' : p > .66 ? icons[0] : p > .33 ? icons[1] : icons[2];
    }
    const stop = () => { clearInterval(tv); tv = null; };
    timer.querySelectorAll('.t-btn[data-min]').forEach(b => b.addEventListener('click', () => {
      stop();
      timer.querySelectorAll('.t-btn').forEach(x => x.classList.toggle('on', x === b));
      timer.classList.remove('done');
      total = left = +b.dataset.min * 60; render();
      tv = setInterval(() => { left--; render(); if (left <= 0) { stop(); timer.classList.add('done'); } }, 1000);
    }));
    document.getElementById('tStop').addEventListener('click', () => {
      stop(); total = left = 0; timer.classList.remove('done');
      timer.querySelectorAll('.t-btn').forEach(x => x.classList.remove('on')); render();
    });
    render();
  }

  /* ===== Видео: обложка + кнопки RuTube / YouTube / VK ===== */
  document.querySelectorAll('.video-block').forEach(block => {
    const d = block.dataset;
    const title = d.title || 'Мультфильм';
    const yt = (d.yt || '').trim(), vk = (d.vk || '').trim(), rt = (d.rt || '').trim();
    const q = encodeURIComponent((d.ytSearch || title).trim());
    const validYt = /^[A-Za-z0-9_-]{11}$/.test(yt);
    const stage = document.createElement('div');
    stage.className = 'video-stage';
    stage.innerHTML =
      '<div class="video-cover" role="button" tabindex="0" aria-label="Смотреть: ' + title + '">' +
        (validYt ? '<img class="thumb" alt="" loading="lazy" src="img/yt/' + yt + '.jpg" onerror="this.remove()">' : '') +
        '<span class="vplay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
        '<span class="vlabel">' + title + '</span>' +
      '</div><div class="video-frame"></div>';
    const cover = stage.querySelector('.video-cover'), frame = stage.querySelector('.video-frame');
    const btns = [];
    if (rt) btns.push({ label: 'RuTube', make: () => 'https://rutube.ru/play/embed/' + rt + '?autoplay=1' });
    if (validYt) btns.push({ label: 'YouTube', make: () => 'https://www.youtube-nocookie.com/embed/' + yt + '?autoplay=1&rel=0&modestbranding=1&playsinline=1' });
    if (vk) btns.push({ label: 'VK Видео', make: () => 'https://vk.com/video_ext.php?' + vk + '&autoplay=1' });
    if (!rt) btns.push({ label: 'RuTube ↗', href: 'https://rutube.ru/search/?query=' + q });
    if (!vk) btns.push({ label: 'VK Видео ↗', href: 'https://vk.com/video?q=' + q });
    if (!validYt) btns.push({ label: 'YouTube ↗', href: 'https://www.youtube.com/results?search_query=' + q });
    const row = document.createElement('div');
    row.className = 'video-sources';
    let primary = null;
    function play(make, btn) {
      frame.innerHTML = '<iframe src="' + make() + '" title="' + title + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      frame.classList.add('on'); cover.style.display = 'none';
      row.querySelectorAll('.vchip').forEach(b => b.classList.toggle('playing', b === btn));
    }
    btns.forEach(s => {
      let el;
      if (s.make) { el = document.createElement('button'); el.type = 'button'; el.addEventListener('click', () => play(s.make, el)); if (!primary) primary = () => play(s.make, el); }
      else { el = document.createElement('a'); el.href = s.href; el.target = '_blank'; el.rel = 'noopener'; }
      el.className = 'vchip'; el.textContent = s.label; row.appendChild(el);
    });
    const activate = () => { if (primary) { primary(); return; } const a = row.querySelector('a'); if (a) a.click(); };
    cover.addEventListener('click', activate);
    cover.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    block.appendChild(stage); block.appendChild(row);
  });
})();
