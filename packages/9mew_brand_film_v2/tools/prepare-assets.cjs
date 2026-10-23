#!/usr/bin/env node
'use strict';
// Mechanical preparation only: raster artwork comes from the recorded imagegen sources.
// No network access, painting, optical flow, per-frame fit scaling or invented poses.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'sharp')); }
sharp.concurrency(2);
const root = path.resolve(__dirname, '..');
const arg = process.argv.indexOf('--reuse-root');
const reuseRoot = arg >= 0 ? path.resolve(process.argv[arg + 1]) : path.resolve(root, '..', '9mew_chase_motion_kit_v1');
const SIZE = 512, ANCHOR = {x: 0.5, y: 456 / 512};
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const fileHash = p => hash(fs.readFileSync(p));
const writeJSON = (p, x) => fs.writeFileSync(p, JSON.stringify(x, null, 2) + '\n');
const ensure = p => fs.mkdirSync(p, {recursive: true});
const definitions = [
  {id: 'ginger-trot', characterId: '9mew.character.brand-ginger', label: 'Ginger kitten trot', file: 'source/cats/ginger-trot.png', baselines: [396,340], loop: true, delays: [90,85,80,95,90,85,80,95]},
  {id: 'ragdoll-star-paw', characterId: '9mew.character.brand-ragdoll', label: 'Ragdoll reaches for starlight', file: 'source/cats/ragdoll-star-paw.png', baselines: [407,374], loop: false, delays: [220,180,160,170,220,170,160,240]},
];
const reusedIds = ['chase-run', 'chase-look-up', 'chase-leap', 'chase-land'];
for (const d of ['sprites','frames','reports','source/reused']) ensure(path.join(root,d));

function bounds(rgba, w, h, threshold = 24) {
  let left = w, top = h, right = -1, bottom = -1, pixels = 0;
  for (let n=0; n<w*h; n++) if (rgba[n*4+3] >= threshold) {
    const x=n%w, y=Math.floor(n/w);
    left=Math.min(left,x); top=Math.min(top,y); right=Math.max(right,x); bottom=Math.max(bottom,y); pixels++;
  }
  if (!pixels) throw Error('Empty alpha bounds');
  return {left,top,right,bottom,width:right-left+1,height:bottom-top+1,pixels};
}
function margins(b,w,h) { return {left:b.left,top:b.top,right:w-1-b.right,bottom:h-1-b.bottom}; }
function visibleEqual(a,b) {
  if(a.length!==b.length)return false;
  for(let i=0;i<a.length;i+=4) {
    if(a[i+3]!==b[i+3])return false;
    if(a[i+3] && (a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]))return false;
  }
  return true;
}
function cropAround(b,w,h,pad=2) {
  const left=Math.max(0,b.left-pad), top=Math.max(0,b.top-pad);
  const right=Math.min(w,b.right+1+pad), bottom=Math.min(h,b.bottom+1+pad);
  return {left,top,width:right-left,height:bottom-top};
}

