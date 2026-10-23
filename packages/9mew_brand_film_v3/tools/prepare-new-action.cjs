#!/usr/bin/env node
'use strict';
// Mechanical registration of four genuinely redrawn imagegen pairs.
// Each pose receives only a rigid uniform scale and translation; no body warping.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
let sharp;try{sharp=require('sharp');}catch{sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'','sharp'));}
sharp.concurrency(2);
const root=path.resolve(__dirname,'..'),id='naimiao-star-greeting';
const outFlag=process.argv.indexOf('--output-root');
const outputRoot=outFlag<0?root:path.resolve(process.argv[outFlag+1]);
const SIZE=1024,ANCHOR={x:.5,y:.875},DELAYS=[260,240,280,320,300,260,320,420];
const SOURCE_KEYS=['01','23','45','67'];
// Approximate manual measurements in the original 887x887 source half-cells.
// Head span and hind-paw spacing jointly normalize size without fitting the moving paw.
// Ground is the visually observed lowest supporting foot; seat is hind-paw midpoint.
const GEOMETRY=[
 {headSpan:540,hindPawXs:[184,482],groundY:863},
 {headSpan:538,hindPawXs:[227,517],groundY:862},
 {headSpan:540,hindPawXs:[276,571],groundY:852},
 {headSpan:536,hindPawXs:[291,572],groundY:838},
 {headSpan:565,hindPawXs:[232,545],groundY:852},
 {headSpan:568,hindPawXs:[207,533],groundY:852},
 {headSpan:512,hindPawXs:[251,546],groundY:851},
 {headSpan:531,hindPawXs:[261,548],groundY:852}
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fileHash=p=>sha(fs.readFileSync(p));
const writeJSON=(p,v)=>fs.writeFileSync(path.join(outputRoot,p),JSON.stringify(v,null,2)+'\n');
function bounds(data,w,h,threshold=24){let l=w,t=h,r=-1,b=-1,n=0;for(let i=0;i<data.length;i+=4)if(data[i+3]>=threshold){const x=i/4%w,y=Math.floor(i/4/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);n++;}if(!n)throw Error('Empty cell');return{left:l,top:t,right:r,bottom:b,width:r-l+1,height:b-t+1,pixels:n};}
function margins(b,w=SIZE,h=SIZE){return{left:b.left,top:b.top,right:w-1-b.right,bottom:h-1-b.bottom};}
function equalVisible(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i+=4){if(a[i+3]!==b[i+3])return false;if(a[i+3]&&(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]))return false;}return true;}
async function main(){
 for(const d of ['frames/'+id,'sprites','reports'])fs.mkdirSync(path.join(outputRoot,d),{recursive:true});
 const sources=[],cells=[];
 for(let pair=0;pair<4;pair++){
  const relativeSource='source/cats/hires-'+SOURCE_KEYS[pair]+'.png';
  const original=fs.readFileSync(path.join(root,relativeSource)),meta=await sharp(original).metadata();
  if(!meta.hasAlpha)throw Error('Expected source alpha '+relativeSource);
  sources.push({path:relativeSource,sha256:sha(original),width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,indices:[pair*2,pair*2+1],original});
  for(let half=0;half<2;half++){
   const index=pair*2+half,left=Math.round(half*meta.width/2),right=Math.round((half+1)*meta.width/2);
   const cell={left,top:0,width:right-left,height:meta.height};
   const data=await sharp(original).extract(cell).ensureAlpha().raw().toBuffer();
   const b=bounds(data,cell.width,cell.height),b1=bounds(data,cell.width,cell.height,1);
   const l=Math.max(0,b.left-20),t=Math.max(0,b.top-20),r=Math.min(cell.width,b.right+21),bt=Math.min(cell.height,b.bottom+21);
   const g=GEOMETRY[index],hindPawSpacing=g.hindPawXs[1]-g.hindPawXs[0];
   const scale=.96/((g.headSpan/540+hindPawSpacing/298)/2);
   cells.push({index,pair,half,row:Math.floor(index/4),col:index%4,sourcePath:relativeSource,sourceSHA256:sha(original),cell,alpha24:b,alpha1:b1,crop:{left:l,top:t,width:r-l,height:bt-t},manualGeometry:{...g,hindPawSpacing,seatX:(g.hindPawXs[0]+g.hindPawXs[1])/2},uniformScale:scale});
  }
 }
 const frames=[],placements=[],overlays=[],buffers=[];
 for(const c of cells){
  const original=sources[c.pair].original;
  const sourceCrop={left:c.cell.left+c.crop.left,top:c.crop.top,width:c.crop.width,height:c.crop.height};
  const resized=await sharp(original).extract(sourceCrop).resize({width:Math.round(c.crop.width*c.uniformScale),kernel:'lanczos3'}).png().toBuffer({resolveWithObject:true});
  const width=resized.info.width,height=resized.info.height;
  const actualScale=width/c.crop.width;
  const x=Math.round(SIZE*ANCHOR.x-(c.manualGeometry.seatX-c.crop.left)*actualScale),y=Math.round(SIZE*ANCHOR.y-(c.manualGeometry.groundY-c.crop.top)*actualScale);
  if(x<0||y<0||x+width>SIZE||y+height>SIZE)throw Error('Source fringe would clip '+c.index);
  const data=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#00000000'}}).composite([{input:resized.data,left:x,top:y}]).raw().toBuffer();
  const b=bounds(data,SIZE,SIZE),pad=margins(b);
  if(Math.min(...Object.values(pad))<24)throw Error('Insufficient visible margin '+c.index);
  const rel='frames/'+id+'/'+String(c.index).padStart(3,'0')+'.webp';
  const out=await sharp(data,{raw:{width:SIZE,height:SIZE,channels:4}}).webp({lossless:true,effort:5}).toBuffer();
  const decoded=await sharp(out).ensureAlpha().raw().toBuffer();if(!equalVisible(data,decoded))throw Error('Lossless visible-pixel mismatch');
  frames.push(rel);buffers.push(out);overlays.push({input:await sharp(out).png().toBuffer(),left:c.col*SIZE,top:c.row*SIZE});
  placements.push({...c,sourceCrop,actualRasterScale:actualScale,output:{left:x,top:y,width,height},outputAlpha24:b,outputMargins:pad,sha256:sha(out),pixelSHA256:sha(decoded)});
 }
 const sprite='sprites/'+id+'.webp';
 const atlas=await sharp({create:{width:SIZE*4,height:SIZE*2,channels:4,background:'#00000000'}}).composite(overlays).webp({lossless:true,effort:5}).toBuffer();
 const distinct=new Set(placements.map(p=>p.pixelSHA256)).size;if(distinct!==8)throw Error('Expected eight distinct decoded poses');
 // All decoding, geometry and atlas preparation succeeded before publishing any frame.
 for(let i=0;i<8;i++)fs.writeFileSync(path.join(outputRoot,frames[i]),buffers[i]);
 fs.writeFileSync(path.join(outputRoot,sprite),atlas);
 const actions={[id]:{id,label:'奶喵接星与放飞',characterId:'9mew.character.naimiao',sprite,frames,frameWidth:SIZE,frameHeight:SIZE,columns:4,rows:2,frameCount:8,anchor:ANCHOR,durationsMs:DELAYS,loop:false,facing:'front-left',sourceKind:'new-imagegen-sequence',sourcePaths:sources.map(s=>s.path),sourceRevision:'high-detail-pairs',performance:'Seated welcome, head inclination, gentle reach, cupped paws, closed-eye smile, open paws and release. Star is a separate composition layer.'}};
 const catalog={schemaVersion:1,kitVersion:'3.0.0',status:'prototype',artApproval:'awaiting-user-review',newSourceSequences:1,newSourcePoses:8,reusedSourceSequences:0,reusedFrameSlots:0,totalFrameSlots:8,directionPolicy:'Source front-left; any mirror is a derivative, not a new original action.',animationMethod:'Eight recorded 2D key poses, genuinely redrawn from the identity master as four high-detail pairs. Code performs rigid size normalization, seat/ground translation and timing only. This source upgrade replaces the same action, not eight additional actions.',actions};
 writeJSON('runtime-assets.json',catalog);
 const contacts=[];
 for(const theme of ['dark','light']){
  const bg=theme==='dark'?'#101321':'#FFF5EC',pieces=[];
  for(let i=0;i<8;i++)pieces.push({input:await sharp(buffers[i]).resize(384,384).png().toBuffer(),left:(i%4)*400+8,top:Math.floor(i/4)*400+8});
  const rel='reports/action-contact-'+theme+'.png';
  await sharp({create:{width:1600,height:800,channels:4,background:bg}}).composite(pieces).png().toFile(path.join(outputRoot,rel));contacts.push({path:rel,sha256:fileHash(path.join(outputRoot,rel))});
 }
 const publicSources=sources.map(({original,...s})=>s);
 writeJSON('reports/action-preparation.json',{status:'ACTION_PREPARATION_PASSED',checkedAtUtc:new Date().toISOString(),scriptSHA256:fileHash(__filename),sources:publicSources,frameWidth:SIZE,frameHeight:SIZE,catalogSHA256:fileHash(path.join(outputRoot,'runtime-assets.json')),newSequences:1,newPoses:8,reusedSequences:0,totalFrameSlots:8,anchor:ANCHOR,normalization:{referenceHeadSpan:540,referenceHindPawSpacing:298,referenceScale:.96,formula:'0.96 / mean(headSpan/540, hindPawSpacing/298)',measurementMethod:'Approximate manual visual head span, supporting-ground baseline and hind-paw-center measurements in each original source half. These are registration estimates, not anatomical detector output.'},method:'Four imagegen-redrawn pairs at native 1774x887 each. Each pose uses one rigid uniform scale based on face/body proportions, then translates its measured seat/ground to (512,896). 20px source fringe retained where available. No nonuniform stretching, repainting, optical flow or mixed-pose crossfades.',placements,sprite,atlasDimensions:{width:SIZE*4,height:SIZE*2},atlasSHA256:sha(atlas),distinctDecodedPoses:distinct,contacts,scope:'Actual source geometry, every RGBA frame, unique decoded frames, visible lossless equality and output alpha margins. Timed movie and user artistic approval are separate.'});
 console.log(JSON.stringify({status:'ACTION_PREPARATION_PASSED',outputRoot,newSequences:1,newPoses:8,frameSize:SIZE,anchor:ANCHOR,sprite,sourceVisibleHeights:cells.map(c=>c.alpha24.height),scales:placements.map(c=>c.actualRasterScale),minimumMargin:Math.min(...placements.flatMap(p=>Object.values(p.outputMargins))),contacts}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
