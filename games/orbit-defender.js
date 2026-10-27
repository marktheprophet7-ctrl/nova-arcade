(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,CX=W/2,CY=H/2,CORE_R=25;
let running=false,paused=false,score=0,best=0,health=5,wave=1,kills=0,charge=0,elapsed=0,spawn=.65,angle=-Math.PI/2,fireCooldown=0,hold={left:false,right:false,fire:false},rocks=[],shots=[],particles=[],raf=0,last=0,sound=false,ac=null,shockwave=0,flash=0;
try{best=Math.max(Number(localStorage.getItem('nova-orbit-defender-best')||0),Number(localStorage.getItem('nova-best-11')||0))||0}catch{}$('best').textContent=best;
function tone(h=460,d=.09){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),v=ac.createGain();o.type='sawtooth';o.frequency.value=h;v.gain.setValueAtTime(.011,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(710)};
function hud(){$('score').textContent=score;$('best').textContent=best;$('core').textContent='♥ '.repeat(health).trim()||'DESTROYED';$('wave').textContent=String(wave).padStart(2,'0');$('kills').textContent=kills;$('burst').textContent=charge+'%';$('burstButton').disabled=charge<100||!running||paused}
function say(s){$('message').textContent=s}
function add(n){score+=n;if(score>best){best=score;try{localStorage.setItem('nova-orbit-defender-best',String(best));localStorage.setItem('nova-best-11',String(best))}catch{}}hud()}
function sparks(x,y,col,n=13){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=40+Math.random()*125;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.62,col})}if(particles.length>210)particles.splice(0,particles.length-210)}
function end(){running=false;paused=false;hold.left=hold.right=hold.fire=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('CORE LOST · '+score+' POINTS · '+kills+' ASTEROIDS DESTROYED');tone(160,.3);hud()}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;health=5;wave=1;kills=0;charge=0;elapsed=0;spawn=.55;angle=-Math.PI/2;fireCooldown=0;hold.left=hold.right=hold.fire=false;rocks=[];shots=[];particles=[];shockwave=0;flash=0;$('start').hidden=true;$('pause').textContent='PAUSE';hud();say('DEFEND THE CORE · TAP TO AIM AND FIRE');last=performance.now();raf=requestAnimationFrame(loop);tone(790)}
function makeRock(){let side=Math.floor(Math.random()*4),x=side===0?-25:side===1?W+25:Math.random()*W,y=side===2?-25:side===3?H+25:Math.random()*H;let r=12+Math.random()*15,vel=42+Math.min(95,elapsed*1.35)+Math.random()*23;let direction=Math.atan2(CY-y,CX-x);rocks.push({x,y,r,vx:Math.cos(direction)*vel,vy:Math.sin(direction)*vel,hp:r>22?2:1,spin:(Math.random()-.5)*2,rotation:Math.random()*6,seed:Math.random()*10})}
function fire(){if(!running||paused||fireCooldown>0)return false;let dx=Math.cos(angle),dy=Math.sin(angle);shots.push({x:CX+dx*37,y:CY+dy*37,vx:dx*460,vy:dy*460,r:5});fireCooldown=.16;tone(610,.05);return true}
function burst(){if(!running||paused||charge<100)return false;charge=0;shockwave=.8;flash=.8;let removed=rocks.length;for(const rock of rocks){sparks(rock.x,rock.y,'#92ffe6',11)}rocks=[];add(removed*55);kills+=removed;say('NOVA BURST! · '+removed+' THREATS CLEARED');tone(1080,.27);hud();return true}
function destroy(i){let rock=rocks[i];if(!rock)return;rocks.splice(i,1);kills++;charge=Math.min(100,charge+15);add(rock.r>21?95:60);sparks(rock.x,rock.y,'#ffd69a',16);tone(390+Math.random()*200,.08)}
function damage(){health--;flash=.75;sparks(CX,CY,'#ff77a7',24);tone(150,.2);hud();if(health<=0){end();return}say('REACTOR HIT! · '+health+' CORE SEGMENTS LEFT')}
function update(dt){if(!running||paused)return;elapsed+=dt;wave=1+Math.floor(elapsed/25);shockwave=Math.max(0,shockwave-dt);flash=Math.max(0,flash-dt);fireCooldown=Math.max(0,fireCooldown-dt);
 let direction=(hold.right?1:0)-(hold.left?1:0);angle+=direction*2.5*dt;if(hold.fire)fire();
 spawn-=dt;if(spawn<=0){makeRock();spawn=Math.max(.35,1.13-elapsed*.008)+Math.random()*.24}
 // Shot/rock collisions are checked after each shot moves; nearest hits are processed once.
 for(let i=shots.length-1;i>=0;i--){const b=shots[i];b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<-30||b.y<-30||b.x>W+30||b.y>H+30){shots.splice(i,1);continue}let contact=-1;for(let j=rocks.length-1;j>=0;j--){let r=rocks[j],dx=r.x-b.x,dy=r.y-b.y;if(dx*dx+dy*dy<(r.r+b.r)*(r.r+b.r)){contact=j;break}}if(contact>=0){shots.splice(i,1);rocks[contact].hp--;sparks(b.x,b.y,'#fff3cf',5);if(rocks[contact].hp<=0)destroy(contact)}}
 for(let i=rocks.length-1;i>=0;i--){let r=rocks[i];r.x+=r.vx*dt;r.y+=r.vy*dt;r.rotation+=r.spin*dt;if(Math.hypot(r.x-CX,r.y-CY)<r.r+CORE_R){rocks.splice(i,1);damage();if(!running)return}}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);hud()}
