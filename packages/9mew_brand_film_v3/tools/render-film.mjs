#!/usr/bin/env node
// Imagegen supplies the scene and real kitten poses; this file supplies layout,
// frame timing, real text, independent star choreography and media encoding.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

const require=createRequire(import.meta.url);
function dep(name){try{return require(name);}catch{return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'',name));}}
const {createCanvas,loadImage,GlobalFonts}=dep('@napi-rs/canvas');
const sharp=dep('sharp');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const W=1920,H=720,FPS=30;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const RENDER_HASH=hash(fs.readFileSync(fileURLToPath(import.meta.url)));
const fileHash=p=>hash(fs.readFileSync(path.join(ROOT,p)));
const writeJSON=(p,o)=>fs.writeFileSync(path.join(ROOT,p),JSON.stringify(o,null,2)+'\n');
for(const d of ['exports','posters','logos','reports'])fs.mkdirSync(path.join(ROOT,d),{recursive:true});
GlobalFonts.registerFromPath(path.join(ROOT,'fonts/9mew-brand-medium.ttf'),'NineMew');
GlobalFonts.registerFromPath(path.join(ROOT,'fonts/Nunito-brand.ttf'),'MewRound');
const nine=await loadImage(path.join(ROOT,'source/brand/cat9-original.png'));
const stage=await loadImage(path.join(ROOT,'source/scene/star-garden-stage.png'));
const concept=await loadImage(path.join(ROOT,'source/scene/star-garden-ensemble.png'));
const assets=JSON.parse(fs.readFileSync(path.join(ROOT,'runtime-assets.json')));
const action=assets.actions['naimiao-star-greeting'];
const atlas=await loadImage(path.join(ROOT,action.sprite));
const contactAnchors=JSON.parse(fs.readFileSync(path.join(ROOT,'reports/action-contact-anchors.json')));
if(contactAnchors.frames.length!==action.frameCount)throw Error('Star anchors do not match pose count');
const INPUT_BINDINGS=Object.fromEntries(['runtime-assets.json','reports/action-contact-anchors.json','source/scene/star-garden-stage.png','source/scene/star-garden-ensemble.png','source/brand/cat9-original.png','fonts/9mew-brand-medium.ttf','fonts/Nunito-brand.ttf',action.sprite].map(p=>[p,fileHash(p)]));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=u=>{u=clamp(u);return u*u*(3-2*u);};
const mix=(a,b,u)=>a+(b-a)*u;
const TAU=Math.PI*2;

