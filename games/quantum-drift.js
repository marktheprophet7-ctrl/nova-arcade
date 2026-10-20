(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,PY=366;
let playing=false,paused=false,score=0,best=0,armour=3,sector=1,flux=0,elapsed=0,raf=0,last=0,ship=280,target=280,held={left:false,right:false},dragging=false,anomalies=[],particles=[],spawn=.8,invuln=0,shake=0,sound=false,ac=null;
try{best=Math.max(Number(localStorage.getItem('nova-quantum-drift-best')||0),Number(localStorage.getItem('nova-arcade-machine-quantum-drift')||0))||0}catch(e){}$('best').textContent=best;
function tone(freq=540,d=.08){if(!sound)return;try{let Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ac=ac||new Audio();let o=ac.createOscillator(),v=ac.createGain();o.type='sine';o.frequency.value=freq;v.gain.setValueAtTime(.023,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));tone(720)};
function centerAt(y,t){let lead=(PY-y)*.007;return 280+Math.sin(t*.59+lead)*101+Math.sin(t*.24+lead*1.55)*34}
function corridorWidth(){return Math.max(160,245-elapsed*.63)}
function hud(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('armour').textContent='♥ '.repeat(armour).trim()||'OFFLINE';$('sector').textContent=String(sector).padStart(2,'0');$('flux').textContent=flux}
function gain(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem('nova-quantum-drift-best',String(best))}catch(e){}}hud()}
function say(s){$('message').textContent=s}
function sparkle(x,y,color,n=14){for(let i=0;i<n;i++){let a=Math.random()*6.283,s=35+Math.random()*110;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.55,color})}if(particles.length>150)particles.splice(0,particles.length-150)}
function finish(){playing=false;paused=false;cancelAnimationFrame(raf);held.left=held.right=false;$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('QUANTUM COLLAPSE · SCORE '+Math.floor(score)+' · '+flux+' FLUX COLLECTED');tone(170,.24)}
function start(){cancelAnimationFrame(raf);playing=true;paused=false;score=0;armour=3;sector=1;flux=0;elapsed=0;anomalies=[];particles=[];spawn=.85;invuln=1;shake=0;held.left=held.right=false;dragging=false;ship=centerAt(PY,0);target=ship;hud();$('start').hidden=true;pauseBtn.textContent='PAUSE';say('NAVIGATE THE TUNNEL · AVOID ITS EDGES');last=performance.now();raf=requestAnimationFrame(loop);tone(760)}
function hurt(reason){
 if(invuln>0)return;armour--;invuln=1.3;shake=5;sparkle(ship,PY,'#ff6496',22);tone(160,.17);hud();
 if(armour<=0){finish();return}
 say(reason+' · '+armour+' ARMOUR LEFT')
}
function spawnItem(){let isFlux=Math.random()<.48,center=centerAt(-25,elapsed),width=corridorWidth(),offset=(Math.random()*1.35-.675)*(width/2-24);
 anomalies.push({x:center+offset,y:-25,offset,kind:isFlux?'flux':'hazard',r:isFlux?12:17,hit:false});}
