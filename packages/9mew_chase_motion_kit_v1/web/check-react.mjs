// Optional adapter check using caller-provided existing React/TypeScript/esbuild.
// No package installation or external network requests are performed.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const web=path.dirname(fileURLToPath(import.meta.url));
const kit=path.dirname(web);
const require=createRequire(import.meta.url);
const dependencies=process.env.CHASE_REACT_DEPS;
if(!dependencies)throw new Error('Set CHASE_REACT_DEPS to an existing node_modules with React, types, TypeScript and esbuild.');
const deps=path.resolve(dependencies);
const esbuild=require(path.join(deps,'esbuild'));
const {chromium}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||deps,'playwright'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const version=name=>JSON.parse(fs.readFileSync(path.join(deps,name,'package.json'),'utf8')).version;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'9mew-chase-react-check-'));
const checks=[],errors=[];
let browser,server;
const report={status:'RUNNING',executedAt:new Date().toISOString(),checks,
  dependencies:Object.fromEntries(['react','react-dom','@types/react','@types/react-dom','typescript','esbuild'].map(n=>[n,version(n)])),
  sourceSHA256:{adapter:hash(path.join(web,'ChasePet.tsx')),types:hash(path.join(web,'chase-scene.d.ts')),runtime:hash(path.join(web,'chase-scene.js'))},
  limits:['Local Chromium with the listed existing dependencies only.','No production app or framework-specific deployment tested.','No new packages installed and no external network requests required.']};
try{
  const config={files:[path.join(web,'ChasePet.tsx')],compilerOptions:{strict:true,noEmit:true,skipLibCheck:false,
    target:'ES2022',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',lib:['ES2022','DOM'],
    types:['react','react-dom'],typeRoots:[path.join(deps,'@types')],
    paths:{react:[path.join(deps,'@types/react/index.d.ts')],
      'react/jsx-runtime':[path.join(deps,'@types/react/jsx-runtime.d.ts')],
      'react-dom':[path.join(deps,'@types/react-dom/index.d.ts')]}}};
  const configPath=path.join(temp,'tsconfig.json');fs.writeFileSync(configPath,JSON.stringify(config));
  const output=execFileSync(process.execPath,[path.join(deps,'typescript/bin/tsc'),'-p',configPath],{encoding:'utf8'});
  checks.push({name:'Strict TypeScript adapter and declaration check',result:'PASS',output:output.trim()});
  const entry=`import {createElement,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ChasePet} from ${JSON.stringify(path.join(web,'ChasePet.tsx'))};
const root=createRoot(document.getElementById('app'));
window.readyCount=0;window.instances=[];
window.mountPet=()=>root.render(createElement(StrictMode,null,createElement(ChasePet,{catalogUrl:'/catalog.json',autoplay:true,onReady:c=>{window.activePet=c;window.instances.push(c);window.readyCount++;}})));
window.unmountPet=()=>root.render(null);
window.mountPet();`;
  const bundled=await esbuild.build({stdin:{contents:entry,loader:'tsx',resolveDir:temp},nodePaths:[deps],bundle:true,
    write:false,format:'iife',platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"development"'}});
  const code=bundled.outputFiles[0].text;
  checks.push({name:'React adapter bundles with the shared runtime',result:'PASS',bundleBytes:Buffer.byteLength(code)});
  server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script src="/qa-bundle.js"></script></body></html>');return;}
    if(url.pathname==='/qa-bundle.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(code);return;}
    const file=path.resolve(kit,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(kit+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    const mime={'.json':'application/json','.webp':'image/webp','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':mime});fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PET_BROWSER_EXECUTABLE?{executablePath:process.env.PET_BROWSER_EXECUTABLE}:{})});
  report.browserVersion=browser.version();
  const page=await browser.newPage({viewport:{width:1000,height:720},reducedMotion:'no-preference'});
  const external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(origin))external.push(r.url());});
  await page.goto(origin);await page.waitForFunction(()=>window.readyCount===1);
  assert.equal(await page.locator('.mew-chase-overlay').count(),1);
  await page.waitForTimeout(180);assert((await page.evaluate(()=>window.activePet.inspect().timeMs))>0);
  checks.push({name:'React StrictMode double-effect mount leaves one live playing overlay',result:'PASS'});
  await page.evaluate(()=>window.activePet.pause());const frozen=await page.evaluate(()=>window.activePet.inspect().timeMs);
  await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>window.activePet.inspect().timeMs),frozen);
  checks.push({name:'Controller delivered through onReady pauses playback',result:'PASS'});
  await page.evaluate(()=>window.unmountPet());await page.waitForFunction(()=>document.querySelectorAll('.mew-chase-overlay').length===0);
  const oldTime=await page.evaluate(()=>window.instances[0].inspect().timeMs);
  await page.evaluate(()=>window.mountPet());await page.waitForFunction(()=>window.readyCount===2);
  assert.equal(await page.locator('.mew-chase-overlay').count(),1);await page.waitForTimeout(120);
  assert.equal(await page.evaluate(()=>window.instances[0].inspect().timeMs),oldTime);
  assert((await page.evaluate(()=>window.activePet.inspect().timeMs))>0);
  checks.push({name:'Unmount removes the old overlay; remount works without reviving it',result:'PASS'});
  await page.evaluate(()=>window.unmountPet());await page.waitForFunction(()=>document.querySelectorAll('.mew-chase-overlay').length===0);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  checks.push({name:'No JavaScript errors or external requests in mount/unmount smoke',result:'PASS'});
  report.status='REACT_ADAPTER_CHECKS_PASSED';
}catch(error){report.status='REACT_ADAPTER_CHECKS_FAILED';report.failure=error.message;throw error;}
finally{
  report.errors=errors;fs.writeFileSync(path.join(web,'react-validation.json'),JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
  fs.rmSync(temp,{recursive:true,force:true});console.log(JSON.stringify(report));
}
