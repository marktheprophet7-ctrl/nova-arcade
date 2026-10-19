// NOVA ARCADE — full standalone-source migration check
// Runs after the separate game files and V14/V15 covers are installed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const games=path.join(root,'games'),art=path.join(root,'art');
if(!fs.existsSync(path.join(games,'circuit-flow.html'))||!fs.existsSync(art)){
  console.log('Standalone source migration not installed yet; current 30-mode site retained.');
  process.exit(0);
}
const pages=fs.readdirSync(games).filter(x=>x.endsWith('.html')&&x!=='play.html'&&x!=='arcade-collection.html');
const artwork=fs.readdirSync(art).filter(x=>x.endsWith('.webp'));
const errors=[];
if(pages.length!==30)errors.push('Expected 30 standalone games, found '+pages.length);
if(artwork.length!==30)errors.push('Expected 30 original cover artworks, found '+artwork.length);
for(const filename of pages){
  const slug=filename.slice(0,-5);
  if(!artwork.includes((slug==='memory'?'memory':slug)+'.webp'))errors.push('Missing cover: '+slug);
}
const dirs=[root,games];
for(const dir of dirs){
 for(const filename of fs.readdirSync(dir)){
  const file=path.join(dir,filename);
  if(!fs.statSync(file).isFile()||!filename.endsWith('.js'))continue;
  try{new Function(fs.readFileSync(file,'utf8'))}catch(e){errors.push(filename+': '+e.message)}
 }
}
for(const file of [path.join(root,'index.html'),...pages.map(name=>path.join(games,name))]){
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
  const url=match[1].split(/[?#]/)[0];
  if(!url||url.startsWith('#')||/^(?:https?:|data:|mailto:|\/\/)/.test(url))continue;
  const target=url.startsWith('/')?path.join(root,url):path.resolve(path.dirname(file),url);
  if(!fs.existsSync(target))errors.push(path.relative(root,file)+': missing '+url);
 }
}
if(errors.length){for(const e of errors)console.error('ERROR:',e);process.exit(1)}
console.log('PASS: 30 standalone games, 30 art covers, JavaScript syntax and local links.');
