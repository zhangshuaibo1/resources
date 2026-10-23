#!/usr/bin/env node
'use strict';
// Imagegen supplies all new artwork. This script only slices, aligns and encodes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'sharp')); }
const root = path.resolve(__dirname, '..');
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const json = (p, x) => fs.writeFileSync(p, JSON.stringify(x, null, 2) + '\n');
const dirs = ['sprites','frames','animations','posters','reports'];
dirs.forEach(d => fs.mkdirSync(path.join(root,d),{recursive:true}));
const definitions = [
  {id:'chase-run',label:'追着小鼠跑',file:'source/cat/chase-run.png',kind:'cat',loop:true,delays:[85,80,75,90,85,80,75,90]},
  {id:'chase-look-up',label:'发现蝴蝶',file:'source/cat/chase-look-up.png',kind:'cat',loop:false,delays:[170,170,180,180,190,140,110,100]},
  {id:'chase-leap',label:'起跳追蝶',file:'source/cat/chase-leap.png',kind:'cat',loop:false,delays:[170,130,100,110,130,140,130,150]},
  {id:'chase-float',label:'星空轻跃',file:'source/cat/chase-float.png',kind:'cat',loop:true,delays:[140,140,130,140,150,150,140,140]},
  {id:'chase-land',label:'轻轻落地',file:'source/cat/chase-land.png',kind:'cat',loop:false,delays:[120,120,130,170,170,170,170,150]},
  {id:'mouse-run',label:'小鼠快跑',file:'source/companions/mouse-run.png',kind:'mouse',loop:true,delays:[65,65,70,65,65,65,70,65]},
  {id:'butterfly-flutter',label:'蝴蝶扇翅',file:'source/companions/butterfly-flutter.png',kind:'butterfly',loop:true,delays:[95,75,65,75,95,75,65,75]},
];

function findFigures(rgba,w,h){
  const visited=new Uint8Array(w*h),queue=new Int32Array(w*h),found=[];
  for(let p=0;p<w*h;p++){
    if(visited[p]||rgba[p*4+3]<100)continue;
    let read=0,used=1,x=w,y=h,right=0,bottom=0;
    queue[0]=p;visited[p]=1;
    while(read<used){
      const q=queue[read++],xx=q%w,yy=Math.floor(q/w);
      x=Math.min(x,xx);y=Math.min(y,yy);right=Math.max(right,xx);bottom=Math.max(bottom,yy);
      const neighbors=[];
      if(xx)neighbors.push(q-1);if(xx<w-1)neighbors.push(q+1);
      if(yy)neighbors.push(q-w);if(yy<h-1)neighbors.push(q+w);
      for(const n of neighbors)if(!visited[n]&&rgba[n*4+3]>=100){visited[n]=1;queue[used++]=n;}
    }
    if(used>1200)found.push({x,y,right,bottom,width:right-x+1,height:bottom-y+1,pixels:used});
  }
  const figures=found.sort((a,b)=>b.pixels-a.pixels).slice(0,8);
  if(figures.length!==8)throw Error('Expected 8 isolated figures, found '+figures.length);
  figures.sort((a,b)=>(a.y+a.bottom)-(b.y+b.bottom));
  return [...figures.slice(0,4).sort((a,b)=>a.x-b.x),...figures.slice(4).sort((a,b)=>a.x-b.x)];
}

function bounds(rgba,w,h,alpha=24){
  let x=w,y=h,right=-1,bottom=-1,pixels=0;
  for(let n=0;n<w*h;n++)if(rgba[n*4+3]>=alpha){
    const xx=n%w,yy=Math.floor(n/w);x=Math.min(x,xx);y=Math.min(y,yy);
    right=Math.max(right,xx);bottom=Math.max(bottom,yy);pixels++;
  }
  return {x,y,right,bottom,width:right-x+1,height:bottom-y+1,pixels};
}

