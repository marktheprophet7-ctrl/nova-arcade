(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=448,PY=376;
let running=false,paused=false,score=0,best=0,hull=3,sector=1,stars=0,shield=0,invuln=0,elapsed=0,spawn=.5,ship=280,target=280,held={left:false,right:false},dragging=false,items=[],particles=[],raf=0,last=0,sound=false,ac=null,shake=0;
try{best=Math.max(+(localStorage.getItem('nova-void-runner-best')||0),+(localStorage.getItem('nova-best-0')||0))||0}catch(e){}$('best').textContent=best;
function tone(f=550,d=.08){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=f;v.gain.setValueAtTime(.022,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));tone(820)};
function hud(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('hull').textContent='♥ '.repeat(hull).trim()||'OFFLINE';$('sector').textContent=String(sector).padStart(2,'0');$('stars').textContent=stars;$('shield').textContent=shield>0?Math.ceil(shield)+'s':'OFF'}
function add(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem('nova-void-runner-best',String(best));localStorage.setItem('nova-best-0',String(best))}catch(e){}}hud()}
function say(s){$('message').textContent=s}
function spark(x,y,col,n=15){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=35+Math.random()*110;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.55,col})}if(particles.length>160)particles.splice(0,particles.length-160)}
function finish(){running=false;paused=false;cancelAnimationFrame(raf);held.left=held.right=false;$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('VOID COLLAPSE · '+Math.floor(score)+' POINTS · '+stars+' STARS');tone(180,.3)}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;hull=3;sector=1;stars=0;shield=0;invuln=1;elapsed=0;spawn=.65;ship=280;target=280;items=[];particles=[];held.left=held.right=false;dragging=false;shake=0;hud();$('start').hidden=true;$('pause').textContent='PAUSE';say('SECTOR 01 · STAY CLEAR OF THE RED SHARDS');last=performance.now();raf=requestAnimationFrame(loop);tone(800)}
function spawnItem(){let roll=Math.random(),kind=roll<.19?'star':roll<.235?'shield':'shard',r=kind==='shard'?14+Math.random()*12:kind==='shield'?15:11;
 let x=22+r+Math.random()*(W-44-r*2);
 // Keep the immediate player lane fair: no unavoidable walls or instant-hit obstacles.
 items.push({x,y:-35,kind,r,angle:Math.random()*6.283,spin:(Math.random()-.5)*3,speed:165+Math.min(235,elapsed*3)+Math.random()*55})}
