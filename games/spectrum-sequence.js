(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d'),W=560,H=450;
const COLORS=['#ff76ad','#68eeff','#ffe58b','#8bffbd'],NAMES=['ROSE','CYAN','GOLD','MINT'],SOUNDS=[329.63,440,554.37,659.25],CENTERS=[[168,148],[390,148],[168,346],[390,346]];
let sequence=[],inputIndex=0,round=0,strikes=0,score=0,best=0,phase='menu',paused=false,lit=-1,inputLit=-1,flashTime=0,cueIndex=0,cueClock=0,intermission=0,responseTime=0,sound=false,audioCtx=null,raf=0,last=0,gameToken=0;
const key='nova-spectrum-sequence-best';
try{best=Math.max(Number(localStorage.getItem(key)||0),Number(localStorage.getItem('nova-arcade-machine-spectrum-sequence')||0))||0}catch{}$('best').textContent=best;
function tone(n,seconds=.15){if(!sound)return;try{let Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioCtx=audioCtx||new Audio();if(audioCtx.state==='suspended')audioCtx.resume();let osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=SOUNDS[n]||220;gain.gain.setValueAtTime(.035,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+seconds);osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+seconds+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(1)};
function savePoints(n){score+=n;$('score').textContent=String(score);if(score>best){best=score;$('best').textContent=String(best);try{localStorage.setItem(key,String(best))}catch(e){}}}
function status(msg){$('message').textContent=msg;$('phase').textContent=phase==='watch'?'WATCH':phase==='input'?'YOUR TURN':phase==='paused'?'PAUSED':phase==='interlude'?'ROUND CLEAR':phase==='over'?'GAME OVER':'READY';$('strikes').textContent=strikes+' / 3';$('round').textContent=String(Math.max(1,round)).padStart(2,'0');for(let i=0;i<buttons.length;i++)buttons[i].disabled=phase!=='input'||paused}
function beginRound(){phase='watch';round++;sequence.push(Math.floor(Math.random()*4));cueIndex=0;cueClock=.48;lit=-1;inputLit=-1;inputIndex=0;responseTime=0;status('WATCH CLOSELY · '+sequence.length+' SIGNAL'+(sequence.length!==1?'S':''));}
function start(){gameToken++;cancelAnimationFrame(raf);sequence=[];inputIndex=0;round=0;strikes=0;score=0;phase='menu';paused=false;lit=-1;inputLit=-1;flashTime=0;replayNext=false;$('score').textContent='0';$('start').hidden=true;pauseButton.textContent='PAUSE';beginRound();last=performance.now();raf=requestAnimationFrame(loop)}
function over(){phase='over';paused=false;lit=-1;inputLit=-1;$('start').hidden=false;$('start').textContent='PLAY AGAIN';status('GAME OVER · '+round+' ROUNDS · '+score+' POINTS');tone(0,.34)}
function advance(){phase='interlude';lit=-1;inputLit=-1;let speed=Math.max(0,100-Math.floor(responseTime)*6),award=round*90+speed;savePoints(award);intermission=.85;status('PERFECT SEQUENCE! +'+award+' · PREPARE FOR ROUND '+(round+1))}
function press(n){if(phase!=='input'||paused||n<0||n>3)return false;inputLit=n;flashTime=.19;tone(n,.1);if(n===sequence[inputIndex]){inputIndex++;if(inputIndex===sequence.length)advance();else status('CORRECT · '+inputIndex+' / '+sequence.length+' SIGNALS');return true}else{strikes++;inputIndex=0;lit=-1;phase='interlude';intermission=.85;status('WRONG COLOUR · STRIKE '+strikes+' OF 3');if(strikes>=3)over();else{replayNext=true}return false}}
let replayNext=false;
function update(dt){if(paused)return;
if(inputLit>=0){flashTime-=dt;if(flashTime<=0)inputLit=-1}
if(phase==='watch'){cueClock-=dt;if(cueClock<=0){if(lit>=0){lit=-1;cueClock+=.21}else if(cueIndex<sequence.length){lit=sequence[cueIndex++];tone(lit,.22);cueClock+=Math.max(.27,.47-round*.012)}else{phase='input';inputIndex=0;responseTime=0;status('YOUR TURN · REPEAT THE '+sequence.length+' SIGNALS')}}}
else if(phase==='input')responseTime+=dt;
else if(phase==='interlude'){intermission-=dt;if(intermission<=0){if(replayNext){replayNext=false;phase='watch';cueIndex=0;cueClock=.4;lit=-1;status('WATCH AGAIN · RETRY ROUND '+round)}else beginRound()}}
}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function draw(){
 const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#1a1035');grad.addColorStop(1,'#081427');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#a86dff22';ctx.lineWidth=1;for(let x=0;x<W;x+=28){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.fillStyle='#09091cb0';rounded(48,38,464,381,22);ctx.fill();ctx.strokeStyle='#9a6ac777';ctx.lineWidth=3;ctx.stroke();
 for(let i=0;i<4;i++){const [x,y]=CENTERS[i],active=(lit===i||inputLit===i),base=COLORS[i];ctx.save();ctx.shadowColor=base;ctx.shadowBlur=active?48:13;ctx.fillStyle=base;ctx.globalAlpha=active?1:.43;rounded(x-88,y-78,176,157,25);ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=active?6:2;ctx.strokeStyle=active?'#fff8ef':base;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=active?'#101023':'#f3edff';ctx.font='900 31px system-ui';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+4);ctx.font='800 13px system-ui';ctx.fillText(NAMES[i],x,y+28);ctx.restore()}
 ctx.textAlign='center';ctx.font='900 12px system-ui';ctx.fillStyle='#f5e0a9';ctx.fillText('MEMORY CIRCUIT • '+(phase==='watch'?'WATCH THE LIGHTS':phase==='input'?'REPEAT THE PATTERN':'PRESS START'),280,24);
 ctx.fillStyle='#0808186b';for(let y=0;y<H;y+=5)ctx.fillRect(0,y,W,1);
 if(phase==='menu'||phase==='over'||paused){ctx.fillStyle='#08061cc9';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#ffe59b';ctx.font='900 37px system-ui';ctx.fillText(paused?'PAUSED':phase==='over'?'GAME OVER':'SPECTRUM SEQUENCE',W/2,210);ctx.fillStyle='#acfff0';ctx.font='700 16px system-ui';ctx.fillText(paused?'PRESS P OR RESUME':'MEMORISE · REPEAT · SURVIVE',W/2,247)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw();if(phase!=='menu'&&phase!=='over')raf=requestAnimationFrame(loop)}
const buttons=[];for(let i=0;i<4;i++){let b=document.createElement('button');b.type='button';b.textContent=(i+1)+' · '+NAMES[i];b.style.setProperty('--pad-color',COLORS[i]);b.onclick=()=>press(i);$('controls').append(b);buttons.push(b)}
const pauseButton=document.createElement('button');pauseButton.type='button';pauseButton.textContent='PAUSE';pauseButton.onclick=()=>{if(phase==='menu'||phase==='over')return;paused=!paused;pauseButton.textContent=paused?'RESUME':'PAUSE';if(paused){$('phase').textContent='PAUSED';$('message').textContent='PAUSED · PRESS P OR RESUME'}else{status(phase==='watch'?'WATCH THE LIGHTS':phase==='input'?'YOUR TURN · CONTINUE':'PREPARE FOR THE NEXT ROUND');last=performance.now()}};$('controls').insertAdjacentElement('afterend',pauseButton);
canvas.addEventListener('pointerdown',e=>{let r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let hit=CENTERS.findIndex(([cx,cy])=>Math.abs(x-cx)<=88&&Math.abs(y-cy)<=78);if(hit>=0)press(hit)});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(e.target?.tagName))return;let key=e.key.toLowerCase();if(/^[1-4]$/.test(key)){if(!e.repeat){e.preventDefault();press(+key-1)}}if(key==='p'&&!e.repeat){e.preventDefault();pauseButton.click()}if(key==='enter'&&(phase==='menu'||phase==='over')&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&phase!=='menu'&&phase!=='over')pauseButton.click()});
$('start').onclick=start;status('PRESS START TO BEGIN · WATCH THEN REPEAT THE LIGHTS');draw();
})();