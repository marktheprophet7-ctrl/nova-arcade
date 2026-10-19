import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const exists = (p) => fs.existsSync(path.join(root,p));
const html=read('index.html');
const errors=[];

const cards=[...html.matchAll(/<a\b[^>]*class="game"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(cards.length,30,'Homepage should link to all 30 machines');
for(const href of cards){const loc=href.split(/[?#]/)[0];if(!exists(loc))errors.push('Broken homepage route: '+href)}
for(const page of ['index.html','games/play.html','games/arcade-collection.html']){
  if(!exists(page)){errors.push('Missing required page: '+page);continue}
  const file=read(page);
  for(const [,js] of file.matchAll(/<script>([\s\S]*?)<\/script>/g)){
    try{new Function(js)}catch(e){errors.push(page+': inline JS syntax error '+e.message)}
  }
}
for(const game of ['laser-mirrors','beat-forge','comet-pinball']){
 const htmlFile='games/'+game+'.html',scriptFile='games/'+game+'.js',coverFile='art/'+game+'.webp';
 for(const file of [htmlFile,scriptFile,coverFile])if(!exists(file))errors.push('Missing migrated V15 source: '+file);
 if(!exists(htmlFile)||!exists(scriptFile)||!exists(coverFile))continue;
 const page=read(htmlFile);
 if(!page.includes('src="'+game+'.js"'))errors.push('Standalone page missing engine script: '+game);
 if(!html.includes('href="games/'+game+'.html"'))errors.push('Homepage missing migrated link: '+game);
 if(!html.includes('src="art/'+game+'.webp"'))errors.push('Homepage missing real artwork: '+game);
 try{new Function(read(scriptFile))}catch(e){errors.push(scriptFile+': '+e.message)}
 const cover=fs.readFileSync(path.join(root,coverFile));
 if(cover.length<100||cover.toString('ascii',0,4)!=='RIFF'||cover.toString('ascii',8,12)!=='WEBP')errors.push('Invalid WebP artwork: '+coverFile);
}
for(const file of ['games/machine.css','games/machine-tools.js'])if(!exists(file))errors.push('Missing shared standalone asset: '+file);
try{new Function(read('games/machine-tools.js'))}catch(e){errors.push('machine-tools.js '+e.message)}
if(errors.length){console.error(errors.map(e=>'✘ '+e).join('\n'));process.exit(1)}
console.log('✔ 30 working homepage routes');
console.log('✔ Inline game scripts parse');
console.log('✔ 3 V15 standalone engines, pages and matching WebP covers');
console.log('✔ Retro machine styles and tools');