async function makeNew(def) {
  const original=fs.readFileSync(path.join(root,def.file));
  const meta=await sharp(original).metadata();
  if (!meta.hasAlpha) throw Error(def.id+': source lacks alpha');
  const cells=[];
  for(let i=0;i<8;i++) {
    const col=i%4,row=Math.floor(i/4);
    const left=Math.round(col*meta.width/4),right=Math.round((col+1)*meta.width/4);
    const top=Math.round(row*meta.height/2),bottom=Math.round((row+1)*meta.height/2);
    const cell={left,top,width:right-left,height:bottom-top};
    const raw=await sharp(original).extract(cell).ensureAlpha().raw().toBuffer();
    const b24=bounds(raw,cell.width,cell.height), b1=bounds(raw,cell.width,cell.height,1);
    // Imagegen can leave near-invisible alpha=1 specks far from the figure.
    // A 24-source-pixel fringe around the alpha>=24 silhouette retains the actual
    // soft fur/whisker edge without carrying the whole empty source cell.
    const crop=cropAround(b24,cell.width,cell.height,24);
    cells.push({index:i,row,col,cell,b24,b1,crop});
  }
  // A single scale is derived once for the whole action, never independently for each frame.
  const maxVisibleWidth=Math.max(...cells.map(c=>c.b24.width));
  const maxVisibleHeight=Math.max(...cells.map(c=>c.b24.height));
  const scale=Math.min(420/maxVisibleWidth,390/maxVisibleHeight);
  const overlay=[],frames=[],placements=[];
  ensure(path.join(root,'frames',def.id));
  for(const c of cells) {
    const sourceCrop={left:c.cell.left+c.crop.left,top:c.cell.top+c.crop.top,width:c.crop.width,height:c.crop.height};
    const tileWidth=Math.round(c.crop.width*scale),tileHeight=Math.round(c.crop.height*scale);
    const tile=await sharp(original).extract(sourceCrop).resize(tileWidth,tileHeight,{kernel:'lanczos3'}).png().toBuffer();
    const sourceCenterX=(c.b24.left+c.b24.right+1)/2;
    const x=Math.round(256-(sourceCenterX-c.crop.left)*scale);
    // Same source ground line for every pose in the row. Airborne offsets remain visible.
    const rowBaseline=def.baselines[c.row];
    const y=Math.round(456-(rowBaseline-c.crop.top)*scale);
    if(x<0||y<0||x+tileWidth>SIZE||y+tileHeight>SIZE) throw Error(def.id+'/'+c.index+': source padding would be clipped');
    const raw=await sharp({create:{width:SIZE,height:SIZE,channels:4,background:'#00000000'}})
      .composite([{input:tile,left:x,top:y}]).raw().toBuffer();
    const b=bounds(raw,SIZE,SIZE), margin=margins(b,SIZE,SIZE);
    if(Math.min(...Object.values(margin))<16) throw Error(def.id+'/'+c.index+': insufficient output margin');
    if(b.width>422||b.height>392) throw Error(def.id+'/'+c.index+': visible extent exceeds common-scale budget');
    const encoded=await sharp(raw,{raw:{width:SIZE,height:SIZE,channels:4}}).webp({lossless:true,effort:5}).toBuffer();
    const relative='frames/'+def.id+'/'+String(c.index).padStart(3,'0')+'.webp';
    fs.writeFileSync(path.join(root,relative),encoded);
    const decoded=await sharp(encoded).ensureAlpha().raw().toBuffer();
    // Lossless WebP may normalize RGB hidden beneath alpha=0; visible pixels and
    // every alpha byte must remain exactly equal.
    if(!visibleEqual(decoded,raw)) throw Error(def.id+'/'+c.index+': visible lossless decode differs');
    overlay.push({input:await sharp(encoded).png().toBuffer(),left:c.col*SIZE,top:c.row*SIZE});
    frames.push(relative);
    placements.push({index:c.index,sourceCell:c.cell,sourceAlpha24Bounds:c.b24,sourceAlpha1Bounds:c.b1,sourceCrop,
      scale,sourceGroundBaselineInCell:rowBaseline,sourceBodyCenterXInCell:sourceCenterX,
      outputPosition:{x,y},resampledTile:{width:tileWidth,height:tileHeight},outputAlpha24Bounds:b,
      outputAlpha24Margins:margin,frame:relative,sha256:hash(encoded),pixelSHA256:hash(decoded)});
  }
  const sprite='sprites/'+def.id+'.webp';
  await sharp({create:{width:2048,height:1024,channels:4,background:'#00000000'}})
    .composite(overlay).webp({lossless:true,effort:5}).toFile(path.join(root,sprite));
  const action={id:def.id,label:def.label,characterId:def.characterId,sprite,frameWidth:SIZE,frameHeight:SIZE,
    columns:4,rows:2,frameCount:8,anchor:ANCHOR,durationsMs:def.delays,loop:def.loop,facing:'right',frames,
    sourceKind:'new-imagegen-sequence',sourcePath:def.file};
  const evidence={id:def.id,sourceKind:action.sourceKind,sourcePath:def.file,sourceSHA256:hash(original),
    sourceDimensions:{width:meta.width,height:meta.height},sharedScale:scale,
    maxSourceAlpha24Dimensions:{width:maxVisibleWidth,height:maxVisibleHeight},
    outputVisibleBudget:{width:420,height:390,roundingTolerance:2},anchor:ANCHOR,
    rowGroundBaselines:def.baselines,method:'Per-row common ground line; common scale; per-pose horizontal centering only; 24px source fringe around alpha>=24 bounds; original alpha preserved inside crop',
    placements,sprite,atlasSHA256:fileHash(path.join(root,sprite)),distinctDecodedFrames:new Set(placements.map(p=>p.pixelSHA256)).size};
  if(evidence.distinctDecodedFrames!==8) throw Error(def.id+': expected eight distinct original poses');
  return {action,evidence};
}

