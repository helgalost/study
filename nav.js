/* Кнопка «Следующая тема» внизу каждого урока.
   Порядок тем — в списке ниже: чтобы добавить урок, впиши его сюда. */
(function () {
  var LESSONS = [
    ['welcome.html',  'Введение и знакомство'],
    ['brand.html',    'Бренд'],
    ['slogan.html',   'Слоган'],
    ['paint.html',    'Рисование'],
    ['idea.html',     'Как придумать идею'],
    ['impact.html',   'Влияние рекламы'],
    ['repeat.html',   'Бренд-агентство: коллаж'],
    ['moodboard.html','Мудборд'],
    ['style.html',    'Стилистика'],
    ['audience.html', 'Кому это надо?'],
    ['color.html',    'Цвет и настроение'],
    ['pack.html',     'Упаковка'],
    ['howad.html',    'Как рекламировать']
  ];

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var i = -1;
  for (var k = 0; k < LESSONS.length; k++) if (LESSONS[k][0] === file) i = k;
  if (i < 0) return;

  var next = LESSONS[i + 1];
  var css = document.createElement('style');
  css.textContent =
    '.next-topic{background:#0b0b0c;color:#ebe9e4;padding:3rem 1.25rem calc(6.5rem + env(safe-area-inset-bottom));font-family:Inter,system-ui,sans-serif}' +
    '.next-topic .nt-in{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:14px}' +
    '.next-topic .nt-lbl{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(235,233,228,.55)}' +
    '.next-topic .nt-btn{display:flex;align-items:center;justify-content:space-between;gap:1rem;' +
      'background:#ff3d3d;color:#fff;border-radius:26px;padding:1.4rem 1.6rem;text-decoration:none;' +
      'font-weight:900;font-size:clamp(1.4rem,6vw,2.4rem);line-height:1;letter-spacing:-.03em;text-transform:uppercase;' +
      'transition:transform .3s cubic-bezier(.16,1,.3,1)}' +
    '.next-topic .nt-btn:hover{transform:translateY(-4px)}' +
    '.next-topic .nt-btn .ar{font-size:1.4em;flex-shrink:0}' +
    '.next-topic .nt-home{align-self:flex-start;color:rgba(235,233,228,.75);font-weight:800;font-size:14px;text-decoration:none;' +
      'border:2px solid rgba(235,233,228,.3);border-radius:999px;padding:.6rem 1.1rem}' +
    '.next-topic .nt-home:hover{color:#fff;border-color:#fff}';
  document.head.appendChild(css);

  var box = document.createElement('section');
  box.className = 'next-topic';
  box.innerHTML =
    '<div class="nt-in">' +
      (next
        ? '<span class="nt-lbl">Следующая тема · ' + (i + 2) + ' из ' + LESSONS.length + '</span>' +
          '<a class="nt-btn" href="' + next[0] + '"><span>' + next[1] + '</span><span class="ar">→</span></a>'
        : '<span class="nt-lbl">Это последняя тема курса 🎉</span>' +
          '<a class="nt-btn" href="index.html"><span>К началу курса</span><span class="ar">↺</span></a>') +
      '<a class="nt-home" href="index.html">☰ Все темы</a>' +
    '</div>';
  document.body.appendChild(box);
})();
