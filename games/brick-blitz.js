(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=448,BRICK_W=56,BRICK_H=19,BRICK_GAP=5,COLS=8,PALETTE=['#ff78bc','#ffcf8c','#a789ff','#62f8ff','#83ffc9'];
let running=false,paused=false,score=0,best=0,lives=3,wave=1,combo=1,bricks=[],particles=[],paddle=280,target=280,paddleWidth=99,ball={x:280,y:377,vx:0,vy:0,r:8,stuck:true},keys={left:false,right:false},raf=0,last=0,sound=false,ac=null,flash=0;
try{best=Math.max(+(localStorage.getItem('nova-brick-blitz-best')||0),+(localStorage.getItem('nova-best-2')||0))||0}catch(e){}$('best').textContent=best;
function tone(f=510,d=.07){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=f;v.gain.setValueAtTime(.021,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));tone(780)};
function hud(){$('score').textContent=score;$('best').textContent=best;$('lives').textContent='● '.repeat(lives).trim()||'OUT';$('wave').textContent=String(wave).padStart(2,'0');$('combo').textContent='×'+combo}
function add(n){score+=n;if(score>best){best=score;try{localStorage.setItem('nova-brick-blitz-best',String(best));localStorage.setItem('nova-best-2',String(best))}catch(e){}}hud()}
function say(s){$('message').textContent=s}
function spark(x,y,col,count=8){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=35+Math.random()*90;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.55,col})}if(particles.length>180)particles.splice(0,particles.length-180)}
function resetBall(){ball={x:paddle,y:376,vx:0,vy:0,r:8,stuck:true};$('launch').textContent='LAUNCH BALL'}
function generate(){bricks=[];let rows=Math.min(8,4+Math.floor(wave/2)),off=(W-(COLS*(BRICK_W+BRICK_GAP)-BRICK_GAP))/2;for(let y=0;y<rows;y++)for(let x=0;x<COLS;x++){let hard=wave>=3&&(y+wave)%4===0,empty=wave>2&&(x+y+wave)%11===0;if(empty)continue;bricks.push({x:off+x*(BRICK_W+BRICK_GAP),y:55+y*(BRICK_H+BRICK_GAP),w:BRICK_W,h:BRICK_H,hp:hard?2:1,color:PALETTE[y%PALETTE.length]})}resetBall();say('WAVE '+wave+' · '+bricks.length+' BRICKS · LAUNCH TO START')}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;lives=3;wave=1;combo=1;paddle=280;target=280;particles=[];flash=0;keys.left=keys.right=false;generate();hud();$('start').hidden=true;$('pause').textContent='PAUSE';last=performance.now();raf=requestAnimationFrame(loop);tone(780)}
function launch(){if(!running||paused||!ball.stuck)return false;let speed=Math.min(405,285+wave*15);ball.stuck=false;ball.vx=(Math.random()-.5)*120;ball.vy=-Math.sqrt(speed*speed-ball.vx*ball.vx);$('launch').textContent='BALL IN PLAY';tone(840);return true}
function finish(){running=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('OUT OF BALLS · SCORE '+score+' · WAVE '+wave);tone(155,.22)}
function update(dt){
 if(!running||paused)return;
 let direction=(keys.right?1:0)-(keys.left?1:0);if(direction)target+=direction*430*dt;target=Math.max(paddleWidth/2+8,Math.min(W-paddleWidth/2-8,target));paddle+=(target-paddle)*Math.min(1,dt*22);
 if(ball.stuck){ball.x=paddle;ball.y=376;return}
 let travel=Math.hypot(ball.vx,ball.vy)*dt,steps=Math.max(1,Math.ceil(travel/6)),sub=dt/steps;
 for(let k=0;k<steps&&running;k++){
  let px=ball.x,py=ball.y;ball.x+=ball.vx*sub;ball.y+=ball.vy*sub;
  if(ball.x<ball.r+5){ball.x=ball.r+5;ball.vx=Math.abs(ball.vx);tone(330,.04)}
  if(ball.x>W-ball.r-5){ball.x=W-ball.r-5;ball.vx=-Math.abs(ball.vx);tone(330,.04)}
  if(ball.y<ball.r+6){ball.y=ball.r+6;ball.vy=Math.abs(ball.vy);tone(340,.04)}
  if(ball.vy>0&&py+ball.r<=395&&ball.y+ball.r>=395&&Math.abs(ball.x-paddle)<=paddleWidth/2+ball.r){ball.y=395-ball.r;let hit=(ball.x-paddle)/(paddleWidth/2),speed=Math.min(440,Math.hypot(ball.vx,ball.vy)+5);ball.vx=hit*speed*.84;ball.vy=-Math.sqrt(Math.max(80*80,speed*speed-ball.vx*ball.vx));combo=1;hud();tone(490)}
  if(ball.y>H+ball.r){lives--;combo=1;hud();if(lives<=0){finish();return}resetBall();say('BALL LOST · '+lives+' LEFT · PRESS LAUNCH');tone(200,.2);return}
  for(let i=bricks.length-1;i>=0;i--){let b=bricks[i],nearestX=Math.max(b.x,Math.min(ball.x,b.x+b.w)),nearestY=Math.max(b.y,Math.min(ball.y,b.y+b.h)),dx=ball.x-nearestX,dy=ball.y-nearestY;if(dx*dx+dy*dy>ball.r*ball.r)continue;
    b.hp--;if(b.hp<=0){bricks.splice(i,1);combo=Math.min(12,combo+1);add(10*combo);spark(ball.x,ball.y,b.color,11)}else{add(5);spark(ball.x,ball.y,b.color,5)}
    let fromSide=px+ball.r<=b.x||px-ball.r>=b.x+b.w;if(fromSide)ball.vx=-ball.vx;else ball.vy=-ball.vy;tone(520+Math.min(600,combo*35));break}
  if(!bricks.length){wave++;combo=1;flash=.7;generate();add(200+wave*40);tone(1060,.22);return}
 }
 flash=Math.max(0,flash-dt);for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)
}
function draw(now=0){
 let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#191037');bg.addColorStop(1,'#07182b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let x=12;x<W;x+=28){g.strokeStyle='#80fff112';g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=12;y<H;y+=28){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
 for(let b of bricks){g.save();g.shadowColor=b.color;g.shadowBlur=13;g.fillStyle=b.hp===2?'#695b97':b.color;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,4);g.fill();g.shadowBlur=0;g.fillStyle='#ffffff76';g.fillRect(b.x+4,b.y+3,b.w-8,3);if(b.hp>1){g.fillStyle='#fff4b4';g.font='900 11px system-ui';g.textAlign='center';g.fillText('Ⅱ',b.x+b.w/2,b.y+15)}g.restore()}
 g.save();g.shadowColor='#8fffe9';g.shadowBlur=22;g.fillStyle='#b9fff0';g.beginPath();g.roundRect(paddle-paddleWidth/2,395,paddleWidth,13,6);g.fill();g.restore();
 g.save();g.shadowColor='#ffe39d';g.shadowBlur=25;g.fillStyle='#fff6d1';g.beginPath();g.arc(ball.x,ball.y,ball.r,0,7);g.fill();g.restore();
 for(let p of particles){g.globalAlpha=Math.max(0,p.life/.55);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
 g.fillStyle='#ffe5ab';g.font='900 12px system-ui';g.textAlign='left';g.fillText('BRICK BLITZ · WAVE '+wave,16,25);g.textAlign='right';g.fillText(bricks.length+' BRICKS LEFT',W-16,25);
 if(flash>0){g.fillStyle='rgba(255,228,160,'+(flash*.2)+')';g.fillRect(0,0,W,H)}
 g.fillStyle='#00000023';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!running||paused){g.fillStyle='#04091dd0';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe3a0';g.font='900 42px system-ui';g.fillText(paused?'PAUSED':lives<=0?'GAME OVER':'BRICK BLITZ',W/2,215);g.fillStyle='#a1ffe9';g.font='700 16px system-ui';g.fillText(paused?'PRESS P TO RESUME':'BREAK BRICKS · CHAIN COMBOS',W/2,249)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
function point(e){let r=c.getBoundingClientRect();target=Math.max(paddleWidth/2+8,Math.min(W-paddleWidth/2-8,(e.clientX-r.left)/r.width*W))}
c.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)point(e)});c.addEventListener('pointerdown',e=>{point(e);if(c.setPointerCapture)c.setPointerCapture(e.pointerId);if(ball.stuck)launch()});
for(let side of ['left','right']){let b=$(side);b.addEventListener('pointerdown',e=>{e.preventDefault();keys[side]=true});for(let ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>keys[side]=false)}
$('launch').onclick=launch;$('pause').onclick=()=>{if(!running)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'KEEP THE BALL IN PLAY')};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a'){keys.left=true;e.preventDefault()}if(k==='arrowright'||k==='d'){keys.right=true;e.preventDefault()}if(k===' '&&!e.repeat){e.preventDefault();if(running)launch();else start()}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();