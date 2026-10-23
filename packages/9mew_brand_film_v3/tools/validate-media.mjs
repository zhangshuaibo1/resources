#!/usr/bin/env node
// Validate existing exports only. Does not render or modify media.
// Run: node tools/validate-media.mjs
// Requires ffmpeg, ffprobe and sharp. No network or credentials are used.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const require=createRequire(import.meta.url);
let sharp;
try { sharp=require('sharp'); }
catch { sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'', 'sharp')); }
sharp.concurrency(2);
sharp.cache(false);
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SELF=fileURLToPath(import.meta.url);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fileHash=p=>sha(fs.readFileSync(p));
const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const reportFile=path.join(ROOT,'reports/media-validation.json');
const renderer=path.join(ROOT,'tools/render-film.mjs');
const renderRunFile=path.join(ROOT,'reports/render-run.json');
const catalogFile=path.join(ROOT,'runtime-assets.json');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'9mew-brand-media-'));
const assets=[];
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const round=n=>Number(n.toFixed(8));

function run(command,args,options={}) {
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{stdio:['ignore','pipe','pipe']});
    const out=[],err=[];let outBytes=0,errBytes=0;
    child.on('error',e=>reject(Error(command+' could not run: '+e.message)));
    child.stdout.on('data',b=>{outBytes+=b.length;if(outBytes>32*1024*1024){child.kill();reject(Error(command+' output limit exceeded'));}else out.push(b);});
    child.stderr.on('data',b=>{errBytes+=b.length;if(errBytes>2*1024*1024){child.kill();reject(Error(command+' error output limit exceeded'));}else err.push(b);});
    child.on('close',code=>{
      const stdout=Buffer.concat(out),stderr=Buffer.concat(err);
      if(code!==0)return reject(Error(command+' failed: '+stderr.toString().slice(0,1800)));
      resolve({status:code,stdout:options.encoding?stdout.toString(options.encoding):stdout,stderr:options.encoding?stderr.toString(options.encoding):stderr});
    });
  });
}
function ratio(value) {
  const [a,b]=String(value).split('/').map(Number);
  return b ? a/b : NaN;
}
function loopMetrics(first,last,channels) {
  assert(first.length===last.length && first.length%channels===0,'Invalid seam buffers');
  let sum=0,sumSquares=0,max=0,changedChannels=0,changedPixels=0,alphaChanges=0;
  const pixels=first.length/channels;
  for(let p=0;p<first.length;p+=channels) {
    let changed=false;
    for(let c=0;c<3;c++) {
      const diff=Math.abs(first[p+c]-last[p+c]);
      sum+=diff;sumSquares+=diff*diff;max=Math.max(max,diff);
      if(diff){changedChannels++;changed=true;}
    }
    if(changed)changedPixels++;
    if(channels===4&&first[p+3]!==last[p+3])alphaChanges++;
  }
  const values=pixels*3,rmse=Math.sqrt(sumSquares/values);
  return {method:'Full-resolution decoded first-versus-last RGB pixels',informationalOnly:true,
    visualAcceptanceThreshold:null,pixels,meanAbsoluteDifference8bit:round(sum/values),
    rootMeanSquareDifference8bit:round(rmse),maximumChannelDifference8bit:max,
    changedRGBChannelPercent:round(changedChannels/values*100),changedPixelPercent:round(changedPixels/pixels*100),
    alphaChangedPixels:channels===4?alphaChanges:null,exactDecodedRGBMatch:sum===0,
    psnrDb:rmse===0?null:round(20*Math.log10(255/rmse)),
    note:'Measured evidence only. Lossy compression can change identical source endpoints; no arbitrary seam quality pass/fail threshold is imposed.'};
}
function faststart(file) {
  const bytes=fs.readFileSync(file),boxes=[];
  let offset=0;
  while(offset+8<=bytes.length) {
    let size=bytes.readUInt32BE(offset);const type=bytes.toString('ascii',offset+4,offset+8);
    let header=8;
    if(size===1) {assert(offset+16<=bytes.length,'Truncated MP4 large box');size=Number(bytes.readBigUInt64BE(offset+8));header=16;}
    else if(size===0)size=bytes.length-offset;
    assert(Number.isSafeInteger(size)&&size>=header&&offset+size<=bytes.length,'Invalid MP4 box size');
    boxes.push({type,offset,bytes:size});offset+=size;
  }
  assert(offset===bytes.length,'Unparsed MP4 trailing bytes');
  const moov=boxes.find(x=>x.type==='moov'),mdat=boxes.find(x=>x.type==='mdat');
  assert(moov&&mdat&&moov.offset<mdat.offset,'MP4 is missing faststart moov-before-mdat ordering');
  return {status:'PASSED',method:'ISO BMFF top-level box inspection',moovOffset:moov.offset,mdatOffset:mdat.offset,boxes};
}