async function encode(raws,size,delays,file,format,background){
  const outputSize=format==='gif'?Math.min(size,320):size;
  const pages=[];
  for(const raw of raws){
    let s=sharp(raw,{raw:{width:size,height:size,channels:4}});
    if(background)s=s.flatten({background}).ensureAlpha();
    pages.push(await s.resize(outputSize,outputSize).raw().toBuffer());
  }
  const s=sharp(Buffer.concat(pages),{raw:{width:outputSize,height:outputSize*pages.length,channels:4,pageHeight:outputSize},limitInputPixels:false});
  // GIF timing uses centiseconds: round accumulated time, avoiding per-frame drift.
  let accumulated=0,previous=0;
  const gifDelays=delays.map(d=>{accumulated+=d;const rounded=Math.round(accumulated/10)*10;const value=rounded-previous;previous=rounded;return value;});
  if(format==='gif')await s.gif({loop:0,delay:gifDelays,colours:192,dither:.25,effort:6}).toFile(file);
  else await s.webp({loop:0,delay:delays,quality:92,alphaQuality:100,effort:5,mixed:true}).toFile(file);
  const meta=await sharp(file,{animated:true}).metadata();
  const decoded=await sharp(file,{animated:true}).ensureAlpha().raw().toBuffer();
  const bytes=meta.width*meta.pageHeight*4,frames=[];
  for(let i=0;i<meta.pages;i++)frames.push(hash(decoded.subarray(i*bytes,(i+1)*bytes)));
  if(meta.pages<2||new Set(frames).size<2)throw Error('Not real decoded animation: '+file);
  if(Math.abs(meta.delay.reduce((a,b)=>a+b,0)-delays.reduce((a,b)=>a+b,0))>20)throw Error('Wrong encoded timing: '+file);
  return {path:path.relative(root,file).split(path.sep).join('/'),width:meta.width,height:meta.pageHeight,
    frames:meta.pages,distinctDecodedFrames:new Set(frames).size,durationMs:meta.delay.reduce((a,b)=>a+b,0),
    sha256:hash(fs.readFileSync(file)),bytes:fs.statSync(file).size,alpha:meta.hasAlpha};
}

