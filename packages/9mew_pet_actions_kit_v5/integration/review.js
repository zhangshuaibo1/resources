const KIT=new URL('../',location.href),grid=document.querySelector('#grid'),notice=document.querySelector('#notice');
let manifest,theme='light',locale='zh',cleanups=[];
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
const text={
zh:{eyebrow:'九喵宇宙 · 视觉系统',title:'让陪伴，有自己的形状。',subtitle:'原画、场景插画与奶喵的宠物动作。保留熟悉的形象，让陪伴更生动。',actionsLink:'宠物动作',websiteLink:'官网相伴',light:'浅色预览',dark:'深色预览',status:'状态',delivered:'已交付 / 原型',all:'全部规划',planned:'规划中',ready:'可用素材',prototype:'设计原型',retired:'已停用',reduce:'减少动态预览',footer:'本地评审工具 · 无外部 CDN · 未批准素材保留“原型”状态',play:'播放动效',pause:'暂停',download:'下载',empty:'这一筛选条件下暂无素材。',reduced:'减少动态效果已开启，展示静态画面。',failed:'资产清单尚未就绪。请从素材包根目录启动本地服务后打开本页。',missing:'静态预览暂不可用。',notice:'深浅主题由素材清单选择；透明素材可共享同一文件。已停用素材不提供播放入口。'},
en:{eyebrow:'9MEW UNIVERSE · VISUAL SYSTEM',title:'A little character. A world of connection.',subtitle:'Original art, scene illustrations and Naimiao character actions. A familiar companion, brought to life.',actionsLink:'Pet actions',websiteLink:'Website pet',light:'Light preview',dark:'Dark preview',status:'Status',delivered:'Delivered / prototype',all:'Full roadmap',planned:'Planned',ready:'Available',prototype:'Design prototype',retired:'Retired',reduce:'Reduce motion',footer:'Local review tool · No external CDN · Unapproved designs remain prototypes',play:'Play motion',pause:'Pause',download:'Download',empty:'No assets match this filter.',reduced:'Reduced motion is enabled. Still previews remain available.',failed:'The asset manifest is not ready. Start the local server from this kit before opening this page.',missing:'Still preview unavailable.',notice:'Theme variants follow the manifest. Transparent assets may share one file. Retired assets have no playback entry.'}
};
const el=(tag,className,value)=>{const n=document.createElement(tag);if(className)n.className=className;if(value!==undefined)n.textContent=value;return n;};
function path(src){
  if(typeof src!=='string'||/[\\?#\u0000]/.test(src)||/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(src))return null;
  let decoded;try{decoded=decodeURIComponent(src);}catch{return null;}
  if(decoded.split('/').includes('..'))return null;
  const base=new URL(manifest?.basePath||'./',KIT),url=new URL(src,base);
  return url.origin===location.origin&&url.href.startsWith(KIT.href)?url.href:null;
}
function bytes(n){return typeof n==='number'?n<1024*1024?`${Math.round(n/1024)} KB`:`${(n/(1024*1024)).toFixed(2)} MB`:'';}
function reduced(){return systemMotion.matches||document.querySelector('#reduce').checked;}
function translate(){
  const t=text[locale];document.documentElement.lang=locale==='zh'?'zh-CN':'en';document.documentElement.dataset.theme=theme;
  ['eyebrow','title','subtitle','footer'].forEach(id=>document.querySelector('#'+id).textContent=t[id]);
  document.querySelector('#pet-actions-link').textContent=t.actionsLink;document.querySelector('#website-pet-link').textContent=t.websiteLink;
  document.querySelector('#language').textContent=locale==='zh'?'English':'中文';
  const toggle=document.querySelector('#theme');toggle.textContent=theme==='light'?t.dark:t.light;toggle.setAttribute('aria-pressed',String(theme==='dark'));
  document.querySelector('#status-label').textContent=t.status;document.querySelector('#reduce-label').textContent=t.reduce;
  for(const option of document.querySelector('#status').options)option.textContent=t[option.value];
  notice.textContent=reduced()?t.reduced:t.notice;
}
function counts(){const t=text[locale],counts=document.querySelector('#counts');counts.replaceChildren();for(const [key,label] of [['ready',t.ready],['prototype',t.prototype],['planned',t.planned],['retired',t.retired]]){const span=el('span'),n=manifest.assets.filter(a=>a.status===key).length;span.append(el('strong','',String(n)),document.createTextNode(label));counts.append(span);}}
function card(asset){
  const t=text[locale],variant=asset.variants?.[theme]||asset.variants?.neutral||{},usable=asset.status==='ready'||asset.status==='prototype';
  const still=variant.poster||variant.still,poster=path(still?.src),motion=path(variant.motion?.src);
  const node=el('article',`asset-card${!usable?' is-planned':''}`),stage=el('div','stage');
  const body=el('div','card-body'),title=asset.title?.[locale]||asset.title?.zh||asset.id;
  node.dataset.assetId=asset.id;
  let img,video,motionActive=false,inView=false,alive=true;
  const status=el('div','status-line');status.setAttribute('aria-live','polite');
  if(usable&&poster){img=el('img');img.src=poster;img.alt=asset.decorative?'':asset.alt?.[locale]||title;img.loading='lazy';img.decoding='async';if(still.width)img.width=still.width;if(still.height)img.height=still.height;img.addEventListener('error',()=>{if(motionActive){motionActive=false;img.src=poster;status.textContent=t.missing;}else{img.hidden=true;stage.append(el('span','placeholder',t.missing));}});stage.append(img);}
  else stage.append(el('span','placeholder',usable?t.missing:t[asset.status]||t.planned));
  stage.append(el('span','badge',t[asset.status]||asset.status));
  body.append(el('h2','card-title',title),el('div','asset-id',`${asset.id}${asset.version?' · '+asset.version:''}`));
  const meta=el('div','metadata');
  [asset.kind,still?.width&&still?.height?`${still.width} × ${still.height}`:'',bytes(variant.motion?.bytes||still?.bytes)].filter(Boolean).forEach(value=>meta.append(el('span','',value)));body.append(meta);
  const controls=el('div','card-controls');let motionButton;
  function syncMotion(){
    const active=motionActive&&!reduced()&&inView&&!document.hidden;
    if(video){video.hidden=!active;if(active)void video.play().catch(()=>{motionActive=false;video.hidden=true;if(motionButton)motionButton.textContent=t.play;});else video.pause();}
    else if(img)img.src=active&&motion?motion:poster;
    if(motionButton){motionButton.textContent=motionActive?t.pause:t.play;motionButton.setAttribute('aria-pressed',String(motionActive));}
  }
  if(usable&&motion){
    const isVideo=variant.motion.mime?.startsWith('video/');
    if(isVideo){video=el('video');video.muted=true;video.playsInline=true;video.loop=variant.motion.loop!==false;video.preload='none';video.hidden=true;if(poster)video.poster=poster;video.src=motion;video.setAttribute('aria-label',title);video.addEventListener('error',()=>{motionActive=false;syncMotion();});stage.append(video);}
    motionButton=el('button','',t.play);motionButton.type='button';motionButton.disabled=reduced();motionButton.addEventListener('click',()=>{motionActive=!motionActive;syncMotion();});controls.append(motionButton);
  }
  for(const [label,file] of [['PNG',variant.still],['MOTION',variant.motion]]){
    const url=usable?path(file?.src):null;if(!url)continue;
    const a=el('a','download',`${t.download} ${label==='PNG'?(file.mime==='image/svg+xml'?'SVG':(file.mime||'image').split('/').at(-1).toUpperCase()):label}`);a.href=url;a.download=file.src.split('/').at(-1);controls.append(a);
  }
  body.append(controls,status);node.append(stage,body);
  const observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting||false;syncMotion();});observer.observe(node);
  document.addEventListener('visibilitychange',syncMotion);
  cleanups.push(()=>{alive=false;observer.disconnect();document.removeEventListener('visibilitychange',syncMotion);if(video){video.pause();video.removeAttribute('src');video.load();}});
  return node;
}
function render(){translate();if(!manifest)return;cleanups.forEach(fn=>fn());cleanups=[];grid.replaceChildren();counts();const status=document.querySelector('#status').value;const assets=manifest.assets.filter(a=>status==='all'||status==='planned'?status==='all'||a.status==='planned':a.status==='ready'||a.status==='prototype');assets.forEach(a=>grid.append(card(a)));if(!assets.length)grid.append(el('div','empty',text[locale].empty));}
document.querySelector('#theme').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';render();});
document.querySelector('#language').addEventListener('click',()=>{locale=locale==='zh'?'en':'zh';render();});
document.querySelector('#status').addEventListener('change',render);document.querySelector('#reduce').addEventListener('change',render);
function motionChange(){const box=document.querySelector('#reduce');box.disabled=systemMotion.matches;if(systemMotion.matches)box.checked=true;render();}systemMotion.addEventListener('change',motionChange);motionChange();
window.addEventListener('pagehide',()=>cleanups.forEach(fn=>fn()));
try{const response=await fetch(new URL('assets_manifest.json',KIT),{credentials:'same-origin'});if(!response.ok)throw new Error('Manifest unavailable');manifest=await response.json();if(manifest.schemaVersion!==1||!Array.isArray(manifest.assets))throw new Error('Unsupported manifest');render();}catch{notice.textContent=text[locale].failed;}
