#!/usr/bin/env node
'use strict';
// Mechanical atlas extraction, anchor alignment, encoding and factual validation.
// Character poses are imagegen artwork. This script does not draw or inpaint cats.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp; try { sharp = require('sharp'); } catch { sharp = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'sharp')); }
const root = __dirname;
const size = 512;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const writeJSON = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const definitions = [
  ['blink','轻轻眨眼','daily','social/blink.png','loop',[1800,70,60,80,80,60,70,1000],'眼睑自然闭合、睁开；保留安静待机节奏。'],
  ['wave','招爪问好','daily','social/wave.png','once',[260,120,120,180,180,180,140,600],'前爪抬起、手腕轻摆，再放回地面。'],
  ['tail-swish','轻摆尾巴','daily','social/tail-swish.png','loop',[240,160,180,180,180,180,160,240],'尾根与尾尖连续改变弯曲方向。'],
  ['listen','歪头倾听','daily','social/listen.png','once',[400,180,220,260,220,180,180,700],'耳朵转向、抬头、左右观察和轻抬前爪。'],
  ['walk-right','向右散步','movement','locomotion/walk-right.png','once',Array(8).fill(120),'四足交替迈步；官网舞台附带有限水平移动。'],
  ['run-right','向右小跑','movement','locomotion/run-right.png','once',Array(8).fill(80),'伸展、收腿和短暂离地的小跑步态。'],
  ['jump','轻盈跳跃','movement','locomotion/jump-candidate-01.png','once',[250,180,90,110,180,100,140,650],'屈膝蓄力、蹬地、收爪腾空、伸爪落地。'],
  ['happy','开心眯眼','emotion','social/happy.png','once',[260,140,160,240,240,160,140,700],'抬头、眯眼微笑、前爪轻贴胸口。'],
  ['angry','小小生气','emotion','social/angry.png','once',[260,160,200,180,180,200,180,700],'耳朵向两侧压低、眯眼、轻拍前爪后缓和。'],
  ['sad','委屈求安慰','emotion','social/sad.png','once',[300,220,220,300,300,220,220,700],'垂耳、低头、收拢前爪，再抬头看向主人。'],
  ['surprised','好奇惊讶','emotion','social/surprised.png','once',[300,160,160,260,260,180,180,700],'眼睛睁大、耳朵竖起、前爪微抬，再放松。'],
  ['excited','兴奋庆祝','emotion','social/excited.png','once',[220,140,140,220,220,140,180,700],'双前爪举起、开心张口、向上伸展后回坐。'],
  ['nuzzle','亲昵蹭蹭','emotion','social/nuzzle.png','once',[300,220,220,260,260,220,220,700],'闭眼侧头、肩颈和脸颊亲昵地左右蹭动。'],
  ['groom','舔爪洗脸','daily','locomotion/groom.png','once',[280,180,220,260,240,240,180,700],'前爪抬至嘴边轻舔，再轻擦脸颊。'],
  ['sleep','安静睡觉','daily','locomotion/sleep.png','loop',Array(8).fill(500),'趴卧闭眼，胸背轻呼吸并伴有细微耳动。'],
  ['stretch','伸个懒腰','daily','locomotion/stretch.png','once',[280,180,220,360,360,220,180,700],'前爪伸长、抬臀压胸、拱背，再回到休息姿态。'],
  ['knead','左右踩奶','daily','locomotion/knead.png','loop',Array(8).fill(180),'保持前倾重心，左右前爪交替向地面轻压。'],
  ['yawn','困困哈欠','daily','locomotion/yawn.png','once',[300,180,180,240,300,200,180,700],'眼睛轻闭，嘴自然张开打哈欠，再合上。'],
  ['roll','翻身露肚皮','daily','locomotion/roll.png','once',[300,220,220,300,300,220,220,700],'轻轻侧躺、露肚皮，四爪蜷起再回到侧卧。'],
  ['pounce','伏身小扑','movement','locomotion/pounce.png','once',[300,220,180,120,120,180,220,700],'低伏观察、蓄力、短距离前扑，再落回前爪。'],
];

