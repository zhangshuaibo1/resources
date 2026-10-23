import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const require = createRequire(import.meta.url);
const playwright = require((process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '') + '/playwright');
const web = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(web), origin = process.env.CHASE_REVIEW_ORIGIN || 'http://127.0.0.1:9077';
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const catalog = JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const checks=[],errors=[],externalRequests=[];
const report={status:'RUNNING',executedAt:new Date().toISOString(),catalogSHA256:hash(path.join(root,'catalog.json')),
  runtimeSHA256:hash(path.join(web,'chase-scene.js')),testSHA256:hash(fileURLToPath(import.meta.url)),checks,
  limits:['Local Chromium only, with mobile viewport emulation; not real mobile-device testing.',
    'Document visibility is tested with a simulated visibilitychange event; offscreen suspension uses a real scroll.',
    'Visual quality and identity still require user acceptance. No production deployment or model service was exercised.']};
const screenshots=path.join(web,'qa');fs.mkdirSync(screenshots,{recursive:true});
const inspect=page=>page.evaluate(()=>window.mewChase.inspect());
async function check(name, fn){const evidence=await fn();checks.push({name,result:'PASS',...(evidence?{evidence}:{})});console.log('PASS '+name);}
async function loaded(page){await page.waitForFunction(()=>window.mewChase?.inspect().loaded||window.mewChase?.inspect().loadFailed);}
const browser=await playwright.chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PET_BROWSER_EXECUTABLE?{executablePath:process.env.PET_BROWSER_EXECUTABLE}:{})});
try{
  report.browserVersion=browser.version();
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{const u=r.url();if(/^https?:/.test(u)&&!u.startsWith(origin))externalRequests.push(u);});
  await page.goto(origin+'/web/');await loaded(page);
  await check('all real sprite atlases loaded and decoded',async()=>{
    const s=await inspect(page);assert.equal(s.loaded,true);assert.equal(s.loadFailed,false);assert.equal(s.playing,true);
    const dimensions=await page.evaluate(async catalog=>Promise.all(Object.entries(catalog.actions).map(async([id,a])=>{
      const image=new Image();image.src=new URL('../'+a.sprite,document.baseURI);await image.decode();
      return{id,width:image.naturalWidth,height:image.naturalHeight,expectedWidth:a.columns*a.frameWidth,expectedHeight:a.rows*a.frameHeight};
    })),catalog);
    for(const a of dimensions){assert.equal(a.width,a.expectedWidth);assert.equal(a.height,a.expectedHeight);}return dimensions;
  });
  await check('27-second route stays in safe bounds and returns home',async()=>JSON.parse(execFileSync(process.execPath,[path.join(web,'check-route.mjs')],{encoding:'utf8'})));
  await check('actual pose frames and route coordinates change while playing',async()=>{
    await page.evaluate(()=>{window.mewChase.seek(2500);window.mewChase.play();});
    const before=await inspect(page);await page.waitForTimeout(230);const after=await inspect(page);
    assert(after.timeMs>before.timeMs);assert(after.cat.x<before.cat.x);assert.notEqual(after.cat.frame,before.cat.frame);
    return{before:{time:before.timeMs,x:before.cat.x,frame:before.cat.frame},after:{time:after.timeMs,x:after.cat.x,frame:after.cat.frame}};
  });
  await check('pause freezes both frame and location',async()=>{
    await page.getByRole('button',{name:'暂停动画',exact:true}).click();const before=await inspect(page);
    await page.waitForTimeout(350);const after=await inspect(page);
    assert.equal(before.timeMs,after.timeMs);assert.deepEqual(before.cat,after.cat);assert.equal(after.playing,false);
  });
  await check('every cat state appears with its expected true frame',async()=>{
    const samples=[];for(const [t,action] of [[0,'rest'],[2500,'chase-run'],[6800,'chase-look-up'],[7800,'chase-leap'],[14000,'chase-float'],[23600,'chase-land']]){
      await page.evaluate(t=>window.mewChase.seek(t),t);const s=await inspect(page);assert.equal(s.cat.action,action);samples.push({timeMs:t,action,frame:s.cat.frame});
    }return samples;
  });
  await check('light and dark preview render without overflow',async()=>{
    await page.evaluate(()=>window.mewChase.seek(4300));
    await page.screenshot({path:path.join(screenshots,'desktop-dark.png'),fullPage:true});
    await page.getByRole('button',{name:'切换到浅色主题'}).click();
    await page.screenshot({path:path.join(screenshots,'desktop-light.png'),fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  });
  await check('finite playback completes and replay restarts',async()=>{
    await page.evaluate(()=>{window.mewChase.seek(26950);window.mewChase.play();});
    await page.waitForFunction(()=>window.mewChase.inspect().state==='finished');const end=await inspect(page);
    assert.equal(end.timeMs,27000);assert.equal(end.playing,false);
    await page.getByRole('button',{name:'重新出发',exact:false}).click();await page.waitForTimeout(100);
    const replay=await inspect(page);assert(replay.timeMs<500);assert.equal(replay.playing,true);
  });
  await check('hidden-document suspension preserves scene time',async()=>{
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    const before=await inspect(page);await page.waitForTimeout(250);const after=await inspect(page);assert.equal(after.timeMs,before.timeMs);assert.equal(after.state,'suspended');
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(150);assert((await inspect(page)).timeMs>after.timeMs);
  });
  await check('real offscreen scrolling pauses and resumes',async()=>{
    await page.evaluate(()=>{const spacer=document.createElement('div');spacer.id='qa-spacer';spacer.style.height='2200px';document.body.append(spacer);scrollTo(0,document.body.scrollHeight);});
    await page.waitForFunction(()=>window.mewChase.inspect().visible===false);const before=await inspect(page);
    await page.waitForTimeout(200);assert.equal((await inspect(page)).timeMs,before.timeMs);
    await page.evaluate(()=>{document.getElementById('qa-spacer').remove();scrollTo(0,0);});
    await page.waitForFunction(()=>window.mewChase.inspect().visible===true);await page.waitForTimeout(100);
    assert((await inspect(page)).timeMs>before.timeMs);
  });
  await check('mobile resize retains progress and fits the viewport',async()=>{
    await page.evaluate(()=>{window.mewChase.pause();window.mewChase.seek(11000);});const time=(await inspect(page)).timeMs;
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
    const s=await inspect(page);assert.equal(s.timeMs,time);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert(s.cat.x-s.cat.width*s.cat.anchorX>=31.9);assert(s.cat.y-s.cat.height*s.cat.anchorY>=31.9);
    await page.screenshot({path:path.join(screenshots,'mobile-light.png'),fullPage:true});return{canvas:{width:s.width,height:s.height},cat:s.cat};
  });
  await check('full-viewport overlay passes real clicks through and cleans old instance',async()=>{
    await page.getByRole('button',{name:'铺满屏幕',exact:false}).click();await loaded(page);
    assert.equal(await page.locator('.mew-chase-overlay').count(),1);
    assert.equal(await page.locator('.mew-chase-overlay').evaluate(el=>getComputedStyle(el).position),'fixed');
    await page.evaluate(()=>{const b=document.createElement('button');b.id='qa-target';b.textContent='QA';b.style.cssText='position:fixed;left:10px;top:10px;width:45px;height:35px;z-index:2';b.onclick=()=>window.__clicked=true;document.body.append(b);});
    await page.mouse.click(25,25);assert.equal(await page.evaluate(()=>window.__clicked),true);
    await page.evaluate(()=>document.getElementById('qa-target').remove());
    await page.getByRole('button',{name:'回到画框',exact:false}).click();await loaded(page);assert.equal(await page.locator('.mew-chase-overlay').count(),1);
  });
  await check('speed and size controls update active controller',async()=>{
    await page.selectOption('#speed','1.5');await page.selectOption('#size','200');
    assert.equal((await inspect(page)).speed,1.5);
    await page.evaluate(()=>window.mewChase.pause());
  });
  await check('destroy removes overlay and stops time',async()=>{
    await page.evaluate(()=>window.mewChase.destroy());assert.equal(await page.locator('.mew-chase-overlay').count(),0);
    const before=(await inspect(page)).timeMs;await page.waitForTimeout(150);assert.equal((await inspect(page)).timeMs,before);
  });
  const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const rp=await reduced.newPage();rp.on('pageerror',e=>errors.push(e.message));await rp.goto(origin+'/web/');await loaded(rp);
  await check('reduced motion stays static until explicit keyboard play',async()=>{
    const s=await inspect(rp);assert.equal(s.state,'reduced-motion');assert.equal(s.timeMs,0);
    await rp.waitForTimeout(250);assert.equal((await inspect(rp)).timeMs,0);
    await rp.getByRole('button',{name:'播放动画',exact:true}).focus();await rp.keyboard.press('Enter');await rp.waitForTimeout(160);
    const played=await inspect(rp);assert.equal(played.userOverride,true);assert(played.timeMs>0);
  });
  const failure=await browser.newContext({viewport:{width:1200,height:900}});
  const fp=await failure.newPage();fp.on('pageerror',e=>errors.push(e.message));
  await fp.route('**/sprites/chase-run.webp',route=>route.abort());await fp.goto(origin+'/web/');await loaded(fp);
  await check('missing sprite falls back to the selected original still',async()=>{
    const s=await inspect(fp);assert.equal(s.loadFailed,true);assert.equal(s.state,'fallback');assert.equal(s.playing,false);
    const alpha=await fp.locator('canvas').evaluate(c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)n++;return n;});
    assert(alpha>100);return{drawnAlphaPixels:alpha};
  });
  await check('no JavaScript errors or external network requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);});
  report.status='RUNTIME_CHECKS_PASSED';report.screenshots=['qa/desktop-dark.png','qa/desktop-light.png','qa/mobile-light.png'];
}catch(e){report.status='RUNTIME_CHECKS_FAILED';report.failure=e.message;throw e;}
finally{report.errors=errors;report.externalRequests=externalRequests;fs.writeFileSync(path.join(web,'runtime-validation.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
