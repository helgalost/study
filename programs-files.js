
(function(){
'use strict';
const get=id=>document.getElementById(id);
const token=get('mouseToken'),board=get('mouseBoard'),goal=get('mouseGoal'),mission=get('mouseMission'),status=get('mouseStatus'),next=get('mouseNext');
const tasks=['1 / 3 · Нажми и сразу отпусти','2 / 3 · Зажми, подержи и отпусти','3 / 3 · Зажми и перетащи звезду в пунктир'];
let mode=0,passed=false,drag=null,timer=null,x=22,y=55;
function position(a,b){x=Math.max(13,Math.min(87,a));y=Math.max(20,Math.min(80,b));token.style.left=x+'%';token.style.top=y+'%';}
function resetMouse(){passed=false;drag=null;clearTimeout(timer);position(22,55);mission.textContent=tasks[mode];goal.hidden=mode!==2;next.disabled=true;next.textContent=mode===2?'Повторить сначала ↺':'Дальше →';status.textContent='Пробуем левой кнопкой.';}
token.addEventListener('pointerdown',e=>{if(e.button!==0||passed)return;const r=board.getBoundingClientRect();drag={id:e.pointerId,time:Date.now(),x:e.clientX,y:e.clientY,px:x,py:y,width:r.width,height:r.height,moved:0};token.setPointerCapture(e.pointerId);e.preventDefault();status.textContent='Кнопка нажата…';if(mode===1)timer=setTimeout(()=>{if(drag)status.textContent='Удержал! Теперь отпусти кнопку.';},550);});
token.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.moved=Math.max(drag.moved,Math.hypot(e.clientX-drag.x,e.clientY-drag.y));if(mode===2)position(drag.px+(e.clientX-drag.x)/drag.width*100,drag.py+(e.clientY-drag.y)/drag.height*100);});
token.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;clearTimeout(timer);const elapsed=Date.now()-drag.time;const moved=drag.moved;drag=null;passed=mode===0?elapsed<550&&moved<8:mode===1?elapsed>=500&&moved<8:Math.hypot(x-78,y-55)<12&&moved>=8;status.textContent=passed?['Нажал и отпустил — это щелчок!','Держал, потом отпустил — это зажать!','Держал и двигал — это перетаскивание!'][mode]:mode===0?'Нажми коротко, без движения, и отпусти.':mode===1?'Держи неподвижно чуть дольше. Дождись подсказки.':'Потяни звезду в пунктир и только потом отпусти.';next.disabled=!passed;});
function cancel(){clearTimeout(timer);drag=null;}
token.addEventListener('pointercancel',cancel);token.addEventListener('lostpointercapture',cancel);
next.addEventListener('click',()=>{if(!passed)return;mode=(mode+1)%3;resetMouse();});resetMouse();
const finder=get('keyboardFind'),findStatus=get('keyFindStatus');
const keyList=[['Control','Ctrl'],['Shift','Shift'],['Alt','Alt'],['Enter','Enter'],['KeyZ','Z / Я'],['KeyC','C / С'],['KeyV','V / М'],['KeyS','S / Ы']];
let keyIndex=0;
findStatus.textContent='Выбери тренажёр. Найди Ctrl на своей клавиатуре.';
get('keyFindStart').addEventListener('click',()=>finder.focus());
finder.addEventListener('keydown',e=>{if(e.repeat)return;const code=['Control','Shift','Alt','Enter'].includes(e.key)?e.key:e.code;if(e.ctrlKey||e.altKey||keyList.some(k=>k[0]===code))e.preventDefault();if(code!==keyList[keyIndex][0]){findStatus.textContent='Сейчас ищем '+keyList[keyIndex][1]+'. Нажимай клавиши по одной.';return;}finder.querySelectorAll('[data-map-key]').forEach(k=>k.classList.toggle('lit',k.dataset.mapKey===code));keyIndex++;if(keyIndex===keyList.length){findStatus.textContent='Все клавиши найдены! Ещё круг начинается с Ctrl.';keyIndex=0;}else findStatus.textContent='Нашли! Отпусти клавишу. Теперь найди '+keyList[keyIndex][1]+'.';});
const trainer=get('chordTrainer'),ctrlCap=get('ctrlCap'),letterCap=get('letterCap'),chordStatus=get('chordStatus'),chordNext=get('chordNext');
const commands=[['KeyZ','Z','отменить правку'],['KeyC','C','копировать'],['KeyV','V','вставить'],['KeyS','S','сохранить']];
let command=0,ctrlDown=false,pressed=false,letterReleased=false,done=false;
function clearChord(){ctrlDown=pressed=letterReleased=false;ctrlCap.classList.remove('held');letterCap.classList.remove('held');}
function renderChord(){done=false;clearChord();letterCap.textContent=commands[command][1];chordNext.disabled=true;chordStatus.textContent='Ctrl+'+commands[command][1]+' — '+commands[command][2]+'. Сначала зажми Ctrl.';}
get('chordStart').addEventListener('click',()=>trainer.focus());
trainer.addEventListener('keydown',e=>{const target=commands[command];if(e.key==='Control'){e.preventDefault();if(done)return;ctrlDown=true;ctrlCap.classList.add('held');chordStatus.textContent='Ctrl держим. Нажми '+target[1]+'.';return;}if(e.ctrlKey)e.preventDefault();if(done||e.repeat)return;if(e.code===target[0]){if(ctrlDown&&e.ctrlKey){e.preventDefault();pressed=true;letterReleased=false;letterCap.classList.add('held');chordStatus.textContent='Теперь отпусти '+target[1]+', пока держишь Ctrl.';}else chordStatus.textContent='Сначала зажми Ctrl, потом нажми '+target[1]+'.';}});
trainer.addEventListener('keyup',e=>{if(e.code===commands[command][0]&&pressed){letterReleased=true;letterCap.classList.remove('held');chordStatus.textContent='Буква отпущена. Теперь отпусти Ctrl.';}if(e.key==='Control'){ctrlCap.classList.remove('held');if(pressed&&letterReleased){done=true;chordNext.disabled=false;chordStatus.textContent='Получилось! Ctrl+'+commands[command][1]+' — '+commands[command][2]+'.';}else if(pressed){chordStatus.textContent='Попробуй снова: букву отпускаем раньше Ctrl.';}ctrlDown=false;pressed=false;letterReleased=false;}});
trainer.addEventListener('blur',clearChord);
chordNext.addEventListener('click',()=>{if(!done)return;command=(command+1)%commands.length;renderChord();trainer.focus();});renderChord();
})();
