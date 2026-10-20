(()=>{'use strict';
const c=document.getElementById('field'),g=c.getContext('2d'),$=id=>document.getElementById(id),W=560,H=450,COLS=21,ROWS=15,TILE=24,OX=28,OY=40;
let grid=[],player={x:1,y:1,px:1,py:1},exit={x:COLS-2,y:ROWS-2},visited=new Set(),shards=[],particles=[],running=false,paused=false,level=1,score=0,best=0,moves=0,levelTime=0,last=0,raf=0,sound=false,ac=null,exitTime=0,complete=false;
try{best=Math.max(Number(localStorage.getItem('nova-neon-maze-best')||0),Number(localStorage.getItem('nova-arcade-machine-neon-maze')||0))||0}catch{}$('best').textContent=best;
function tone(freq,d=.09){if(!sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=freq;v.gain.setValueAtTime(.03,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));tone(640)};
function points(n){score+=n;$('score').textContent=score;if(score>best){best=score;$('best').textContent=best;try{localStorage.setItem('nova-neon-maze-best',best)}catch{}}}
function say(s){$('message').textContent=s}
function rand(n){return Math.floor(Math.random()*n)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function cell(x,y){return y*COLS+x}
function maze(){grid=Array(COLS*ROWS).fill(1);let path=[[1,1]];grid[cell(1,1)]=0;while(path.length){let [x,y]=path[path.length-1],options=shuffle([[2,0],[-2,0],[0,2],[0,-2]]),next=null;for(let [dx,dy] of options){let a=x+dx,b=y+dy;if(a<=0||b<=0||a>=COLS-1||b>=ROWS-1||grid[cell(a,b)]===0)continue;next=[a,b,dx,dy];break}if(next){const [a,b,dx,dy]=next;grid[cell(x+dx/2,y+dy/2)]=0;grid[cell(a,b)]=0;path.push([a,b])}else path.pop()}
 grid[cell(exit.x,exit.y)]=0;
 player={x:1,y:1,px:1,py:1};visited=new Set([cell(1,1)]);moves=0;levelTime=0;complete=false;exitTime=0;shards=[];particles=[];
 const spaces=[];for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(grid[cell(x,y)]===0&&Math.abs(x-1)+Math.abs(y-1)>5&&Math.abs(x-exit.x)+Math.abs(y-exit.y)>3)spaces.push({x,y});
 shuffle(spaces);shards=spaces.slice(0,Math.min(3,spaces.length)).map(p=>({...p,taken:false}));
 $('level').textContent=String(level).padStart(2,'0');$('crystals').textContent='0 / '+shards.length;$('clock').textContent='0:00';
 say('LEVEL '+level+' · FIND THE GOLDEN EXIT PORTAL');
}
function start(){cancelAnimationFrame(raf);running=true;paused=false;level=1;score=0;$('score').textContent='0';$('start').hidden=true;pauseButton.textContent='PAUSE';maze();last=performance.now();raf=requestAnimationFrame(loop);tone(730)}
function burst(x,y,color){for(let i=0;i<13;i++){let a=i/13*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*65,vy:Math.sin(a)*65,t:.48,col:color})}}
function move(dx,dy){if(!running||paused||complete)return;let nx=player.x+dx,ny=player.y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS||grid[cell(nx,ny)]){tone(160,.03);return}
 player.x=nx;player.y=ny;moves++;visited.add(cell(nx,ny));tone(320,.028);
 const shard=shards.find(p=>!p.taken&&p.x===nx&&p.y===ny);if(shard){shard.taken=true;points(50);tone(880);burst(nx,ny,'#75ffda');$('crystals').textContent=shards.filter(p=>p.taken).length+' / '+shards.length;say('ENERGY SHARD COLLECTED! +50')}
 if(nx===exit.x&&ny===exit.y){complete=true;exitTime=.75;let bonus=Math.max(90,450-Math.floor(levelTime)*5-Math.max(0,moves-50));points(bonus+shards.filter(p=>p.taken).length*25);say('LABYRINTH ESCAPED! +'+bonus+' · ENTERING NEXT SECTOR');tone(1050,.17);burst(nx,ny,'#ffe39c')}
}
function update(dt){if(!running||paused)return;levelTime+=dt;const sec=Math.floor(levelTime);$('clock').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
 let ease=Math.min(1,dt*15);player.px+=(player.x-player.px)*ease;player.py+=(player.y-player.py)*ease;
 particles.forEach(p=>{p.x+=p.vx*dt/TILE;p.y+=p.vy*dt/TILE;p.t-=dt});particles=particles.filter(p=>p.t>0);
 if(complete){exitTime-=dt;if(exitTime<=0){complete=false;level++;maze()}}
}
function draw(now=0){let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#172441');bg.addColorStop(1,'#080e24');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const n=cell(x,y),dx=x-player.x,dy=y-player.y,dist=Math.hypot(dx,dy),v=dist<4.8||visited.has(n);
 if(!v){g.fillStyle='#070b1a';g.fillRect(OX+x*TILE,OY+y*TILE,TILE,TILE);continue}
 const px=OX+x*TILE,py=OY+y*TILE,alpha=Math.max(.35,1-dist/13);
 if(grid[n]){g.fillStyle='#25395d';g.fillRect(px,py,TILE-1,TILE-1);g.fillStyle='#3c5e88';g.fillRect(px+1,py+1,TILE-3,3);g.fillStyle='#101e37';g.fillRect(px+TILE-5,py+4,4,TILE-5)}
 else{g.fillStyle=(x+y)%2?'#101b32':'#131d36';g.fillRect(px,py,TILE-1,TILE-1);if(visited.has(n)){g.fillStyle='#7a67ca20';g.fillRect(px+10,py+10,4,4)}}}
 for(const shard of shards)if(!shard.taken&&Math.hypot(shard.x-player.x,shard.y-player.y)<5.1){const px=OX+(shard.x+.5)*TILE,py=OY+(shard.y+.5)*TILE;g.shadowColor='#7affd5';g.shadowBlur=17;g.fillStyle='#81ffdb';g.beginPath();g.moveTo(px,py-8);g.lineTo(px+7,py);g.lineTo(px,py+8);g.lineTo(px-7,py);g.closePath();g.fill();g.shadowBlur=0}
 if(Math.hypot(exit.x-player.x,exit.y-player.y)<5.3||visited.has(cell(exit.x,exit.y))){const px=OX+(exit.x+.5)*TILE,py=OY+(exit.y+.5)*TILE;g.shadowColor='#ffe185';g.shadowBlur=20;g.strokeStyle='#ffe185';g.lineWidth=4;g.beginPath();g.arc(px,py,8+Math.sin(now/450)*2,0,Math.PI*2);g.stroke();g.shadowBlur=0}
 for(const p of particles){g.globalAlpha=Math.max(0,p.t/.48);g.fillStyle=p.col;g.fillRect(OX+(p.x+.5)*TILE,OY+(p.y+.5)*TILE,4,4)}g.globalAlpha=1;
 const px=OX+(player.px+.5)*TILE,py=OY+(player.py+.5)*TILE;g.shadowColor='#78ffed';g.shadowBlur=22;g.fillStyle='#8fffe8';g.beginPath();g.arc(px,py,9,0,Math.PI*2);g.fill();g.shadowBlur=0;g.fillStyle='#12354e';g.beginPath();g.arc(px+2,py-2,3,0,Math.PI*2);g.fill();
 g.fillStyle='#e6efff';g.font='900 14px system-ui';g.textAlign='left';g.fillText('SECTOR '+String(level).padStart(2,'0'),29,24);g.textAlign='right';g.fillText('MOVES '+moves,W-29,24);g.fillStyle='#00000025';for(let y=0;y<H;y+=6)g.fillRect(0,y,W,2);
 if(!running||paused){g.fillStyle='#030b1dd5';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe4a0';g.font='900 38px system-ui';g.fillText(paused?'PAUSED':'NEON MAZE',W/2,210);g.fillStyle='#9bfcee';g.font='700 16px system-ui';g.fillText(paused?'PRESS P OR RESUME':'START TO ENTER THE LABYRINTH',W/2,244)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
const controls=$('controls');for(const [label,dx,dy] of [['▲',0,-1],['◀',-1,0],['▼',0,1],['▶',1,0]]){let b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',label==='▲'?'Up':label==='◀'?'Left':label==='▼'?'Down':'Right');b.onclick=()=>move(dx,dy);controls.append(b)}
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='PAUSE';pauseButton.onclick=()=>{if(!running)return;paused=!paused;pauseButton.textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P TO CONTINUE':'FIND THE EXIT PORTAL')};pauseButton.style.marginTop='8px';controls.insertAdjacentElement('afterend',pauseButton);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase(),d={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]}[k];if(d){e.preventDefault();move(...d)}if(k==='p'&&!e.repeat){e.preventDefault();pauseButton.click()}});
let touch=null;c.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY}});c.addEventListener('pointerup',e=>{if(!touch)return;let dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;if(Math.abs(dx)>Math.abs(dy))move(Math.sign(dx),0);else move(0,Math.sign(dy))});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pauseButton.click()});
$('start').onclick=start;draw();
})();