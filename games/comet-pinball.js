(()=>{'use strict';
const c=document.querySelector('#field'),g=c.getContext('2d'),W=560,H=450,$=s=>document.querySelector(s),msg=$('#message'),start=$('#start'),controls=$('#controls');
let score=0,best=0,lives=3,state='menu',ball={x:509,y:360,vx:0,vy:0,r:9},pressed={left:false,right:false},bumpers=[{x:145,y:158,r:29,color:'#d9a9ff'},{x:286,y:112,r:31,color:'#86fff2'},{x:413,y:177,r:28,color:'#ffb4dd'},{x:278,y:255,r:22,color:'#e3dc8a'}],particles=[],last=0,raf=0,sound=false,ac,flash=0,shooter=true,flipperCooldown=0,pause=false,trails=[],combo=0,shake=0;
try{best=Number(Math.max(Number(localStorage.getItem('nova-comet-pinball-best')||0),Number(localStorage.getItem('nova-arcade-machine-comet-pinball')||0))||0)}catch{}$('#best').textContent=best;
function tone(freq){if(!sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=freq;v.gain.value=.02;o.connect(v).connect(ac.destination);o.start();v.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.09);o.stop(ac.currentTime+.1)}catch{}}
$('#soundtoggle').onclick=()=>{sound=!sound;$('#soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('#soundtoggle').setAttribute('aria-pressed',String(sound))};
function scorePoint(n){score+=n;$('#score').textContent=score;if(score>best){best=score;$('#best').textContent=best;try{localStorage.setItem('nova-comet-pinball-best',best)}catch{}}}
function spawnParticle(x,y,col){for(let i=0;i<14;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,a:1,col})}
function resetBall(){ball={x:509,y:358,vx:0,vy:0,r:9};shooter=true;flipperCooldown=0;combo=0;trails=[];msg.textContent='SPACE / LAUNCH to fire • ← and → for flippers • '+lives+' balls'}
function loseBall(){lives--;tone(130);flash=1;if(lives<=0){state='over';msg.textContent='GAME OVER • '+score+' points • Restart to play again';start.hidden=false;start.textContent='PLAY AGAIN'}else resetBall()}
function launch(){if(state==='play'&&!pause&&shooter){shooter=false;ball.vx=-3.2;ball.vy=-11.5;tone(490)}}
function reset(){cancelAnimationFrame(raf);score=0;$('#score').textContent='0';lives=3;state='play';pause=false;pressed.left=pressed.right=false;particles=[];trails=[];combo=0;shake=0;start.hidden=true;pauseButton.textContent='PAUSE';resetBall();last=performance.now();raf=requestAnimationFrame(frame)}
function rebound(nx,ny,power=1){let dot=ball.vx*nx+ball.vy*ny;if(dot>=0)return;ball.vx=(ball.vx-1.87*dot*nx)*power;ball.vy=(ball.vy-1.87*dot*ny)*power}
function update(dt){
 if(state!=='play'||pause)return;
 const total=Math.min(2.1,Math.max(0,dt*60)),steps=Math.max(1,Math.ceil(total)),step=total/steps;
 flash=Math.max(0,flash-.045*total);shake=Math.max(0,shake-.14*total);
 flipperCooldown=Math.max(0,flipperCooldown-total);
 for(let tick=0;tick<steps&&!shooter&&state==='play';tick++){
   ball.vy+=.19*step;
   ball.x+=ball.vx*step;ball.y+=ball.vy*step;
   ball.vx*=Math.pow(.999,step);ball.vy*=Math.pow(.999,step);
   if(ball.x<20){ball.x=20;ball.vx=Math.abs(ball.vx)*.95}
   if(ball.x>W-20){ball.x=W-20;ball.vx=-Math.abs(ball.vx)*.95}
   if(ball.y<29){ball.y=29;ball.vy=Math.abs(ball.vy)*.92}
   for(const p of bumpers){
     let dx=ball.x-p.x,dy=ball.y-p.y,dist=Math.hypot(dx,dy),limit=ball.r+p.r;
     if(dist<limit&&dist>0){
       let nx=dx/dist,ny=dy/dist;
       ball.x=p.x+nx*limit;ball.y=p.y+ny*limit;
       rebound(nx,ny,1.07);ball.vy-=.28;
       combo=Math.min(combo+1,5);
       scorePoint(25*combo);tone(350+p.x);
       spawnParticle(ball.x,ball.y,p.color);shake=Math.max(shake,2.5)
     }
   }
   // Real flipper contact: only the visibly raised left/right bat can strike the ball.
   if(ball.vy>0&&flipperCooldown===0){
     for(const side of ['left','right']){
       if(!pressed[side])continue;
       const left=side==='left',distance=left?280-ball.x:ball.x-280;
       if(distance<2||distance>92)continue;
       const surface=385-Math.sin(.29)*distance;
       if(ball.y+ball.r>=surface-4&&ball.y-ball.r<=surface+8){
         ball.y=surface-ball.r-3;
         ball.vy=-Math.max(9.6,Math.abs(ball.vy)*1.28);
         ball.vx=(ball.x-280)/23+(left?1.8:-1.8);
         flipperCooldown=8;combo=0;scorePoint(10);
         tone(left?560:675);spawnParticle(ball.x,ball.y,left?'#ff9fcb':'#80ffea');shake=1.9;break
       }
     }
   }
   if(ball.y>H+15){loseBall();break}
   const speed=Math.hypot(ball.vx,ball.vy);
   if(speed>15){ball.vx=ball.vx/speed*15;ball.vy=ball.vy/speed*15}
 }
 if(!shooter&&state==='play'){
   trails.push({x:ball.x,y:ball.y,life:1});
   if(trails.length>15)trails.shift()
 }
 trails.forEach(p=>p.life-=.085*total);trails=trails.filter(p=>p.life>0);
 particles.forEach(p=>{p.x+=p.vx*total;p.y+=p.vy*total;p.a-=.04*total});
 particles=particles.filter(p=>p.a>0)
}
function draw(t){let bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#20153e');bg.addColorStop(.6,'#0a1b35');bg.addColorStop(1,'#091126');g.fillStyle=bg;g.fillRect(0,0,W,H);
for(let i=0;i<55;i++){g.fillStyle='rgba(227,228,255,'+(.08+.1*Math.sin(t/630+i))+')';g.fillRect((i*77)%W,(i*89)%H,2,2)}g.strokeStyle='#7a90d755';g.lineWidth=4;g.beginPath();g.moveTo(28,365);g.lineTo(28,90);g.quadraticCurveTo(28,26,112,26);g.lineTo(446,26);g.quadraticCurveTo(535,26,535,90);g.lineTo(535,360);g.stroke();g.lineWidth=1;
for(const p of bumpers){g.shadowColor=p.color;g.shadowBlur=26;g.fillStyle=p.color+'66';g.beginPath();g.arc(p.x,p.y,p.r+7,0,7);g.fill();g.fillStyle='#17243f';g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();g.strokeStyle=p.color;g.lineWidth=5;g.stroke();g.lineWidth=1;g.shadowBlur=0;g.fillStyle=p.color;g.font='900 22px system-ui';g.textAlign='center';g.fillText('✧',p.x,p.y+8)}
function flipper(right,active){g.save();g.translate(280,385);g.rotate((right?-1:1)*(active?.29:.04));g.shadowColor=right?'#80ffea':'#ff9fcb';g.shadowBlur=active?27:9;g.fillStyle=right?'#8beaff':'#ff9dc9';g.beginPath();g.roundRect(right?0:-82,-10,82,20,10);g.fill();g.fillStyle='#ffffff66';g.fillRect(right?7:-75,-6,68,3);g.restore()}
flipper(false,pressed.left);flipper(true,pressed.right);
for(const trail of trails){g.globalAlpha=trail.life*.25;g.fillStyle='#9ffaff';g.beginPath();g.arc(trail.x,trail.y,Math.max(1,ball.r*trail.life*.7),0,Math.PI*2);g.fill()}g.globalAlpha=1;
if(!shooter||state==='menu'){g.shadowColor='#adffff';g.shadowBlur=20;g.fillStyle='#f0ffff';g.beginPath();g.arc(ball.x,ball.y,ball.r,0,7);g.fill();g.shadowBlur=0}else{g.fillStyle='#7bb2da';g.beginPath();g.arc(ball.x,ball.y,ball.r,0,7);g.fill()}g.font='900 14px system-ui';g.textAlign='center';g.fillStyle='#b0c2e9';g.fillText('COMET PINBALL • BALLS '+lives+' • BUMPER CHAIN ×'+Math.max(1,combo),W/2,18);
particles.forEach(p=>{g.globalAlpha=Math.max(0,p.a);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)});g.globalAlpha=1;if(flash>0){g.fillStyle='rgba(255,86,146,'+(flash*.17)+')';g.fillRect(0,0,W,H)}if(pause){g.fillStyle='#04091ad6';g.fillRect(0,0,W,H);g.font='900 36px system-ui';g.fillStyle='#ffe19c';g.fillText('PAUSED',W/2,210);g.font='700 16px system-ui';g.fillText('PRESS RESUME OR P',W/2,245)}if(state==='menu'||state==='over'){g.fillStyle='#030918b8';g.fillRect(0,0,W,H);g.font='900 36px system-ui';g.fillStyle='#ebedff';g.fillText(state==='over'?'GAME OVER':'COMET PINBALL',W/2,212);g.font='700 16px system-ui';g.fillStyle='#b8a2ff';g.fillText(state==='over'?'TRY AGAIN':'LAUNCH THE COMET • HIT THE BUMPERS',W/2,247)}}
function frame(now){let dt=Math.min(.038,(now-last)/1000||.016);last=now;update(dt);draw(now);if(state==='play')raf=requestAnimationFrame(frame)}
function btn(label,down,up){let b=document.createElement('button');b.textContent=label;b.type='button';b.addEventListener('pointerdown',e=>{e.preventDefault();down()});for(const n of ['pointerup','pointerleave','pointercancel'])b.addEventListener(n,()=>up?.());b.addEventListener('click',e=>{if(e.detail===0){down();if(up)setTimeout(up,120)}});controls.append(b)}
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='PAUSE';pauseButton.onclick=()=>{if(state!=='play')return;pause=!pause;pauseButton.textContent=pause?'RESUME':'PAUSE';msg.textContent=pause?'PAUSED · Press P or Resume to continue':'BALLS '+lives+' · BUMPER CHAIN ×'+Math.max(1,combo);last=performance.now()};controls.append(pauseButton);
btn('◀ FLIP',()=>pressed.left=true,()=>pressed.left=false);btn('LAUNCH',launch);btn('FLIP ▶',()=>pressed.right=true,()=>pressed.right=false);
window.addEventListener('keydown',e=>{if([' ','ArrowLeft','ArrowRight','a','d'].includes(e.key))e.preventDefault();if(e.key==='p'&&!e.repeat)pauseButton.click();if(e.key===' '&&!e.repeat)launch();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')pressed.left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')pressed.right=true});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')pressed.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')pressed.right=false});c.addEventListener('pointerdown',e=>{let r=c.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width;if(shooter)launch();else if(x<W/2)pressed.left=true;else pressed.right=true});const release=()=>pressed.left=pressed.right=false;c.addEventListener('pointerup',release);c.addEventListener('pointercancel',release);c.addEventListener('pointerleave',release);document.addEventListener('visibilitychange',()=>{if(document.hidden){release();if(state==='play'&&!pause)pauseButton.click()}});start.onclick=reset;draw(0);
})();