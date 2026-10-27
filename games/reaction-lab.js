(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,TOTAL=10;
let playing=false,paused=false,phase='menu',round=0,score=0,best=0,fastest=Infinity,faults=0,streak=0,clock=0,wait=0,response=0,feedback=0,last=0,raf=0,particles=[],sound=false,ac=null,shownMs=0;
try{best=Math.max(Number(localStorage.getItem('nova-reaction-lab-best')||0),Number(localStorage.getItem('nova-best-7')||0))||0}catch{}$('best').textContent=best;
function tone(h=650,d=.1){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),v=ac.createGain();o.type='sine';o.frequency.setValueAtTime(h,ac.currentTime);v.gain.setValueAtTime(.027,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(710)};
function hud(){$('score').textContent=score;$('best').textContent=best;$('round').textContent=String(round).padStart(2,'0')+' / '+TOTAL;$('fastest').textContent=Number.isFinite(fastest)?fastest+' ms':'—';$('faults').textContent=faults+' / 3'}
function say(s){$('message').textContent=s}
function award(n){score+=n;if(score>best){best=score;try{localStorage.setItem('nova-reaction-lab-best',String(best));localStorage.setItem('nova-best-7',String(best))}catch{}}hud()}
function burst(col){for(let i=0;i<24;i++){const a=i*Math.PI*2/24+Math.random()*.3,v=90+Math.random()*180;particles.push({x:W/2,y:205,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.8,col})}}
function finish(){playing=false;paused=false;phase='over';cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';$('react').textContent='ROUND COMPLETE';say('TEST COMPLETE · '+score+' POINTS · FASTEST '+(Number.isFinite(fastest)?fastest+' MS':'—'));tone(430,.25)}
function arm(){if(round>=TOTAL){finish();return}round++;phase='waiting';wait=1.1+Math.random()*2.6;clock=0;response=0;shownMs=0;feedback=0;$('react').textContent='WAIT FOR GREEN…';say('SIGNAL '+round+' / '+TOTAL+' · HOLD YOUR NERVE');hud()}
function start(){cancelAnimationFrame(raf);playing=true;paused=false;round=0;score=0;faults=0;streak=0;fastest=Infinity;particles=[];phase='menu';$('start').hidden=true;$('pause').textContent='PAUSE';arm();last=performance.now();raf=requestAnimationFrame(loop);tone(720)}
function hit(){
 if(!playing||paused)return false;
 if(phase==='waiting'){faults++;streak=0;phase='feedback';feedback=.85;shownMs=0;$('react').textContent='TOO EARLY!';say('FALSE START · '+faults+' / 3 · WAIT FOR GREEN');hud();tone(170,.16);if(faults>=3){finish()}return false}
 if(phase==='green'){let ms=Math.max(1,Math.round(response*1000)),pts=Math.max(10,500-Math.floor(ms*.76))+Math.min(150,streak*24);streak++;fastest=Math.min(fastest,ms);shownMs=ms;phase='feedback';feedback=1.05;$('react').textContent=ms+' MS · EXCELLENT!';say((ms<220?'LIGHTNING REFLEXES':ms<350?'QUICK RESPONSE':'SIGNAL CAPTURED')+' · +'+pts+' POINTS');award(pts);burst('#79ffe0');tone(820,.12);return true}
 return false;
}
function update(dt){
 if(!playing||paused)return;
 if(phase==='waiting'){wait-=dt;if(wait<=0){phase='green';response=0;$('react').textContent='HIT SIGNAL NOW!';say('GREEN! · REACT IMMEDIATELY');tone(1040,.1)}}
 else if(phase==='green'){response+=dt;if(response>=2){streak=0;phase='feedback';feedback=.78;$('react').textContent='MISSED SIGNAL';say('TIMEOUT · SIGNAL MISSED');tone(210,.2)}}
 else if(phase==='feedback'){feedback-=dt;if(feedback<=0)arm()}
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0)
}
function draw(now=0){
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1d1538');bg.addColorStop(1,'#07172b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let x=15;x<W;x+=26){g.strokeStyle='#7dfaff12';g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}
 const color=phase==='green'?'#7dffbf':phase==='waiting'?'#ff7b9d':phase==='feedback'?(shownMs?'#7dffbf':'#ffd78a'):'#9b8bff';
 g.shadowColor=color;g.shadowBlur=32;g.fillStyle='#120e2a';g.beginPath();g.arc(280,206,135,0,Math.PI*2);g.fill();g.strokeStyle=color;g.lineWidth=12;g.stroke();
 g.shadowBlur=0;g.fillStyle=color;g.textAlign='center';g.font='900 43px system-ui';g.fillText(phase==='waiting'?'WAIT':phase==='green'?'GO!':phase==='feedback'?(shownMs?shownMs+'ms':'EARLY'):'REACTION',280,201);g.fillStyle='#e8f8ff';g.font='800 16px system-ui';g.fillText(phase==='waiting'?'DO NOT TAP':phase==='green'?'TAP OR SPACE':phase==='feedback'?(shownMs?'SIGNAL REGISTERED':'WATCH FOR GREEN'):'REFLEX TEST',280,237);
 if(phase==='green'){g.fillStyle='#7dffbf';g.fillRect(75,391,410*Math.max(0,1-response/2),7)}
 for(const p of particles){g.globalAlpha=Math.max(0,p.life/.8);g.fillStyle=p.col;g.fillRect(p.x,p.y,5,5)}g.globalAlpha=1;g.fillStyle='#ffe6ac';g.font='900 13px system-ui';g.textAlign='left';g.fillText('REACTION LAB / SIGNAL '+round,22,25);
 if(!playing||paused){g.fillStyle='#04091bcc';g.fillRect(0,0,W,H);g.fillStyle='#ffe3a0';g.font='900 38px system-ui';g.textAlign='center';g.fillText(paused?'PAUSED':phase==='over'?'RUN COMPLETE':'REACTION LAB',W/2,219);g.fillStyle='#8effd9';g.font='700 15px system-ui';g.fillText(paused?'PRESS P TO RESUME':'WAIT FOR GREEN, THEN REACT',W/2,253)}
}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(playing)raf=requestAnimationFrame(loop)}
$('react').onclick=hit;c.addEventListener('pointerdown',hit);
$('pause').onclick=()=>{if(!playing)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'SIGNAL TEST RESUMED')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(k===' '&&!e.repeat){e.preventDefault();if(playing)hit();else start()}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();