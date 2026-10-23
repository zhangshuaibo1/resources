import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {WebsitePet} from './WebsitePet';
import type {AppearanceCatalog, AppearanceReference, PetTheme} from './website-pet-types';
import rawCatalog from './website-pet-appearance-catalog.json';
import './website-pet-demo.css';

const catalog = rawCatalog as AppearanceCatalog;
const reference: AppearanceReference = {appearanceId:'9mew.naimiao.website',appearanceVersion:'0.4.0',variantId:'sakura-cream',revision:'local-design-preview-v5-actions',approval:'prototype'};
const kitRoot = new URL('../', window.location.href).pathname;

function PetDemo() {
  const [theme,setTheme] = useState<PetTheme>('light');
  const [reduced,setReduced] = useState(false);
  const [openSignal,setOpenSignal] = useState(0);
  return <div className="pet-demo" data-theme={theme}>
    <header className="pet-demo__header">
      <a href="./review.html" className="pet-demo__brand" aria-label="九喵素材预览">9mew<span>九喵</span></a>
      <span className="pet-demo__preview-label">奶喵 · 会动的小伙伴</span>
      <div className="pet-demo__settings"><label><input type="checkbox" checked={reduced} onChange={event=>setReduced(event.target.checked)}/>减少动态</label><button type="button" onClick={()=>setTheme(value=>value==='light'?'dark':'light')} aria-pressed={theme==='dark'}>{theme==='light'?'切换夜色':'切换晨光'}</button></div>
    </header>
    <main>
      <section className="pet-demo__hero">
        <div className="pet-demo__intro"><div className="pet-demo__eyebrow"><span/>有陪伴，也有灵感</div><h1>每一个想法，<br/>都值得被温柔接住。</h1><p>在九喵，把问题慢慢想清楚，把灵感一点点完成。<br className="pet-demo__desktop-break"/>还有一只奶喵，安静地等你说声你好。</p><div className="pet-demo__hero-actions"><button type="button" className="pet-demo__primary" onClick={()=>setOpenSignal(value=>value+1)}>和奶喵打个招呼 <span aria-hidden="true">↗</span></button><a href="./actions-demo.html">看看奶喵的日常 <span aria-hidden="true">→</span></a></div><div className="pet-demo__small-note">右下角的小伙伴可以展开，也可以挪到喜欢的位置。</div></div>
        <div className="pet-demo__art"><div className="pet-demo__orbit" aria-hidden="true"/><img src={`${kitRoot}illustrations/scene_collaboration.desktop.webp`} width="1024" height="683" alt="不同品种的猫咪围在樱花粉星轨之间，共同探索"/><span className="pet-demo__art-caption">让连接，多一点温度。</span></div>
      </section>
      <section className="pet-demo__cards" aria-label="陪伴的三种方式">
        <article><span className="pet-demo__card-index">01</span><h2>随时相伴</h2><p>点开看看熟悉的小伙伴，也可以把陪伴面板挪到舒服的位置。</p></article>
        <article><span className="pet-demo__card-index">02</span><h2>安静陪伴</h2><p>想专注时就收起来，也可以选择更少的动态效果。</p></article>
        <article><span className="pet-demo__card-index">03</span><h2>慢慢认识</h2><p>保留熟悉的样子，让每一次见面都延续同一份亲近。</p></article>
      </section>
      <section className="pet-demo__focus" aria-labelledby="focus-title"><div><span className="pet-demo__eyebrow">给想法留一点空间</span><h2 id="focus-title">你专注的时候，奶喵会让一让。</h2><p>试着在手机上输入。这个输入框只用于交互体验，不会提交或保存。</p></div><label className="pet-demo__note-label">随手写下一个想法<textarea id="page-note" rows={3} placeholder="下一次，想和奶喵一起做什么？"/></label></section>
    </main>
    <footer className="pet-demo__footer"><span>9mew · 九喵</span><p>本地交互预览 · 问答、成长与外貌发布尚未接入</p><a href="./review.html">返回素材画廊</a></footer>
    <WebsitePet petId="official-naimiao-preview" catalog={catalog} baseUrl={kitRoot} initialAppearance={reference} allowPrototype theme={theme} reducedMotion={reduced} openSignal={openSignal}/>
  </div>;
}

const root = document.getElementById('pet-demo-root');
if (root) createRoot(root).render(<PetDemo/>);
