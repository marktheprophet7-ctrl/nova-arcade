(()=>{'use strict';
const $=id=>document.getElementById(id),c=$('field'),g=c.getContext('2d'),W=560,H=450,DURATION=40,NAMES=['CYAN','PINK','GOLD','GREEN'],COLORS=['#73edff','#ff90ca','#ffe198','#8cffa8'];
let playing=false,paused=false,score=0,best=0,lives=3,combo=0,round=0,elapsed=0,clock=0,word=0,ink=0,task='INK',feedback=0,last=0,raf=0,sound=false,ac=null,correctChoice=-1;
try{best=Math.max(Number(localStorage.getItem('nova-color-match-best')||0),Number(localStorage.getItem('nova-best-9')||0))||0}catch{}$('best').textContent=best;
function tone(h=560,d=.09){if(!sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();const o=ac.createOscillator(),v=ac.createGain();o.type='triangle';o.frequency.value=h;v.gain.setValueAtTime(.022,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch{}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(680)};
function hud(){$('score').textContent=score;$('best').textContent=best;$('lives').textContent='♥ '.repeat(lives).trim()||'OUT';$('combo').textContent='×'+combo;$('time').textContent=Math.max(0,Math.ceil(DURATION-elapsed))+'s';$('round').textContent=String(round).padStart(2,'0')}
function say(s){$('message').textContent=s}
function gain(n){score=Math.max(0,score+n);if(score>best){best=score;try{localStorage.setItem('nova-color-match-best',String(best));localStorage.setItem('nova-best-9',String(best))}catch{}}hud()}
function finish(){playing=false;paused=false;cancelAnimationFrame(raf);$('start').hidden=false;$('start').textContent='PLAY AGAIN';say('COLOUR TEST COMPLETE · '+score+' POINTS · '+round+' PROMPTS');tone(320,.24)}
function next(){if(!playing)return;round++;word=Math.floor(Math.random()*4);ink=(word+1+Math.floor(Math.random()*3))%4;task=Math.random()<.5?'INK':'WORD';correctChoice=task==='INK'?ink:word;clock=Math.max(1.65,4.1-round*.09);feedback=0;say('ROUND '+round+' · MATCH THE '+task);hud()}
function start(){cancelAnimationFrame(raf);playing=true;paused=false;score=0;lives=3;combo=0;round=0;elapsed=0;clock=4;feedback=0;$('start').hidden=true;$('pause').textContent='PAUSE';next();last=performance.now();raf=requestAnimationFrame(loop);tone(760)}
function choose(n){if(!playing||paused||feedback>0||n<0||n>=4)return false;
 if(n===correctChoice){combo++;let pts=75+Math.min(210,combo*12)+Math.max(0,Math.floor(clock*15));gain(pts);say('CORRECT! +'+pts+' · COMBO ×'+combo);tone(850,.11)}else{lives--;combo=0;say('WRONG ANSWER · '+lives+' LIVES LEFT');tone(180,.16)}
 feedback=.54;hud();if(lives<=0){finish()}return n===correctChoice;
}
function update(dt){if(!playing||paused)return;elapsed+=dt;if(elapsed>=DURATION){elapsed=DURATION;hud();finish();return}
 if(feedback>0){feedback-=dt;if(feedback<=0){feedback=0;next()}}
 else{clock-=dt;if(clock<=0){lives--;combo=0;hud();if(lives<=0){finish();return}say('TOO SLOW · '+lives+' LIVES LEFT');feedback=.65;tone(190,.14)}}
 hud()
}
function draw(){
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#191139');bg.addColorStop(1,'#07182b');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let i=0;i<16;i++){g.fillStyle='#b38bff13';g.fillRect(15+i*35,0,1,H)}
 g.fillStyle='#1a143b';g.beginPath();g.roundRect(37,53,486,330,22);g.fill();g.strokeStyle='#926dda';g.lineWidth=3;g.stroke();
 g.textAlign='center';g.font='900 23px system-ui';g.fillStyle='#fff1b8';g.fillText('MATCH THE '+task,280,115);
 g.shadowColor=COLORS[ink];g.shadowBlur=25;g.fillStyle=COLORS[ink];g.font='900 65px system-ui';g.fillText(NAMES[word],280,239);g.shadowBlur=0;
 g.font='800 14px system-ui';g.fillStyle='#aeeaf0';g.fillText('CHOOSE BELOW • 1 / 2 / 3 / 4',280,300);
 g.fillStyle='#243353';g.fillRect(79,334,402,9);g.fillStyle=clock<1?'#ff7997':'#89ffe5';g.fillRect(79,334,402*Math.max(0,Math.min(1,clock/4.1)),9);
 g.fillStyle='#ffe6b0';g.textAlign='left';g.font='900 13px system-ui';g.fillText('COLOR MATCH / '+Math.ceil(DURATION-elapsed)+'s',18,27);
 if(!playing||paused){g.fillStyle='#04091cd5';g.fillRect(0,0,W,H);g.textAlign='center';g.font='900 38px system-ui';g.fillStyle='#ffe4a2';g.fillText(paused?'PAUSED':lives<=0||elapsed>=DURATION?'GAME OVER':'COLOR MATCH',280,212);g.font='700 16px system-ui';g.fillStyle='#a1ffea';g.fillText(paused?'PRESS P TO RESUME':'MATCH INK OR MATCH WORD',280,251)}
}
function loop(now){const dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw();if(playing)raf=requestAnimationFrame(loop)}
const buttons=[];for(let i=0;i<4;i++){let b=document.createElement('button');b.type='button';b.textContent=(i+1)+' · '+NAMES[i];b.style.setProperty('--col',COLORS[i]);b.onclick=()=>choose(i);$('controls').append(b);buttons.push(b)}
c.addEventListener('pointerdown',()=>{});$('pause').onclick=()=>{if(!playing)return;paused=!paused;$('pause').textContent=paused?'RESUME':'PAUSE';last=performance.now();say(paused?'PAUSED · PRESS P OR RESUME':'MATCH THE '+task)};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;let k=e.key.toLowerCase();if(/^[1-4]$/.test(k)&&!e.repeat){e.preventDefault();choose(+k-1)}if(k==='p'&&!e.repeat){e.preventDefault();$('pause').click()}if(k==='r'&&!e.repeat){e.preventDefault();start()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)$('pause').click()});
$('start').onclick=start;draw();
})();