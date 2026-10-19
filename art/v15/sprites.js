/* NOVA ARCADE V15 — sprite renderer. Images are original SVG files in art/v15/sprites. */
(function(){
"use strict";
const core=["void-runner","neon-snake","brick-blitz","memory-matrix","asteroid-assault","number-merge","target-rush","reaction-lab","meteor-dodge","color-match","neon-rally","orbit-defender","skyline-hop"],wing=["polarity-shift","lane-blazer","quantum-drift","hex-mines","spectrum-sequence","tower-stack","neon-maze","circuit-flow","beat-forge","comet-pinball","word-reactor","laser-mirrors"];
const bank=new Map(),base=location.pathname.includes("/games/")?"../":"";
function imgFor(slug){if(!bank.has(slug)){let im=new Image();im.decoding="async";im.src=base+"art/v15/sprites/"+slug+".svg";bank.set(slug,im)}return bank.get(slug)}
function paint(ctx,slug,cx,cy,size,alpha=1){if(!ctx||!Number.isFinite(cx)||!Number.isFinite(cy))return;const im=imgFor(slug);if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.globalAlpha=alpha;ctx.shadowBlur=15;ctx.shadowColor="#92f8ff88";ctx.drawImage(im,cx-size/2,cy-size/2,size,size);ctx.restore()}
function renderCore(ctx,m,p,s,t){if(m<0||m>=core.length||!s||!p)return;const slug=core[m];let loc;
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
}
function decorateStandalone(){const slug=location.pathname.split("/").pop().replace(/\.html$/,"");if(!slug||document.querySelector(".nova-v15-emblem"))return;const img=document.createElement("img");img.src=base+"art/v15/sprites/"+slug+".svg";img.className="nova-v15-emblem";img.alt="";img.loading="eager";const heading=document.querySelector("main h1");if(heading){heading.before(img);document.body.classList.add("nova-v15-standalone")}const canvas=document.querySelector("canvas");if(canvas&&canvas.parentElement){canvas.classList.add("nova-v15-canvas")}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",decorateStandalone);else decorateStandalone();
window.NovaSprites={renderCore,renderWing,paint};
})();