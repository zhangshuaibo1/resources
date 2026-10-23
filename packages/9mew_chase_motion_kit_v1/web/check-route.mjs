import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sampleChase, CHASE_PHASES, CHASE_DURATION_MS} from './chase-scene.js';

const web = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(web, '../catalog.json');
const catalog = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
const cases = [[1440,900,160],[390,844,160],[358,475,200],[320,568,240],[1920,1080,240]];
const evidence = [];
for (const [width,height,catSize] of cases) {
  let previous;
  for (let t=0;t<=CHASE_DURATION_MS;t+=25) {
    const s = sampleChase(t,width,height,{catSize,catalog});
    for (const key of ['cat','mouse','butterfly']) {
      const a=s[key];
      assert(a.x-a.width*a.anchorX>=31.99,key+' clips left safe inset');
      assert(a.y-a.height*a.anchorY>=31.99,key+' clips top safe inset');
      assert(a.x+a.width*(1-a.anchorX)<=width-31.99,key+' clips right safe inset');
      assert(a.y+a.height*(1-a.anchorY)<=height-31.99,key+' clips bottom safe inset');
      if(catalog)assert(a.frame>=0&&a.frame<catalog.actions[a.action].frameCount,'Frame outside atlas');
    }
    if(previous)assert(Math.hypot(s.cat.x-previous.cat.x,s.cat.y-previous.cat.y)<30,'Cat jumps on route');
    previous=s;
  }
  const start=sampleChase(0,width,height,{catSize,catalog}),end=sampleChase(CHASE_DURATION_MS,width,height,{catSize,catalog});
  assert.equal(start.cat.x,end.cat.x);assert.equal(start.cat.y,end.cat.y);assert.equal(start.cat.flip,end.cat.flip);
  const seams=[];
  for(const phase of CHASE_PHASES.slice(1)) {
    const before=sampleChase(phase.start-.01,width,height,{catSize,catalog});
    const after=sampleChase(phase.start,width,height,{catSize,catalog});
    for(const key of ['cat','butterfly']) {
      if(before[key].opacity<.001||after[key].opacity<.001)continue;
      const distance=Math.hypot(before[key].x-after[key].x,before[key].y-after[key].y);
      assert(distance<4.1,`${key} discontinuity at ${phase.id}: ${distance}`);
      seams.push({phase:phase.id,actor:key,deltaPx:distance});
    }
  }
  assert(sampleChase(2000,width,height,{catSize,catalog}).cat.x>sampleChase(5000,width,height,{catSize,catalog}).cat.x);
  assert(sampleChase(8000,width,height,{catSize,catalog}).cat.y>sampleChase(12000,width,height,{catSize,catalog}).cat.y);
  assert(sampleChase(13000,width,height,{catSize,catalog}).cat.x<sampleChase(17500,width,height,{catSize,catalog}).cat.x);
  assert(sampleChase(19000,width,height,{catSize,catalog}).cat.y<sampleChase(23000,width,height,{catSize,catalog}).cat.y);
  evidence.push({width,height,catSize,seams});
}
console.log(JSON.stringify({status:'ROUTE_GEOMETRY_PASSED',catalogPresent:!!catalog,caseCount:cases.length,samplesPerCase:1081,evidence}));