function update(dt){
 if(!playing||paused)return;
 elapsed+=dt;sector=1+Math.floor(elapsed/24);invuln=Math.max(0,invuln-dt);shake=Math.max(0,shake-dt*17);
 let steer=(held.right?1:0)-(held.left?1:0);
 if(steer)target+=steer*(290+Math.min(120,elapsed))*dt;
 target=Math.max(15,Math.min(W-15,target));ship+=(target-ship)*Math.min(1,dt*19);
 const cx=centerAt(PY,elapsed),half=corridorWidth()/2-17;
 if(ship<cx-half||ship>cx+half){hurt('TUNNEL WALL HIT');ship=Math.max(cx-half,Math.min(cx+half,ship));target=ship;if(!playing)return}
 spawn-=dt;if(spawn<=0){spawnItem();spawn=Math.max(.73,1.7-elapsed*.006)+Math.random()*.4}
 for(let i=anomalies.length-1;i>=0;i--){const o=anomalies[i];o.y+=(180+Math.min(180,elapsed*2.7))*dt;o.x+=(centerAt(o.y,elapsed)-o.x)*Math.min(1,dt*.35);
 if(Math.abs(o.y-PY)<o.r+16&&Math.abs(o.x-ship)<o.r+16){
 if(o.kind==='flux'){flux++;gain(50+Math.min(100,flux*6));sparkle(o.x,o.y,'#ffe69a');tone(970,.08)}
 else{hurt('QUANTUM ANOMALY');if(!playing)return}
 anomalies.splice(i,1);continue}
 if(o.y>490)anomalies.splice(i,1)
 }
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
 gain(dt*(6+sector*1.7))
}
function draw(now=0){
 let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1a102b');bg.addColorStop(1,'#061326');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.save();g.translate(Math.sin(now/36)*shake,0);
 let width=corridorWidth(),t=elapsed;
 g.beginPath();g.moveTo(0,0);for(let y=0;y<=H;y+=9)g.lineTo(centerAt(y,t)-width/2,y);g.lineTo(0,H);g.closePath();g.fillStyle='#ea55904c';g.fill();
 g.beginPath();g.moveTo(W,0);for(let y=0;y<=H;y+=9)g.lineTo(centerAt(y,t)+width/2,y);g.lineTo(W,H);g.closePath();g.fillStyle='#60dfff45';g.fill();
 for(let side of [-1,1]){g.beginPath();for(let y=0;y<=H;y+=5){let x=centerAt(y,t)+side*width/2;if(y===0)g.moveTo(x,y);else g.lineTo(x,y)}g.strokeStyle=side<0?'#ff7cbb':'#6af9ff';g.lineWidth=5;g.shadowColor=side<0?'#ff7cbb':'#6af9ff';g.shadowBlur=21;g.stroke();g.shadowBlur=0}
 for(let y=-80;y<H+90;y+=60){let py=y+(t*135)%60,cx=centerAt(py,t);g.strokeStyle='#eeecff19';g.beginPath();g.moveTo(cx-width/2,py);g.lineTo(cx+width/2,py);g.stroke()}
 for(const o of anomalies){g.save();g.shadowBlur=25;g.shadowColor=o.kind==='flux'?'#ffe299':'#ff668e';g.fillStyle=o.kind==='flux'?'#ffe19e':'#ff668e';if(o.kind==='flux'){g.beginPath();g.arc(o.x,o.y,12,0,7);g.fill();g.strokeStyle='#fff1a9';g.lineWidth=2;g.beginPath();g.arc(o.x,o.y,20,0,7);g.stroke()}else{g.beginPath();for(let i=0;i<10;i++){let a=i*Math.PI/5+now/800,r=i%2?10:19;if(i===0)g.moveTo(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r);else g.lineTo(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r)}g.closePath();g.fill()}g.restore()}
 for(const p of particles){g.globalAlpha=Math.max(0,p.life/.55);g.fillStyle=p.color;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
 g.save();if(invuln>0&&Math.floor(now/110)%2===0)g.globalAlpha=.5;g.shadowColor='#89ffeb';g.shadowBlur=27;g.fillStyle='#f0ffff';g.beginPath();g.moveTo(ship,PY-30);g.lineTo(ship+20,PY+20);g.lineTo(ship,PY+11);g.lineTo(ship-20,PY+20);g.closePath();g.fill();g.fillStyle='#7fffea';g.fillRect(ship-5,PY+15,10,15);g.restore();
 g.restore();g.textAlign='left';g.fillStyle='#ffe3a1';g.font='900 13px system-ui';g.fillText('QUANTUM DRIFT / SECTOR '+sector,20,24);g.textAlign='right';g.fillText('TUNNEL '+Math.floor(width)+'PX',W-20,24);
 g.fillStyle='#00000023';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!playing||paused){g.fillStyle='#03091dce';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe0a1';g.font='900 37px system-ui';g.fillText(paused?'PAUSED':armour<=0?'QUANTUM COLLAPSE':'QUANTUM DRIFT',W/2,212);g.fillStyle='#97ffe9';g.font='700 16px system-ui';g.fillText(paused?'PRESS RESUME OR P':'STEER BETWEEN THE ENERGY WALLS',W/2,248)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(playing)raf=requestAnimationFrame(loop)}
for(const side of ['left','right']){const b=$(side);b.addEventListener('pointerdown',e=>{e.preventDefault();held[side]=true});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>held[side]=false);b.onclick=e=>{if(e.detail===0&&playing&&!paused)target+=side==='left'?-52:52}}
const pointerMove=e=>{if(!dragging||!playing||paused)return;let r=c.getBoundingClientRect();target=(e.clientX-r.left)*W/r.width};c.addEventListener('pointerdown',e=>{if(!playing||paused)return;dragging=true;if(c.setPointerCapture)c.setPointerCapture(e.pointerId);pointerMove(e)});c.addEventListener('pointermove',pointerMove);for(const ev of ['pointerup','pointercancel','pointerleave'])c.addEventListener(ev,()=>dragging=false);
const pauseBtn=document.createElement('button');pauseBtn.type='button';pauseBtn.textContent='PAUSE';pauseBtn.onclick=()=>{if(!playing)return;paused=!paused;pauseBtn.textContent=paused?'RESUME':'PAUSE';held.left=held.right=false;last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'RETURN TO THE QUANTUM CORRIDOR')};$('controls').insertAdjacentElement('afterend',pauseBtn);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a'){e.preventDefault();held.left=true}if(k==='arrowright'||k==='d'){e.preventDefault();held.right=true}if(k==='p'&&!e.repeat){e.preventDefault();pauseBtn.click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')held.left=false;if(k==='arrowright'||k==='d')held.right=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)pauseBtn.click()});
$('start').onclick=start;draw();
})();