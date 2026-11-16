
(function(){
'use strict';
const get=id=>document.getElementById(id);
let taps=0;
get('clickStar').addEventListener('click',()=>{taps++;get('starFeedback').textContent='Нажатий: '+taps+' · Левая кнопка выбирает!';});
const source=get('sourcePicture'),destination=get('destination'),copyMenu=get('copyMenu'),pasteMenu=get('pasteMenu'),paste=get('labPaste'),status=get('transferStatus');
const original=source.innerHTML;
let copied=false;
function showCopy(){pasteMenu.hidden=true;copyMenu.hidden=false;status.textContent='Выбери «Копировать изображение» левой кнопкой.';}
function showPaste(){copyMenu.hidden=true;pasteMenu.hidden=false;paste.disabled=!copied;status.textContent=copied?'Теперь левой нажми «Вставить».':'Сначала скопируй картинку слева.';}
source.addEventListener('contextmenu',e=>{e.preventDefault();showCopy();});
destination.addEventListener('contextmenu',e=>{e.preventDefault();showPaste();});
get('sourceMenuButton').addEventListener('click',showCopy);
get('destinationMenuButton').addEventListener('click',showPaste);
source.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showCopy();}});
destination.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPaste();}});
get('labCopy').addEventListener('click',()=>{copied=true;copyMenu.hidden=true;paste.disabled=false;status.textContent='Скопировано! Открой меню на пустом листе справа.';});
paste.addEventListener('click',()=>{if(!copied)return;destination.innerHTML=original;pasteMenu.hidden=true;status.textContent='Готово! Картинка осталась в браузере и появилась на листе.';});
get('transferReset').addEventListener('click',()=>{copied=false;paste.disabled=true;copyMenu.hidden=pasteMenu.hidden=true;destination.innerHTML='<span>Пустой лист</span>';status.textContent='Начни с картинки слева.';});
[source,destination].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Escape'){copyMenu.hidden=pasteMenu.hidden=true;}}));

const workspace=get('catWorkspace');
const parts=[
{el:get('catBody'),start:[25,79],target:[68,70]},
{el:get('catHead'),start:[24,46],target:[68,46]},
{el:get('catEarLeft'),start:[15,15],target:[56,28]},
{el:get('catEarRight'),start:[41,15],target:[80,28]}
];
function put(p,x,y){
const rect=workspace.getBoundingClientRect();
const halfX=rect.width?p.el.offsetWidth/rect.width*50:5;
const halfY=rect.height?p.el.offsetHeight/rect.height*50:5;
p.x=Math.max(halfX,Math.min(100-halfX,x));p.y=Math.max(halfY,Math.min(100-halfY,y));
p.el.style.left=p.x+'%';p.el.style.top=p.y+'%';
}
function reset(){parts.forEach(p=>put(p,...p.start));get('catStatus').textContent='Четыре детали. Один очень упитанный кот.';}
parts.forEach(p=>{
let drag=null;
p.el.addEventListener('pointerdown',e=>{if(e.button!==0)return;const rect=workspace.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:p.x,py:p.y,width:rect.width,height:rect.height};p.el.setPointerCapture(e.pointerId);p.el.focus();e.preventDefault();});
p.el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;put(p,drag.px+(e.clientX-drag.x)/drag.width*100,drag.py+(e.clientY-drag.y)/drag.height*100);});
p.el.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;if(Math.hypot(p.x-p.target[0],p.y-p.target[1])<7)put(p,...p.target);});
p.el.addEventListener('pointercancel',()=>{drag=null;});p.el.addEventListener('lostpointercapture',()=>{drag=null;});
p.el.addEventListener('keydown',e=>{const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!delta)return;e.preventDefault();put(p,p.x+delta[0],p.y+delta[1]);});
});
get('catCheck').addEventListener('click',()=>{get('catStatus').textContent=parts.every(p=>Math.hypot(p.x-p.target[0],p.y-p.target[1])<7)?'🐈🍞 Кот-батон готов! Кажется, он просит добавки.':'Голова над телом. Два уха сверху. Посмотри на силуэт.';});
get('catReset').addEventListener('click',reset);reset();
const stage=get('eggStage');
get('eggSpin').addEventListener('click',()=>{stage.classList.remove('tilted','spinning');void stage.offsetWidth;stage.classList.add('spinning');});
get('eggTilt').addEventListener('click',()=>{stage.classList.remove('spinning');stage.classList.add('tilted');});
get('eggReset').addEventListener('click',()=>{stage.classList.remove('spinning','tilted');});
const lab=get('partyLab'),board=get('partyBoard'),partyStatus=get('partyStatus');
let partyCopied=false,partyCount=1;
const names=['Капибара','Директор болота','Главный по отдыху','Зам по булочкам','Мастер дзена','Капибосс'];
const template=get('sourcePicture').innerHTML;
function drawParty(){
 board.replaceChildren();
 for(let n=0;n<partyCount;n++){const card=document.createElement('div');card.className='party-sticker';card.innerHTML=template;const title=document.createElement('strong');title.textContent=names[n%names.length];card.appendChild(title);board.appendChild(card);}
 get('partyUndo').disabled=partyCount<=1;
}
function copyParty(){partyCopied=true;partyStatus.textContent='Фото скопировано. Теперь вставляй: Ctrl+V!';lab.focus();}
function pasteParty(){if(!partyCopied){partyStatus.textContent='Сначала скопируй фото: Ctrl+C.';return;}if(partyCount>=6){partyStatus.textContent='Шесть капибар — вечеринка в сборе! Попробуй Ctrl+Z.';return;}partyCount++;drawParty();partyStatus.textContent='Капибар: '+partyCount+'. Ещё копию или отменим?';lab.focus();}
function undoParty(){if(partyCount>1){partyCount--;drawParty();partyStatus.textContent='Ctrl+Z отменил последнее добавление. Капибар: '+partyCount;}else partyStatus.textContent='Это исходное фото. Копии уже отменены.';lab.focus();}
get('partyCopy').addEventListener('click',copyParty);
get('partyPaste').addEventListener('click',pasteParty);
get('partyUndo').addEventListener('click',undoParty);
get('partyReset').addEventListener('click',()=>{partyCount=1;partyCopied=false;drawParty();partyStatus.textContent='Снова одна капибара. Скопируй её!';lab.focus();});
lab.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.shiftKey||e.altKey)return;const key=e.code||('Key'+String(e.key).toUpperCase());const action={KeyC:copyParty,KeyV:pasteParty,KeyZ:undoParty}[key];if(action){e.preventDefault();action();}});
drawParty();
// Подсветка восьми крупных разделов вместо ссылки на каждый слайд.
const navLinks=[...document.querySelectorAll('.computer-dock a')];
if('IntersectionObserver' in window){
const all=[...document.querySelectorAll('main .slide')],groups=navLinks.map(a=>all.findIndex(s=>s.id===a.getAttribute('href').slice(1)));
const observer=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!active)return;const index=all.indexOf(active.target);let group=0;groups.forEach((start,i)=>{if(start<=index)group=i;});navLinks.forEach((a,i)=>a.classList.toggle('active',i===group));},{threshold:.35});all.forEach(s=>observer.observe(s));
}
})();