async function bounds(relative,threshold=24,padding=8){
  const{data,info}=await sharp(path.join(ROOT,relative)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,y0=info.height,x1=-1,y1=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=threshold){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  x0=Math.max(0,x0-padding);y0=Math.max(0,y0-padding);x1=Math.min(info.width-1,x1+padding);y1=Math.min(info.height-1,y1+padding);
  return{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
}
const nineCrop=await bounds('source/brand/cat9-original.png');
const SCENE={x:820,y:14,w:1040,h:1040*1024/1536};
const CAT={x:1325,y:552,size:600};
const BRAND={x:138,y:216,scale:1};
const COLORS={
  dark:{ink:'#F8EBF2',muted:'#B8A3B7',subtle:'#82748D',sakura:'#F3ABC6'},
  light:{ink:'#59425B',muted:'#927C90',subtle:'#A18B9B',sakura:'#DE8BA9'}
};

function glow(ctx,x,y,r,color,opacity){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+Math.round(opacity*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function background(theme){
  const dark=theme==='dark',c=createCanvas(W,H),x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,dark?'#111222':'#FFF9F3');g.addColorStop(.55,dark?'#1C1A30':'#FFF4F2');g.addColorStop(1,dark?'#23203A':'#F3F0FA');x.fillStyle=g;x.fillRect(0,0,W,H);
  glow(x,1285,390,690,dark?'#775B83':'#F5D8DE',dark?.19:.25);
  glow(x,1450,570,520,dark?'#A97B83':'#EDCFB7',dark?.08:.17);
  glow(x,370,300,620,dark?'#553B67':'#FFFFFF',dark?.09:.3);
  const d=x.getImageData(0,0,W,H);let s=73178;
  for(let i=0;i<d.data.length;i+=4){s=(Math.imul(s,1664525)+1013904223)>>>0;const v=((s>>>28)/15-.5)*1.3;for(let k=0;k<3;k++)d.data[i+k]=clamp(d.data[i+k]+v,0,255);}
  x.putImageData(d,0,0);return c;
}
const backgrounds={dark:background('dark'),light:background('light')};
function star(ctx,p,size,theme,alpha=1){
  const dark=theme==='dark';ctx.save();ctx.globalAlpha=alpha;ctx.translate(p.x,p.y);
  glow(ctx,0,0,size*4.7,dark?'#F5C69A':'#EAC6A1',dark?.19:.24);
  const g=ctx.createLinearGradient(-size,-size,size,size);g.addColorStop(0,'#FFEACA');g.addColorStop(.4,'#FFF7E3');g.addColorStop(.7,'#E7B16E');g.addColorStop(1,'#FFF1CC');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(size*.14,-size*.17,size*.22,-size*.08,size,0);ctx.bezierCurveTo(size*.22,size*.08,size*.14,size*.17,0,size);ctx.bezierCurveTo(-size*.14,size*.17,-size*.22,size*.08,-size,0);ctx.bezierCurveTo(-size*.22,-size*.08,-size*.14,-size*.17,0,-size);ctx.fill();
  ctx.strokeStyle=dark?'#FFE9CB':'#D9AE84';ctx.lineWidth=.65;ctx.stroke();ctx.fillStyle='#FFF7E3';ctx.beginPath();ctx.arc(0,0,size*.1,0,TAU);ctx.fill();ctx.restore();
}
function atmosphere(ctx,t,theme,period=16){
  const dark=theme==='dark',q=t/period*TAU;
  const points=[[99,121],[674,96],[720,592],[1824,119],[1758,654],[425,623],[1067,53],[190,615]];
  points.forEach(([x,y],i)=>{const alpha=(dark?.24:.16)+.09*Math.sin(q+i);const px=x+Math.sin(q+i*1.9)*2,py=y+Math.cos(q+i)*1.5;
    if(i===0||i===4)star(ctx,{x:px,y:py},3,theme,alpha);else{ctx.globalAlpha=alpha;ctx.fillStyle=dark?'#D6BAD0':'#B58DAB';ctx.beginPath();ctx.arc(px,py,1.25,0,TAU);ctx.fill();ctx.globalAlpha=1;}});
  ctx.save();ctx.strokeStyle=dark?'#BBA9D316':'#B59BBF1B';ctx.lineWidth=.75;
  ctx.beginPath();ctx.moveTo(60,596);ctx.bezierCurveTo(330,663,691,626,870,531);ctx.stroke();ctx.restore();
}
function drawNine(ctx,x,y,h){const w=h*nineCrop.w/nineCrop.h;ctx.drawImage(nine,nineCrop.x,nineCrop.y,nineCrop.w,nineCrop.h,x,y,w,h);return w;}
function wordmark(ctx,{x,y,scale=1,theme,bilingual=true,domain=false}){
  const c=COLORS[theme];ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  drawNine(ctx,0,0,151);
  ctx.font='160px MewRound';ctx.fillStyle=c.ink;ctx.textAlign='left';ctx.fillText('mew',152,112);
  if(bilingual){ctx.font='500 31px NineMew';ctx.fillStyle=c.ink;ctx.fillText('九喵',165,177);}
  if(domain){ctx.font='22px MewRound';ctx.fillStyle=c.muted;ctx.fillText('9mew.com',326,177);}
  ctx.restore();
}
function brandCopy(ctx,theme){
  const c=COLORS[theme];wordmark(ctx,{...BRAND,theme,bilingual:true});
  ctx.save();ctx.textAlign='left';ctx.fillStyle=c.muted;ctx.font='500 26px NineMew';ctx.fillText('小小星域，自在相伴。',BRAND.x+3,491);
  ctx.fillStyle=c.subtle;ctx.font='25px MewRound';ctx.fillText('9mew.com',BRAND.x+3,545);ctx.restore();
}
function activeFrame(t){
  if(t<2.1||t>=6.3)return 0;
  const keys=[[2.1,1],[2.55,2],[3.05,3],[3.65,4],[4.35,5],[4.85,6],[5.55,7]];
  let f=0;for(const [a,i]of keys)if(t>=a)f=i;return f;
}
function drawCat(ctx,index,cat=CAT){
  ctx.save();ctx.translate(cat.x,cat.y);const s=cat.size;
  const fw=action.frameWidth,fh=action.frameHeight,columns=action.columns;
  ctx.drawImage(atlas,(index%columns)*fw,Math.floor(index/columns)*fh,fw,fh,-s*action.anchor.x,-s*action.anchor.y,s,s);ctx.restore();
}
function worldNormalized(p){return{x:CAT.x+CAT.size*(p.x-action.anchor.x),y:CAT.y+CAT.size*(p.y-action.anchor.y)};}
const PAWS=contactAnchors.frames.map((f,index)=>{if(f.index!==index)throw Error('Star anchor order mismatch');return worldNormalized(f.recommendedStarCenterNormalized);});
const HOME={x:1124,y:169};
function bezier(a,b,c,d,u){const v=1-u;return{x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
function starPoint(t){
  if(t<1.05||t>=12.4)return HOME;
  const keys=[
    [1.05,2.05,HOME,{x:1108,y:225},{x:1167,y:305},PAWS[0]],
    [2.05,2.5,PAWS[0],{x:1190,y:325},{x:1170,y:313},PAWS[1]],
    [2.5,2.95,PAWS[1],{x:1155,y:300},{x:1129,y:270},PAWS[2]],
    [2.95,3.35,PAWS[2],{x:PAWS[2].x-20,y:PAWS[2].y+75},{x:PAWS[3].x-70,y:PAWS[3].y+12},PAWS[3]],
    [3.35,4.35,PAWS[3],PAWS[3],PAWS[4],PAWS[4]],
    [4.35,4.75,PAWS[4],PAWS[4],PAWS[5],PAWS[5]],
    [4.75,5.2,PAWS[5],{x:PAWS[5].x-12,y:PAWS[5].y-34},{x:PAWS[6].x+38,y:PAWS[6].y-5},PAWS[6]],
    [5.2,6.6,PAWS[6],{x:1137,y:123},{x:1403,y:78},{x:1599,y:153}],
    [6.6,8.05,{x:1599,y:153},{x:1752,y:210},{x:1692,y:515},{x:1468,y:559}],
    [8.05,9.05,{x:1468,y:559},{x:1300,y:594},{x:1085,y:545},{x:1005,y:425}],
    [9.05,10.65,{x:1005,y:425},{x:864,y:226},{x:550,y:104},{x:286,y:195}],
    [10.65,12.4,{x:286,y:195},{x:460,y:67},{x:1026,y:96},HOME]
  ];
  const s=keys.find(s=>t>=s[0]&&t<s[1]);return bezier(s[2],s[3],s[4],s[5],smooth((t-s[0])/(s[1]-s[0])));
}
function starTrail(ctx,t,theme){
  if(t>1.05&&t<12.4){for(let n=1;n<=15;n++){const p=starPoint(Math.max(1.05,t-n*.025));ctx.globalAlpha=(1-n/16)*.24;ctx.fillStyle=theme==='dark'?'#F4C49B':'#C19078';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,2.2-n*.1),0,TAU);ctx.fill();}ctx.globalAlpha=1;}
  const p=starPoint(t);star(ctx,p,11.8,theme);return p;
}
function garden(ctx,t,theme,{still=false,rect=SCENE,cat=CAT}={}){
  ctx.drawImage(stage,rect.x,rect.y,rect.w,rect.h);
  const frame=still?0:activeFrame(t);drawCat(ctx,frame,cat);
  // A small lower part of the original cloud shore remains in the foreground.
  // No character pixel, face or limb is procedurally redrawn.
  ctx.save();ctx.beginPath();ctx.rect(rect.x,cat.y+10,rect.w,H);ctx.clip();ctx.drawImage(stage,rect.x,rect.y,rect.w,rect.h);ctx.restore();
  return frame;
}
function render(ctx,t,theme,ident=false){
  ctx.clearRect(0,0,W,H);ctx.drawImage(backgrounds[theme],0,0);atmosphere(ctx,t,theme,ident?6:16);
  if(ident){
    const s=1.22,x=(W-516*s)/2,y=220;wordmark(ctx,{x,y,scale:s,theme,bilingual:true,domain:true});
    ctx.save();ctx.strokeStyle=theme==='dark'?'#D7AAC425':'#B891AB28';ctx.lineWidth=.85;ctx.beginPath();ctx.ellipse(960,355,455,193,-.10,0,TAU);ctx.stroke();ctx.restore();
    const q=t/6*TAU-Math.PI*.78,p={x:960+455*Math.cos(q)*Math.cos(-.10)-193*Math.sin(q)*Math.sin(-.10),y:355+455*Math.cos(q)*Math.sin(-.10)+193*Math.sin(q)*Math.cos(-.10)};
    star(ctx,p,10,theme);
    return{time:t,kind:'ident',star:p,characterMotion:false};
  }
  brandCopy(ctx,theme);const frame=garden(ctx,t,theme);const p=starTrail(ctx,t,theme);
  return{time:t,kind:'film',frame,star:p};
}

function run(args){return new Promise((resolve,reject)=>{const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:['ignore','ignore','pipe']});let err='';child.stderr.on('data',b=>err+=b);child.on('error',reject);child.on('close',n=>n===0?resolve():reject(Error(err||'FFmpeg failed')));});}
async function encode(theme,kind){
  const ident=kind==='ident',duration=ident?6:16,count=duration*FPS,base=path.join(ROOT,'exports',`brand-${kind}-${theme}`);
  const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',base+'.mp4'],{stdio:['pipe','ignore','pipe']});let err='';child.stderr.on('data',b=>err+=b);const done=once(child,'close');
  for(let i=0;i<count;i++){
    const t=i===count-1?0:i/FPS;render(ctx,t,theme,ident);
    if(!child.stdin.write(canvas.data()))await once(child.stdin,'drain');
    if(i%120===0)console.log(`${kind}-${theme} ${i}/${count}`);
  }
  child.stdin.end();const[code]=await done;if(code!==0)throw Error(err||'MP4 failed');
  await run(['-i',base+'.mp4','-an','-c:v','libvpx-vp9','-b:v','0','-crf','30','-row-mt','1','-cpu-used','3',base+'.webm']);
  await run(['-i',base+'.mp4','-vf','fps=15,scale=1280:480:flags=lanczos','-c:v','libwebp_anim','-quality','87','-compression_level','4','-loop','0',base+'.webp']);
  return['mp4','webm','webp'].map(ext=>`exports/brand-${kind}-${theme}.${ext}`);
}
async function stills(){
  for(const theme of ['dark','light']){
    for(const kind of ['film','ident']){
      const c=createCanvas(W,H);render(c.getContext('2d'),0,theme,kind==='ident');const b=c.toBuffer('image/png');fs.writeFileSync(path.join(ROOT,`posters/brand-${kind}-${theme}.png`),b);
      await sharp(b).webp({quality:92,effort:5}).toFile(path.join(ROOT,`posters/brand-${kind}-${theme}.webp`));
    }
    for(const bilingual of [false,true]){
      const c=createCanvas(1800,bilingual?720:600),ctx=c.getContext('2d');wordmark(ctx,{x:126,y:bilingual?100:80,scale:3,theme,bilingual});const name=bilingual?'brand-lockup':'wordmark',b=c.toBuffer('image/png');fs.writeFileSync(path.join(ROOT,`logos/${name}-${theme}.png`),b);await sharp(b).webp({lossless:true,effort:5}).toFile(path.join(ROOT,`logos/${name}-${theme}.webp`));
    }
    const sq=createCanvas(1080,1080),c=sq.getContext('2d');c.drawImage(backgrounds[theme],0,0,1080,1080);wordmark(c,{x:285,y:65,scale:1,theme,bilingual:true,domain:true});
    // The ensemble is original full key art, used here as a static square poster.
    c.drawImage(concept,12,326,1056,704);fs.writeFileSync(path.join(ROOT,`posters/brand-square-${theme}.png`),sq.toBuffer('image/png'));
  }
  for(const n of [64,192,512,1024]){const c=createCanvas(n,n),x=c.getContext('2d');const h=n*.86,w=h*nineCrop.w/nineCrop.h;drawNine(x,(n-w)/2,(n-h)/2,h);fs.writeFileSync(path.join(ROOT,`logos/cat9-${n}.png`),c.toBuffer('image/png'));}
  writeJSON('reports/layout.json',{canvas:{width:W,height:H},brand:BRAND,scene:SCENE,cat:CAT,nineCrop,renderSourceSha256:RENDER_HASH,
    typography:{wordmark:'Nunito 650, actual text mew',chinese:'Noto Sans SC 500, actual text 九喵',tagline:'小小星域，自在相伴。'},
    staticCompanionCats:2,newSourceActions:1,newSourcePoses:8,ident:'Standalone cat9 plus actual mew/九喵 wordmark with ambient orbit, no kitten performance',
    inputBindings:INPUT_BINDINGS,sourceHashes:{stage:fileHash('source/scene/star-garden-stage.png'),concept:fileHash('source/scene/star-garden-ensemble.png'),originalNine:fileHash('source/brand/cat9-original.png'),catalog:fileHash('runtime-assets.json')}});
}

await stills();
if(process.argv.includes('--review-stills')){
  const poses=[];
  for(const theme of ['dark','light'])for(const t of [0,2.3,2.7,3.4,3.9,4.6,5.1,5.8,7.3,9.8,11,15.9]){const c=createCanvas(W,H),state=render(c.getContext('2d'),t,theme);const p=`reports/review-${theme}-${t}.png`;fs.writeFileSync(path.join(ROOT,p),c.toBuffer('image/png'));poses.push({path:p,...state});}
  writeJSON('reports/review-timeline.json',{renderSourceSha256:RENDER_HASH,poses});console.log('Actual composition review stills exported.');process.exit(0);
}
if(process.argv.includes('--stills-only')){console.log('Posters, wordmarks and icons exported.');process.exit(0);}
const kinds=process.argv.includes('--film-only')?['film']:process.argv.includes('--ident-only')?['ident']:['film','ident'];
const themes=process.argv.includes('--dark-only')?['dark']:process.argv.includes('--light-only')?['light']:['dark','light'];const rendered=[];
for(const theme of themes)for(const kind of kinds)rendered.push(...await encode(theme,kind));
const oldPath=path.join(ROOT,'reports/render-run.json');const previous=fs.existsSync(oldPath)?JSON.parse(fs.readFileSync(oldPath)):{};
const prior=previous.renderSourceSha256===RENDER_HASH&&JSON.stringify(previous.inputBindings)===JSON.stringify(INPUT_BINDINGS)?previous.rendered||[]:[];
writeJSON('reports/render-run.json',{status:'RENDERED_PENDING_DECODE_VALIDATION',renderSourceSha256:RENDER_HASH,runtimeAssetsSha256:fileHash('runtime-assets.json'),inputBindings:INPUT_BINDINGS,rendered:[...new Set([...prior,...rendered])],filmDuration:16,identDuration:6,fps:FPS,resolution:[W,H],animationMethod:'One new eight-pose kitten performance plus independent star choreography. Two background companions remain static. Ident uses only the simple brand mark and ambient graphics.'});
console.log('All requested media exported.');