function damage(){if(invuln>0)return;if(shield>0){shield=0;invuln=.8;spark(ship,PY,'#79faff',18);tone(940);say('SHIELD ABSORBED THE HIT');hud();return}hull--;invuln=1.35;shake=7;spark(ship,PY,'#ff6e9c',20);tone(170,.2);hud();if(hull<=0){finish();return}say('HULL BREACHED · '+hull+' HEARTS REMAIN')}
function update(dt){if(!running||paused)return;elapsed+=dt;sector=1+Math.floor(elapsed/22);shield=Math.max(0,shield-dt);invuln=Math.max(0,invuln-dt);shake=Math.max(0,shake-dt*25);
 let steer=(held.right?1:0)-(held.left?1:0);if(steer)target+=steer*370*dt;target=Math.max(19,Math.min(W-19,target));ship+=(target-ship)*Math.min(1,dt*23);
 spawn-=dt;if(spawn<=0){spawnItem();spawn=Math.max(.32,.89-elapsed*.005)+Math.random()*.25}
 for(let i=items.length-1;i>=0;i--){let o=items[i];o.y+=o.speed*dt;o.angle+=o.spin*dt;if(Math.abs(o.y-PY)<o.r+16&&Math.abs(o.x-ship)<o.r+15){if(o.kind==='star'){stars++;add(75+Math.min(150,stars*5));spark(o.x,o.y,'#ffe49a',13);tone(1050,.09);say('STAR COLLECTED · '+stars+' TOTAL')}else if(o.kind==='shield'){shield=7;spark(o.x,o.y,'#77faff');tone(880,.12);say('SHIELD ONLINE · 7 SECONDS')}else damage();items.splice(i,1);if(!running)return;continue}if(o.y>H+50)items.splice(i,1)}
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);add(dt*(7+sector*2))}
function draw(now=0){let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#150c2c');bg.addColorStop(1,'#071b2b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.save();g.translate(Math.sin(now/30)*shake,0);
 for(let i=0;i<75;i++){let x=(i*137.73)%W,y=(i*83.31+elapsed*(22+i%6*13))%H;g.fillStyle=i%4?'#b0b2fa7a':'#ffdcaa9a';g.fillRect(x,y,i%9===0?3:2,i%9===0?4:2)}
 for(let y=-100;y<H+120;y+=75){let yy=(y+elapsed*90)%550-65;g.strokeStyle='#a779f023';g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke()}
 for(let o of items){g.save();g.translate(o.x,o.y);g.rotate(o.angle);let col=o.kind==='star'?'#ffe69b':o.kind==='shield'?'#75f7ff':'#ff6a9e';g.shadowColor=col;g.shadowBlur=21;g.fillStyle=col;if(o.kind==='star'){g.beginPath();for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,r=j%2?o.r*.46:o.r;if(j===0)g.moveTo(Math.cos(a)*r,Math.sin(a)*r);else g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill()}else if(o.kind==='shield'){g.beginPath();g.arc(0,0,o.r,0,7);g.fill();g.fillStyle='#102f48';g.fillRect(-3,-9,6,18);g.fillRect(-9,-3,18,6)}else{g.beginPath();for(let j=0;j<7;j++){let a=j*Math.PI*2/7,r=o.r*(.75+(j%3)*.12);if(j===0)g.moveTo(Math.cos(a)*r,Math.sin(a)*r);else g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill()}g.restore()}
 if(shield>0){g.save();g.strokeStyle='#7df9ff';g.lineWidth=3;g.shadowColor='#7df9ff';g.shadowBlur=20;g.beginPath();g.arc(ship,PY,31,0,7);g.stroke();g.restore()}
 g.save();if(invuln>0&&Math.floor(now/100)%2===0)g.globalAlpha=.42;g.shadowColor='#87ffe8';g.shadowBlur=25;g.fillStyle='#efffff';g.beginPath();g.moveTo(ship,PY-29);g.lineTo(ship+20,PY+19);g.lineTo(ship,PY+9);g.lineTo(ship-20,PY+19);g.closePath();g.fill();g.fillStyle='#5ffbdc';g.fillRect(ship-5,PY+15,10,15);g.restore();
 for(let p of particles){g.globalAlpha=Math.max(0,p.life/.55);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;g.restore();
 g.fillStyle='#ffe5a3';g.font='900 13px system-ui';g.textAlign='left';g.fillText('VOID RUNNER / SECTOR '+sector,16,24);g.textAlign='right';g.fillText('SURVIVAL '+Math.floor(elapsed)+'s',W-16,24);
 g.fillStyle='#00000022';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!running||paused){g.fillStyle='#03091dd2';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe5a3';g.font='900 42px system-ui';g.fillText(paused?'PAUSED':hull<=0?'VOID COLLAPSE':'VOID RUNNER',W/2,216);g.fillStyle='#91ffeb';g.font='700 16px system-ui';g.fillText(paused?'PRESS P TO RESUME':'DODGE · COLLECT · SURVIVE',W/2,252)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
for(let side of ['left','right']){let b=$(side);b.addEventListener('pointerdown',e=>{e.preventDefault();held[side]=true});for(let ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>held[side]=false)}
function drag(e){if(!dragging||!running||paused)return;let r=c.getBoundingClientRect();target=(e.clientX-r.left)*W/r.width}
c.addEventListener('pointerdown',e=>{if(!running||paused)return;dragging=true;if(c.setPointerCapture)c.setPointerCapture(e.pointerId);drag(e)});c.addEventListener('pointermove',drag);for(let ev of ['pointerup','pointercancel','pointerleave'])c.addEventListener(ev,()=>dragging=false);
$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';held.left=held.right=false;last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'KEEP MOVING · STAY ALIVE')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a'){held.left=true;e.preventDefault()}if(k==='arrowright'||k==='d'){held.right=true;e.preventDefault()}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')held.left=false;if(k==='arrowright'||k==='d')held.right=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();