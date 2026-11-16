
(function(){
'use strict';
const get=id=>document.getElementById(id);
const start=get('startPanel'),tray=get('trayPanel'),system=get('systemPanel'),app=get('demoProgram'),pinned=get('taskbarProgram'),status=get('windowsStatus');
let running=false;
function hidePanels(){start.hidden=tray.hidden=system.hidden=true;}
function openApp(){running=true;app.hidden=false;pinned.classList.add('is-open');hidePanels();status.textContent='Программа открыта. «—» свернёт окно, «×» закроет его.';}
get('startDemo').addEventListener('click',()=>{const show=start.hidden;hidePanels();start.hidden=!show;if(show)get('programSearch').focus();status.textContent='Напиши название нужной программы в Пуске.';});
get('programSearch').addEventListener('input',()=>{const q=get('programSearch').value.trim().toLowerCase();const match=!q||'powerpoint пауэрпоинт презентации'.includes(q);get('programResult').hidden=!match;get('searchProgramStatus').textContent=match?'Выбери найденную программу.':'В тренажёре есть только PowerPoint. Попробуй «PowerPoint» или «презентации».';});
get('programResult').addEventListener('click',openApp);
get('desktopProgram').addEventListener('dblclick',openApp);
get('desktopProgram').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openApp();}});
pinned.addEventListener('click',()=>{if(!running||app.hidden){openApp();}else{app.hidden=true;status.textContent='Окно свернулось. Программа всё ещё работает — под значком есть полоска.';}});
get('minimizeDemo').addEventListener('click',()=>{app.hidden=true;status.textContent='Свернули, а не закрыли. Найди PowerPoint на панели задач.';});
get('closeDemo').addEventListener('click',()=>{running=false;app.hidden=true;pinned.classList.remove('is-open');status.textContent='Закрыли. Закреплённый значок остался. Можно запустить снова через него, Пуск или ярлык.';});
get('trayDemo').addEventListener('click',()=>{const show=tray.hidden;hidePanels();tray.hidden=!show;status.textContent='Стрелка показывает часть скрытых значков программ.';});
get('languageDemo').addEventListener('click',()=>{hidePanels();system.hidden=false;system.replaceChildren();['РУС','ENG'].forEach(language=>{const b=document.createElement('button');b.type='button';b.className='small-button';b.textContent=language==='РУС'?'РУС · Русский':'ENG · Английский';b.addEventListener('click',()=>{get('languageDemo').textContent=language;system.hidden=true;status.textContent='В схеме выбран '+language+'. На своём компьютере язык меняем через этот значок или Win+Пробел.';});system.appendChild(b);});});
get('volumeDemo').addEventListener('click',()=>{hidePanels();system.hidden=false;system.textContent='🔊 Здесь в Windows можно менять громкость. В тренажёре звук компьютера не меняется.';});
get('calendarDemo').addEventListener('click',()=>{hidePanels();system.hidden=false;system.textContent='📅 Часы и календарь. Здесь можно посмотреть дату.';});
let caught=0;
function renderPuffs(){caught=0;get('puffField').replaceChildren();get('puffStatus').textContent='Поймано: 0 / 6';for(let i=0;i<6;i++){const b=document.createElement('button');b.type='button';b.textContent='☁️';b.setAttribute('aria-label','Поймать пушинку '+(i+1));b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;caught++;get('puffStatus').textContent=caught===6?'Весь пух собран! Ловкая левая кнопка.':'Поймано: '+caught+' / 6';});get('puffField').appendChild(b);}}
get('puffReset').addEventListener('click',renderPuffs);renderPuffs();
})();
