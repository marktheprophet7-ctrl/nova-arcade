(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,RAILS=[142,326],PLAYER_X=109,COLORS=['#ff77c2','#67ffeb'];
let running=false,paused=false,score=0,best=0,hp=3,energy=0,sector=1,elapsed=0,last=0,raf=0,rail=0,targetY=RAILS[0],displayY=RAILS[0],objects=[],particles=[],spawnTimer=0,invincible=0,switchCooldown=0,flash=0,sound=false,ac=null,streak=0,number=0;
const record='nova-polarity-shift-best';
try{best=Math.max(Number(localStorage.getItem(record)||0),Number(localStorage.getItem('nova-arcade-machine-polarity-shift')||0))||0}catch(e){}$('best').textContent=best;
function tone(freq=540,d=.07){if(!sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ac=ac||new Audio();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,ac.currentTime);v.gain.setValueAtTime(.022,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(620)};
function ui(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('energy').textContent=energy;$('sector').textContent=String(sector).padStart(2,'0');$('health').textContent='♥ '.repeat(hp).trim()||'OFFLINE'}
function add(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem(record,String(best))}catch(e){}}ui()}
function signal(message){$('message').textContent=message}
function sparks(x,y,color,count=12){for(let i=0;i<count;i++){let a=Math.random()*6.283,v=25+Math.random()*110;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.65,col:color})}if(particles.length>155)particles.splice(0,particles.length-155)}
function finish(){running=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';$('flip').disabled=true;signal('SYSTEM OVERLOAD · SCORE '+Math.floor(score)+' · '+energy+' ENERGY ORBS');tone(160,.25)}
function flip(){if(!running||paused||switchCooldown>0)return false;rail=1-rail;targetY=RAILS[rail];switchCooldown=.11;sparks(PLAYER_X,displayY,COLORS[rail],6);tone(rail?730:450);return true}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;hp=3;energy=0;sector=1;elapsed=0;rail=0;targetY=RAILS[0];displayY=RAILS[0];objects=[];particles=[];spawnTimer=.85;invincible=0;switchCooldown=0;flash=0;streak=0;number=0;$('start').hidden=true;$('flip').disabled=false;pauseButton.textContent='Ⅱ PAUSE';ui();signal('SECTOR 01 · FLIP TO EVADE PLASMA');last=performance.now();raf=requestAnimationFrame(frame);tone(850)}
function spawn(){let lane=Math.random()<.5?0:1,rate=Math.min(1,.18+elapsed/170),double=rate>.5&&Math.random()<rate*.15,kind=Math.random()<.26?'orb':'hazard';if(kind==='orb'&&number<2)kind='orb';
 objects.push({x:W+30,y:RAILS[lane],lane,kind,r:kind==='orb'?12:21,alive:true,id:number++});
 // Opposite-lane hazards are uncommon and always leave a flipping window.
 if(double&&kind==='hazard'&&Math.random()<.45)objects.push({x:W+140,y:RAILS[1-lane],lane:1-lane,kind:'orb',r:11,alive:true,id:number++})
}
function update(dt){
 if(!running||paused)return;
 elapsed+=dt;sector=1+Math.floor(elapsed/24);switchCooldown=Math.max(0,switchCooldown-dt);invincible=Math.max(0,invincible-dt);flash=Math.max(0,flash-dt);
 displayY+=(targetY-displayY)*Math.min(1,dt*15);
 spawnTimer-=dt;
 if(spawnTimer<=0){spawn();spawnTimer=Math.max(.50,1.3-elapsed*.009)+Math.random()*.3}
 const speed=Math.min(360,180+elapsed*2.4);
 for(let i=objects.length-1;i>=0;i--){let o=objects[i];o.x-=speed*dt;
   if(Math.abs(o.x-PLAYER_X)<o.r+17&&o.lane===rail){
     if(o.kind==='orb'){energy++;streak++;add(25+Math.min(100,streak*5));tone(900,.06);sparks(o.x,o.y,'#ffdf94',12);objects.splice(i,1);continue}
     if(invincible<=0){hp--;invincible=1.25;flash=.44;streak=0;sparks(PLAYER_X,displayY,'#ff648e',21);ui();tone(145,.16);if(hp<=0){finish();return}signal('PLASMA CONTACT · '+hp+' SHIELDS REMAIN')}
     objects.splice(i,1);continue
   }
   if(o.x<-38){objects.splice(i,1);if(o.kind==='hazard'){add(8)}}
 }
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
 add(dt*(1.5+sector*.3))
}
function draw(now=0){
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1d103a');bg.addColorStop(1,'#070f27');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let i=0;i<55;i++){g.fillStyle='#b3e0ff22';g.fillRect((i*97+15+elapsed*9)%W,(i*73+33)%H,2,2)}
 for(let i=0;i<2;i++){let y=RAILS[i],col=COLORS[i];g.save();g.shadowColor=col;g.shadowBlur=20;g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.moveTo(12,y);g.lineTo(W-12,y);g.stroke();g.shadowBlur=0;g.fillStyle=col+'1d';g.fillRect(15,y-35,W-30,70);g.fillStyle='#e8f7ff';g.font='900 12px system-ui';g.textAlign='right';g.fillText((i===0?'POSITIVE':'NEGATIVE')+' RAIL',W-23,y-46);g.restore()}
 for(const o of objects){g.save();g.shadowColor=o.kind==='orb'?'#ffdc8e':'#ff568e';g.shadowBlur=19;
 if(o.kind==='orb'){g.fillStyle='#ffe29e';g.beginPath();g.arc(o.x,o.y,12,0,7);g.fill();g.strokeStyle='#fff6c6';g.lineWidth=2;g.beginPath();g.arc(o.x,o.y,19+Math.sin(now/180)*2,0,7);g.stroke()}
 else{g.fillStyle='#fe5b99';g.beginPath();for(let j=0;j<8;j++){let angle=j*Math.PI/4+now/770,dist=j%2?14:22;let x=o.x+Math.cos(angle)*dist,y=o.y+Math.sin(angle)*dist;if(j===0)g.moveTo(x,y);else g.lineTo(x,y)}g.closePath();g.fill();g.fillStyle='#3e112f';g.beginPath();g.arc(o.x,o.y,7,0,7);g.fill()}g.restore()}
 for(const p of particles){g.globalAlpha=Math.max(0,p.life/.65);g.fillStyle=p.col;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
 g.save();if(invincible>0&&Math.floor(now/85)%2===0)g.globalAlpha=.45;g.shadowColor=COLORS[rail];g.shadowBlur=25;g.fillStyle='#e1fff7';g.beginPath();g.moveTo(PLAYER_X+23,displayY);g.lineTo(PLAYER_X-14,displayY-17);g.lineTo(PLAYER_X-8,displayY);g.lineTo(PLAYER_X-14,displayY+17);g.closePath();g.fill();g.fillStyle=COLORS[rail];g.fillRect(PLAYER_X-22,displayY-6,19,12);g.restore();
 g.textAlign='left';g.font='900 13px system-ui';g.fillStyle='#ffe7a8';g.fillText('POLARITY SHIFT · '+sector.toString().padStart(2,'0'),20,25);g.textAlign='right';g.fillText('CHAIN ×'+Math.max(1,streak),W-20,25);
 if(flash>0){g.fillStyle='rgba(255,69,120,'+(flash*.25)+')';g.fillRect(0,0,W,H)}
 g.fillStyle='#00000027';for(let y=0;y<H;y+=5)g.fillRect(0,y,W,1);
 if(!running||paused){g.fillStyle='#03091ccd';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe6ad';g.font='900 38px system-ui';g.fillText(paused?'PAUSED':hp<=0?'SYSTEM OVERLOAD':'POLARITY SHIFT',W/2,211);g.fillStyle='#8cffe3';g.font='700 16px system-ui';g.fillText(paused?'PRESS RESUME OR P':'PRESS SPACE OR TAP TO FLIP RAILS',W/2,246)}
}
function frame(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(frame)}
$('flip').onclick=flip;c.addEventListener('pointerdown',flip);
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='Ⅱ PAUSE';pauseButton.onclick=()=>{if(!running)return;paused=!paused;pauseButton.textContent=paused?'▶ RESUME':'Ⅱ PAUSE';last=performance.now();signal(paused?'PAUSED · PRESS P TO RESUME':'RAIL POWER RESTORED')};$('controls').append(pauseButton);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if([' ','arrowup','arrowdown'].includes(k)&&!e.repeat){e.preventDefault();if(running)flip();else start()}if(k==='p'&&!e.repeat){e.preventDefault();pauseButton.click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pauseButton.click()});
$('flip').disabled=true;$('start').onclick=start;draw();
})();