function draw(now=0){const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#171133');bg.addColorStop(1,'#081827');g.fillStyle=bg;g.fillRect(0,0,W,H);
for(let i=0;i<70;i++){g.fillStyle=i%4?'#9cd2ff61':'#ffe1b77d';g.fillRect((i*113.77)%W,(i*71.6)%H,2,2)}
g.strokeStyle='#88dfff19';g.lineWidth=1;for(let radius=70;radius<370;radius+=62){g.beginPath();g.arc(CX,CY,radius,0,Math.PI*2);g.stroke()}
for(let r of rocks){g.save();g.translate(r.x,r.y);g.rotate(r.rotation);g.shadowColor='#ff85aa';g.shadowBlur=12;g.fillStyle=r.hp>1?'#ab72ac':'#dc7e90';g.strokeStyle='#ffd8af';g.lineWidth=2;g.beginPath();for(let j=0;j<9;j++){const a=j*6.283/9,rr=r.r*(.83+.12*Math.sin(j*3+r.seed));if(j===0)g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fill();g.stroke();g.restore()}
for(let b of shots){g.shadowColor='#a5ffef';g.shadowBlur=16;g.fillStyle='#faffd1';g.beginPath();g.arc(b.x,b.y,b.r,0,Math.PI*2);g.fill()}g.shadowBlur=0;
g.save();g.translate(CX,CY);g.rotate(angle);g.shadowColor='#80ffe8';g.shadowBlur=20;g.fillStyle='#9bffe6';g.beginPath();g.roundRect(14,-9,41,18,5);g.fill();g.restore();
g.shadowColor='#80ffe7';g.shadowBlur=25;g.fillStyle='#64efdf';g.beginPath();g.arc(CX,CY,CORE_R,0,7);g.fill();g.fillStyle='#15334b';g.beginPath();g.arc(CX,CY,11,0,7);g.fill();g.shadowBlur=0;
if(shockwave>0){g.strokeStyle='#b1fff6';g.lineWidth=6*shockwave;g.shadowColor='#9afff2';g.shadowBlur=20;g.beginPath();g.arc(CX,CY,27+(1-shockwave/.8)*350,0,7);g.stroke();g.shadowBlur=0}
for(let p of particles){g.globalAlpha=Math.max(0,p.life/.62);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
g.fillStyle='#ffe6ac';g.textAlign='left';g.font='900 13px system-ui';g.fillText('ORBIT DEFENDER · WAVE '+wave,15,25);g.textAlign='right';g.fillText('CHARGE '+charge+'%',W-15,25);
if(flash>0){g.fillStyle='rgba(255,105,159,'+(flash*.20)+')';g.fillRect(0,0,W,H)}
g.fillStyle='#00000020';for(let y=0;y<H;y+=6)g.fillRect(0,y,W,1);
if(!running||paused){g.fillStyle='#050a1bce';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe5a7';g.font='900 38px system-ui';g.fillText(paused?'PAUSED':health<=0?'CORE LOST':'ORBIT DEFENDER',W/2,212);g.fillStyle='#93ffe7';g.font='700 16px system-ui';g.fillText(paused?'PRESS P OR RESUME':'AIM · FIRE · PROTECT THE CORE',W/2,252)}}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
function aim(x,y){if(Math.hypot(x-CX,y-CY)<18)return;angle=Math.atan2(y-CY,x-CX)}
c.addEventListener('pointerdown',e=>{if(!running||paused)return;let rect=c.getBoundingClientRect();aim((e.clientX-rect.left)*W/rect.width,(e.clientY-rect.top)*H/rect.height);fire()});
for(const [id,prop] of [['rotateleft','left'],['rotateright','right'],['fire','fire']]){let b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();hold[prop]=true;if(prop==='fire')fire()});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>hold[prop]=false);if(prop==='fire')b.onclick=()=>fire()}
$('burstButton').onclick=burst;
$('pause').onclick=()=>{if(!running)return;paused=!paused;hold.left=hold.right=hold.fire=false;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();hud();say(paused?'PAUSED · PRESS P OR RESUME':'REACTOR DEFENCE RESUMED')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft'){hold.left=true;e.preventDefault()}if(k==='d'||k==='arrowright'){hold.right=true;e.preventDefault()}if(k===' '){e.preventDefault();hold.fire=true;if(!e.repeat)fire()}if(k==='b'&&!e.repeat){e.preventDefault();burst()}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')hold.left=false;if(k==='d'||k==='arrowright')hold.right=false;if(k===' ')hold.fire=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();