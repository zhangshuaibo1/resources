import {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PetActionPlayer, usePetActionCatalog} from './PetActionPlayer';
import './actions-demo.css';

const catalogUrl = new URL('../pet-actions/catalog.json', location.href).href;
const fallback = new URL('../illustrations/mewling_master.desktop.webp', location.href).href;
const categories: Record<string, {label: string; subtitle: string}> = {
  daily: {label: '陪伴日常', subtitle: '小小的习惯，也有自己的节奏。'},
  movement: {label: '撒欢时刻', subtitle: '走一走，跳一下，让好奇心带路。'},
  emotion: {label: '心情日记', subtitle: '把每一种小情绪，都好好接住。'},
};

function ActionsDemo() {
  const {catalog, error} = usePetActionCatalog(catalogUrl);
  const [dark, setDark] = useState(false), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false), [systemReduced, setSystemReduced] = useState(false);
  const [selected, setSelected] = useState('blink'), [playing, setPlaying] = useState('blink'), [playKey, setPlayKey] = useState(0), [filter, setFilter] = useState('all');
  const requestedAction = catalog?.actions.find(item => item.id === selected);
  const current = catalog?.actions.find(item => item.id === playing);
  const action = current || requestedAction;
  const actualCategories = [...new Set(catalog?.actions.map(item => item.category) || [])];
  const groups = actualCategories.filter(category => filter === 'all' || filter === category);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(media.matches);
    update();media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function play(id: string) {setSelected(id);setPlayKey(value => value + 1);setPaused(false);}
  const motionOff = reduced || systemReduced;

  return <main className="actions-demo" data-theme={dark ? 'dark' : 'light'}>
    <header className="actions-demo__header">
      <a className="actions-demo__brand" href="./website-pet-demo.html"><strong><span>9</span>mew</strong><i/>九喵</a>
      <nav><a href="./website-pet-demo.html">官网相伴</a><button type="button" aria-label={dark ? '切换为浅色主题' : '切换为深色主题'} aria-pressed={dark} onClick={() => setDark(value => !value)}><span aria-hidden="true">{dark ? '☀' : '☾'}</span>{dark ? '晨光' : '夜色'}</button></nav>
    </header>
    <section className="actions-demo__intro">
      <p className="actions-demo__eyebrow"><span/>奶喵的日常</p>
      <h1>陪伴，有好多种模样。</h1>
      <p>有时想撒欢，有时想打盹。<br className="actions-demo__mobile-break"/>选一个动作，和奶喵待一会儿。</p>
    </section>
    <section className="actions-demo__playground" aria-label="奶喵动作预览">
      <div className="actions-demo__scene">
        <span className="actions-demo__scene-caption">NAIMIAO / LITTLE MOMENTS</span>
        <span className="actions-demo__orbit is-one" aria-hidden="true"/><span className="actions-demo__orbit is-two" aria-hidden="true"/>
        <div className="actions-demo__art"><PetActionPlayer catalogUrl={catalogUrl} catalog={catalog || undefined} fallbackSrc={fallback} actionId={selected} playKey={playKey} paused={paused} reducedMotion={motionOff} onActionChange={setPlaying} alt="奶喵，一只佩戴樱花粉丝巾的奶油白毛绒猫"/></div>
        <span className="actions-demo__scene-ground" aria-hidden="true"/>
        <div className="actions-demo__playing" role="status"><span className={paused || motionOff ? 'is-still' : ''}/>{motionOff ? '静静陪着你' : paused ? '稍作休息' : current?.label || '奶喵'}</div>
      </div>
      <div className="actions-demo__details">
        <span className="actions-demo__detail-kicker">选一个小心情</span>
        <h2>{action?.label || '你好，我是奶喵。'}</h2>
        <p className="actions-demo__description">{action?.description || '熟悉的小伙伴，正在准备自己的小动作。'}</p>
        <div className="actions-demo__primary-controls">
          <button type="button" className="actions-demo__primary" aria-label={`再来一次：${requestedAction?.label || '上一个动作'}`} disabled={!requestedAction || motionOff} onClick={() => play(selected)}>再来一次 <span aria-hidden="true">↻</span></button>
          <button type="button" className="actions-demo__pause" disabled={motionOff || !catalog} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? '继续动作' : '暂停一下'}</button>
        </div>
        <p className="actions-demo__replay-note">重播：{requestedAction?.label || '等待动作载入'}</p>
        <label className="actions-demo__quiet"><input type="checkbox" checked={reduced} onChange={event => setReduced(event.target.checked)}/><span>减少动态，静静相伴</span></label>
        {systemReduced && <p className="actions-demo__system-note">已跟随设备的“减少动态”设置。</p>}
        <div className="actions-demo__little-note"><span aria-hidden="true">✧</span><p>这里的心情是动作演示。<br/>喜欢哪个，就让奶喵再做一次。</p></div>
      </div>
    </section>
    <section className="actions-demo__library" aria-labelledby="action-library-title">
      <header><div><span className="actions-demo__detail-kicker">把小日子过得生动一点</span><h2 id="action-library-title">奶喵的动作收藏</h2></div><div className="actions-demo__filters" role="group" aria-label="筛选动作类别"><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>全部</button>{actualCategories.map(category => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{categories[category]?.label || category}</button>)}</div></header>
      {error && <p className="actions-demo__empty" role="status">动作暂时没有加载成功，先让奶喵安静陪着你。请确认素材包完整，并通过本地 HTTP 服务打开。</p>}
      {!catalog && !error && <p className="actions-demo__empty" role="status">奶喵正在准备小动作。</p>}
      {groups.map(category => <div className="actions-demo__group" key={category}><div className="actions-demo__group-heading"><h3>{categories[category]?.label || category}</h3><p>{categories[category]?.subtitle || '一点好奇，一点陪伴。'}</p></div><div className="actions-demo__action-grid">{catalog!.actions.filter(item => item.category === category).map((item, index) => <button className="actions-demo__action" type="button" key={item.id} data-action-id={item.id} disabled={motionOff} aria-pressed={playing === item.id} onClick={() => play(item.id)}><span className="actions-demo__action-number">{String(index + 1).padStart(2, '0')}</span><span className="actions-demo__action-copy"><strong>{item.label}</strong><small>{item.playback === 'loop' ? '轻轻循环' : '一个小动作'}</small></span><span className="actions-demo__action-arrow" aria-hidden="true">↗</span></button>)}</div></div>)}
    </section>
    <footer className="actions-demo__footer"><span>9mew · 九喵</span><p>动作设计预览 · AI 问答与成长服务尚未连接</p><a href="./review.html">品牌素材画廊 ↗</a></footer>
  </main>;
}
const root = document.getElementById('actions-demo-root');
if (root) createRoot(root).render(<ActionsDemo/>);
