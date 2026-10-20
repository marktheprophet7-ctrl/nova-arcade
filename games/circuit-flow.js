(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('field'),ctx=canvas.getContext('2d'),W=560,H=450,N=6,SIZE=62,OX=94,OY=36,DIR=[[0,-1],[1,0],[0,1],[-1,0]],COLORS=['#7bffe0','#65dfff','#ffe38f'];
let masks=[],solvedMask=[],route=[],endpoint=2,selected=14,level=1,moves=0,score=0,best=0,time=0,lit=new Set(),running=false,paused=false,phase='menu',transition=0,hintIndex=-1,hints=0,sound=false,ac=null,raf=0,last=0;
const bestKey='nova-circuit-flow-best';
try{best=Math.max(Number(localStorage.getItem(bestKey)||0),Number(localStorage.getItem('nova-arcade-machine-circuit-flow')||0))||0}catch{}$('best').textContent=best;
function tone(f=510,d=.09){if(!sound)return;try{let Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ac=ac||new Audio();const o=ac.createOscillator(),v=ac.createGain();o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(.027,ac.currentTime);v.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+d+.01)}catch(e){}}
$('soundtoggle').onclick=()=>{sound=!sound;$('soundtoggle').textContent='Sound: '+(sound?'On':'Off');$('soundtoggle').setAttribute('aria-pressed',String(sound));if(sound)tone(680)};
const index=(x,y)=>y*N+x,rotateMask=m=>((m<<1)|(m>>3))&15;
function direction(a,b){const [dx,dy]=[b[0]-a[0],b[1]-a[1]];return dx===1?1:dx===-1?3:dy===1?2:0}
function connectivity(){
 const open=new Set(),front=[index(0,2)];
 if(!(masks[index(0,2)]&8))return {open,win:false};
 open.add(front[0]);
 while(front.length){const id=front.shift(),x=id%N,y=Math.floor(id/N),mask=masks[id];
 for(let d=0;d<4;d++){if(!(mask&(1<<d)))continue;let nx=x+DIR[d][0],ny=y+DIR[d][1];if(nx<0||nx>=N||ny<0||ny>=N)continue;let target=index(nx,ny);if(open.has(target)||!(masks[target]&(1<<((d+2)%4))))continue;open.add(target);front.push(target)}}
 const end=index(5,endpoint);
 return {open,win:open.has(end)&&!!(masks[end]&2)}
}
function makeBoard(){
 const all=Array(N*N).fill(0),steps=[[0,2]];let y=2;
 for(let x=0;x<N;x++){
   if(x>0)steps.push([x,y]);
   if(x<N-1&&Math.random()<Math.min(.8,.28+level*.04)){let options=[-1,1].filter(d=>y+d>=0&&y+d<N);let d=options[Math.floor(Math.random()*options.length)];y+=d;steps.push([x,y])}
 }
 route=steps.map(([x,y])=>index(x,y));endpoint=y;selected=index(0,2);
 all[index(0,2)]|=8;all[index(5,y)]|=2;
 for(let i=0;i<steps.length-1;i++){let d=direction(steps[i],steps[i+1]);all[route[i]]|=1<<d;all[route[i+1]]|=1<<((d+2)%4)}
 const deco=[3,6,9,12,5,10,7,11,13,14];
 for(let i=0;i<all.length;i++)if(!all[i])all[i]=deco[Math.floor(Math.random()*deco.length)];
 solvedMask=all.slice();masks=all.map(mask=>{let r=Math.floor(Math.random()*4);for(let n=0;n<r;n++)mask=rotateMask(mask);return mask});
 // Always start unsolved: disconnect the power port rather than relying on probability.
 let guard=0;while((masks[index(0,2)]&8)&&guard++<4)masks[index(0,2)]=rotateMask(masks[index(0,2)]);
 moves=0;time=0;hints=0;hintIndex=-1;phase='play';transition=0;lit=connectivity().open;
 $('level').textContent=String(level).padStart(2,'0');$('moves').textContent='0';$('clock').textContent='0:00';
 $('message').textContent='SECTOR '+level+' · ROTATE TILES TO SEND POWER RIGHT';
}
function start(){cancelAnimationFrame(raf);running=true;paused=false;level=1;score=0;$('score').textContent='0';$('start').hidden=true;pauseBtn.textContent='PAUSE';makeBoard();last=performance.now();raf=requestAnimationFrame(loop);tone(720)}
function rotate(id){if(!running||paused||phase!=='play'||id<0||id>=N*N)return false;selected=id;masks[id]=rotateMask(masks[id]);moves++;$('moves').textContent=String(moves);hintIndex=-1;tone(380+(id%N)*35);
 const state=connectivity();lit=state.open;
 if(state.win){phase='solved';transition=.95;const award=Math.max(85,340+level*36-moves*12-Math.floor(time)*3-hints*55);score+=award;$('score').textContent=String(score);if(score>best){best=score;$('best').textContent=String(best);try{localStorage.setItem(bestKey,String(best))}catch(e){}}$('message').textContent='POWER RESTORED! +'+award+' · NEXT SECTOR';tone(1000,.2)}
 else $('message').textContent='ENERGY FLOW · '+lit.size+' CONNECTED TILES';
 return true
}
function hint(){if(!running||paused||phase!=='play')return;let candidate=route.find(id=>masks[id]!==solvedMask[id]);if(candidate===undefined){candidate=route[Math.floor(Math.random()*route.length)]}hintIndex=candidate;selected=candidate;hints++;$('message').textContent='HINT: ROTATE THE GOLD-HIGHLIGHTED TILE · -55 BONUS';tone(730)}
function update(dt){if(!running||paused)return;if(phase==='play'){time+=dt;let sec=Math.floor(time);$('clock').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')}
 else if(phase==='solved'){transition-=dt;if(transition<=0){level++;makeBoard()}}}
function draw(now=0){
 let bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#15152f');bg.addColorStop(1,'#071b26');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 for(let i=0;i<15;i++){ctx.fillStyle='#9efff51c';ctx.fillRect((i*73+13)%W,(i*97+44)%H,2,2)}
 const pulse=(Math.sin(now/390)+1)*.5;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
   const id=index(x,y),px=OX+x*SIZE,py=OY+y*SIZE,cx=px+SIZE/2,cy=py+SIZE/2,energized=lit.has(id),isSelected=id===selected;
   ctx.fillStyle=energized?'#144e54':'#1b2e4a';ctx.beginPath();ctx.roundRect(px+2,py+2,SIZE-4,SIZE-4,8);ctx.fill();
   ctx.strokeStyle=id===hintIndex?'#ffe998':isSelected?'#ca9aff':energized?'#70ffdf':'#5c7e9e';ctx.lineWidth=id===hintIndex?4:isSelected?3:1;ctx.stroke();
   let m=masks[id]||0,col=energized?'#8effe5':'#759bbb';ctx.shadowColor=col;ctx.shadowBlur=energized?15+pulse*10:0;ctx.strokeStyle=col;ctx.lineWidth=11;ctx.lineCap='round';
   for(let d=0;d<4;d++)if(m&(1<<d)){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+DIR[d][0]*SIZE*.43,cy+DIR[d][1]*SIZE*.43);ctx.stroke()}
   ctx.shadowBlur=0;ctx.fillStyle=energized?'#ffe298':'#889cbb';ctx.beginPath();ctx.arc(cx,cy,7,0,Math.PI*2);ctx.fill();
   if(isSelected){ctx.font='900 10px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('▼',cx,py+15)}
 }
 let sourceY=OY+(2+.5)*SIZE,goalY=OY+(endpoint+.5)*SIZE;
 ctx.shadowColor='#80ffe5';ctx.shadowBlur=22;ctx.fillStyle='#88ffe5';ctx.beginPath();ctx.arc(OX-30,sourceY,16,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.shadowColor='#ffdc79';ctx.shadowBlur=connectivity().win?27:12;ctx.fillStyle='#ffe086';ctx.beginPath();ctx.arc(OX+N*SIZE+30,goalY,16,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe3a3';ctx.fillText('IN',OX-30,sourceY-25);ctx.fillText('OUT',OX+N*SIZE+30,goalY-25);
 ctx.fillStyle='#d8f9f3';ctx.font='900 12px system-ui';ctx.textAlign='left';ctx.fillText('CONNECTED '+lit.size+'/'+(N*N),24,22);ctx.textAlign='right';ctx.fillText('SECTOR '+level,W-24,22);
 ctx.fillStyle='#00000024';for(let y=0;y<H;y+=6)ctx.fillRect(0,y,W,2);
 if(!running||paused||phase==='solved'){ctx.fillStyle='#04091cbd';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.font='900 37px system-ui';ctx.fillStyle='#ffe39d';ctx.fillText(paused?'PAUSED':phase==='solved'?'POWER RESTORED':'CIRCUIT FLOW',W/2,211);ctx.font='700 16px system-ui';ctx.fillStyle='#9affeb';ctx.fillText(paused?'PRESS P OR RESUME':phase==='solved'?'NEXT SECTOR LOADING':'ROTATE PIPES TO CONNECT THE SOURCE',W/2,246)}
}
function loop(now){let dt=Math.min(.05,(now-last||16)/1000);last=now;update(dt);draw(now);if(running)raf=requestAnimationFrame(loop)}
const controls=$('controls');
function makeButton(name,action){let btn=document.createElement('button');btn.type='button';btn.textContent=name;btn.onclick=action;controls.append(btn);return btn}
makeButton('↻ ROTATE',()=>rotate(selected));makeButton('✦ HINT',hint);
const pauseBtn=makeButton('Ⅱ PAUSE',()=>{if(!running)return;paused=!paused;pauseBtn.textContent=paused?'▶ RESUME':'Ⅱ PAUSE';last=performance.now();$('message').textContent=paused?'PAUSED · PRESS P OR RESUME':'TRACE THE POWER FLOW'});
canvas.addEventListener('pointerdown',e=>{let r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;let col=Math.floor((x-OX)/SIZE),row=Math.floor((y-OY)/SIZE);if(col>=0&&col<N&&row>=0&&row<N)rotate(index(col,row))});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if(k==='p'&&!e.repeat){e.preventDefault();pauseBtn.click();return}if(k==='h'&&!e.repeat){e.preventDefault();hint();return}if((k===' '||k==='enter')&&!e.repeat){e.preventDefault();if(running)rotate(selected);else start();return}
 if(k.startsWith('arrow')||'wasd'.includes(k)&&k.length===1){const moves={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]},d=moves[k];if(!d||!running||paused)return;e.preventDefault();let x=selected%N,y=Math.floor(selected/N);selected=index(Math.max(0,Math.min(N-1,x+d[0])),Math.max(0,Math.min(N-1,y+d[1])))}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pauseBtn.click()});
$('start').onclick=start;draw();
})();