function components(rgba, width, height) {
  const count = width * height, visited = new Uint8Array(count), queue = new Int32Array(count), groups=[];
  for (let p=0;p<count;p++) {
    if (visited[p] || rgba[p*4+3] < 112) continue;
    let read=0, used=1, minX=width, maxX=0, minY=height, maxY=0;
    queue[0]=p;visited[p]=1;
    while (read<used) {
      const q=queue[read++], x=q%width, y=Math.floor(q/width);
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      const neighbors=[];
      if(x>0)neighbors.push(q-1);if(x<width-1)neighbors.push(q+1);if(y>0)neighbors.push(q-width);if(y<height-1)neighbors.push(q+width);
      for(const z of neighbors)if(!visited[z] && rgba[z*4+3]>=112){visited[z]=1;queue[used++]=z;}
    }
    if(used>1800)groups.push({pixels:used,x:minX,y:minY,right:maxX,bottom:maxY,width:maxX-minX+1,height:maxY-minY+1});
  }
  const cats=groups.sort((a,b)=>b.pixels-a.pixels).slice(0,8);
  if(cats.length!==8)throw Error(`Expected eight isolated cat silhouettes; found ${cats.length}`);
  cats.sort((a,b)=>(a.y+a.bottom)-(b.y+b.bottom));
  return [...cats.slice(0,4).sort((a,b)=>a.x-b.x),...cats.slice(4).sort((a,b)=>a.x-b.x)];
}

async function encode(raws, delays, destination, format, bg) {
  const outSize=format==='gif'?320:size;
  const converted=[];
  for(const raw of raws){let image=sharp(raw,{raw:{width:size,height:size,channels:4}});
    if(bg)image=image.flatten({background:bg});
    image=image.resize(outSize,outSize);
    if(bg)image=image.ensureAlpha();
    converted.push(await image.raw().toBuffer());
  }
  const input=sharp(Buffer.concat(converted),{raw:{width:outSize,height:outSize*converted.length,channels:4,pageHeight:outSize},limitInputPixels:false});
  if(format==='gif') await input.gif({loop:0,delay:delays,colours:192,dither:.3,effort:7}).toFile(destination);
  else await input.webp({loop:0,delay:delays,quality:91,alphaQuality:100,effort:5,mixed:true}).toFile(destination);
  const info=await sharp(destination,{animated:true}).metadata();
  if(!info.pages || info.pages<2)throw Error(`Not an animation: ${destination}`);
  const duration=(info.delay||[]).reduce((a,b)=>a+b,0);
  if(Math.abs(duration-delays.reduce((a,b)=>a+b,0))>20)throw Error(`Encoded duration mismatch ${destination}`);
  const decoded=await sharp(destination,{animated:true}).ensureAlpha().raw().toBuffer();
  const decodedPageBytes=info.width*info.pageHeight*4;
  const decodedHashes=[];
  for(let i=0;i<info.pages;i++)decodedHashes.push(hash(decoded.subarray(i*decodedPageBytes,(i+1)*decodedPageBytes)));
  const uniqueDecodedFrames=new Set(decodedHashes).size;
  if(decoded.length!==decodedPageBytes*info.pages||uniqueDecodedFrames<2)throw Error(`Animation decode failed: ${destination}`);
  return {path:path.relative(root,destination).split(path.sep).join('/'),width:info.width,height:info.pageHeight,pages:info.pages,durationMs:duration,hasAlpha:info.hasAlpha,sha256:hash(fs.readFileSync(destination)),bytes:fs.statSync(destination).size,decodeStatus:'all_frames_decoded',uniqueDecodedFrames,decodedFrameSha256:decodedHashes};
}

