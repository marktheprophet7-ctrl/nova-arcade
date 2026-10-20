(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,LANES=[128,280,432],PLAYER_Y=372,PALETTE=['#6dfaff','#a994ff','#ff8ccc'];
let running=false,paused=false,score=0,best=0,lives=3,combo=0,maxCombo=0,stage=1,elapsed=0,last=0,raf=0,lane=1,displayX=280,items=[],particles=[],spawn=.7,invuln=0,steerCd=0,sound=false,ac=null,shield=0,shake=0,distance=0;
try{best=Math.max(Number(localStorage.getItem('nova-lane-blazer-best')||0),Number(localStorage.getItem('nova-arcade-machine-lane-blazer')||0))||0}catch(e){}$('best').textContent=best;
function tone(h=550,d=.08){if(!sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ac=ac||new Audio();let o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=h;v.gain.setValueAtTime(.026,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));tone(820)};
function ui(){$('score').textContent=Math.floor(score);$('best').textContent=best;$('lives').textContent='♥ '.repeat(lives).trim()||'GAME OVER';$('combo').textContent='×'+combo;$('stage').textContent=String(stage).padStart(2,'0')}
function earn(n){score+=n;if(score>best){best=Math.floor(score);try{localStorage.setItem('nova-lane-blazer-best',String(best))}catch(e){}}ui()}
function say(msg){$('message').textContent=msg}
function emit(x,y,color){for(let i=0;i<14;i++){let angle=Math.random()*Math.PI*2,v=40+Math.random()*110;particles.push({x,y,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,life:.5,color})}}
function finish(){running=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('TRAFFIC OVERLOAD · SCORE '+Math.floor(score)+' · BEST COMBO '+maxCombo);tone(180,.23)}
function choose(n){if(!running||paused||steerCd>0)return false;n=Math.max(0,Math.min(2,n));if(n===lane)return false;lane=n;steerCd=.08;tone(400+lane*110,.04);return true}
function change(dx){return choose(lane+dx)}
function start(){cancelAnimationFrame(raf);running=true;paused=false;score=0;lives=3;combo=0;maxCombo=0;stage=1;elapsed=0;lane=1;displayX=LANES[1];items=[];particles=[];spawn=.5;invuln=0;steerCd=0;shield=0;shake=0;distance=0;ui();$('start').hidden=true;pauseButton.textContent='PAUSE';say('COLLECT CYAN GEMS · AVOID PINK TRAFFIC');last=performance.now();raf=requestAnimationFrame(loop);tone(750)}
function spawnWave(){
 let lanes=[0,1,2].sort(()=>Math.random()-.5),difficulty=Math.min(1,elapsed/100),hazards=elapsed>18&&Math.random()<.28+difficulty*.18?2:1;
 for(let i=0;i<hazards;i++)items.push({lane:lanes[i],y:-40-i*7,type:'danger',r:27});
 let safe=lanes.slice(hazards),gemLane=safe[Math.floor(Math.random()*safe.length)];
 items.push({lane:gemLane,y:-100,type:Math.random()<.065?'shield':'gem',r:15});
}
function update(dt){if(!running||paused)return;elapsed+=dt;stage=1+Math.floor(elapsed/22);steerCd=Math.max(0,steerCd-dt);invuln=Math.max(0,invuln-dt);shake=Math.max(0,shake-dt*12);distance+=dt*(260+stage*25);displayX+=(LANES[lane]-displayX)*Math.min(1,dt*15);
 spawn-=dt;if(spawn<=0){spawnWave();spawn=Math.max(.50,1.07-elapsed*.004)+Math.random()*.25}
 let speed=Math.min(460,210+elapsed*2.6);
 for(let i=items.length-1;i>=0;i--){let o=items[i];o.y+=speed*dt;
 if(o.lane===lane&&Math.abs(o.y-PLAYER_Y)<o.r+23){
 if(o.type==='gem'){combo++;maxCombo=Math.max(combo,maxCombo);earn(30+Math.min(180,combo*12));tone(850,.06);emit(LANES[lane],PLAYER_Y,'#90ffe6')}
 else if(o.type==='shield'){shield=1;combo++;earn(100);tone(1020,.16);emit(LANES[lane],PLAYER_Y,'#ffe79d');say('GOLD SHIELD CHARGED · BLOCK ONE CRASH')}
 else if(invuln<=0){if(shield){shield=0;invuln=.8;say('SHIELD ABSORBED COLLISION');tone(620,.1)}else{lives--;combo=0;invuln=1.2;shake=4;emit(LANES[lane],PLAYER_Y,'#ff7eac');tone(160,.16);say('CRASH · '+lives+' LIVES LEFT');if(lives<=0){items.splice(i,1);ui();finish();return}}}
 items.splice(i,1);continue}
 if(o.y>490){items.splice(i,1);if(o.type==='danger')earn(9);else if(o.type==='gem'){combo=0;ui()}}
 }
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
 earn(dt*(1.5+stage*.6))
}
function draw(now=0){
 let bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1b0a36');bg.addColorStop(1,'#07182b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.save();g.translate(Math.sin(now/45)*shake,0);
 for(let i=0;i<3;i++){const cx=LANES[i],w=130;g.fillStyle=i===lane?'#61faff16':'#ffffff07';g.fillRect(cx-w/2,12,w,426);g.strokeStyle=i===lane?'#76faff':'#7770bb55';g.lineWidth=i===lane?2:1;g.strokeRect(cx-w/2+1,12,w-2,426);g.textAlign='center';g.font='900 14px system-ui';g.fillStyle='#a0acdb';g.fillText('LANE 0'+(i+1),cx,38)}
 for(let y=-60;y<H+40;y+=76){let off=distance%76;g.fillStyle='#ccf7ff22';g.fillRect(205,y+off,4,30);g.fillRect(358,y+off,4,30)}
 for(const o of items){let x=LANES[o.lane],y=o.y;g.save();
 if(o.type==='danger'){g.shadowColor='#ff71ac';g.shadowBlur=25;g.fillStyle='#f95991';g.beginPath();g.roundRect(x-40,y-25,80,50,11);g.fill();g.fillStyle='#54132f';g.beginPath();g.roundRect(x-29,y-16,58,31,7);g.fill();g.fillStyle='#ffcfda';g.font='900 26px system-ui';g.textAlign='center';g.fillText('✕',x,y+10)}
 else{let col=o.type==='gem'?'#75ffe9':'#ffe4a1';g.shadowColor=col;g.shadowBlur=24;g.fillStyle=col;g.beginPath();g.moveTo(x,y-19);g.lineTo(x+16,y);g.lineTo(x,y+19);g.lineTo(x-16,y);g.closePath();g.fill();if(o.type==='shield'){g.strokeStyle='#fff1bc';g.lineWidth=3;g.beginPath();g.arc(x,y,23,0,7);g.stroke()}}
 g.restore()}
 for(let p of particles){g.globalAlpha=Math.max(0,p.life/.5);g.fillStyle=p.color;g.fillRect(p.x,p.y,4,4)}g.globalAlpha=1;
 g.save();if(invuln>0&&Math.floor(now/110)%2===0)g.globalAlpha=.45;
 g.shadowColor=shield?'#ffe89d':'#8bffe6';g.shadowBlur=shield?35:21;g.fillStyle='#e4faff';g.beginPath();g.moveTo(displayX,PLAYER_Y-28);g.lineTo(displayX+24,PLAYER_Y+17);g.lineTo(displayX,PLAYER_Y+10);g.lineTo(displayX-24,PLAYER_Y+17);g.closePath();g.fill();g.fillStyle='#6bffdf';g.fillRect(displayX-6,PLAYER_Y+12,12,13);g.shadowBlur=0;if(shield){g.strokeStyle='#ffe89d';g.lineWidth=3;g.beginPath();g.arc(displayX,PLAYER_Y,35,0,7);g.stroke()}g.restore();
 g.restore();
 g.font='900 13px system-ui';g.fillStyle='#ffde93';g.textAlign='left';g.fillText('LANE BLAZER · STAGE '+stage,20,24);g.textAlign='right';g.fillText('ENERGY CHAIN ×'+Math.max(1,combo),W-20,24);
 g.fillStyle='#00000022';for(let y=0;y<H;y+=6)g.fillRect(0,y,W,2);
 if(!running||paused){g.fillStyle='#040a1ecb';g.fillRect(0,0,W,H);g.textAlign='center';g.fillStyle='#ffe09b';g.font='900 40px system-ui';g.fillText(paused?'PAUSED':lives<=0?'TRAFFIC OVERLOAD':'LANE BLAZER',W/2,210);g.fillStyle='#99ffed';g.font='700 16px system-ui';g.fillText(paused?'PRESS P OR RESUME':'MOVE LANES · CATCH ENERGY · DODGE TRAFFIC',W/2,245)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
$('left').onclick=()=>change(-1);$('right').onclick=()=>change(1);
c.addEventListener('pointerdown',e=>{let box=c.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*W;choose(LANES.reduce((winner,cx,i)=>Math.abs(x-cx)<Math.abs(x-LANES[winner])?i:winner,0))});
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='PAUSE';pauseButton.onclick=()=>{if(!running)return;paused=!paused;pauseButton.textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'KEEP THE ENERGY CHAIN ALIVE')};$('controls').insertAdjacentElement('afterend',pauseButton);
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(['arrowleft','a','arrowright','d'].includes(k)){e.preventDefault();if(!e.repeat)change(k==='arrowleft'||k==='a'?-1:1)}if(k==='p'&&!e.repeat){e.preventDefault();pauseButton.click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pauseButton.click()});
$('start').onclick=start;draw();
})();