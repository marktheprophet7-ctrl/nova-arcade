(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450;
let playing=false,paused=false,score=0,best=0,hull=3,storm=1,shield=false,dodged=0,elapsed=0,spawn=.75,invuln=0,shake=0,ship={x:280,y:345},touch=null,keys={up:false,down:false,left:false,right:false},meteors=[],pickups=[],particles=[],last=0,raf=0,sound=false,ac=null;
try{best=Math.max(Number(localStorage.getItem('nova-meteor-dodge-best')||0),Number(localStorage.getItem('nova-best-8')||0))||0}catch{}$('best').textContent=best;
function tone(h=520,d=.09){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=h;v.gain.setValueAtTime(.022,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(700)};
function hud(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('hull').textContent='♥ '.repeat(hull).trim()||'OFFLINE';$('storm').textContent=String(storm).padStart(2,'0');$('shield').textContent=shield?'READY':'OFF';$('dodged').textContent=dodged}
function gain(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem('nova-meteor-dodge-best',String(best));localStorage.setItem('nova-best-8',String(best))}catch{}}hud()}
function say(s){$('message').textContent=s}
function spark(x,y,col,count=20){for(let i=0;i<count;i++){const a=Math.random()*6.283,v=35+Math.random()*165;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.65,col})}if(particles.length>185)particles.splice(0,particles.length-185)}
function finish(){playing=false;paused=false;cancelAnimationFrame(raf);keys.up=keys.down=keys.left=keys.right=false;$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('SHIP LOST · '+Math.floor(score)+' POINTS · '+dodged+' METEORS DODGED');tone(170,.3)}
function start(){cancelAnimationFrame(raf);playing=true;paused=false;score=0;hull=3;storm=1;shield=false;dodged=0;elapsed=0;spawn=.9;invuln=1;shake=0;ship={x:280,y:345};touch=null;keys.up=keys.down=keys.left=keys.right=false;meteors=[];pickups=[];particles=[];$('start').hidden=true;$('pause').textContent='PAUSE';hud();say('STORM 01 · STEER AWAY FROM FALLING METEORS');last=performance.now();raf=requestAnimationFrame(loop);tone(840)}
function spawnMeteor(){const r=12+Math.random()*19,x=20+r+Math.random()*(W-40-r*2),speed=135+storm*24+Math.random()*90,drift=(Math.random()-.5)*78;meteors.push({x,y:-r-8,r,vx:drift,vy:speed,angle:Math.random()*6.283,spin:(Math.random()-.5)*3,seed:Math.random()*8})}
function spawnShield(){pickups.push({x:28+Math.random()*(W-56),y:-24,r:14,vy:142})}
function damage(){if(invuln>0)return;if(shield){shield=false;invuln=.75;spark(ship.x,ship.y,'#83fff0',18);say('SHIELD ABSORBED IMPACT');tone(910);hud();return}hull--;invuln=1.35;shake=8;spark(ship.x,ship.y,'#ff7da5',24);tone(140,.21);hud();if(hull<=0){finish()}else say('HULL DAMAGED · '+hull+' REMAINING')}
function update(dt){if(!playing||paused)return;elapsed+=dt;storm=1+Math.floor(elapsed/21);invuln=Math.max(0,invuln-dt);shake=Math.max(0,shake-dt*21);
 let dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0),len=Math.hypot(dx,dy)||1;ship.x=Math.max(20,Math.min(W-20,ship.x+dx/len*275*dt));ship.y=Math.max(65,Math.min(H-27,ship.y+dy/len*275*dt));
 if(touch){let a=Math.min(1,dt*18);ship.x+=(touch.x-ship.x)*a;ship.y+=(touch.y-ship.y)*a;ship.x=Math.max(20,Math.min(W-20,ship.x));ship.y=Math.max(65,Math.min(H-27,ship.y))}
 spawn-=dt;if(spawn<=0){spawnMeteor();spawn=Math.max(.24,.84-elapsed*.007)+Math.random()*.24;if(Math.random()<.06)spawnShield()}
 for(let i=meteors.length-1;i>=0;i--){let m=meteors[i];m.x+=m.vx*dt;m.y+=m.vy*dt;m.angle+=m.spin*dt;if(m.x<m.r||m.x>W-m.r)m.vx*=-1;
 if(Math.hypot(ship.x-m.x,ship.y-m.y)<m.r+12){meteors.splice(i,1);damage();if(!playing)return;continue}if(m.y>H+m.r){meteors.splice(i,1);dodged++;gain(20+Math.min(40,storm*4))}}
 for(let i=pickups.length-1;i>=0;i--){let p=pickups[i];p.y+=p.vy*dt;if(Math.hypot(ship.x-p.x,ship.y-p.y)<p.r+14){shield=true;spark(p.x,p.y,'#7bfff2');gain(100);tone(990);say('EMERGENCY SHIELD CHARGED');pickups.splice(i,1);continue}if(p.y>H+25)pickups.splice(i,1)}
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
 gain(dt*(5+storm*2))
}
function draw(now=0){let grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#160d2e');grad.addColorStop(1,'#07182a');g.fillStyle=grad;g.fillRect(0,0,W,H);g.save();g.translate(Math.sin(now/32)*shake,0);
 for(let i=0;i<60;i++){const x=(i*97.3)%W,y=(i*73.2+elapsed*(15+i%5*10))%H;g.fillStyle=i%4?'#adceef66':'#ffe1aa82';g.fillRect(x,y,i%8?2:3,2)}
 for(let m of meteors){g.save();g.translate(m.x,m.y);g.rotate(m.angle);g.shadowColor='#ff947c';g.shadowBlur=14;g.fillStyle='#b86582';g.strokeStyle='#ffd4a1';g.lineWidth=2;g.beginPath();for(let j=0;j<9;j++){let a=j*Math.PI*2/9,r=m.r*(.8+.15*Math.sin(j*2+m.seed));if(j===0)g.moveTo(Math.cos(a)*r,Math.sin(a)*r);else g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.shadowBlur=0;g.fillStyle='#613f5a';g.beginPath();g.arc(-m.r*.2,-m.r*.17,m.r*.23,0,7);g.fill();g.restore()}
 for(let p of pickups){g.shadowColor='#7affef';g.shadowBlur=19;g.fillStyle='#83fff2';g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#0b3b49';g.fillRect(p.x-8,p.y-3,16,6)}
 if(shield){g.shadowColor='#83fff3';g.shadowBlur=18;g.strokeStyle='#80ffe9';g.lineWidth=3;g.beginPath();g.arc(ship.x,ship.y,31,0,7);g.stroke();g.shadowBlur=0}
 g.save();if(invuln>0&&Math.floor(now/100)%2===0)g.globalAlpha=.5;g.shadowColor='#88ffe7';g.shadowBlur=25;g.fillStyle='#f1fff8';g.beginPath();g.moveTo(ship.x,ship.y-26);g.lineTo(ship.x+19,ship.y+20);g.lineTo(ship.x,ship.y+8);g.lineTo(ship.x-19,ship.y+20);g.closePath();g.fill();g.fillStyle='#8bffeb';g.fillRect(ship.x-5,ship.y+15,10,11);g.restore();
 for(let p of particles){g.globalAlpha=Math.max(0,p.life/.65);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;g.restore();
 g.fillStyle='#ffe4a4';g.font='900 13px system-ui';g.textAlign='left';g.fillText('METEOR DODGE / STORM '+storm,20,24);g.textAlign='right';g.fillText('SURVIVAL '+Math.floor(elapsed)+'s',W-20,24);g.fillStyle='#00000023';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!playing||paused){g.fillStyle='#03091dd4';g.fillRect(0,0,W,H);g.fillStyle='#ffe5a2';g.textAlign='center';g.font='900 38px system-ui';g.fillText(paused?'PAUSED':hull<=0?'SHIP LOST':'METEOR DODGE',W/2,213);g.fillStyle='#8bffea';g.font='700 16px system-ui';g.fillText(paused?'PRESS P TO RESUME':'DODGE THE STORM · SURVIVE',W/2,249)}
}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(playing)raf=requestAnimationFrame(loop)}
for(let b of document.querySelectorAll('[data-dir]')){const dir=b.dataset.dir;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[dir]=true});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>keys[dir]=false)}
function point(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
c.addEventListener('pointerdown',e=>{if(!playing||paused)return;touch=point(e);if(c.setPointerCapture)c.setPointerCapture(e.pointerId)});c.addEventListener('pointermove',e=>{if(touch)touch=point(e)});for(const ev of ['pointerup','pointercancel','pointerleave'])c.addEventListener(ev,()=>touch=null);
$('pause').onclick=()=>{if(!playing)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';keys.up=keys.down=keys.left=keys.right=false;touch=null;last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'AVOID THE METEOR STORM')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;const d={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[e.key.toLowerCase()];if(d){e.preventDefault();keys[d]=true}if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(e.key.toLowerCase()==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{const d={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[e.key.toLowerCase()];if(d)keys[d]=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();