(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,PY=61,PADDLE_H=92,BALL_R=9,GOAL=7;
let playing=false,paused=false,finished=false,score=0,best=0,playerScore=0,aiScore=0,level=1,rally=0,playerY=H/2,playerTarget=H/2,aiY=H/2,ball={x:W/2,y:H/2,vx:0,vy:0},serveTime=1.1,serveDir=-1,hold={up:false,down:false},dragging=false,raf=0,last=0,sound=false,ac=null,particles=[],flash=0,gameTime=0;
try{best=Math.max(Number(localStorage.getItem('nova-neon-rally-best')||0),Number(localStorage.getItem('nova-best-10')||0))||0}catch{}$('best').textContent=best;
function tone(h=470,d=.08){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=h;v.gain.setValueAtTime(.022,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(650)};
function hud(){$('score').textContent=score;$('best').textContent=best;$('playerScore').textContent=playerScore;$('aiScore').textContent=aiScore;$('rally').textContent=rally;$('level').textContent=String(level).padStart(2,'0')}
function award(n){score+=n;if(score>best){best=score;try{localStorage.setItem('nova-neon-rally-best',String(best));localStorage.setItem('nova-best-10',String(best))}catch{}}hud()}
function say(s){$('message').textContent=s}
function burst(x,y,col,n=14){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=30+Math.random()*135;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.65,col})}if(particles.length>160)particles.splice(0,particles.length-160)}
function ready(dir){serveDir=dir;serveTime=1.1;ball.x=W/2;ball.y=H/2;ball.vx=0;ball.vy=0;rally=0;hud()}
function end(){playing=false;finished=true;paused=false;hold.up=hold.down=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say(playerScore>=GOAL?'YOU WIN · '+playerScore+'–'+aiScore+' · SCORE '+score:'AI WINS · '+playerScore+'–'+aiScore+' · TRY AGAIN');tone(playerScore>=GOAL?880:180,.28)}
function point(playerWon){if(playerWon){playerScore++;award(200+rally*20);say('POINT TO YOU · '+playerScore+'–'+aiScore);burst(W-24,ball.y,'#8bffe9',23);tone(800,.18)}else{aiScore++;say('AI SCORES · '+playerScore+'–'+aiScore);burst(24,ball.y,'#ff81b5',23);tone(180,.18)}flash=.75;hud();if(playerScore>=GOAL||aiScore>=GOAL){end();return}ready(playerWon?-1:1)}
function start(){cancelAnimationFrame(raf);playing=true;finished=false;paused=false;score=0;playerScore=0;aiScore=0;level=1;rally=0;gameTime=0;playerY=playerTarget=aiY=H/2;particles=[];flash=0;hold.up=hold.down=false;dragging=false;ready(Math.random()<.5?-1:1);$('start').hidden=true;$('pause').textContent='PAUSE';say('FIRST TO SEVEN · AIM YOUR PADDLE FOR SPIN');last=performance.now();raf=requestAnimationFrame(loop);tone(760)}
function hit(player){const paddleY=player?playerY:aiY,relative=Math.max(-1,Math.min(1,(ball.y-paddleY)/(PADDLE_H/2))),speed=Math.min(620,Math.max(275,Math.hypot(ball.vx,ball.vy)+18));const angle=relative*.85+(Math.random()-.5)*(!player?.04:.13);ball.vx=(player?1:-1)*Math.max(175,Math.cos(angle)*speed);ball.vy=Math.sin(angle)*speed;ball.x=player?PY+13+BALL_R:W-PY-13-BALL_R;rally++;if(player){award(12+Math.min(100,rally*4));burst(ball.x,ball.y,'#87ffee',6);tone(510+rally*25)}else{burst(ball.x,ball.y,'#ff89be',6);tone(370+rally*10)}hud()}
function update(dt){if(!playing||paused)return;gameTime+=dt;level=1+Math.floor((playerScore+aiScore)/4);flash=Math.max(0,flash-dt);const axis=(hold.down?1:0)-(hold.up?1:0);if(axis)playerTarget+=axis*400*dt;playerTarget=Math.max(PADDLE_H/2+13,Math.min(H-PADDLE_H/2-13,playerTarget));playerY+=(playerTarget-playerY)*Math.min(1,dt*18);
let desired=ball.vx>0&&serveTime<=0?ball.y+Math.sin(gameTime*.8+level)*Math.max(5,20-level*2):H/2,aiSpeed=Math.min(315,205+level*22);
aiY+=Math.max(-aiSpeed*dt,Math.min(aiSpeed*dt,desired-aiY));aiY=Math.max(PADDLE_H/2+13,Math.min(H-PADDLE_H/2-13,aiY));
if(serveTime>0){serveTime-=dt;if(serveTime<=0){let a=(Math.random()-.5)*.75;ball.vx=serveDir*300*Math.cos(a);ball.vy=300*Math.sin(a)}return}
let slices=Math.max(1,Math.ceil(Math.hypot(ball.vx,ball.vy)*dt/7)),step=dt/slices;
for(let k=0;k<slices&&playing;k++){let oldX=ball.x;ball.x+=ball.vx*step;ball.y+=ball.vy*step;
if(ball.y<BALL_R+9){ball.y=BALL_R+9;ball.vy=Math.abs(ball.vy);tone(340,.04)}
if(ball.y>H-BALL_R-9){ball.y=H-BALL_R-9;ball.vy=-Math.abs(ball.vy);tone(340,.04)}
if(ball.vx<0&&oldX>=PY+13+BALL_R&&ball.x<=PY+13+BALL_R&&Math.abs(ball.y-playerY)<PADDLE_H/2+BALL_R)hit(true);
if(ball.vx>0&&oldX<=W-PY-13-BALL_R&&ball.x>=W-PY-13-BALL_R&&Math.abs(ball.y-aiY)<PADDLE_H/2+BALL_R)hit(false);
if(ball.x<-BALL_R){point(false);break}if(ball.x>W+BALL_R){point(true);break}
}
for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)}
function draw(now=0){let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#150e37');bg.addColorStop(1,'#07172d');g.fillStyle=bg;g.fillRect(0,0,W,H);
g.strokeStyle='#90f9ff44';g.lineWidth=3;g.strokeRect(7,8,W-14,H-16);for(let i=0;i<12;i++){g.fillStyle=i%2?'#ffe6ad33':'#72ffe833';g.fillRect(W/2-2,15+i*36,4,21)}
g.shadowColor='#7dffe5';g.shadowBlur=23;g.fillStyle='#79f9e8';g.beginPath();g.roundRect(PY-7,playerY-PADDLE_H/2,14,PADDLE_H,7);g.fill();g.shadowColor='#ff81be';g.fillStyle='#ff81be';g.beginPath();g.roundRect(W-PY-7,aiY-PADDLE_H/2,14,PADDLE_H,7);g.fill();g.shadowBlur=0;
g.shadowColor='#ffe5ab';g.shadowBlur=22;g.fillStyle='#fff8de';g.beginPath();g.arc(ball.x,ball.y,BALL_R,0,Math.PI*2);g.fill();g.shadowBlur=0;
for(const p of particles){g.globalAlpha=Math.max(0,p.life/.65);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
g.font='900 35px system-ui';g.textAlign='center';g.fillStyle='#83ffe2';g.fillText(playerScore,W/2-55,52);g.fillStyle='#ff89c5';g.fillText(aiScore,W/2+55,52);
g.textAlign='left';g.font='900 12px system-ui';g.fillStyle='#ffe4a0';g.fillText('YOU / CYAN',19,27);g.textAlign='right';g.fillText('AI / PINK',W-19,27);
if(serveTime>0&&playing&&!paused){g.font='900 20px system-ui';g.textAlign='center';g.fillStyle='#ffe7af';g.fillText('SERVE IN '+Math.ceil(Math.max(0,serveTime)),W/2,230)}
if(flash>0){g.fillStyle='rgba(255,232,156,'+(flash*.14)+')';g.fillRect(0,0,W,H)}
g.fillStyle='#00000020';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
if(!playing||paused){g.fillStyle='#05091ac9';g.fillRect(0,0,W,H);g.fillStyle='#ffe4a0';g.textAlign='center';g.font='900 37px system-ui';g.fillText(paused?'PAUSED':finished?(playerScore>=GOAL?'YOU WIN!':'AI WINS'):'NEON RALLY',W/2,212);g.fillStyle='#89ffe3';g.font='700 15px system-ui';g.fillText(paused?'PRESS P OR RESUME':'FIRST TO SEVEN WINS',W/2,250)}}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(playing)raf=requestAnimationFrame(loop)}
for(const side of ['up','down']){const b=$(side);b.addEventListener('pointerdown',e=>{e.preventDefault();hold[side]=true});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>hold[side]=false)}
function aim(e){if(!playing||paused)return;const rect=c.getBoundingClientRect();playerTarget=(e.clientY-rect.top)*H/rect.height}
c.addEventListener('pointerdown',e=>{dragging=true;if(c.setPointerCapture)c.setPointerCapture(e.pointerId);aim(e)});c.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||dragging)aim(e)});for(const ev of ['pointerup','pointercancel','pointerleave'])c.addEventListener(ev,()=>dragging=false);
$('pause').onclick=()=>{if(!playing)return;paused=!paused;hold.up=hold.down=false;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'RALLY RESUMED')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(k==='arrowup'||k==='w'){e.preventDefault();hold.up=true}if(k==='arrowdown'||k==='s'){e.preventDefault();hold.down=true}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(k==='arrowup'||k==='w')hold.up=false;if(k==='arrowdown'||k==='s')hold.down=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();