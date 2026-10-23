#!/usr/bin/env node
// Deterministic 2D compositing of actual generated cat poses and the original 9.
// Imagegen creates artwork; this script supplies layout, timing, light and encoding.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';

const require=createRequire(import.meta.url);
function dep(name){try{return require(name);}catch{return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'',name));}}
const {createCanvas,loadImage,GlobalFonts}=dep('@napi-rs/canvas');
const sharp=dep('sharp');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const W=1920,H=720,FPS=30,DURATION=16;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const RENDER_HASH=sha(fs.readFileSync(fileURLToPath(import.meta.url)));
const json=(p,v)=>fs.writeFileSync(path.join(ROOT,p),JSON.stringify(v,null,2)+'\n');
for(const d of ['exports','posters','logos','reports'])fs.mkdirSync(path.join(ROOT,d),{recursive:true});
GlobalFonts.registerFromPath(path.join(ROOT,'fonts/9mew-brand-medium.ttf'),'NineMew');
const originalNine=await loadImage(path.join(ROOT,'source/brand/cat9-original.png'));
const wordmark=await loadImage(path.join(ROOT,'source/brand/cat-wordmark-v2.png'));
const assetsPath=path.join(ROOT,'runtime-assets.json');
const assets=fs.existsSync(assetsPath)?JSON.parse(fs.readFileSync(assetsPath)):null;
const atlases=new Map();
if(assets)for(const [id,a]of Object.entries(assets.actions))atlases.set(id,await loadImage(path.join(ROOT,a.sprite)));
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
const mix=(a,b,u)=>a+(b-a)*u;
const pi2=Math.PI*2;

