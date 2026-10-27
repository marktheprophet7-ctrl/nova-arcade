(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,GRAV=880,RUNNER_W=24,RUNNER_H=35;
let running=false,paused=false,score=0,best=0,lives=3,rooftops=0,gems=0,pace=1,worldX=72,y=0,vy=0,jumps=0,camera=0,platforms=[],stars=[],particles=[],invuln=0,elapsed=0,raf=0,last=0,sound=false,ac=null,flash=0,lastRoof=-1;
try{best=Math.max(Number(localStorage.getItem('nova-skyline-hop-best')||0),Number(localStorage.getItem('nova-best-12')||0))||0}catch{}$('best').textContent=best;
function tone(h=610,d=.09){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=h;v.gain.setValueAtTime(.024,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(740)};
function hud(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('lives').textContent='♥ '.repeat(lives).trim()||'GAME OVER';$('rooftops').textContent=rooftops;$('gems').textContent=gems;$('pace').textContent=String(pace).padStart(2,'0')}
function award(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem('nova-skyline-hop-best',String(best));localStorage.setItem('nova-best-12',String(best))}catch{}}hud()}
function say(s){$('message').textContent=s}
function sparks(x,y,col,n=12){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=30+Math.random()*140;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.62,col})}if(particles.length>170)particles.splice(0,particles.length-170)}
function makeRoof(){let prev=platforms[platforms.length-1],gap=49+Math.random()*Math.min(66,35+pace*5),width=128+Math.random()*86,top=Math.max(207,Math.min(350,prev.y+(Math.random()-.5)*66));let roof={x:prev.x+prev.w+gap,y:top,w:width,antenna:Math.random()<.32&&platforms.length>3,passed:false};platforms.push(roof);
 if(Math.random()<.83)stars.push({x:roof.x+roof.w*.53,y:roof.y-47,taken:false});}