async function finalize(id,label,raws,size,delays,loop,anchor,source){
  const folder=path.join(root,'frames',id);fs.mkdirSync(folder,{recursive:true});
  const overlay=[],facts=[];
  for(let i=0;i<raws.length;i++){
    const name=String(i).padStart(3,'0')+'.webp';
    const frame=await sharp(raws[i],{raw:{width:size,height:size,channels:4}}).webp({lossless:true,effort:5}).toBuffer();
    fs.writeFileSync(path.join(folder,name),frame);
    overlay.push({input:await sharp(frame).png().toBuffer(),left:(i%4)*size,top:Math.floor(i/4)*size});
    const b=bounds(raws[i],size,size);
    if(b.x<8||b.y<8||b.right>=size-8||b.bottom>=size-8)throw Error(id+'/'+i+' clipped frame margin '+JSON.stringify(b));
    facts.push({index:i,path:'frames/'+id+'/'+name,sha256:hash(frame),pixelSha256:hash(raws[i]),opaqueBounds:b});
  }
  await sharp({create:{width:size*4,height:size*2,channels:4,background:'#00000000'}})
    .composite(overlay).webp({lossless:true,effort:5}).toFile(path.join(root,'sprites',id+'.webp'));
  await sharp(raws[0],{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(root,'posters',id+'.png'));
  const exports={};
  for(const [key,ext,bg] of [['webp','webp',null],['gifLight','gif','#FFF8F2'],['gifDark','gif','#101321']]){
    const suffix=key==='gifLight'?'-light':key==='gifDark'?'-dark':'';
    exports[key]=await encode(raws,size,delays,path.join(root,'animations',id+suffix+'.'+ext),ext,bg);
  }
  return {action:{id,label,sprite:'sprites/'+id+'.webp',columns:4,rows:2,frameWidth:size,frameHeight:size,
    frameCount:raws.length,durationsMs:delays,anchor,facing:'right',loop,poster:'posters/'+id+'.png',
    frames:facts.map(f=>f.path),sourceKind:source.kind,source:source.path,status:'prototype',
    exports:Object.fromEntries(Object.entries(exports).map(([k,v])=>[k,v.path]))},
    evidence:{id,source,frames:facts,exports,atlasSha256:hash(fs.readFileSync(path.join(root,'sprites',id+'.webp')))}};
}

async function make(def){
  const original=fs.readFileSync(path.join(root,def.file));
  const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const figures=findFigures(data,info.width,info.height);
  const rowBottom=Math.max(...figures.slice(0,4).map(b=>b.bottom)),rowTop=Math.min(...figures.slice(4).map(b=>b.y));
  if(rowBottom>=rowTop)throw Error(def.id+': source row overlap');
  const boundary=Math.round((rowBottom+rowTop)/2),size=def.kind==='cat'?512:256;
  const anchor=def.kind==='butterfly'?{x:.64,y:.69}:{x:.5,y:440/512};
  // One common scale per source sequence. Never fit each pose independently.
  const maxW=Math.max(...figures.map(b=>b.width)),maxH=Math.max(...figures.map(b=>b.height));
  const scale=def.kind==='cat'?Math.min(1.7,420/maxW,380/maxH):Math.min(190/maxW,def.kind==='mouse'?155/maxH:195/maxH);
  const thorax=[[383,343],[810,341],[1171,345],[1618,349],[364,760],[817,750],[1173,749],[1615,764]];
  const raws=[],placements=[];
  for(let i=0;i<8;i++){
    const c=figures[i],col=i%4,row=Math.floor(i/4);
    const left=col?Math.round((figures[i-1].right+c.x)/2):0;
    const right=col===3?info.width:Math.round((c.right+figures[i+1].x)/2);
    const top=row?boundary:0,bottom=row?info.height:boundary;
    const crop={left,top,width:right-left,height:bottom-top};
    const tile=await sharp(original).extract(crop).resize(Math.round(crop.width*scale),Math.round(crop.height*scale)).png().toBuffer();
    const m=await sharp(tile).metadata();
    const center=def.kind==='butterfly'?thorax[i][0]:(c.x+c.right)/2;
    const x=Math.round(size*anchor.x-(center-left)*scale);
    const bob=def.id==='chase-run'?[0,-3,-7,-12,0,-3,-8,-10][i]:def.id==='mouse-run'?[0,-1,-3,-5,0,-1,-3,-4][i]:0;
    const y=Math.round(def.kind==='butterfly'?size*anchor.y-(thorax[i][1]-top)*scale:size*anchor.y+bob-(c.bottom-top)*scale);
    const visible={left:Math.max(0,-x),top:Math.max(0,-y),width:Math.min(m.width,size-x)-Math.max(0,-x),height:Math.min(m.height,size-y)-Math.max(0,-y)};
    if(visible.width<=0||visible.height<=0)throw Error('Invalid placement');
    const piece=await sharp(tile).extract(visible).png().toBuffer();
    const raw=await sharp({create:{width:size,height:size,channels:4,background:'#00000000'}})
      .composite([{input:piece,left:Math.max(0,x),top:Math.max(0,y)}]).raw().toBuffer();
    raws.push(raw);placements.push({sourceBounds:c,crop,scale,position:{x,y},bob,...(def.kind==='butterfly'?{sourceBodyAnchor:thorax[i]}:{})});
  }
  const built=await finalize(def.id,def.label,raws,size,def.delays,def.loop,anchor,
    {kind:'independent-imagegen-sequence',path:def.file,sha256:hash(original),dimensions:{width:info.width,height:info.height},placements});
  return built;
}

async function main(){
  const selected=process.argv.includes('--partial');
  const actions={},evidence=[];
  for(const def of definitions){
    if(!fs.existsSync(path.join(root,def.file))){if(selected)continue;throw Error('Missing source '+def.file);}
    const made=await make(def);actions[def.id]=made.action;evidence.push(made.evidence);
    console.log(def.id+': eight poses, atlas and three animations encoded');
  }
  // Rest deliberately reuses the seated tail of the landing sequence, no new-art claim.
  if(actions['chase-land']){
    const indices=[5,5,6,7,7,7,7,7],raws=[];
    for(const n of indices)raws.push(await sharp(path.join(root,'frames/chase-land/'+String(n).padStart(3,'0')+'.webp')).ensureAlpha().raw().toBuffer());
    const made=await finalize('rest','追逐后歇一会',raws,512,[280,320,140,200,360,400,400,400],true,{x:.5,y:440/512},
      {kind:'derived-from-landing',path:'source/cat/chase-land.png',sourceActionId:'chase-land',sourceFrameIndices:indices});
    actions.rest=made.action;evidence.push(made.evidence);
  }
  const catalog={schemaVersion:1,kitVersion:'1.0.0',characterId:'9mew.character.naimiao',appearanceVersion:'naimiao.chase.1.0.0',
    status:'prototype',artApproval:'awaiting-user-review',poster:'refs/mewling_master.webp',
    sourceSequenceCount:Object.keys(actions).filter(x=>x!=='rest').length,reusedSequenceCount:actions.rest?1:0,
    directionPolicy:'All source sheets face right. Left travel is a horizontal mirror, not another original action.',
    animationMethod:'Discrete generated key poses plus time-based webpage route; no AI video or optical-flow claim.',actions};
  json(path.join(root,'catalog.json'),catalog);
  json(path.join(root,'reports/encoding-validation.json'),{status:selected?'PARTIAL_ENCODING_CHECKED':'ENCODING_AND_GEOMETRY_PASSED',
    catalogSha256:hash(fs.readFileSync(path.join(root,'catalog.json'))),newSourceSequences:catalog.sourceSequenceCount,
    reusedSequences:catalog.reusedSequenceCount,artApproval:false,actions:evidence});
  console.log(JSON.stringify({actions:Object.keys(actions).length,sourceSequences:catalog.sourceSequenceCount}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