async function alphaBounds(rel,threshold=24,padding=8){
  const {data,info}=await sharp(path.join(ROOT,rel)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,top=info.height,right=-1,bottom=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=threshold){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  left=Math.max(0,left-padding);top=Math.max(0,top-padding);right=Math.min(info.width-1,right+padding);bottom=Math.min(info.height-1,bottom+padding);
  return {x:left,y:top,w:right-left+1,h:bottom-top+1};
}
const nineCrop=await alphaBounds('source/brand/cat9-original.png');
const wordCrop=await alphaBounds('source/brand/cat-wordmark-v2.png');
const NINE={x:160,y:142,w:350,h:350*nineCrop.h/nineCrop.w};
const WORD={x:570,w:1190,h:1190*wordCrop.h/wordCrop.w};
WORD.y=NINE.y+NINE.h-WORD.h;

function radial(ctx,x,y,r,color,alpha){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+Math.round(alpha*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function makeBackground(dark){
  const c=createCanvas(W,H),ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,dark?'#101220':'#FFF9F3');g.addColorStop(.53,dark?'#19182D':'#FBF2F5');g.addColorStop(1,dark?'#171728':'#F1F2FA');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  radial(ctx,460,320,650,dark?'#6F405F':'#F7CFD6',dark?.18:.31);
  radial(ctx,1430,315,800,dark?'#485C93':'#B8C7EC',dark?.12:.15);
  radial(ctx,1110,615,620,dark?'#8F625D':'#E9C6AE',dark?.13:.18);
  radial(ctx,1050,250,750,dark?'#D9BBCB':'#FFFFFF',dark?.025:.7);
  // Extremely fine deterministic texture prevents broad gradient banding.
  const pixels=ctx.getImageData(0,0,W,H);let state=74237;
  for(let i=0;i<pixels.data.length;i+=4){state=(Math.imul(state,1664525)+1013904223)>>>0;const n=(state>>>28)/15-.5;for(let k=0;k<3;k++)pixels.data[i+k]=clamp(pixels.data[i+k]+n*1.3,0,255);}
  ctx.putImageData(pixels,0,0);return c;
}
const backgrounds={dark:makeBackground(true),light:makeBackground(false)};
function sparkle(ctx,x,y,size,alpha,dark){
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
  const g=ctx.createRadialGradient(0,0,0,0,0,size*3.7);g.addColorStop(0,dark?'#FFE7C54A':'#D99C8135');g.addColorStop(1,'#FFE7C500');ctx.fillStyle=g;ctx.fillRect(-size*4,-size*4,size*8,size*8);
  ctx.fillStyle=dark?'#FFE8C8':'#BA8A79';ctx.beginPath();ctx.moveTo(0,-size);ctx.bezierCurveTo(size*.17,-size*.16,size*.24,-size*.10,size,0);ctx.bezierCurveTo(size*.24,size*.1,size*.17,size*.16,0,size);ctx.bezierCurveTo(-size*.17,size*.16,-size*.24,size*.1,-size,0);ctx.bezierCurveTo(-size*.24,-size*.1,-size*.17,-size*.16,0,-size);ctx.fill();ctx.restore();
}
function atmosphere(ctx,t,dark,period=16){
  const q=t/period*pi2;
  for(let i=0;i<26;i++){
    const x=65+((i*433+119)%1780)+Math.sin(q+i*1.7)*3;
    const y=48+((i*163+41)%594)+Math.cos(q+i)*2;
    const alpha=(dark?.25:.15)+(.1+.08*Math.sin(q+i));
    if(i%7===0)sparkle(ctx,x,y,3+(i%3),alpha,dark);
    else{ctx.globalAlpha=alpha;ctx.fillStyle=dark?'#DEBED4':'#A67A96';ctx.beginPath();ctx.arc(x,y,i%3===0?1.5:1,0,pi2);ctx.fill();ctx.globalAlpha=1;}
  }
  ctx.save();ctx.lineWidth=.9;ctx.strokeStyle=dark?'#D6AEC81A':'#B388A51B';
  ctx.beginPath();ctx.moveTo(30,550);ctx.bezierCurveTo(350,690,1380,636,1880,208);ctx.stroke();
  ctx.strokeStyle=dark?'#B9CBE015':'#9EADD31C';ctx.beginPath();ctx.moveTo(110,603);ctx.bezierCurveTo(720,687,1630,520,1870,155);ctx.stroke();ctx.restore();
}
function groundGlow(ctx,x,y,w,opacity,dark){
  ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.scale(w/80,.16);
  const g=ctx.createRadialGradient(0,0,2,0,0,80);g.addColorStop(0,dark?'#07081391':'#67507340');g.addColorStop(1,'#07081300');ctx.fillStyle=g;ctx.fillRect(-80,-80,160,160);ctx.restore();
}
function drawNine(ctx,dark,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;
  if(dark)radial(ctx,NINE.x+NINE.w*.5,NINE.y+NINE.h*.51,270,'#E18BAB',.025);
  ctx.drawImage(originalNine,nineCrop.x,nineCrop.y,nineCrop.w,nineCrop.h,NINE.x,NINE.y,NINE.w,NINE.h);
  ctx.restore();
}
function typography(ctx,dark,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=dark?'#EBD4DF':'#765069';
  ctx.font='500 31px NineMew';ctx.textAlign='center';ctx.fillText('九',WORD.x+30,599);ctx.fillText('喵',WORD.x+WORD.w-30,599);
  ctx.font='500 21px NineMew';ctx.fillStyle=dark?'#BFA9BC':'#96798E';
  ctx.fillText('9mew.com',WORD.x+WORD.w/2,644);ctx.restore();
}
function drawWordmark(ctx,alpha,dark,shadows=true){
  if(alpha<=0)return;
  if(shadows)groundGlow(ctx,WORD.x+WORD.w*.52,NINE.y+NINE.h+3,570,alpha*.42,dark);
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(wordmark,wordCrop.x,wordCrop.y,wordCrop.w,wordCrop.h,WORD.x,WORD.y,WORD.w,WORD.h);ctx.restore();
}
function cat(ctx,id,timeMs,x,y,size,alpha,flip=false,dark=true,onceOnly=false){
  if(alpha<=.001)return null;
  const a=assets.actions[id],image=atlases.get(id),delays=a.durationsMs||Array(8).fill(110),length=delays.reduce((s,n)=>s+n,0);
  let time=onceOnly?clamp(timeMs,0,length-1):((timeMs%length)+length)%length,index=0;
  for(let i=0;i<delays.length;i++){if(time<delays[i]){index=i;break;}time-=delays[i];}
  const anchor=a.anchor||{x:.5,y:456/512};
  groundGlow(ctx,x,y+5,size*.33,alpha*.45,dark);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);
  ctx.drawImage(image,(index%4)*512,Math.floor(index/4)*512,512,512,-size*anchor.x,-size*anchor.y,size,size);ctx.restore();
  return {id,index,x,y,size,alpha,flip};
}
function cubic(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
const HOME={x:474,y:139};
function starPosition(t){
  if(t<1.2||t>=8)return {...HOME};
  const segments=[
    [1.2,3.1,HOME,{x:740,y:66},{x:810,y:400},{x:1050,y:329}],
    [3.1,4.5,{x:1050,y:329},{x:1210,y:470},{x:1540,y:220},{x:1588,y:297}],
    [4.5,6.2,{x:1588,y:297},{x:1510,y:95},{x:1040,y:120},{x:1180,y:234}],
    [6.2,8,{x:1180,y:234},{x:1305,y:27},{x:638,y:24},HOME]
  ];
  const s=segments.find(s=>t>=s[0]&&t<s[1]);return cubic(s[2],s[3],s[4],s[5],ease((t-s[0])/(s[1]-s[0])));
}
function drawStar(ctx,t,dark,ident=false){
  let p=ident?{x:HOME.x+Math.sin(t/6*pi2)*9,y:HOME.y+(1-Math.cos(t/6*pi2))*4}:starPosition(t);
  if(!ident&&t>1.2&&t<8){
    for(let i=1;i<=22;i++){const age=i*.018,s=starPosition(Math.max(1.2,t-age)),a=(1-i/23)*.36;ctx.fillStyle=dark?`rgba(246,190,211,${a})`:`rgba(183,116,146,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,Math.max(.5,3.5-i*.13),0,pi2);ctx.fill();}
  }
  sparkle(ctx,p.x,p.y,ident?10:10.5,1,dark);
  ctx.save();ctx.globalAlpha=.88;radial(ctx,p.x,p.y,26,dark?'#FFD9AC':'#F8D4B2',dark?.22:.15);ctx.restore();return p;
}
function render(ctx,t,theme,{ident=false,transparent=false}={}){
  const dark=theme==='dark';ctx.clearRect(0,0,W,H);
  if(!transparent){ctx.drawImage(backgrounds[theme],0,0);atmosphere(ctx,t,dark,ident?6:16);}
  const brandAlpha=ident?1:(1-ramp(t,.8,1.55)+ramp(t,6.9,7.8));
  drawNine(ctx,dark);drawWordmark(ctx,clamp(brandAlpha),dark,!transparent);typography(ctx,dark);
  const actors=[];
  if(!ident&&assets){
    const visible=ramp(t,1.2,1.75)*(1-ramp(t,6.7,7.45));
    const base=527;
    if(t<3.6){actors.push(cat(ctx,'chase-run',(t-1.5)*1000,mix(635,1000,ramp(t,1.5,3.6)),base,350,visible,false,dark));}
    else if(t<4.8){actors.push(cat(ctx,'chase-look-up',(t-3.6)*1180,1000,base,350,visible,false,dark,true));}
    else if(t<6.15){const u=clamp((t-4.8)/1.35);actors.push(cat(ctx,'chase-leap',u*1050,mix(1000,1120,ease(u)),base-Math.sin(Math.PI*u)*150,350,visible,false,dark,true));}
    else actors.push(cat(ctx,'chase-land',(t-6.15)*1000,1120,base,350,visible,false,dark,true));
    const orangeAlpha=ramp(t,2.1,2.5)*(1-ramp(t,6.6,7.2));
    const orangeU=1-Math.pow(1-clamp((t-2.15)/3.65),2);
    const orangeTiming=assets.actions['ginger-trot'].durationsMs;
    const orangeCycle=orangeTiming.reduce((a,b)=>a+b,0);
    const orangePhase=orangeU*orangeCycle*4+orangeTiming[0]+orangeTiming[1]*.5;
    actors.push(cat(ctx,'ginger-trot',orangePhase,mix(1090,1445,orangeU),540,319,orangeAlpha,false,dark));
    const ragAlpha=ramp(t,2.7,3.25)*(1-ramp(t,6.8,7.45));
    actors.push(cat(ctx,'ragdoll-star-paw',clamp((t-3.0)/3.8)*1800,1710,522,325,ragAlpha,true,dark,true));
  }
  const s=drawStar(ctx,t,dark,ident);
  // One small emblem connects the widely spaced Chinese name, retaining open space.
  sparkle(ctx,WORD.x+WORD.w/2,587,6,dark?.7:.55,dark);
  return {time:t,brandAlpha:clamp(brandAlpha),actors:actors.filter(Boolean),star:s};
}

function ffmpeg(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',maxBuffer:4*1024*1024});if(r.status!==0)throw Error('ffmpeg: '+r.stderr);}
async function encode(theme,kind){
  const ident=kind==='ident',duration=ident?6:DURATION,count=duration*FPS;
  const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),filename=`brand-${kind}-${theme}.mp4`;
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(ROOT,'exports',filename)],{stdio:['pipe','ignore','pipe']});
  let error='';child.stderr.on('data',d=>error+=d.toString());const complete=once(child,'close');
  for(let i=0;i<count;i++){
    // Exactly matching endpoints support an intentional loop without a blank frame.
    const time=i===count-1?0:i/FPS;const state=render(ctx,time,theme,{ident});
    if(kind==='film'&&[0,60,120,168,216,300,479].includes(i))fs.writeFileSync(path.join(ROOT,'reports',`film-${theme}-${String(i).padStart(3,'0')}.png`),canvas.toBuffer('image/png'));
    if(!child.stdin.write(canvas.data()))await once(child.stdin,'drain');
    if(i%120===0)console.log(`${kind}-${theme} ${i}/${count}`);
  }
  child.stdin.end();const[code]=await complete;if(code!==0)throw Error('MP4 encoding failed: '+error);
  const base=path.join(ROOT,'exports',`brand-${kind}-${theme}`);
  ffmpeg(['-i',base+'.mp4','-an','-c:v','libvpx-vp9','-b:v','0','-crf','30','-row-mt','1','-cpu-used','3',base+'.webm']);
  ffmpeg(['-i',base+'.mp4','-vf','fps=15,scale=1280:480:flags=lanczos','-c:v','libwebp_anim','-quality','87','-compression_level','4','-loop','0',base+'.webp']);
  return ['mp4','webm','webp'].map(ext=>`exports/brand-${kind}-${theme}.${ext}`);
}
async function stills(){
  for(const theme of ['dark','light']){
    const c=createCanvas(W,H),ctx=c.getContext('2d');render(ctx,0,theme,{ident:true});
    const png=c.toBuffer('image/png');fs.writeFileSync(path.join(ROOT,`posters/brand-film-${theme}.png`),png);
    await sharp(png).webp({quality:92,effort:5}).toFile(path.join(ROOT,`posters/brand-film-${theme}.webp`));
    const lc=createCanvas(2400,900),lctx=lc.getContext('2d');lctx.scale(1.25,1.25);render(lctx,0,theme,{ident:true,transparent:true});
    fs.writeFileSync(path.join(ROOT,`logos/brand-lockup-${theme}.png`),lc.toBuffer('image/png'));
    await sharp(lc.toBuffer('image/png')).webp({lossless:true,effort:5}).toFile(path.join(ROOT,`logos/brand-lockup-${theme}.webp`));
    const square=createCanvas(1080,1080),sq=square.getContext('2d');sq.drawImage(backgrounds[theme],0,0,1080,1080);
    const nw=320,nh=nw*nineCrop.h/nineCrop.w;sq.drawImage(originalNine,nineCrop.x,nineCrop.y,nineCrop.w,nineCrop.h,540-nw/2,88,nw,nh);
    const ww=960,wh=ww*wordCrop.h/wordCrop.w;sq.drawImage(wordmark,wordCrop.x,wordCrop.y,wordCrop.w,wordCrop.h,60,520,ww,wh);
    sq.font='500 35px NineMew';sq.fillStyle=theme==='dark'?'#EBD4DF':'#765069';sq.textAlign='center';sq.fillText('九',105,905);sq.fillText('喵',975,905);
    sparkle(sq,540,895,8,.8,theme==='dark');sq.font='500 25px NineMew';sq.fillStyle=theme==='dark'?'#BFA9BC':'#96798E';sq.fillText('9mew.com',540,984);
    fs.writeFileSync(path.join(ROOT,`posters/brand-square-${theme}.png`),square.toBuffer('image/png'));
  }
  for(const size of [64,192,512,1024]){
    const c=createCanvas(size,size),ctx=c.getContext('2d'),pad=size*.07;
    const scale=Math.min((size-pad*2)/nineCrop.w,(size-pad*2)/nineCrop.h),w=nineCrop.w*scale,h=nineCrop.h*scale;
    ctx.drawImage(originalNine,nineCrop.x,nineCrop.y,nineCrop.w,nineCrop.h,(size-w)/2,(size-h)/2,w,h);
    fs.writeFileSync(path.join(ROOT,`logos/cat9-${size}.png`),c.toBuffer('image/png'));
  }
  json('reports/layout.json',{canvas:{width:W,height:H},nineCrop,wordCrop,nineLayout:NINE,wordLayout:WORD,renderSourceSha256:RENDER_HASH,note:'The original 9 pixels are cropped for placement and scaled, never redrawn. All lettering is real font layout.'});
}
await stills();
if(process.argv.includes('--review-stills')){
  for(const theme of ['dark','light'])for(const t of [2.8,3.8,4.8,5.5,6.2,7.3]){const c=createCanvas(W,H);render(c.getContext('2d'),t,theme);fs.writeFileSync(path.join(ROOT,'reports',`review-${theme}-${t}.png`),c.toBuffer('image/png'));}
  console.log('Actual timeline review stills exported.');process.exit(0);
}
if(process.argv.includes('--stills-only')){console.log('Posters, transparent lockups and icons exported.');process.exit(0);}
if(!assets)throw Error('runtime-assets.json is required for motion rendering.');
const encoded=[];
const kinds=process.argv.includes('--film-only')?['film']:process.argv.includes('--ident-only')?['ident']:['film','ident'];
const themes=process.argv.includes('--dark-only')?['dark']:process.argv.includes('--light-only')?['light']:['dark','light'];
for(const theme of themes)for(const kind of kinds)encoded.push(...await encode(theme,kind));
const previousPath=path.join(ROOT,'reports/render-run.json');
const previous=fs.existsSync(previousPath)?JSON.parse(fs.readFileSync(previousPath)):{};
const old=previous.renderSourceSha256===RENDER_HASH?previous.rendered||[]:[];
json('reports/render-run.json',{status:'RENDERED_PENDING_DECODE_VALIDATION',renderSourceSha256:RENDER_HASH,runtimeAssetsSha256:sha(fs.readFileSync(assetsPath)),rendered:[...new Set([...old,...encoded])],filmDuration:16,identDuration:6,fps:FPS,resolution:[W,H],animationMethod:'Generated 2D key poses plus designed position paths. Cat wordmark is a static illustration; ident is decorative motion, not extra animal actions.'});
console.log('All requested media exported.');