function fill(){while(platforms[platforms.length-1].x+platforms[platforms.length-1].w<worldX+W*2)makeRoof();while(platforms.length>4&&platforms[1].x+platforms[1].w<camera-160)platforms.shift();stars=stars.filter(s=>!s.taken&&s.x>camera-100)}
function end(){running=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('RUN COMPLETE · '+Math.floor(score)+' POINTS · '+rooftops+' ROOFTOPS');tone(180,.27)}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;lives=3;rooftops=0;gems=0;pace=1;worldX=72;vy=0;jumps=0;camera=0;invuln=1;elapsed=0;flash=0;particles=[];lastRoof=-1;platforms=[{x:-120,y:336,w:370,antenna:false,passed:false}];stars=[];y=platforms[0].y-RUNNER_H;fill();hud();$('start').hidden=true;$('pause').textContent='PAUSE';say('JUMP THE GAPS · DOUBLE-JUMP TO RECOVER');last=performance.now();raf=requestAnimationFrame(loop);tone(790)}
function jump(){if(!running||paused||jumps>=2)return false;vy=jumps===0?-400:-365;jumps++;sparks(worldX-camera,y+RUNNER_H,'#85fff1',7);tone(jumps===1?620:820,.07);return true}
function fall(){if(invuln>0&&y<H+120)return;lives--;flash=.65;hud();tone(170,.2);sparks(worldX-camera,y,'#ff78ab',20);if(lives<=0){end();return}let safe=platforms.findLast(p=>p.x<=worldX&&p.x+p.w>worldX-30)||platforms[0];worldX=safe.x+Math.min(38,safe.w*.25);y=safe.y-RUNNER_H;vy=0;jumps=0;invuln=1.6;say('MISSED THE ROOF · '+lives+' LIVES LEFT')}
function update(dt){
 if(!running||paused)return;elapsed+=dt;pace=1+Math.floor(elapsed/24);invuln=Math.max(0,invuln-dt);flash=Math.max(0,flash-dt);
 let speed=Math.min(270,168+pace*11);let previousY=y,previousX=worldX;worldX+=speed*dt;vy+=GRAV*dt;y+=vy*dt;camera=Math.max(0,worldX-138);fill();
 const oldFeet=previousY+RUNNER_H,feet=y+RUNNER_H;
 if(vy>=0)for(const roof of platforms){if(oldFeet<=roof.y+3&&feet>=roof.y&&worldX+RUNNER_W*.6>roof.x&&worldX-RUNNER_W*.55<roof.x+roof.w){y=roof.y-RUNNER_H;vy=0;jumps=0;break}}
 if(y>H+100){fall();if(!running)return}
 for(let i=0;i<platforms.length;i++){let p=platforms[i];if(!p.passed&&worldX>p.x+p.w*.58&&p.x>0){p.passed=true;rooftops++;award(40+pace*7);say('ROOFTOP '+rooftops+' CLEARED');}
 if(p.antenna&&invuln<=0&&Math.abs(worldX-(p.x+p.w*.82))<RUNNER_W*.55+8&&y+RUNNER_H>p.y-25&&y<p.y){p.antenna=false;lives--;invuln=1.35;flash=.5;sparks(worldX-camera,y,'#ff79ac',17);tone(160,.14);hud();if(lives<=0){end();return}else say('ANTENNA HIT · '+lives+' LIVES LEFT')}}
 for(let s of stars){if(!s.taken&&Math.abs(worldX-s.x)<21&&Math.abs(y+RUNNER_H*.45-s.y)<26){s.taken=true;gems++;award(100);sparks(s.x-camera,s.y,'#ffe39e',13);tone(990,.11);say('SKY GEM! +100')}}
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
 award(dt*(5+pace*.7))
}
function draw(now=0){const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#231342');grad.addColorStop(.7,'#121b3b');grad.addColorStop(1,'#090d22');g.fillStyle=grad;g.fillRect(0,0,W,H);
for(let i=0;i<56;i++){const x=(i*117.1-camera*.11)%W,y=(i*71.4)%240+10;g.fillStyle='#a8e3ff70';g.fillRect(x<0?x+W:x,y,2,2)}
for(let i=0;i<20;i++){let x=i*47-(camera*.3%47),height=85+(i*51%90);g.fillStyle='#1c2146';g.fillRect(x,H-height,42,height);g.fillStyle='#56faff24';for(let j=0;j<3;j++)g.fillRect(x+8+j*10,H-height+14,4,6)}
for(let p of platforms){let x=p.x-camera;if(x+p.w<-20||x>W+20)continue;g.fillStyle='#212745';g.fillRect(x,p.y,p.w,H-p.y+50);g.shadowColor='#8fffe1';g.shadowBlur=13;g.fillStyle='#90ffe4';g.fillRect(x,p.y-5,p.w,7);g.shadowBlur=0;g.fillStyle='#5ae0d421';for(let j=16;j<p.w-12;j+=31){g.fillRect(x+j,p.y+35,12,18);g.fillRect(x+j,p.y+80,12,18)}if(p.antenna){let ax=x+p.w*.82;g.strokeStyle='#ff78ad';g.lineWidth=5;g.beginPath();g.moveTo(ax,p.y);g.lineTo(ax,p.y-26);g.stroke();g.shadowColor='#ff78ad';g.shadowBlur=18;g.fillStyle='#ff9bb7';g.beginPath();g.arc(ax,p.y-30,6,0,7);g.fill();g.shadowBlur=0}}
for(let s of stars){let x=s.x-camera;if(s.taken||x<-25||x>W+25)continue;g.shadowColor='#ffe09b';g.shadowBlur=20;g.fillStyle='#ffe5a0';g.beginPath();for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,r=j%2?6:12;if(j===0)g.moveTo(x+Math.cos(a)*r,s.y+Math.sin(a)*r);else g.lineTo(x+Math.cos(a)*r,s.y+Math.sin(a)*r)}g.closePath();g.fill();g.shadowBlur=0}
g.save();if(invuln>0&&Math.floor(now/100)%2===0)g.globalAlpha=.5;let px=worldX-camera;g.shadowColor='#a3ffed';g.shadowBlur=22;g.fillStyle='#b8ffeb';g.beginPath();g.roundRect(px-12,y+7,24,26,6);g.fill();g.fillStyle='#fff6c9';g.beginPath();g.arc(px,y+1,11,0,7);g.fill();g.fillStyle='#192a43';g.fillRect(px+4,y,4,3);g.shadowBlur=0;g.fillStyle='#8f86ff';g.fillRect(px-9,y+27,7,11);g.fillRect(px+3,y+27,7,11);g.restore();
for(let p of particles){g.globalAlpha=Math.max(0,p.life/.62);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;g.fillStyle='#ffe3a5';g.font='900 13px system-ui';g.textAlign='left';g.fillText('SKYLINE HOP / PACE '+pace,18,24);g.textAlign='right';g.fillText('DISTANCE '+Math.floor(worldX)+'m',W-18,24);
if(flash>0){g.fillStyle='rgba(255,107,153,'+(flash*.2)+')';g.fillRect(0,0,W,H)}
g.fillStyle='#00000023';for(let yy=0;yy<H;yy+=5)g.fillRect(0,yy,W,1);
if(!running||paused){g.fillStyle='#030a1bd2';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe4a4';g.font='900 39px system-ui';g.fillText(paused?'PAUSED':lives<=0?'RUN COMPLETE':'SKYLINE HOP',W/2,215);g.fillStyle='#8bffe4';g.font='700 16px system-ui';g.fillText(paused?'PRESS P OR RESUME':'TAP TO JUMP · DOUBLE-JUMP TO SAVE YOURSELF',W/2,251)}}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
$('jump').onclick=jump;c.addEventListener('pointerdown',jump);
$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'KEEP HOPPING')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if((k===' '||k==='arrowup'||k==='w')&&!e.repeat){e.preventDefault();if(running)jump();else start()}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();