async function copyReused() {
  const manifestPath=path.join(root,'source/reused/provenance.json');
  let provenance;
  if(fs.existsSync(path.join(reuseRoot,'catalog.json'))) {
    const prior=JSON.parse(fs.readFileSync(path.join(reuseRoot,'catalog.json'),'utf8'));
    provenance={sourcePackage:'9mew_chase_motion_kit_v1',sourceRelease:'9mew-chase-motion-v1.0.0',
      sourceCatalogSHA256:fileHash(path.join(reuseRoot,'catalog.json')),actions:{},files:[]};
    for(const id of reusedIds) {
      const a=prior.actions[id]; if(!a||a.frameCount!==8)throw Error('Missing prior action '+id);
      provenance.actions[id]=a;
      const items=[{from:a.sprite,to:a.sprite},{from:a.source,to:'source/reused/'+id+'.png'},...a.frames.map(f=>({from:f,to:f}))];
      for(const item of items) {
        const original=path.join(reuseRoot,item.from),dest=path.join(root,item.to);
        ensure(path.dirname(dest));fs.copyFileSync(original,dest);
        const sha256=fileHash(original);
        if(fileHash(dest)!==sha256)throw Error('Reused bytes changed: '+item.to);
        provenance.files.push({originalPath:item.from,path:item.to,bytes:fs.statSync(dest).size,sha256});
      }
    }
    writeJSON(manifestPath,provenance);
  } else {
    if(!fs.existsSync(manifestPath))throw Error('Supply --reuse-root PATH or retain packaged source/reused/provenance.json and copied assets');
    provenance=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    for(const f of provenance.files)if(!fs.existsSync(path.join(root,f.path))||fileHash(path.join(root,f.path))!==f.sha256)throw Error('Packaged reused asset missing or changed: '+f.path);
  }
  const actions={},evidence=[];
  for(const id of reusedIds) {
    const a=provenance.actions[id];
    actions[id]={id,label:a.label,characterId:'9mew.character.naimiao',sprite:a.sprite,
      frameWidth:a.frameWidth,frameHeight:a.frameHeight,columns:a.columns,rows:a.rows,frameCount:a.frameCount,
      anchor:a.anchor,durationsMs:a.durationsMs,loop:a.loop,facing:a.facing,frames:a.frames,
      sourceKind:'reused-imagegen-sequence',sourcePath:'source/reused/'+id+'.png',originalRelease:provenance.sourceRelease};
    const frameFacts=[];
    for(const f of a.frames) {
      const {data,info}=await sharp(path.join(root,f)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      if(info.width!==512||info.height!==512)throw Error('Unexpected reused frame geometry');
      const b=bounds(data,512,512);
      frameFacts.push({path:f,sha256:fileHash(path.join(root,f)),pixelSHA256:hash(data),outputAlpha24Bounds:b,outputAlpha24Margins:margins(b,512,512)});
    }
    const sm=await sharp(path.join(root,a.sprite)).metadata();
    if(sm.width!==2048||sm.height!==1024||!sm.hasAlpha)throw Error('Unexpected reused sprite geometry');
    evidence.push({id,sourceKind:'reused-imagegen-sequence',originalRelease:provenance.sourceRelease,
      sourcePath:actions[id].sourcePath,sourceSHA256:fileHash(path.join(root,actions[id].sourcePath)),
      copiedWithoutReencoding:true,originalAnchorPreserved:a.anchor,
      sprite:a.sprite,atlasSHA256:fileHash(path.join(root,a.sprite)),frames:frameFacts,
      distinctDecodedFrames:new Set(frameFacts.map(f=>f.pixelSHA256)).size});
  }
  return {actions,evidence,provenance};
}

function textSvg(text,width,height,color,size=16) {
  const escaped=text.replaceAll('&','&amp;').replaceAll('<','&lt;');
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="12" y="${Math.round(height*.72)}" fill="${color}" font-family="sans-serif" font-size="${size}">${escaped}</text></svg>`);
}
async function contactSheet(actions,theme) {
  const width=1280,cell=160,head=44,rowHeader=30,rowHeight=190;
  const ids=Object.keys(actions),height=head+ids.length*rowHeight;
  const dark=theme==='dark',bg=dark?'#101321':'#FFF5EC',fg=dark?'#F9EAF0':'#503745';
  const pieces=[{input:textSvg('9mew brand film v2 | 48 frame slots: 16 new poses + 32 reused poses',width,head,fg,20),left:0,top:0}];
  for(let row=0;row<ids.length;row++) {
    const id=ids[row],a=actions[id],top=head+row*rowHeight;
    pieces.push({input:textSvg(id+'  /  '+a.sourceKind,width,rowHeader,fg,16),left:0,top});
    for(let col=0;col<8;col++) {
      const image=await sharp(path.join(root,a.frames[col])).resize(150,150).png().toBuffer();
      pieces.push({input:image,left:col*cell+5,top:top+rowHeader});
      pieces.push({input:textSvg(String(col).padStart(2,'0'),40,18,fg,11),left:col*cell,top:top+rowHeader+140});
    }
  }
  const relative='reports/contactsheet-'+theme+'.png';
  await sharp({create:{width,height,channels:4,background:bg}}).composite(pieces).png().toFile(path.join(root,relative));
  return {path:relative,width,height,sha256:fileHash(path.join(root,relative))};
}

async function main() {
  const actions={},evidence=[];
  for(const def of definitions) {
    const made=await makeNew(def);actions[def.id]=made.action;evidence.push(made.evidence);
    console.log(def.id+': prepared eight lossless aligned frames and atlas');
  }
  const reused=await copyReused();Object.assign(actions,reused.actions);evidence.push(...reused.evidence);
  const catalog={schemaVersion:1,kitVersion:'2.0.0',status:'prototype',artApproval:'awaiting-user-review',
    newSourceSequences:2,newSourcePoses:16,reusedSourceSequences:4,reusedFrameSlots:32,totalFrameSlots:48,
    directionPolicy:'Right-facing sources; a mirrored direction is reuse, not a new source action.',
    animationMethod:'Recorded 2D key poses; mechanical alignment and movie composition are separate from artwork generation.',actions};
  writeJSON(path.join(root,'runtime-assets.json'),catalog);
  const contacts=[];for(const theme of ['light','dark'])contacts.push(await contactSheet(actions,theme));
  const report={status:'ASSET_PREPARATION_PASSED',checkedAtUtc:new Date().toISOString(),
    scriptSHA256:fileHash(__filename),catalogSHA256:fileHash(path.join(root,'runtime-assets.json')),
    newSequences:2,newPoses:16,reusedSequences:4,reusedFrameSlots:32,totalFrameSlots:48,
    allCopiedReusedHashesMatched:true,animationsExported:0,actions:evidence,contacts,
    scope:'Geometry, actual RGBA decode, unique frame hashes and exact reuse checks. Static contact sheets supplied for review; this script does not certify timed motion or artistic approval.'};
  writeJSON(path.join(root,'reports/asset-preparation.json'),report);
  console.log(JSON.stringify({status:report.status,actions:Object.keys(actions),contacts:contacts.map(c=>c.path)}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
