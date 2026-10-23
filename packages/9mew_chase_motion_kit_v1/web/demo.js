import { create9mewChase, CHASE_DURATION_MS } from './chase-scene.js';

const $ = id => document.getElementById(id);
const embedded = window.__9MEW_CHASE_EMBEDDED__ || null;
const stage = $('playground');
let full = false, player, currentTheme = document.documentElement.dataset.theme;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
function update(info) {
  $('phase').textContent = info.stageLabel || '准备动作';
  $('clock').textContent = `${Math.floor(info.timeMs / 1000).toString().padStart(2, '0')} / 27s`;
  $('progress').firstElementChild.style.width = `${info.progress * 100}%`;
  $('progress').setAttribute('aria-valuenow', String(Math.round(info.timeMs / 1000)));
  $('play-label').textContent = info.playing ? '暂停' : info.state === 'finished' ? '再玩一次' : '播放';
  $('play-icon').textContent = info.playing ? 'Ⅱ' : '▶';
  $('play').setAttribute('aria-label', info.playing ? '暂停动画' : '播放动画');
  if (info.state === 'reduced-motion') $('mode-note').textContent = '已遵循系统减少动态效果偏好。点击播放后开始追逐。';
  else if (info.state === 'fallback') $('mode-note').textContent = '动作资源未完整加载，已保留静态奶喵。';
  else $('mode-note').textContent = full ? '全屏浮层不拦截页面点击。点击“回到画框”恢复。' : '播放一次后停在右下角，可以随时重播。';
}
function mount(autoplay = true, at = 0) {
  player?.destroy();
  player = create9mewChase({ container: full ? undefined : stage, catalogUrl: '../catalog.json',
    catalog: embedded?.catalog, assetMap: embedded?.assets, autoplay,
    catSize: Number($('size').value), speed: Number($('speed').value), margin: 32,
    onProgress: update, onStateChange: update,
    onError(error) { $('load-status').textContent = '动作资源暂时不可用，已显示静态形象。'; console.warn('[9mew chase]', error.code); },
  });
  window.mewChase = player;
  player.ready.then(ok => {
    if (ok) { $('load-status').textContent = ''; $('play').disabled = false; $('replay').disabled = false; if (at) player.seek(at); update(player.inspect()); }
  });
}
$('play').addEventListener('click', () => player.inspect().playing ? player.pause() : player.play());
$('replay').addEventListener('click', () => player.replay());
$('speed').addEventListener('change', () => player.setSpeed(Number($('speed').value)));
$('size').addEventListener('change', () => player.setCatSize(Number($('size').value)));
$('theme').addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = currentTheme;
  $('theme').textContent = currentTheme === 'dark' ? '浅色' : '深色';
  $('theme').setAttribute('aria-label', currentTheme === 'dark' ? '切换到浅色主题' : '切换到深色主题');
});
$('full').addEventListener('click', () => {
  const state = player.inspect(); full = !full;
  document.body.classList.toggle('full-scene', full);
  $('full').innerHTML = full ? '回到画框 <span aria-hidden="true">↙</span>' : '铺满屏幕 <span aria-hidden="true">↗</span>';
  mount(state.playing, state.timeMs);
});
if (embedded) {
  $('readme-link').href = embedded.docsUrl || 'https://github.com/zhangshuaibo1/resources/blob/9mew-chase-motion-v1.0.0/packages/9mew_chase_motion_kit_v1/README.md';
  $('readme-link').textContent = 'GitHub 源码与说明 ↗';
}
window.addEventListener('pagehide', () => player.destroy(), { once: true });
mount(!media.matches);
