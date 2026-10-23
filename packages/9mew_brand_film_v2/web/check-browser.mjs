/** Real Chromium checks using the completed package's MP4s and posters. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const web = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(web);
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assets = ['exports/brand-film-dark.mp4', 'exports/brand-film-light.mp4', 'posters/brand-film-dark.webp', 'posters/brand-film-light.webp', 'fonts/9mew-chase.woff'];
for (const file of assets) assert(fs.existsSync(path.join(root, file)), `Required actual asset missing: ${file}`);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
  const size = fs.statSync(file).size;
  const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'};
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) { response.writeHead(416); response.end(); return; }
    response.writeHead(206, {...headers, 'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
    fs.createReadStream(file,{start,end}).pipe(response);
  } else {
    response.writeHead(200,{...headers,'Content-Length':size});
    fs.createReadStream(file).pipe(response);
  }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const report = {
  status:'RUNNING', checkedAt:new Date().toISOString(),
  runtimeSHA256:sha(path.join(web,'brand-film.js')),testSHA256:sha(fileURLToPath(import.meta.url)),
  webFiles:['brand-film.js','brand-film.css','demo.js','demo.css','index.html','brand-film.d.ts'].map(p=>({path:'web/'+p,sha256:sha(path.join(web,p))})),
  assets:assets.map(p=>({path:p,sha256:sha(path.join(root,p)),bytes:fs.statSync(path.join(root,p)).size})),
  checks:[], errors:[], externalRequests:[], unexpectedHTTP:[],
  limits:['Chromium desktop and mobile viewport emulation; not physical iPhone/Android testing.',
    'Document visibility uses a simulated visibilitychange event. Offscreen suspension uses an actual browser scroll.',
    'These checks verify media and interaction behavior, not user approval of artistic quality. No production deployment.'],
};
const browser = await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PET_BROWSER_EXECUTABLE ? {executablePath:process.env.PET_BROWSER_EXECUTABLE} : {})});
const qa = path.join(web,'qa'); fs.mkdirSync(qa,{recursive:true});
const inspect = page => page.evaluate(()=>window.__9mewBrandFilm.inspect());
const ready = page => page.waitForFunction(()=>window.__9mewBrandFilm && document.querySelector('.mew-brand-film__poster')?.complete);
async function check(name, callback) { const evidence = await callback(); report.checks.push({name,result:'PASS',...(evidence ? {evidence} : {})}); console.log('PASS '+name); }
function observe(page, {trackHTTP = true} = {}) {
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))report.externalRequests.push(r.url());});
  if(trackHTTP)page.on('response',r=>{if(r.status()>=400 && !r.url().endsWith('/favicon.ico'))report.unexpectedHTTP.push({url:r.url().replace(origin,''),status:r.status()});});
}
try {
  report.browserVersion = browser.version();
  const context = await browser.newContext({viewport:{width:1440,height:1120},reducedMotion:'no-preference'});
  const page = await context.newPage(); observe(page);
  const requestedMedia=[]; page.on('request',r=>{if(/\.(mp4|webm)(\?|$)/.test(r.url()))requestedMedia.push(r.url());});
  await page.goto(origin+'/web/'); await ready(page);
  await check('Initial poster is decoded; no video requested before play',async()=>{
    const state=await inspect(page);assert.equal(state.posterMode,true);assert.equal(state.playing,false);assert.equal(state.loaded,false);
    assert.deepEqual(requestedMedia,[]);
    return await page.locator('.mew-brand-film__poster').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight,decoded:img.complete}));
  });
  await check('Chinese font loads and desktop poster has no overflow',async()=>{
    await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.fonts.check('16px "9mew Sans"')));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(qa,'desktop-dark.png'),fullPage:true});
  });
  await check('Explicit play decodes real MP4 frames',async()=>{
    await page.getByRole('button',{name:'播放九喵品牌宣传动画',exact:true}).click();
    await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing && window.__9mewBrandFilm.video.currentTime>0.15);
    const before=await page.evaluate(()=>window.__9mewBrandFilm.video.getVideoPlaybackQuality().totalVideoFrames);
    await page.waitForTimeout(350);
    const after=await page.evaluate(()=>({frames:window.__9mewBrandFilm.video.getVideoPlaybackQuality().totalVideoFrames,width:window.__9mewBrandFilm.video.videoWidth,height:window.__9mewBrandFilm.video.videoHeight,duration:window.__9mewBrandFilm.video.duration}));
    assert(after.frames>before);assert.equal(after.width,1920);assert.equal(after.height,720);assert(Math.abs(after.duration-16)<0.1);
    return {framesBefore:before,...after};
  });
  await check('Manual pause freezes time',async()=>{
    await page.getByRole('button',{name:'暂停九喵品牌动画',exact:true}).click();
    const before=await inspect(page);await page.waitForTimeout(250);const after=await inspect(page);
    assert.equal(after.playing,false);assert.equal(after.requestedPlay,false);assert(Math.abs(after.currentTime-before.currentTime)<0.02);
  });
  await check('Actual offscreen scroll suspends and resumes only active intent',async()=>{
    await page.evaluate(()=>window.__9mewBrandFilm.play());await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    await page.evaluate(()=>{const div=document.createElement('div');div.id='qa-spacer';div.style.height='2500px';document.body.append(div);scrollTo(0,document.body.scrollHeight);});
    await page.waitForFunction(()=>!window.__9mewBrandFilm.inspect().visible);const before=await inspect(page);
    await page.waitForTimeout(200);const after=await inspect(page);assert.equal(after.playing,false);assert(Math.abs(after.currentTime-before.currentTime)<0.02);
    await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    await page.evaluate(()=>window.__9mewBrandFilm.pause());
    await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForFunction(()=>!window.__9mewBrandFilm.inspect().visible);
    await page.evaluate(()=>{document.getElementById('qa-spacer').remove();scrollTo(0,0);});await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().visible);
    await page.waitForTimeout(150);assert.equal((await inspect(page)).playing,false);
  });
  await check('Simulated hidden document suspends; manual pause remains paused after return',async()=>{
    await page.evaluate(()=>window.__9mewBrandFilm.play());await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const before=await inspect(page);await page.waitForTimeout(180);assert(Math.abs((await inspect(page)).currentTime-before.currentTime)<0.02);assert.equal((await inspect(page)).playing,false);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    await page.evaluate(()=>{window.__9mewBrandFilm.pause();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(120);assert.equal((await inspect(page)).playing,false);
  });
  await check('Seek, natural ending and replay work',async()=>{
    await page.evaluate(()=>{window.__9mewBrandFilm.seek(15.8);window.__9mewBrandFilm.play();});
    await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().status==='ended');
    assert.equal((await inspect(page)).requestedPlay,false);
    await page.getByRole('button',{name:'重播',exact:true}).click();await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    assert((await inspect(page)).currentTime<1);
    await page.evaluate(()=>window.__9mewBrandFilm.pause());
  });
  await check('Theme switch preserves pause and loads the actual light poster',async()=>{
    await page.evaluate(()=>window.__9mewBrandFilm.seek(9));
    const count=requestedMedia.length;
    await page.getByRole('button',{name:'晨光',exact:true}).click();await ready(page);
    const state=await inspect(page);assert.equal(state.theme,'light');assert.equal(state.requestedPlay,false);assert.equal(state.playing,false);assert.equal(state.currentTime,9);
    assert.equal(requestedMedia.length,count);
    await page.screenshot({path:path.join(qa,'desktop-light.png'),fullPage:true});
    await page.getByRole('button',{name:'播放动画',exact:false}).click();await page.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    assert((await inspect(page)).currentTime>=9);
    await page.evaluate(()=>window.__9mewBrandFilm.pause());
  });
  await check('Fullscreen is an explicit button action',async()=>{
    await page.getByRole('button',{name:'全屏',exact:true}).click();
    await page.waitForFunction(()=>!!document.fullscreenElement);
    await page.getByRole('button',{name:'退出全屏',exact:true}).click();await page.waitForFunction(()=>!document.fullscreenElement);
  });
  await check('Mobile viewport keeps the complete 8:3 picture without horizontal overflow',async()=>{
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.__9mewBrandFilm.showPoster());await page.waitForTimeout(100);
    const dimensions=await page.locator('.mew-brand-film__screen').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,objectFit:getComputedStyle(el.querySelector('video')).objectFit}));
    assert(Math.abs(dimensions.width/dimensions.height-8/3)<0.01);assert.equal(dimensions.objectFit,'contain');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:path.join(qa,'mobile-light.png'),fullPage:true});return dimensions;
  });
  const reduced = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const rp = await reduced.newPage(); observe(rp); await rp.goto(origin+'/web/');await ready(rp);
  await check('Reduced motion blocks autoplay but allows an explicit keyboard play',async()=>{
    await rp.evaluate(async()=>{window.__9mewBrandFilm.destroy();const {createBrandFilm}=await import('./brand-film.js');window.__9mewBrandFilm=createBrandFilm(document.getElementById('film'),{autoplay:true});});
    await rp.waitForTimeout(150);const s=await inspect(rp);assert.equal(s.status,'reduced-motion');assert.equal(s.loaded,false);assert.equal(s.playing,false);
    await rp.getByRole('button',{name:'播放九喵品牌动画',exact:true}).focus();await rp.keyboard.press('Enter');
    await rp.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
    assert.equal((await inspect(rp)).explicitPlay,true);
  });
  await check('Destroy releases the video and removes the component',async()=>{
    await rp.evaluate(()=>window.__9mewBrandFilm.destroy());assert.equal(await rp.locator('.mew-brand-film').count(),0);assert.equal((await inspect(rp)).playing,false);
  });
  const failure = await browser.newContext({viewport:{width:1200,height:900}});
  const fp = await failure.newPage(); observe(fp,{trackHTTP:false});
  await fp.route('**/brand-film-dark.mp4',r=>r.abort());await fp.goto(origin+'/web/');await ready(fp);
  await check('A deliberately failed MP4 retains the real poster and explicit retry recovers',async()=>{
    await fp.getByRole('button',{name:'播放九喵品牌宣传动画',exact:true}).click();await fp.waitForFunction(()=>window.__9mewBrandFilm.inspect().status==='error');
    const state=await inspect(fp);assert.equal(state.posterMode,true);assert.equal(state.playing,false);
    assert(await fp.locator('.mew-brand-film__poster').evaluate(img=>img.complete&&img.naturalWidth>0));
    await fp.unroute('**/brand-film-dark.mp4');
    await fp.getByRole('button',{name:'播放九喵品牌宣传动画',exact:true}).click();
    await fp.waitForFunction(()=>window.__9mewBrandFilm.inspect().playing);
  });
  await check('No JavaScript errors, unexpected HTTP failures or external requests',async()=>{
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpectedHTTP,[]);assert.deepEqual(report.externalRequests,[]);
  });
  report.status='BRAND_FILM_BROWSER_CHECKS_PASSED';
  report.screenshots=['qa/desktop-dark.png','qa/desktop-light.png','qa/mobile-light.png'];
} catch(error) { report.status='BRAND_FILM_BROWSER_CHECKS_FAILED';report.failure=error.message;throw error; }
finally {
  fs.writeFileSync(path.join(web,'browser-validation.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
