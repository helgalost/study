
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
const workspace=get('rocketWorkspace');
const parts=[
{el:get('pieceBody'),start:[17,68],target:[65,58]},
{el:get('pieceNose'),start:[19,22],target:[65,28]},
{el:get('pieceWindow'),start:[35,87],target:[65,52]}
];
function put(p,x,y){
const rect=workspace.getBoundingClientRect();
const halfX=rect.width?p.el.offsetWidth/rect.width*50:5;
const halfY=rect.height?p.el.offsetHeight/rect.height*50:5;
p.x=Math.max(halfX,Math.min(100-halfX,x));p.y=Math.max(halfY,Math.min(100-halfY,y));
p.el.style.left=p.x+'%';p.el.style.top=p.y+'%';
}
function reset(){parts.forEach(p=>put(p,...p.start));get('rocketStatus').textContent='Перенеси три фигуры на пунктирный силуэт.';}
parts.forEach(p=>{
let drag=null;
p.el.addEventListener('pointerdown',e=>{
if(e.button!==0)return;
const rect=workspace.getBoundingClientRect();
drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:p.x,py:p.y,width:rect.width,height:rect.height};
p.el.setPointerCapture(e.pointerId);p.el.focus();e.preventDefault();
});
p.el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;put(p,drag.px+(e.clientX-drag.x)/drag.width*100,drag.py+(e.clientY-drag.y)/drag.height*100);});
function end(e){if(!drag||drag.id!==e.pointerId)return;drag=null;if(Math.hypot(p.x-p.target[0],p.y-p.target[1])<7)put(p,...p.target);}
p.el.addEventListener('pointerup',end);p.el.addEventListener('pointercancel',()=>{drag=null;});p.el.addEventListener('lostpointercapture',()=>{drag=null;});
p.el.addEventListener('keydown',e=>{const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!delta)return;e.preventDefault();put(p,p.x+delta[0],p.y+delta[1]);});
});
get('rocketCheck').addEventListener('click',()=>{const done=parts.every(p=>Math.hypot(p.x-p.target[0],p.y-p.target[1])<7);get('rocketStatus').textContent=done?'🚀 Получилось! Три фигуры стали ракетой.':'Посмотри на контур: корпус внизу, нос сверху, круг внутри корпуса.';});
get('rocketReset').addEventListener('click',reset);reset();
})();
