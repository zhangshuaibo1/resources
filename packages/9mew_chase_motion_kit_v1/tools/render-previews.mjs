#!/usr/bin/env node
// Render the actual webpage route sampler with the same generated sprite atlases.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {sampleChase,CHASE_DURATION_MS} from '../web/chase-scene.js';
const require=createRequire(import.meta.url);
function dependency(name){try{return require(name);}catch{return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'',name));}}
const {createCanvas,loadImage,GlobalFonts}=dependency('@napi-rs/canvas');
const sharp=dependency('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'exports');fs.mkdirSync(output,{recursive:true});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const runtimeHash=hash(fs.readFileSync(path.join(root,'web/chase-scene.js')));
const atlas=new Map();
for(const action of Object.values(catalog.actions))atlas.set(action.id,await loadImage(path.join(root,action.sprite)));
GlobalFonts.registerFromPath(path.join(root,'fonts/9mew-chase-medium.ttf'),'NineMew');
const W=1280,H=720,FPS=24,COUNT=Math.round(CHASE_DURATION_MS/1000*FPS);

function background(ctx,w,h,dark){
  const grad=ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,dark?'#111425':'#FFFAF6');grad.addColorStop(1,dark?'#23203C':'#F5EDF6');
  ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(w*.45,h*.5,1,w*.45,h*.5,w*.62);
  glow.addColorStop(0,dark?'#8d658514':'#ffffff9c');glow.addColorStop(1,'#ffffff00');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  // Quiet fixed points, not flashing particle effects or drawn character parts.
  for(let i=0;i<32;i++){
    const x=((i*317+71)%997)/997*w,y=((i*181+67)%631)/631*h;
    const r=(i%4===0?1.6:.85);ctx.fillStyle=dark?'#d8bbdb35':'#ae739326';
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
}
function drawSprite(ctx,s){
  if(s.opacity<=.001)return;
  const a=catalog.actions[s.action],image=atlas.get(s.action);
  ctx.save();ctx.globalAlpha=s.opacity;ctx.translate(s.x,s.y);
  if(s.rotation)ctx.rotate(s.rotation);if(s.flip)ctx.scale(-1,1);
  const anchorX=s.flip?1-s.anchorX:s.anchorX;
  ctx.drawImage(image,(s.frame%a.columns)*a.frameWidth,Math.floor(s.frame/a.columns)*a.frameHeight,a.frameWidth,a.frameHeight,
    -s.width*anchorX,-s.height*s.anchorY,s.width,s.height);ctx.restore();
}
function render(ctx,time,dark){
  background(ctx,W,H,dark);
  const s=sampleChase(time,W,H,{catalog,catSize:224,margin:32});
  drawSprite(ctx,s.mouse);drawSprite(ctx,s.butterfly);drawSprite(ctx,s.cat);
  return s;
}
function ffmpeg(args){
  const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8',maxBuffer:4*1024*1024});
  if(r.status!==0)throw Error('ffmpeg failed: '+r.stderr);
}
const overviewOnly=process.argv.includes('--overview-only');
const files=overviewOnly?JSON.parse(fs.readFileSync(path.join(root,'reports/preview-validation.json'),'utf8')).files:[];
for(const theme of (overviewOnly?[]:['light','dark'])){
  const dark=theme==='dark',canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
  const bg=createCanvas(W,H),bgctx=bg.getContext('2d');background(bgctx,W,H,dark);
  const dest=path.join(output,`route-${theme}.mp4`);
  const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba',
    '-video_size',`${W}x${H}`,'-framerate',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','medium',
    '-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',dest],{stdio:['pipe','ignore','pipe']});
  let error='';child.stderr.on('data',d=>error+=d.toString());
  const completed=once(child,'close');
  for(let i=0;i<COUNT;i++){
    ctx.drawImage(bg,0,0);
    const s=sampleChase(i*1000/FPS,W,H,{catalog,catSize:224,margin:32});
    drawSprite(ctx,s.mouse);drawSprite(ctx,s.butterfly);drawSprite(ctx,s.cat);
    if([80,216,340,474,568].includes(i))fs.writeFileSync(path.join(output,`route-${theme}-${String(i).padStart(3,'0')}.png`),canvas.toBuffer('image/png'));
    if(!child.stdin.write(canvas.data()))await once(child.stdin,'drain');
    if(i%144===0)console.log(`${theme}: ${i}/${COUNT} timeline frames`);
  }
  child.stdin.end();const [code]=await completed;if(code!==0)throw Error('Movie encoding failed: '+error);
  ffmpeg(['-i',dest,'-filter_complex','fps=12,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
    '-r','12','-fps_mode','cfr','-gifflags','-offsetting-transdiff','-loop','0',path.join(output,`route-${theme}.gif`)]);
  ffmpeg(['-i',dest,'-vf','fps=16,scale=960:-1:flags=lanczos','-c:v','libwebp_anim','-quality','88','-compression_level','4','-loop','0',
    path.join(output,`route-${theme}.webp`)]);
  for(const ext of ['mp4','gif','webp']){
    const p=path.join(output,`route-${theme}.${ext}`),record={file:path.relative(root,p),bytes:fs.statSync(p).size,sha256:hash(fs.readFileSync(p)),theme};
    if(ext==='mp4'){
      const probe=spawnSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames:format=duration','-of','json',p],{encoding:'utf8'});
      if(probe.status!==0)throw Error('Video probe failed');const info=JSON.parse(probe.stdout),v=info.streams[0];
      if(v.width!==W||v.height!==H||Number(v.nb_read_frames)!==COUNT||Math.abs(Number(info.format.duration)-27)>.1)throw Error('Movie facts mismatch');
      Object.assign(record,{width:W,height:H,frames:COUNT,fps:FPS,durationMs:27000,codec:v.codec_name,audio:false,decode:'all_frames_counted'});
    }else{
      const m=await sharp(p,{animated:true,limitInputPixels:false}).metadata();
      Object.assign(record,{width:m.width,height:m.pageHeight,frames:m.pages,durationMs:m.delay.reduce((x,y)=>x+y,0)});
      if(m.pages<2||Math.abs(record.durationMs-27000)>150)throw Error('Animated preview duration mismatch');
      const decoded=await sharp(p,{animated:true,limitInputPixels:false}).ensureAlpha().raw().toBuffer();
      if(decoded.length!==m.width*m.pageHeight*m.pages*4)throw Error('Animated preview decode count mismatch');
      record.decode='all_frames_decoded';
    }
    files.push(record);
  }
  console.log(theme+': MP4, GIF and WebP exported');
}

