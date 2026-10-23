#!/usr/bin/env node
'use strict';
// Presentation assembly only: uses already generated and validated character frames.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
const sharp=require('sharp');
const root=__dirname,catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const font=process.env.PET_PREVIEW_FONT || path.join(root,'fonts','9mew-actions.ttf');
if(!GlobalFonts.registerFromPath(font,'NineMew'))throw Error('Preview font unavailable.');
const out=path.join(root,'previews');fs.mkdirSync(out,{recursive:true});
const W=840,H=650,FPS=12,COUNT=72;
const groups=[
 {id:'movement-light',theme:'light',title:'跳跃、移动与玩耍',subtitle:'MOVE & PLAY',ids:['jump','walk-right','run-right','pounce','stretch','roll']},
 {id:'emotions-dark',theme:'dark',title:'奶喵的喜怒哀乐',subtitle:'A LITTLE WORLD OF FEELINGS',ids:['happy','angry','sad','surprised','excited','nuzzle']},
 {id:'daily-light',theme:'light',title:'陪伴你的每一天',subtitle:'SMALL MOMENTS, SOFT COMPANY',ids:['blink','wave','listen','groom','knead','sleep']},
];
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function sample(action,t){const duration=action.frames.reduce((n,f)=>n+f.durationMs,0);const cycle=duration+(action.playback==='once'?800:0);let time=t%cycle;if(time>=duration)return action.frames[action.frames.length-1];for(const f of action.frames){if(time<f.durationMs)return f;time-=f.durationMs;}return action.frames.at(-1);}
async function main(){const cache=new Map();for(const a of catalog.actions)for(const f of a.frames)if(!cache.has(f.src))cache.set(f.src,await loadImage(path.join(root,f.src)));
 const records=[];
 for(const group of groups){const actions=group.ids.map(id=>catalog.actions.find(a=>a.id===id));if(actions.some(a=>!a))throw Error('Missing preview action');const raws=[];
  for(let frame=0;frame<COUNT;frame++){const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),dark=group.theme==='dark',t=frame*1000/FPS;
   const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,dark?'#121527':'#fff9f5');bg.addColorStop(1,dark?'#201d37':'#f9edf2');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   ctx.fillStyle=dark?'#f0bfd2':'#ad627b';ctx.font='600 11px NineMew';ctx.fillText('9MEW  /  '+group.subtitle,28,28);
   ctx.fillStyle=dark?'#fff4ed':'#352833';ctx.font='600 27px NineMew';ctx.fillText(group.title,28,65);
   for(let i=0;i<actions.length;i++){const action=actions[i],col=i%3,row=Math.floor(i/3),x=24+col*268,y=88+row*266;
    ctx.fillStyle=dark?'#26263b':'#ffffffcc';round(ctx,x,y,256,254,18);ctx.fill();ctx.strokeStyle=dark?'#62506966':'#e9cdd977';ctx.lineWidth=1;ctx.stroke();
    const f=sample(action,t);let dx=0;if(action.motion){const total=action.frames.reduce((n,p)=>n+p.durationMs,0);dx=((Math.min(t%(total+800),total)/total)-.5)*42;}
    ctx.save();if(action.mirror){ctx.translate(x+256,0);ctx.scale(-1,1);ctx.drawImage(cache.get(f.src),10-dx,y-2,236,236);}else ctx.drawImage(cache.get(f.src),x+10+dx,y-2,236,236);ctx.restore();
    ctx.fillStyle=dark?'#e7dbe4':'#5c4754';ctx.textAlign='center';ctx.font='500 16px NineMew';ctx.fillText(action.label,x+128,y+234);ctx.textAlign='left';
   }
   ctx.fillStyle=dark?'#a69aad':'#97858d';ctx.font='400 11px NineMew';ctx.fillText('2D 角色动作 · 同一只奶喵 · 樱花粉丝巾',28,632);
   const png=canvas.toBuffer('image/png');if(frame===18)fs.writeFileSync(path.join(out,group.id+'-poster.png'),png);
   raws.push(await sharp(png).ensureAlpha().raw().toBuffer());
  }
  const delay=Array.from({length:COUNT},(_,i)=>Math.round((i+1)*1000/FPS)-Math.round(i*1000/FPS));
  for(const format of ['webp','gif']){const file=path.join(out,group.id+'.'+format);let pipeline=sharp(Buffer.concat(raws),{raw:{width:W,height:H*COUNT,channels:4,pageHeight:H},limitInputPixels:false});
   if(format==='webp')pipeline=pipeline.webp({quality:88,alphaQuality:100,effort:4,loop:0,delay});else pipeline=pipeline.gif({colours:192,dither:.15,effort:6,loop:0,delay:delay.map((_,i)=>10*(Math.round((i+1)*100/FPS)-Math.round(i*100/FPS)))});await pipeline.toFile(file);const info=await sharp(file,{animated:true}).metadata();records.push({file:path.relative(root,file),actions:group.ids,theme:group.theme,width:info.width,height:info.pageHeight,frames:info.pages,durationMs:info.delay.reduce((a,b)=>a+b,0),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}
  console.log(group.id+' preview encoded');
 }
 // A static index of every independently generated action, separate from animation proof.
 const source=catalog.actions.filter(a=>!a.mirror), cols=5,cw=240,ch=252,rows=Math.ceil(source.length/cols),canvas=createCanvas(cols*cw,rows*ch+94),ctx=canvas.getContext('2d');
 ctx.fillStyle='#fff7f1';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#4b3444';ctx.font='600 32px NineMew';ctx.fillText('奶喵 · 20 种角色动作',30,47);ctx.font='400 14px NineMew';ctx.fillStyle='#9b7082';ctx.fillText('源动作索引 ｜ 左右镜像与主题编码另列',32,75);
 for(let i=0;i<source.length;i++){const a=source[i],x=(i%cols)*cw,y=Math.floor(i/cols)*ch+94;ctx.drawImage(cache.get(a.frames[Math.min(3,a.frames.length-1)].src),x+10,y,220,220);ctx.fillStyle='#5a4451';ctx.font='500 16px NineMew';ctx.textAlign='center';ctx.fillText(a.label,x+cw/2,y+238);}fs.writeFileSync(path.join(out,'all-actions-index.png'),canvas.toBuffer('image/png'));
 fs.writeFileSync(path.join(out,'preview-validation.json'),JSON.stringify({status:'PREVIEW_ENCODING_PASSED',catalogSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'catalog.json'))).digest('hex'),note:'Graphic contact previews composed from actual frames; not an independent source action.',files:records},null,2)+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
