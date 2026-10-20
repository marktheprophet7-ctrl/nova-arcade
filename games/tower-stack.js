(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d'),W=560,H=450,BASE_Y=392,BLOCK_H=25,LEFT=19,RIGHT=541,COLORS=['#67f6ff','#ff85ca','#ffe187','#a688ff','#86ffbc'];
let run=false,paused=false,score=0,best=0,blocks=[],moving=null,perfects=0,perfectCombo=0,heightBest=0,particles=[],flash=0,camera=0,dropTrail=0,sound=false,ac=null,last=0,raf=0,gameNo=0,feedback='',feedbackTime=0;
try{best=Math.max(Number(localStorage.getItem('nova-tower-stack-best')||0),Number(localStorage.getItem('nova-arcade-machine-tower-stack')||0))||0;heightBest=Number(localStorage.getItem('nova-tower-stack-height')||0)||0}catch{}$('best').textContent=best;$('heightbest').textContent=heightBest;
function tone(freq=450,d=.1){if(!sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ac=ac||new Audio();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=freq;v.gain.setValueAtTime(.028,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(740)};
function scoreAdd(n){score+=n;$('score').textContent=score;if(score>best){best=score;$('best').textContent=best;try{localStorage.setItem('nova-tower-stack-best',String(best))}catch(e){}}}
function updateStats(){let height=Math.max(0,blocks.length-1);$('floor').textContent=String(height).padStart(2,'0');$('perfect').textContent=String(perfects);if(height>heightBest){heightBest=height;$('heightbest').textContent=String(heightBest);try{localStorage.setItem('nova-tower-stack-height',String(heightBest))}catch(e){}}}
function notify(s){feedback=s;feedbackTime=1.2;$('message').textContent=s}
function burst(px,py,col,count=14){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=50+Math.random()*115;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.72,color:col})}if(particles.length>170)particles.splice(0,particles.length-170)}
function makeMoving(){let base=blocks[blocks.length-1],height=blocks.length,speed=114+Math.min(240,height*10),fromLeft=height%2===1,dir=fromLeft?1:-1;moving={x:fromLeft?LEFT:RIGHT-base.w,w:base.w,vel:speed*dir};dropTrail=0}
function start(){cancelAnimationFrame(raf);run=true;paused=false;gameNo++;score=0;perfects=0;perfectCombo=0;camera=0;flash=0;particles=[];blocks=[{x:160,w:240}];$('score').textContent='0';$('start').hidden=true;$('drop').disabled=false;pauseButton.textContent='PAUSE';updateStats();makeMoving();notify('FLOOR 1 · PRESS SPACE OR TAP TO DROP');last=performance.now();raf=requestAnimationFrame(loop);tone(780)}
function over(){run=false;paused=false;moving=null;$('start').hidden=false;$('drop').disabled=true;$('start').textContent='PLAY AGAIN';notify('STACK COLLAPSED · HEIGHT '+(blocks.length-1)+' · SCORE '+score);tone(180,.22)}
function drop(){if(!run||paused||!moving)return false;let parent=blocks[blocks.length-1],left=Math.max(parent.x,moving.x),right=Math.min(parent.x+parent.w,moving.x+moving.w),overlap=right-left,delta=Math.abs(moving.x-parent.x),precise=delta<=Math.min(7,parent.w*.10);
if(overlap<7){burst(moving.x+moving.w/2,BASE_Y-blocks.length*BLOCK_H+camera,'#ff6d98',23);over();return false}
let width=overlap,x=left,bonus=0;
if(precise){x=parent.x;width=parent.w;perfects++;perfectCombo++;bonus=70+Math.min(120,perfectCombo*15);notify('PERFECT DROP! · COMBO ×'+perfectCombo+' · +'+bonus);flash=.9;tone(930)}else{perfectCombo=0;notify('STACKED! '+Math.floor(width)+' PX REMAINING');tone(520)}
blocks.push({x,w:width});scoreAdd(35+bonus);updateStats();burst(x+width/2,BASE_Y-(blocks.length-1)*BLOCK_H+camera,COLORS[blocks.length%COLORS.length],precise?18:7);
makeMoving();return true
}
function update(dt){if(!run||paused)return;const base=blocks[blocks.length-1],target=Math.max(0,(blocks.length-11)*BLOCK_H);camera+=(target-camera)*Math.min(1,dt*8);flash=Math.max(0,flash-dt*1.8);feedbackTime=Math.max(0,feedbackTime-dt);
if(moving){moving.x+=moving.vel*dt;if(moving.x<LEFT){moving.x=LEFT;moving.vel=Math.abs(moving.vel)}if(moving.x+moving.w>RIGHT){moving.x=RIGHT-moving.w;moving.vel=-Math.abs(moving.vel)}}
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)}
function rect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function draw(now=0){
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1e133b');bg.addColorStop(1,'#091329');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 for(let i=0;i<70;i++){const x=(i*97+13)%W,y=(i*61+44)%H;ctx.fillStyle='#ffffff28';ctx.fillRect(x,y,2,2)}
 ctx.strokeStyle='#59dfff14';for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(i*74,0);ctx.lineTo(i*74,H);ctx.stroke()}for(let y=18;y<H;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.fillStyle='#0c1b35';for(let i=0;i<16;i++){let bx=i*38-10,ht=45+(i*59%93);ctx.fillRect(bx,BASE_Y-ht,30,ht);ctx.fillStyle='#69d6ff24';ctx.fillRect(bx+7,BASE_Y-ht+15,5,10);ctx.fillStyle='#0c1b35'}
 ctx.shadowColor='#5ffff0';ctx.shadowBlur=17;ctx.fillStyle='#7effd6';ctx.fillRect(20,BASE_Y+BLOCK_H+camera,520,4);ctx.shadowBlur=0;
 blocks.forEach((b,i)=>{let y=BASE_Y-i*BLOCK_H+camera;if(y<-BLOCK_H||y>H) return;let col=COLORS[i%COLORS.length];ctx.shadowColor=col;ctx.shadowBlur=i===blocks.length-1?16:5;ctx.fillStyle=col;rect(b.x,y,b.w,BLOCK_H-1,5);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ffffff75';ctx.fillRect(b.x+5,y+3,Math.max(0,b.w-10),3);ctx.fillStyle='#10163037';ctx.fillRect(b.x+3,y+17,Math.max(0,b.w-6),5)});
 if(moving){let y=BASE_Y-blocks.length*BLOCK_H+camera;ctx.shadowColor='#ffe3a2';ctx.shadowBlur=22;ctx.fillStyle='#ffdaa2';rect(moving.x,y,moving.w,BLOCK_H-1,5);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ffffff6d';ctx.fillRect(moving.x+5,y+3,Math.max(0,moving.w-10),4);const below=blocks[blocks.length-1];ctx.fillStyle='#ffe69c28';ctx.fillRect(Math.max(below.x,moving.x),y+BLOCK_H,Math.max(0,Math.min(below.x+below.w,moving.x+moving.w)-Math.max(below.x,moving.x)),BLOCK_H-1)}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.72);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1;
 ctx.fillStyle='#ffe9b7';ctx.font='900 14px system-ui';ctx.textAlign='left';ctx.fillText('TOWER HEIGHT '+Math.max(0,blocks.length-1),20,24);ctx.textAlign='right';ctx.fillText('PRECISION ×'+Math.max(1,perfectCombo),W-20,24);
 if(flash>0){ctx.fillStyle='rgba(255,223,145,'+(flash*.13)+')';ctx.fillRect(0,0,W,H)}
 if(feedbackTime>0&&run){ctx.fillStyle='#f9eec6';ctx.textAlign='center';ctx.font='900 20px system-ui';ctx.fillText(feedback,W/2,63)}
 ctx.fillStyle='#00000025';for(let y=0;y<H;y+=6)ctx.fillRect(0,y,W,2);
 if(!run||paused){ctx.fillStyle='#040819cc';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ffe29c';ctx.textAlign='center';ctx.font='900 41px system-ui';ctx.fillText(paused?'PAUSED':blocks.length>1?'TOWER COLLAPSED':'TOWER STACK',W/2,215);ctx.fillStyle='#9cf9ef';ctx.font='700 15px system-ui';ctx.fillText(paused?'PRESS P OR RESUME':'TAP TO DROP · BUILD THE HIGHEST TOWER',W/2,251)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(run)raf=requestAnimationFrame(loop)}
$('drop').onclick=drop;canvas.addEventListener('pointerdown',drop);
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='PAUSE';pauseButton.onclick=()=>{if(!run)return;paused=!paused;pauseButton.textContent=paused?'RESUME':'PAUSE';last=performance.now();notify(paused?'PAUSED · PRESS P TO CONTINUE':'DROP YOUR NEXT BLOCK')};$('controls').append(pauseButton);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if((k===' '||k==='enter')&&!e.repeat){e.preventDefault();if(run)drop();else start()}if(k==='p'&&!e.repeat){e.preventDefault();pauseButton.click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!paused)pauseButton.click()});
$('drop').disabled=true;$('start').onclick=start;draw();
})();