// Contact overview: genuine selected poses with clear action labels.
const ov=createCanvas(1600,1050),ctx=ov.getContext('2d');background(ctx,1600,1050,false);
ctx.fillStyle='#9E5877';ctx.font='500 18px NineMew';ctx.fillText('9MEW  /  PLAYFUL MOMENTS',54,55);
ctx.fillStyle='#34263A';ctx.font='700 44px NineMew';ctx.fillText('奶喵的追逐小冒险',52,114);
ctx.fillStyle='#8E7484';ctx.font='400 20px NineMew';ctx.fillText('追鼠奔跑 · 逐蝶轻跃 · 回到身边',54,154);
const ids=['chase-run','chase-look-up','chase-leap','chase-float','chase-land','rest','mouse-run','butterfly-flutter'];
const poses=[3,4,3,3,3,3,3,4];
for(let i=0;i<ids.length;i++){
  const a=catalog.actions[ids[i]],x=44+i%4*384,y=186+Math.floor(i/4)*410;
  ctx.fillStyle='#ffffffae';ctx.beginPath();ctx.roundRect(x,y,360,384,24);ctx.fill();
  ctx.strokeStyle='#ECDCE6';ctx.lineWidth=1;ctx.stroke();
  const s=300,frame=poses[i];ctx.drawImage(atlas.get(a.id),(frame%4)*a.frameWidth,Math.floor(frame/4)*a.frameHeight,a.frameWidth,a.frameHeight,x+30,y+14,s,s);
  ctx.fillStyle='#614855';ctx.font='500 23px NineMew';ctx.textAlign='center';ctx.fillText(a.label,x+180,y+345);
  ctx.fillStyle='#A28D97';ctx.font='400 13px NineMew';ctx.fillText(a.id==='rest'?'落地姿态复用':'8 个绘制姿态',x+180,y+369);ctx.textAlign='left';
}
const overview=path.join(output,'overview.png');fs.writeFileSync(overview,ov.toBuffer('image/png'));
if(hash(fs.readFileSync(path.join(root,'web/chase-scene.js')))!==runtimeHash)throw Error('Route sampler changed during export; rerender required');
fs.writeFileSync(path.join(root,'reports/preview-validation.json'),JSON.stringify({status:'PREVIEW_ENCODING_PASSED',
  catalogSha256:hash(fs.readFileSync(path.join(root,'catalog.json'))),runtimeSha256:runtimeHash,
  note:'Scene positions and action frames rendered from the exact live webpage sampler; 24fps motion placement does not mean 24 independently drawn poses per second.',
  sourceSequenceCount:7,newSourcePoses:56,reusedRest:true,files},null,2)+'\n');
console.log('Overview and preview facts saved');
