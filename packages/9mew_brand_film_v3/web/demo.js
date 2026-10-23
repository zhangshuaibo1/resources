import {createBrandFilm} from './brand-film.js';

const stage = document.querySelector('#film');
const posterButton = document.querySelector('#poster-view');
const motionButton = document.querySelector('#motion-view');
const note = document.querySelector('#motion-note');
const film = createBrandFilm(stage, {
  theme: 'dark',
  autoplay: false,
  loop: false,
  onStateChange(state) {
    posterButton.setAttribute('aria-pressed', String(state.posterMode));
    motionButton.setAttribute('aria-pressed', String(!state.posterMode));
    if (state.status === 'reduced-motion') note.textContent = '已遵循系统的“减少动态效果”偏好。需要观看时，可主动点击播放。';
    else if (state.status === 'error') note.textContent = '视频暂时无法加载，已保留静态画面。请确认素材路径或稍后重播。';
    else if (state.posterMode) note.textContent = '当前显示静态封面。点击播放后才加载影片，可随时暂停或重播。';
    else if (state.status === 'ended') note.textContent = '影片播放完毕，停留在品牌画面。你可以重播，或切换主题查看。';
    else note.textContent = '画面离屏或切换标签页时会暂停；手动暂停后保持暂停。';
  },
});

posterButton.addEventListener('click', () => film.showPoster());
motionButton.addEventListener('click', () => film.play());
for (const button of document.querySelectorAll('.theme-selector button')) {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    document.documentElement.dataset.theme = theme;
    for (const candidate of document.querySelectorAll('.theme-selector button')) candidate.setAttribute('aria-pressed', String(candidate === button));
    document.querySelector('#theme-caption').textContent = theme === 'dark' ? '星夜 · 深色主题' : '晨光 · 浅色主题';
    document.querySelector('#download-video').href = `../exports/brand-film-${theme}.mp4`;
    document.querySelector('#download-poster').href = `../posters/brand-film-${theme}.webp`;
    film.setTheme(theme);
  });
}

// Read-only integration inspection hook for the included browser checks.
window.__9mewBrandFilm = film;
window.addEventListener('pagehide', event => { if (!event.persisted) film.destroy(); });
