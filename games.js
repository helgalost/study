/* Общий движок игр «выбери правильную картинку».
   G.run({ rounds, question: r => html, options: r => [{ html, right, cls }], cols, praise: r => 'текст' }) */
(function () {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function confetti(n) {
    const e = ['⭐', '✨', '🎉', '💫', '🌟'];
    for (let i = 0; i < (n || 18); i++) {
      const c = document.createElement('div');
      c.className = 'confetti'; c.textContent = pick(e);
      c.style.left = Math.random() * 100 + 'vw';
      c.style.fontSize = (18 + Math.random() * 22) + 'px';
      c.style.animationDuration = (1.4 + Math.random() * 1.4) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3000);
    }
  }

  function run(cfg) {
    const root = document.getElementById('game');
    root.innerHTML =
      '<div class="progress"></div><div class="q"></div><div class="opts"></div><div class="fb"></div>' +
      '<button class="btn hide" type="button">Дальше ➜</button>' +
      '<div class="final"><span class="big">🏆</span><span class="h">Молодцы!</span><span class="stars"></span>' +
      '<button class="btn" type="button">↺ Играть ещё</button></div>';
    const prog = root.querySelector('.progress'), q = root.querySelector('.q'), opts = root.querySelector('.opts'),
          fb = root.querySelector('.fb'), next = root.querySelector(':scope > .btn'), fin = root.querySelector('.final');
    let rounds = [], i = 0, firstTry = 0, tried = false;

    function start() {
      rounds = cfg.shuffleRounds === false ? cfg.rounds.slice() : shuffle(cfg.rounds);
      i = 0; firstTry = 0;
      fin.classList.remove('on');
      [prog, q, opts, fb, next].forEach(el => el.style.display = '');
      prog.innerHTML = rounds.map(() => '<span class="dot"></span>').join('');
      render();
    }
    function render() {
      const r = rounds[i]; tried = false;
      prog.querySelectorAll('.dot').forEach((d, k) => { d.className = 'dot' + (k < i ? ' done' : k === i ? ' active' : ''); });
      q.innerHTML = cfg.question(r);
      fb.innerHTML = ''; next.classList.add('hide');
      const list = cfg.keepOrder ? cfg.options(r) : shuffle(cfg.options(r));
      opts.className = 'opts c' + (cfg.cols || list.length);
      opts.innerHTML = '';
      list.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'opt' + (o.cls ? ' ' + o.cls : '');
        b.innerHTML = o.html;
        b.addEventListener('click', () => {
          if (!next.classList.contains('hide')) return;
          if (o.right) {
            if (!tried) firstTry++;
            b.classList.add('yes');
            opts.querySelectorAll('.opt').forEach(x => { if (x !== b) x.classList.add('dim'); });
            fb.innerHTML = '<span>' + (cfg.praise ? cfg.praise(r) : '👏 Верно!') + '</span>';
            confetti(10);
            next.classList.remove('hide');
            next.textContent = i === rounds.length - 1 ? 'Финиш 🏁' : 'Дальше ➜';
          } else {
            tried = true;
            b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
            fb.innerHTML = '<span>🤔 Попробуй ещё!</span>';
          }
        });
        opts.appendChild(b);
      });
    }
    next.addEventListener('click', () => {
      if (i < rounds.length - 1) { i++; render(); return; }
      [prog, q, opts, fb, next].forEach(el => el.style.display = 'none');
      const stars = Math.max(1, Math.round(firstTry / rounds.length * 3));
      fin.querySelector('.stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      fin.classList.add('on'); confetti(30);
    });
    fin.querySelector('.btn').addEventListener('click', start);
    start();
  }

  window.G = { pick, shuffle, confetti, run };
})();
