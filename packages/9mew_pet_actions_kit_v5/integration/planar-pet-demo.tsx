import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PlanarPetArt} from './PlanarPetArt';
import './planar-pet-demo.css';
const kitRoot = new URL('../', window.location.href).pathname;
function Demo() {
  const [dark,setDark] = useState(false), [paused,setPaused] = useState(false), [reduced,setReduced] = useState(false);
  return <main className="planar-showcase" data-theme={dark?'dark':'light'}>
    <header><a href="./website-pet-demo.html" aria-label="返回官网宠物演示">9mew <span>九喵</span></a><button type="button" onClick={()=>setDark(v=>!v)} aria-pressed={dark}>{dark?'晨光':'夜色'}</button></header>
    <section><p className="planar-showcase__eyebrow">奶喵的小星光</p><h1>熟悉的样子，<br/>轻轻陪着你。</h1><div className="planar-showcase__art"><PlanarPetArt src={`${kitRoot}illustrations/mewling_master.desktop.webp`} alt="奶油白猫奶喵，圆脸、樱花粉丝巾和蓬松卷尾" paused={paused} reducedMotion={reduced}/></div><div className="planar-showcase__controls"><button type="button" onClick={()=>setPaused(v=>!v)} disabled={reduced} aria-pressed={paused}>{paused?'继续动效':'暂停动效'}</button><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>减少动态</label></div><p className="planar-showcase__note">保留原画的每一根绒毛，让周围的星光缓缓流动。</p></section>
    <footer><span>2D 原画 · 平面微动效</span><a href="./review.html">素材画廊 ↗</a></footer>
  </main>;
}
const root=document.getElementById('planar-demo-root');if(root)createRoot(root).render(<Demo/>);
