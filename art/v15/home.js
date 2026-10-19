/* NOVA ARCADE V15 — artwork in the actual site UI. */
(function(){
"use strict";
const roots=["void-runner","neon-snake","brick-blitz","memory-matrix","asteroid-assault","number-merge","target-rush","reaction-lab","meteor-dodge","color-match","neon-rally","orbit-defender","skyline-hop"];
function slugFor(a){const href=a.getAttribute("href")||"";const n=href.match(/[?&]game=(\d+)\b/);if(href.includes("games/play.html")&&n)return roots[+n[1]]||null;const code=href.match(/[?&]game=([a-z\-]+)/);if(code)return code[1];const p=href.match(/games\/([a-z\-]+)\.html/);return p?.[1]||null}
function applyCovers(root=document){root.querySelectorAll("a.game[href]").forEach(a=>{const s=slugFor(a),art=a.querySelector(".art");if(!s||!art||art.querySelector(".nova-cover"))return;const img=document.createElement("img");img.className="nova-cover";img.src="art/v15/covers/"+s+".svg";img.alt="";img.loading="lazy";img.decoding="async";img.onerror=()=>{img.remove();art.classList.remove("nova-with-cover")};art.appendChild(img);art.classList.add("nova-with-cover");a.dataset.sprite=s})}
function addIcon(target,icon,prepend=true){if(!target||target.querySelector(".nova-ui-sprite"))return;let img=document.createElement("img");img.className="nova-ui-sprite";img.src="art/v15/ui/"+icon+".svg";img.alt="";img.loading="lazy";if(prepend)target.prepend(img);else target.append(img)}
function init(){applyCovers();const grid=document.getElementById("grid");if(grid){new MutationObserver(()=>applyCovers(grid)).observe(grid,{childList:true})}
addIcon(document.querySelector(".hero .eyebrow"),"coin");addIcon(document.querySelector(".record-heading .eyebrow"),"trophy");addIcon(document.querySelector(".spot .eyebrow"),"cabinet");
const c=document.querySelector('.controls #surprise');if(c)addIcon(c,"star");
const section=document.getElementById("records");if(section)section.classList.add("nova-v15-hall");
document.querySelectorAll(".chip[data-cat]").forEach(chip=>{let icon=chip.dataset.cat==="action"?"bolt":chip.dataset.cat==="puzzle"?"joystick":chip.dataset.cat==="reflex"?"star":"coin";addIcon(chip,icon)});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();