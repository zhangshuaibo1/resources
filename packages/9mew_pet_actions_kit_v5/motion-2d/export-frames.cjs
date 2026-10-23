// Offline Canvas 2D export. Requires an installed Playwright/Chromium.
// node motion-2d/export-frames.cjs http://127.0.0.1:8989 /tmp/9mew-frames
const fs=require('fs'),path=require('path');
let playwright;
try{playwright=require('playwright')}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'))}
const base=process.argv[2]||'http://127.0.0.1:8989';
const destination=process.argv[3];
if(!destination)throw Error('Provide an output directory outside the delivery package.');
const frameCount=process.argv.includes('--one-frame')?1:144;
(async()=>{
 const browser=await playwright.chromium.launch({headless:true,...(process.env.NINE_MEW_BROWSER_EXECUTABLE?{executablePath:process.env.NINE_MEW_BROWSER_EXECUTABLE}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:800,height:900},deviceScaleFactor:1});
  const allowed=new URL(base).origin;
  await page.route('**/*',route=>new URL(route.request().url()).origin===allowed?route.continue():route.abort());
  await page.goto(new URL('/motion-2d/naimiao-starlight.html',base).href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.animationReady===true);
  for(const theme of ['light','dark']){
   const dir=path.join(destination,theme);fs.mkdirSync(dir,{recursive:true});
   for(let i=0;i<frameCount;i++){
    const uri=await page.evaluate(({t,theme})=>window.renderFrame(t,theme),{t:i/24,theme});
    fs.writeFileSync(path.join(dir,`${String(i).padStart(4,'0')}.png`),Buffer.from(uri.split(',')[1],'base64'));
   }
   console.log(JSON.stringify({theme,frames:frameCount,fps:24,canvas:[640,640],kind:'motion-poster'}));
  }
 }finally{await browser.close()}
})();
