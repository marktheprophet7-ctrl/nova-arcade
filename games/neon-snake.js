(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),COLS=25,ROWS=20,CELL=22,OX=5,OY=4,W=560,H=448,DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
let running=false,paused=false,snake=[],dir='right',queued='right',fruit=null,gold=null,goldTimer=0,score=0,best=0,combo=1,level=1,steps=0,tick=0,raf=0,last=0,particles=[],sound=false,ac=null,comboClock=0,blink=0;
try{best=Math.max(+(localStorage.getItem('nova-neon-snake-best')||0),+(localStorage.getItem('nova-best-1')||0))||0}catch(e){}$('best').textContent=best;
function tone(f=540,d=.09){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();let o=ac.createOscillator(),v=ac.createGain();o.type='square';o.frequency.value=f;v.gain.setValueAtTime(.015,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(700)};
function status(s){$('message').textContent=s}
function hud(){$('score').textContent=score;$('best').textContent=best;$('length').textContent=snake.length;$('combo').textContent='×'+combo;$('level').textContent=String(level).padStart(2,'0')}
function freeCell(){let taken=new Set(snake.map(p=>p.x+','+p.y));if(fruit)taken.add(fruit.x+','+fruit.y);if(gold)taken.add(gold.x+','+gold.y);let choices=[];for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!taken.has(x+','+y))choices.push({x,y});return choices.length?choices[Math.floor(Math.random()*choices.length)]:null}
function sparks(x,y,col){for(let i=0;i<12;i++){let a=Math.random()*Math.PI*2,s=28+Math.random()*80;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5,col})}}
function points(n){score+=n;if(score>best){best=score;try{localStorage.setItem('nova-neon-snake-best',String(best));localStorage.setItem('nova-best-1',String(best))}catch(e){}}hud()}
function over(win=false){running=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';status(win?'GRID MASTER · PERFECT CLEAR · '+score+' POINTS':'GAME OVER · '+score+' POINTS · '+snake.length+' LENGTH');tone(170,.25)}
function start(){cancelAnimationFrame(raf);running=true;paused=false;snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10},{x:4,y:10}];dir='right';queued='right';fruit=null;gold=null;score=0;combo=1;level=1;steps=0;tick=0;comboClock=0;goldTimer=0;particles=[];fruit=freeCell();$('start').hidden=true;$('pause').textContent='PAUSE';hud();status('FOLLOW THE FRUIT · KEEP THE COMBO ALIVE');last=performance.now();raf=requestAnimationFrame(frame);tone(850)}
function steer(d){if(!DIRS[d]||!running||paused)return false;let v=DIRS[d],old=DIRS[dir];if(v[0]===-old[0]&&v[1]===-old[1])return false;queued=d;return true}
function step(){dir=queued;let v=DIRS[dir],head={x:snake[0].x+v[0],y:snake[0].y+v[1]};let isFruit=fruit&&head.x===fruit.x&&head.y===fruit.y,isGold=gold&&head.x===gold.x&&head.y===gold.y;let eating=isFruit||isGold;
 if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.slice(0,eating?snake.length:snake.length-1).some(p=>p.x===head.x&&p.y===head.y)){over();return}
 snake.unshift(head);if(!eating)snake.pop();
 if(eating){combo=comboClock>0?Math.min(8,combo+1):1;comboClock=6;let earned=(isGold?100:20)*combo;points(earned);sparks(OX+(head.x+.5)*CELL,OY+(head.y+.5)*CELL,isGold?'#ffe79a':'#ff79bb');tone(isGold?960:580+combo*65);if(isFruit){fruit=null;fruit=freeCell();if(!fruit){over(true);return}}else{gold=null;goldTimer=0}status((isGold?'GOLD FRUIT! ':'FRUIT! ')+'+'+earned+' · COMBO ×'+combo)}
 steps++;level=1+Math.floor((snake.length-4)/5);hud();
 if(steps%12===0&&!gold&&Math.random()<.45){gold=freeCell();goldTimer=6.5}
}
function update(dt){if(!running||paused)return;comboClock=Math.max(0,comboClock-dt);if(comboClock===0&&combo!==1){combo=1;hud()}if(gold){goldTimer-=dt;if(goldTimer<=0){gold=null;goldTimer=0}}tick+=dt;const interval=Math.max(.074,.19-(level-1)*.014);let guard=0;while(tick>=interval&&running&&guard++<4){tick-=interval;step()}for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)}
function draw(now=0){let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#161432');bg.addColorStop(1,'#061a26');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){g.fillStyle=(x+y)%2?'#8bf9f408':'#8bf9f40d';g.fillRect(OX+x*CELL,OY+y*CELL,CELL-1,CELL-1)}
 g.strokeStyle='#5effe65c';g.lineWidth=3;g.strokeRect(OX-1,OY-1,COLS*CELL+2,ROWS*CELL+2);
 function food(p,col,r){if(!p)return;let cx=OX+(p.x+.5)*CELL,cy=OY+(p.y+.5)*CELL;g.save();g.shadowColor=col;g.shadowBlur=21;g.fillStyle=col;g.beginPath();g.arc(cx,cy,r+Math.sin(now/200)*1.1,0,7);g.fill();g.restore()}
 food(fruit,'#ff77bb',7);food(gold,'#ffe29a',9);
 snake.forEach((p,i)=>{let x=OX+p.x*CELL,y=OY+p.y*CELL,col=i===0?'#effff6':i%2?'#67fce5':'#79cfff';g.save();g.shadowColor=col;g.shadowBlur=i===0?21:10;g.fillStyle=col;g.beginPath();g.roundRect(x+2,y+2,CELL-4,CELL-4,6);g.fill();g.restore();if(i===0){g.fillStyle='#123a42';let v=DIRS[dir],a=v[0]!==0?x+(v[0]>0?15:7):x+7,b=v[1]!==0?y+(v[1]>0?15:7):y+7;g.fillRect(a,b,3,3);g.fillRect(v[0]!==0?a:b===0?x+15:x+15,v[1]!==0?b:y+15,3,3)}});
 for(let p of particles){g.globalAlpha=Math.max(0,p.life/.5);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;g.fillStyle='#00000020';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!running||paused){g.fillStyle='#040b1dd5';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe6a2';g.font='900 42px system-ui';g.fillText(paused?'PAUSED':snake.length>4?'GAME OVER':'NEON SNAKE',W/2,207);g.fillStyle='#96ffe7';g.font='700 16px system-ui';g.fillText(paused?'PRESS P TO RESUME':'EAT · GROW · SURVIVE',W/2,245)}
}
function frame(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(frame)}
for(let b of document.querySelectorAll('[data-dir]'))b.onclick=()=>steer(b.dataset.dir);
let touch=null;c.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};if(c.setPointerCapture)c.setPointerCapture(e.pointerId)});c.addEventListener('pointerup',e=>{if(!touch)return;let dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.hypot(dx,dy)<16)return;steer(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')});c.addEventListener('pointercancel',()=>touch=null);
$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();status(paused?'PAUSED · PRESS P OR RESUME':'BACK IN THE GRID')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase(),d={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[k];if(d){e.preventDefault();if(!e.repeat)steer(d)}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();