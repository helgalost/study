/* «Стиль-гонки»: машинка едет по трассе и собирает только то, что подходит стилю заказчика.
   Race.mount(элемент, { level: 'zhmyak', duration: 40, levels: ['zhmyak','turbo','star'] }) */
(function () {
  const LEVELS = {
    zhmyak: {
      ava: '🧸', name: '«Жмяк!»', who: 'магазин антистресс-игрушек', road: 'soft', car: '🏎️',
      colors: ['#ffd6ec', '#c9f2e6', '#e4d7ff'], el: '☁️',
      good: [['☁️','#ffd6ec'],['🧸','#c9f2e6'],['🍡','#e4d7ff'],['🦄','#ffe9f3'],['💗','#ffd6ec'],['🫧','#d6f0ff'],['🍬','#e4d7ff'],['🐰','#c9f2e6'],['🐱','#ffe9c7'],['🌸','#ffd6ec']],
      bad:  [['💀','#1b1b1b'],['🕷️','#2b2b2b'],['🔧','#5f6670'],['🔥','#c62828'],['🦂','#4e342e'],['⚡','#111111'],['🗡️','#37474f']]
    },
    turbo: {
      ava: '🏁', name: '«Турбо»', who: 'гоночный клуб', road: 'asphalt', car: '🏎️',
      colors: ['#e53935', '#111111', '#ffcc00'], el: '🏁',
      good: [['🏁','#111111'],['🔥','#e53935'],['⚡','#111111'],['🏆','#e53935'],['🛞','#ffcc00'],['💨','#e53935'],['🚀','#111111'],['🏎️','#ffcc00']],
      bad:  [['🌸','#ffd6ec'],['🧸','#c9f2e6'],['🐢','#c8e6c9'],['🍰','#fff3e0'],['🦋','#e4d7ff'],['🛁','#d6f0ff'],['🐌','#f0e6d2']]
    },
    star: {
      ava: '🌟', name: '«Звёздочка»', who: 'космический магазин', road: 'space', car: '🚀', rot: '-45deg',
      colors: ['#1a1446', '#6a3cd6', '#ffe066'], el: '⭐',
      good: [['⭐','#1a1446'],['🪐','#3a1f78'],['🛸','#1a1446'],['🌙','#3a1f78'],['👽','#1a1446'],['☄️','#3a1f78'],['🌌','#1a1446'],['👩‍🚀','#3a1f78']],
      bad:  [['🌻','#fff59d'],['🍉','#ffcdd2'],['🐄','#e8f5e9'],['🌵','#c8e6c9'],['🏖️','#fff3e0'],['🧀','#fff8e1'],['🌷','#fce4ec']]
    }
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function mount(root, opt) {
    opt = opt || {};
    const list = opt.levels || ['zhmyak', 'turbo', 'star'];
    const DUR = opt.duration || 40;
    let L = LEVELS[opt.level || list[0]];

    root.classList.add('race');
    root.innerHTML =
      '<div class="race-client"></div>' +
      '<div class="race-rules"></div>' +
      '<div class="race-road">' +
        '<div class="lines"></div><div class="side l"></div><div class="side r"></div>' +
        '<div class="race-hud"><span class="t">⏱ 0</span><span class="s">⭐ 0</span></div>' +
        '<div class="race-car"><span></span></div>' +
        '<div class="race-bar"></div>' +
        '<div class="race-over start"></div>' +
      '</div>' +
      '<div class="race-ctrl"><button type="button" aria-label="влево">◀</button><button type="button" aria-label="вправо">▶</button></div>';

    const client = root.querySelector('.race-client'), rules = root.querySelector('.race-rules'), road = root.querySelector('.race-road'),
          lines = root.querySelector('.lines'), car = root.querySelector('.race-car'), over = root.querySelector('.race-over'),
          hT = root.querySelector('.race-hud .t'), hS = root.querySelector('.race-hud .s'), bar = root.querySelector('.race-bar'),
          [bL, bR] = root.querySelectorAll('.race-ctrl button');

    let lane = 1, items = [], running = false, last = 0, t = 0, spawnT = 0, score = 0, good = [], bad = 0, raf = 0, lineY = 0;

    function drawClient() {
      client.innerHTML = '<span class="ava">' + L.ava + '</span><div><div class="nm">' + L.name + '</div><div class="wh">' + L.who + '</div></div>' +
        '<div class="sty">' + L.colors.map(c => '<i style="background:' + c + '"></i>').join('') + '<b>' + L.el + '</b></div>';
      rules.innerHTML = '<span class="ok">✅ ' + L.good.slice(0, 4).map(x => x[0]).join('') + '</span><span class="no">❌ ' + L.bad.slice(0, 4).map(x => x[0]).join('') + '</span>';
      road.className = 'race-road ' + L.road;
      car.querySelector('span').textContent = L.car;
      car.style.setProperty('--rot', L.rot || '90deg');
    }
    function setLane(n) { lane = Math.max(0, Math.min(2, n)); car.style.left = (lane * 33.333) + '%'; }
    function move(d) { if (running) setLane(lane + d); }

    function startScreen() {
      over.className = 'race-over';
      over.innerHTML =
        '<span class="big">🏁</span><span class="h">Стиль-гонки</span>' +
        '<span class="sub">Собирай только то, что в стиле заказчика!</span>' +
        (list.length > 1 ? '<div class="race-lvls">' + list.map(k => '<button type="button" data-k="' + k + '"' + (LEVELS[k] === L ? ' class="on"' : '') + '><span class="e">' + LEVELS[k].ava + '</span>' + LEVELS[k].name + '</button>').join('') + '</div>' : '') +
        '<button class="race-go" type="button">▶ Поехали!</button>' +
        '<span class="sub" style="font-size:13px">◀ ▶ кнопки, стрелки или нажимай на трассу слева / справа</span>';
      over.querySelectorAll('.race-lvls button').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation(); L = LEVELS[b.dataset.k]; drawClient();
        over.querySelectorAll('.race-lvls button').forEach(x => x.classList.toggle('on', x === b));
      }));
      over.querySelector('.race-go').addEventListener('click', e => { e.stopPropagation(); countdown(); });
    }
    function countdown() {
      let n = 3;
      over.innerHTML = '<span class="big">3</span>';
      const iv = setInterval(() => {
        n--;
        if (n > 0) over.innerHTML = '<span class="big">' + n + '</span>';
        else { clearInterval(iv); over.className = 'race-over hide'; begin(); }
      }, 600);
    }
    function begin() {
      items.forEach(i => i.el.remove()); items = [];
      t = 0; spawnT = 0; score = 0; good = []; bad = 0; setLane(1);
      hS.textContent = '⭐ 0'; running = true; last = performance.now();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    function popText(txt, x, y, color) {
      const p = document.createElement('div');
      p.className = 'race-pop'; p.textContent = txt; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.color = color;
      road.appendChild(p); setTimeout(() => p.remove(), 800);
    }
    function spawn() {
      const isGood = Math.random() < 0.6;
      const d = pick(isGood ? L.good : L.bad);
      const el = document.createElement('div');
      el.className = 'race-item';
      const ln = Math.floor(Math.random() * 3);
      el.style.left = (ln * 33.333) + '%';
      el.innerHTML = '<b style="background:' + d[1] + '">' + d[0] + '</b>';
      road.appendChild(el);
      items.push({ el, lane: ln, y: -80, good: isGood, d });
    }
    function tick(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const H = road.clientHeight;
      const speed = 200 + Math.min(1, t / DUR) * 230;   // быстрее к концу
      lineY = (lineY + speed * dt) % 60;
      lines.style.backgroundPosition = '33.33% ' + lineY + 'px, 66.66% ' + lineY + 'px';
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = 0.95 - Math.min(0.45, t / DUR * 0.45); }
      const carTop = H - 18 - car.offsetHeight, carBot = H - 18;
      items = items.filter(it => {
        it.y += speed * dt;
        it.el.style.transform = 'translateY(' + it.y + 'px)';
        const size = it.el.offsetHeight || 64;
        if (it.lane === lane && it.y + size > carTop + 10 && it.y < carBot - 10) {
          const x = it.el.offsetLeft + it.el.offsetWidth / 2 - 14;
          if (it.good) {
            score++; good.push(it.d); popText('+1', x, carTop - 20, '#1b8a3a');
            car.classList.remove('bump'); void car.offsetWidth; car.classList.add('bump');
          } else {
            bad++; score = Math.max(0, score - 1); popText('😬', x, carTop - 30, '#c62828');
            car.classList.remove('hit'); void car.offsetWidth; car.classList.add('hit');
            road.classList.remove('shake'); void road.offsetWidth; road.classList.add('shake');
          }
          hS.textContent = '⭐ ' + score;
          it.el.remove(); return false;
        }
        if (it.y > H + 20) { it.el.remove(); return false; }
        return true;
      });
      const left = Math.max(0, DUR - t);
      hT.textContent = '⏱ ' + Math.ceil(left);
      bar.style.width = (100 - left / DUR * 100) + '%';
      if (left <= 0) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish() {
      running = false;
      items.forEach(i => i.el.remove()); items = [];
      const uniq = []; const seen = new Set();
      good.forEach(g => { if (!seen.has(g[0])) { seen.add(g[0]); uniq.push(g); } });
      const stars = good.length >= 14 && bad <= 1 ? 3 : good.length >= 8 && bad <= 3 ? 2 : 1;
      over.className = 'race-over';
      over.innerHTML =
        '<span class="h">🏁 Финиш!</span>' +
        '<span class="race-stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>' +
        '<div class="race-score"><span>✅ ' + good.length + '</span><span>😬 ' + bad + '</span></div>' +
        (uniq.length ? '<span class="sub">Ты собрал мудборд для ' + L.name + ':</span><div class="race-mb">' +
          uniq.slice(0, 8).map(g => '<b style="background:' + g[1] + '">' + g[0] + '</b>').join('') + '</div>' : '<span class="sub">Попробуй ещё — лови нужные картинки!</span>') +
        '<button class="race-go" type="button">↺ Ещё раз</button>';
      over.querySelector('.race-go').addEventListener('click', e => { e.stopPropagation(); startScreen(); });
      if (opt.onFinish) opt.onFinish({ good: good.length, bad, stars, level: L });
    }

    bL.addEventListener('click', () => move(-1));
    bR.addEventListener('click', () => move(1));
    road.addEventListener('pointerdown', e => {
      if (!running) return;
      const r = road.getBoundingClientRect();
      move(e.clientX - r.left < r.width / 2 ? -1 : 1);
    });
    let sx = null;
    road.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    road.addEventListener('touchend', e => {
      if (sx === null || !running) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) move(dx < 0 ? -1 : 1);
    });
    window.addEventListener('keydown', e => {
      if (!running) return;
      const r = road.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;   // только когда трасса на экране
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ф') { e.preventDefault(); move(-1); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'в') { e.preventDefault(); move(1); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && running) { running = false; cancelAnimationFrame(raf);
        over.className = 'race-over'; over.innerHTML = '<span class="big">⏸</span><button class="race-go" type="button">▶ Дальше</button>';
        over.querySelector('.race-go').addEventListener('click', e => { e.stopPropagation(); over.className = 'race-over hide'; running = true; last = performance.now(); raf = requestAnimationFrame(tick); });
      }
    });

    drawClient(); setLane(1); startScreen();
  }

  window.Race = { mount, LEVELS };
})();
