/* NOVA ARCADE V15 — sprite renderer. Images are original SVG files in art/v15/sprites. */
(function(){
"use strict";
const core=["void-runner","neon-snake","brick-blitz","memory-matrix","asteroid-assault","number-merge","target-rush","reaction-lab","meteor-dodge","color-match","neon-rally","orbit-defender","skyline-hop"],wing=["polarity-shift","lane-blazer","quantum-drift","hex-mines","spectrum-sequence","tower-stack","neon-maze","circuit-flow","beat-forge","comet-pinball","word-reactor","laser-mirrors"];
const bank=new Map(),base=location.pathname.includes("/games/")?"../":"";
function imgFor(slug){if(!bank.has(slug)){let im=new Image();im.decoding="async";im.src=base+"art/v15/sprites/"+slug+".svg";bank.set(slug,im)}return bank.get(slug)}
function paint(ctx,slug,cx,cy,size,alpha=1){if(!ctx||!Number.isFinite(cx)||!Number.isFinite(cy))return;const im=imgFor(slug);if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.globalAlpha=alpha;ctx.shadowBlur=15;ctx.shadowColor="#92f8ff88";ctx.drawImage(im,cx-size/2,cy-size/2,size,size);ctx.restore()}
function renderCore(ctx,m,p,s,t,entities=[]){if(m<0||m>=core.length||!s||!p)return;const slug=core[m];let loc;
switch(m){
case 0:loc=[p.x,347,56,1];break;
case 1:if(s.snake&&s.snake.length){let h=s.snake[0];loc=[79+h.x*24,30+h.y*24,34,.98]}break;
case 2:loc=[77,51,68,.75];break;
case 3:loc=[76,54,72,.78];break;
case 4:loc=[p.x,350,58,1];break;
case 5:loc=[80,56,74,.65];break;
case 6:if(s.target)loc=[s.target.x,s.target.y,Math.min(88,s.target.r*2.5),.8];break;
case 7:loc=[74,62,70,.72];break;
case 8:loc=[p.x,350,57,1];break;
case 9:loc=[73,54,64,.75];break;
case 10:loc=[75,p.y,60,.88];break;
case 11:loc=[360,220,95,.85];break;
case 12:loc=[p.x,p.y,60,1];break;
}
if(loc)paint(ctx,slug,...loc);
const hazard=slug+"-hazard",pickup=slug+"-pickup";
if([0,4,8,11].includes(m))entities.forEach(o=>paint(ctx,hazard,o.x,o.y,Math.max(24,Math.min(76,(o.r||22)*2.2)),.76));
if(m===1&&s.food)paint(ctx,pickup,80+s.food[0]*24,32+s.food[1]*24,36,.94);
if(m===2&&s.bricks)s.bricks.filter(b=>b.live).forEach(b=>paint(ctx,hazard,b.x+27,b.y+10,27,.57));
if(m===3&&s.matched)s.matched.forEach(i=>paint(ctx,pickup,172+(i%4)*116,74+Math.floor(i/4)*100,25,.6));
if(m===6&&s.target)paint(ctx,pickup,s.target.x,s.target.y,54,.64);
if(m===9&&Number.isInteger(s.answer))paint(ctx,pickup,180+s.answer*120,345,46,.66);
if(m===10&&s.ball)paint(ctx,pickup,s.ball.x,s.ball.y,31,.8);
if(m===12)entities.forEach(o=>paint(ctx,hazard,o.x,357,Math.max(32,o.w||45),.85));
}
function renderWing(ctx,m,s,t){if(m<0||m>=wing.length||!s||!s.level)return;let loc=null,slug=wing[m];switch(m){
case 0:loc=[170,s.flip?90:395,62,.95];break;
case 1:loc=[185+(s.lane||0)*225,402,66,.97];break;
case 2:loc=[s.pos||400,395,77,.96];break;
case 3:loc=[82,90,75,.75];break;
case 4:loc=[75,94,84,.65];break;
case 5:loc=[90,90,82,.68];break;
case 6:if(s.p)loc=[77+s.p.x*36,22+s.p.y*36,35,.96];break;
case 7:loc=[77,235,75,.8];break;
case 8:loc=[73,70,71,.78];break;
case 9:if(s.ball)loc=[s.ball.x,s.ball.y,42,.86];break;
case 10:loc=[74,348,91,.8];break;
case 11:if(s.goal)loc=[152+s.goal.x*67,72+s.goal.y*67,62,.86];break;
}
if(loc)paint(ctx,slug,...loc);
const hazard=slug+"-hazard",pickup=slug+"-pickup";
if(m===0&&s.items)s.items.forEach(o=>paint(ctx,hazard,o.x,o.y,48,.84));
if(m===1&&s.items)s.items.forEach(o=>paint(ctx,o.good?pickup:hazard,185+o.lane*225,o.y,39,.8));
if(m===2&&Number.isFinite(s.middle))paint(ctx,hazard,s.middle+145,395,42,.7);
if(m===3&&s.mines&&s.open)for(const i of s.mines)if(s.open.has(i))paint(ctx,hazard,187+i%8*60,39+Math.floor(i/8)*55,43,.8);
if(m===4&&s.lit>=0)paint(ctx,pickup,275+s.lit%2*245,140+Math.floor(s.lit/2)*180,84,.57);
if(m===5&&s.moving)paint(ctx,pickup,s.moving.x+s.moving.w/2,415-s.blocks.length*22,43,.65);
if(m===6&&s.exit)paint(ctx,pickup,77+s.exit.x*36,22+s.exit.y*36,43,.91);
if(m===7)paint(ctx,pickup,192,235,58,.7);
if(m===8&&s.items)s.items.forEach(o=>paint(ctx,pickup,175+o.lane*148,o.y,31,.82));
if(m===9)[[285,150],[500,150],[395,250]].forEach(p=>paint(ctx,hazard,p[0],p[1],48,.65));
if(m===10&&s.items)s.items.forEach(o=>paint(ctx,hazard,o.x+77,o.y-5,33,.65));
if(m===11&&s.goal)paint(ctx,pickup,152+s.goal.x*67,72+s.goal.y*67,60,.76);
}
function decorateStandalone(){const slug=location.pathname.split("/").pop().replace(/\.html$/,"");if(!slug||document.querySelector(".nova-v15-emblem"))return;const img=document.createElement("img");img.src=base+"art/v15/sprites/"+slug+".svg";img.className="nova-v15-emblem";img.alt="";img.loading="eager";const heading=document.querySelector("main h1");if(heading){heading.before(img);document.body.classList.add("nova-v15-standalone")}const canvas=document.querySelector("canvas");if(canvas&&canvas.parentElement){canvas.classList.add("nova-v15-canvas");const frame=canvas.closest(".frame");if(frame&&!frame.querySelector(".nova-v15-stage-props")){const tray=document.createElement("div");tray.className="nova-v15-stage-props";for(const [role,label] of [["hazard","DANGER"],["pickup","POWER"]]){const tile=document.createElement("span");tile.className="nova-v15-stage-item";const art=document.createElement("img");art.src=base+"art/v15/sprites/"+slug+"-"+role+".svg";art.alt="";const caption=document.createElement("small");caption.textContent=label;tile.append(art,caption);tray.appendChild(tile)}canvas.before(tray)}}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",decorateStandalone);else decorateStandalone();
window.NovaSprites={renderCore,renderWing,paint};
})();