async function buildAction(def) {
  const [id,label,category,sheet,playback,delays,description]=def;
  const sourceFile=path.join(root,'sheets',sheet);
  if(!fs.existsSync(sourceFile))return null;
  const original=fs.readFileSync(sourceFile);
  const {data,info}=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const cats=components(data,info.width,info.height);
  const topBottom=Math.max(...cats.slice(0,4).map(c=>c.bottom));
  const lowerTop=Math.min(...cats.slice(4).map(c=>c.y));
  if(topBottom>=lowerTop)throw Error(`${id}: overlapping atlas rows`);
  const rowBoundary=Math.round((topBottom+lowerTop)/2);
  const isTravel=id==='walk-right'||id==='run-right';
  const targetH=(id==='jump'||isTravel)?330:390, targetW=isTravel?355:420;
  const scale=Math.min(targetH/Math.max(...cats.map(c=>c.height)),targetW/Math.max(...cats.map(c=>c.width)),1.08);
  const dest=path.join(root,'frames',id);fs.mkdirSync(dest,{recursive:true});
  const raws=[],frameFacts=[];
  const jumpOffsets=[0,0,-40,-92,-112,-65,0,0];
  const runOffsets=[0,-7,-14,-18,0,-7,-14,-18];
  for(let i=0;i<8;i++) {
    const row=Math.floor(i/4),col=i%4,c=cats[i];
    const left=col===0?0:Math.round((cats[i-1].right+c.x)/2);
    const right=col===3?info.width:Math.round((c.right+cats[i+1].x)/2);
    const top=row===0?0:rowBoundary,bottom=row===0?rowBoundary:info.height;
    // Use all alpha detail within a non-overlapping tile, not a hard character mask.
    const crop={left,top,width:right-left,height:bottom-top};
    const rw=Math.max(1,Math.round(crop.width*scale)),rh=Math.max(1,Math.round(crop.height*scale));
    const resized=await sharp(original).extract(crop).resize(rw,rh,{kernel:'lanczos3'}).png().toBuffer();
    const gridCenter=(col+.5)*info.width/4;
    const x=Math.round(size/2-(gridCenter-left)*scale);
    const lift=id==='jump'?jumpOffsets[i]:id==='run-right'?runOffsets[i]:0;
    const y=Math.round(456+lift-(c.bottom-top)*scale);
    const image=sharp({create:{width:size,height:size,channels:4,background:{r:0,g:0,b:0,alpha:0}}});
    // Clip only transparent tile margins if a large generated margin extends outside canvas.
    const visible={left:Math.max(0,-x),top:Math.max(0,-y),width:Math.min(rw,size-x)-Math.max(0,-x),height:Math.min(rh,size-y)-Math.max(0,-y)};
    const overlay=await sharp(resized).extract(visible).png().toBuffer();
    const raw=await image.composite([{input:overlay,left:Math.max(0,x),top:Math.max(0,y)}]).raw().toBuffer();
    raws.push(raw);
    const filename=String(i).padStart(3,'0')+'.webp';
    await sharp(raw,{raw:{width:size,height:size,channels:4}}).webp({lossless:true,effort:5}).toFile(path.join(dest,filename));
    const bounds=componentsForFrame(raw,size,size);
    if(bounds.x<2||bounds.y<2||bounds.right>size-3||bounds.bottom>size-3)throw Error(`${id}/${i} opaque subject hits canvas edge`);
    frameFacts.push({index:i,sourceBounds:c,crop,scale,placement:{x,y},opaqueBounds:bounds,pixelSha256:hash(raw),fileSha256:hash(fs.readFileSync(path.join(dest,filename))),file:`frames/${id}/${filename}`});
  }
  const unique=new Set(frameFacts.map(x=>x.pixelSha256)).size;
  if(unique<6)throw Error(`${id}: insufficient distinct source poses`);
  const animationDir=path.join(root,'animations');fs.mkdirSync(animationDir,{recursive:true});
  const sequence=id==='nuzzle'?[0,1,2,3,4,3,1,7]:[0,1,2,3,4,5,6,7];
  const selectedRaws=sequence.map(i=>raws[i]);
  const webp=await encode(selectedRaws,delays,path.join(animationDir,id+'.webp'),'webp');
  const gifLight=await encode(selectedRaws,delays,path.join(animationDir,id+'-light.gif'),'gif','#fff7f1');
  const gifDark=await encode(selectedRaws,delays,path.join(animationDir,id+'-dark.gif'),'gif','#101321');
  await sharp(raws[Math.min(3,raws.length-1)],{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(dest,'poster.png'));
  const frameList=sequence.map((n,i)=>({src:frameFacts[n].file,durationMs:delays[i]}));
  const action={id,label,category,description,status:'prototype',sourceKind:'independent-generated-sequence',sourceSheet:'sheets/'+sheet,sourceFrameCount:8,frameSize:{width:size,height:size},anchor:{x:.5,y:456/512},loop:playback==='loop',playback,returnTo:'blink',frames:isTravel?[...frameList,...frameList,...frameList]:frameList,exports:{webp:webp.path,gifLight:gifLight.path,gifDark:gifDark.path},sourceSha256:hash(original)};
  if(isTravel){action.direction='right';action.motion={kind:'travel',distance:108};action.sequenceCycles=3;}
  action.selectedSourceFrameIndices=sequence;action.playableDistinctPoseCount=new Set(sequence).size;
  if(id==='nuzzle')action.excludedSourceFrames={indices:[5,6],reason:'Generated torso mirrored during head turn; omit these poses to preserve body orientation.'};
  return {action,report:{id,source:action.sourceSheet,sourceSha256:hash(original),sourceDimensions:{width:info.width,height:info.height},distinctSourcePoses:unique,sourceFrameCount:8,playableDistinctPoseCount:action.playableDistinctPoseCount,selectedSourceFrameIndices:sequence,frames:frameFacts,encodings:{webp,gifLight,gifDark},reviewStatus:'encoding-and-geometry-checked; visual animation review separate'}};
}

function componentsForFrame(data,w,h){let x=w,y=h,right=0,bottom=0;for(let i=0;i<w*h;i++)if(data[i*4+3]>180){const a=i%w,b=Math.floor(i/w);x=Math.min(x,a);y=Math.min(y,b);right=Math.max(right,a);bottom=Math.max(bottom,b);}return{x,y,right,bottom};}

async function main(){
  const selected=new Set(process.argv.slice(2));
  const reports=[],actions=[];
  for(const def of definitions){if(selected.size&&!selected.has(def[0]))continue;const result=await buildAction(def);if(result){reports.push(result.report);actions.push(result.action);console.log(`${def[0]}: 8 key poses, WebP + light/dark GIF encoded`);}}
  for(const source of ['walk-right','run-right']){const action=actions.find(x=>x.id===source);if(!action)continue;const id=source.replace('right','left');const mirror={...action,id,label:source==='walk-right'?'向左散步':'向左小跑',direction:'left',mirror:true,sourceActionId:source,sourceKind:'mirror-derived',description:'使用向右步态的水平镜像派生；不计为独立绘制动作。',exports:{}};
    const raws=[];for(let i=0;i<8;i++)raws.push(await sharp(path.join(root,`frames/${source}/${String(i).padStart(3,'0')}.webp`)).flop().raw().toBuffer());
    const delays=definitions.find(d=>d[0]===source)[5];
    const enc={};for(const [key,ext,bg] of [['webp','webp',null],['gifLight','gif','#fff7f1'],['gifDark','gif','#101321']]){const suffix=key==='gifLight'?'-light':key==='gifDark'?'-dark':'';const result=await encode(raws,delays,path.join(root,'animations',id+suffix+'.'+ext),ext,bg);mirror.exports[key]=result.path;enc[key]=result;}
    actions.push(mirror);reports.push({id,sourceActionId:source,mirror:true,sourceFrameCount:0,encodings:enc});
  }
  if(!actions.some(x=>x.id==='blink'))throw Error('Build must include blink as fallback default.');
  const catalog={schemaVersion:'1.0',kitVersion:'5',characterId:'9mew.character.naimiao',appearanceVersion:'0.4.0',status:'prototype',approval:'not granted for production',basePath:'./',poster:'../illustrations/mewling_master.desktop.webp',defaultAction:'blink',sourceActionCount:actions.filter(x=>!x.mirror).length,derivedActionCount:actions.filter(x=>x.mirror).length,sourcePoseCount:actions.filter(x=>!x.mirror).length*8,style:'2D generated keyframe animation; no optical-flow interpolation',actions};
  writeJSON(path.join(root,'catalog.json'),catalog);
  writeJSON(path.join(root,'encoding-validation.json'),{status:'ENCODING_AND_GEOMETRY_PASSED',generatedAt:new Date().toISOString(),catalogSha256:hash(fs.readFileSync(path.join(root,'catalog.json'))),sourceActionCount:catalog.sourceActionCount,derivedActionCount:catalog.derivedActionCount,sourcePoseCount:catalog.sourcePoseCount,artApproval:false,notValidated:['production approval','backend integration','AI behavior','3D'],actions:reports});
  console.log(JSON.stringify({actions:actions.length,sourceActions:catalog.sourceActionCount,sourcePoses:catalog.sourcePoseCount}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