async function inspectVideo(relative,kind,format) {
  const file=path.join(ROOT,relative),duration=kind==='film'?16:6,expectedFrames=duration*30;
  const before=fileHash(file);
  const probe=JSON.parse((await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'})).stdout);
  const videos=probe.streams.filter(s=>s.codec_type==='video'),audio=probe.streams.filter(s=>s.codec_type==='audio');
  assert(videos.length===1&&audio.length===0,relative+': expected one video stream and no audio');
  const v=videos[0],expectedCodec=format==='mp4'?'h264':'vp9';
  assert(v.codec_name===expectedCodec,relative+': unexpected codec '+v.codec_name);
  assert(v.width===1920&&v.height===720,relative+': wrong dimensions');
  assert(Math.abs(ratio(v.avg_frame_rate)-30)<1e-8&&Math.abs(ratio(v.r_frame_rate)-30)<1e-8,relative+': wrong declared frame rate');
  const actualDuration=Number(probe.format.duration);
  assert(Number.isFinite(actualDuration)&&Math.abs(actualDuration-duration)<=1/30,relative+': wrong duration');
  const md5Path=path.join(temp,path.basename(file)+'.framemd5');
  // Both outputs share the same full decode. All frames are hashed; only endpoints
  // become RGB buffers, avoiding hundreds of uncompressed frames in memory.
  const graph=`[0:v:0]split=2[all][ends];[ends]select='eq(n,0)+eq(n,${expectedFrames-1})'[seam]`;
  const decoded=await run('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-i',file,
    '-filter_complex',graph,'-map','[all]','-an','-fps_mode','passthrough','-f','framemd5',md5Path,
    '-map','[seam]','-an','-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
  assert(!String(decoded.stderr||'').trim(),relative+': decoding emitted errors');
  const frameLines=fs.readFileSync(md5Path,'utf8').split(/\r?\n/).filter(s=>s.trim()&&!s.startsWith('#'));
  const frameFields=frameLines.map(s=>s.split(',').map(x=>x.trim()));
  assert(frameLines.length===expectedFrames,relative+': decoded '+frameLines.length+' frames instead of '+expectedFrames);
  const distinct=new Set(frameFields.map(f=>f.at(-1))).size;
  assert(distinct>1,relative+': no distinct decoded frames');
  const pts=frameFields.map(f=>Number(f[2]));
  assert(pts.every((p,i)=>Number.isFinite(p)&&(!i||p>pts[i-1])),relative+': non-monotonic decoded frame timestamps');
  const frameBytes=1920*720*3;
  assert(decoded.stdout.length===frameBytes*2,relative+': endpoint extraction returned wrong byte count');
  const seam=loopMetrics(decoded.stdout.subarray(0,frameBytes),decoded.stdout.subarray(frameBytes),3);
  const mp4Atoms=format==='mp4'?faststart(file):null;
  assert(fileHash(file)===before,relative+': media changed during validation');
  return {path:relative,status:'PASSED',sha256:before,bytes:fs.statSync(file).size,format,
    codec:v.codec_name,codecLongName:v.codec_long_name,width:v.width,height:v.height,pixelFormat:v.pix_fmt,
    nominalFrameRate:ratio(v.r_frame_rate),averageFrameRate:ratio(v.avg_frame_rate),durationSeconds:actualDuration,
    audioStreams:audio.length,decodedFrames:frameLines.length,expectedFrames,distinctDecodedFrames:distinct,
    fullDecode:{status:'PASSED',method:'ffmpeg strict full decode, every output frame hashed with framemd5',errorOutput:''},
    frameHashManifestSHA256:fileHash(md5Path),faststart:mp4Atoms,loopSeam:seam};
}

async function inspectWebP(relative,kind) {
  const file=path.join(ROOT,relative),duration=kind==='film'?16:6,expectedSamples=duration*15;
  const before=fileHash(file),meta=await sharp(file,{animated:true,limitInputPixels:false}).metadata();
  assert(meta.format==='webp'&&meta.width===1280&&meta.pageHeight===480,relative+': wrong animated WebP geometry');
  assert(meta.pages>=2&&meta.pages<=expectedSamples+1,relative+': invalid encoded animation page count');
  assert(Array.isArray(meta.delay)&&meta.delay.length===meta.pages&&meta.delay.every(d=>d>0),relative+': invalid frame delays');
  const durationMs=meta.delay.reduce((s,d)=>s+d,0),toleranceMs=Math.ceil(1000/15);
  assert(Math.abs(durationMs-duration*1000)<=toleranceMs,relative+': duration outside one 15fps sampling interval');
  assert(meta.loop===0,relative+': expected repeating WebP loop metadata');
  const {data,info}=await sharp(file,{animated:true,limitInputPixels:false}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const frameBytes=1280*480*4;
  assert(info.width===1280&&info.height===480*meta.pages&&info.channels===4&&data.length===frameBytes*meta.pages,relative+': not all animation pages decoded');
  const frameHashes=[];
  for(let i=0;i<meta.pages;i++)frameHashes.push(sha(data.subarray(i*frameBytes,(i+1)*frameBytes)));
  const distinct=new Set(frameHashes).size;assert(distinct>1,relative+': animation decodes to a single repeated frame');
  const seam=loopMetrics(data.subarray(0,frameBytes),data.subarray(data.length-frameBytes),4);
  const histogram={};for(const d of meta.delay)histogram[d]=(histogram[d]||0)+1;
  assert(fileHash(file)===before,relative+': media changed during validation');
  return {path:relative,status:'PASSED',sha256:before,bytes:fs.statSync(file).size,format:'webp',codec:'animated WebP',
    width:meta.width,height:meta.pageHeight,encodedPages:meta.pages,decodedPages:meta.pages,
    distinctDecodedFrames:distinct,requestedSamplingFramesPerSecond:15,expectedPreCoalescingSamples:expectedSamples,
    timingNote:'Actual page count is reported; encoders may coalesce repeated pages. Nominal 15fps sampling does not imply newly drawn art at 15fps.',
    durationMs,expectedDurationMs:duration*1000,durationToleranceMs:toleranceMs,
    toleranceReason:'One nominal 15fps sampling interval, rounded up to integer milliseconds',
    delayHistogramMs:histogram,loop:meta.loop,hasAlpha:meta.hasAlpha,
    audioTrack:'Not applicable to animated WebP image format',
    fullDecode:{status:'PASSED',method:'libvips/sharp animated RGBA decode of every page',decodedRawBytes:data.length},
    decodedFrameHashesSHA256:sha(Buffer.from(frameHashes.join('\n'))),loopSeam:seam};
}

let bound;
try {
  assert(fs.existsSync(renderRunFile),'Wait for reports/render-run.json before validating');
  const rendered=readJSON(renderRunFile),rendererHash=fileHash(renderer),catalogHash=fileHash(catalogFile);
  assert(rendered.renderSourceSha256===rendererHash,'Render report does not match the current frozen renderer');
  assert(rendered.runtimeAssetsSha256===catalogHash,'Render report does not match the current runtime asset catalog');
  assert(rendered.inputBindings&&Object.keys(rendered.inputBindings).length>=8,'Missing render input bindings');
  for(const[p,h]of Object.entries(rendered.inputBindings))assert(fileHash(path.join(ROOT,p))===h,'Rendered input changed: '+p);
  const expected=[];
  for(const theme of ['dark','light'])for(const kind of ['film','ident'])for(const format of ['mp4','webm','webp'])expected.push({theme,kind,format,path:`exports/brand-${kind}-${theme}.${format}`});
  assert(expected.every(x=>rendered.rendered.includes(x.path)),'Wait for all 12 current-hash exports to finish');
  assert(new Set(rendered.rendered).size===12,'Unexpected completed export inventory');
  bound={rendererSHA256:rendererHash,runtimeAssetsSHA256:catalogHash,renderRunSHA256:fileHash(renderRunFile),validatorSHA256:fileHash(SELF),inputBindings:rendered.inputBindings};
  for(const item of expected) {
    assert(fs.existsSync(path.join(ROOT,item.path)),'Missing export '+item.path);
    const result=item.format==='webp'?await inspectWebP(item.path,item.kind):await inspectVideo(item.path,item.kind,item.format);
    assets.push(result);
    console.log(`${item.path}: full decode passed, ${result.decodedFrames||result.decodedPages} frames/pages, ${result.bytes} bytes`);
  }
  assert(fileHash(renderer)===bound.rendererSHA256&&fileHash(catalogFile)===bound.runtimeAssetsSHA256&&fileHash(renderRunFile)===bound.renderRunSHA256,'Inputs changed during media validation');
  for(const[p,h]of Object.entries(bound.inputBindings))assert(fileHash(path.join(ROOT,p))===h,'Input changed during validation: '+p);
  const report={status:'ALL_12_MEDIA_EXPORTS_VALIDATED',checkedAtUtc:new Date().toISOString(),...bound,
    exportCount:assets.length,allPassed:true,checksExecuted:['All 12 files SHA-256 and byte sizes','MP4/WebM codec, 1920x720, 30fps, expected duration and zero audio','Strict complete decode of all 8 MP4/WebM files with every frame hashed','MP4 moov-before-mdat faststart ordering','Complete RGBA page decode of all 4 animated WebP files, real frame variation and timing','Measured decoded first/last differences on every export without an arbitrary quality threshold','Renderer/catalog/run-report hash binding and no media changes during validation'],
    notExecuted:['Human artistic approval','User visual acceptance','Production website deployment','Audio design, because all movie exports intentionally have no audio'],
    seamInterpretation:'Numeric differences are evidence for review only; they are not declared a beauty or perceptual seamlessness score.',
    versions:{node:process.version,sharp:sharp.versions,ffmpeg:(await run('ffmpeg',['-version'],{encoding:'utf8'})).stdout.split('\n')[0]},assets};
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,exportCount:assets.length,report:'reports/media-validation.json'}));
} catch(error) {
  fs.writeFileSync(reportFile,JSON.stringify({status:'MEDIA_VALIDATION_FAILED',checkedAtUtc:new Date().toISOString(),...bound,completedExports:assets,error:error.message},null,2)+'\n');
  console.error(error.message);process.exitCode=1;
} finally {
  fs.rmSync(temp,{recursive:true,force:true});
}
