/**
 * 9mew brand film — a dependency-free, progressively loaded video component.
 * The video remains unloaded until playback is requested. MP4 is the default.
 */
export function createBrandFilm(container, options = {}) {
  if (!(container instanceof HTMLElement)) throw new TypeError('A container element is required.');
  const base = new URL(options.assetBase || '../', import.meta.url);
  const media = options.media || Object.fromEntries(['dark', 'light'].map(theme => [theme, {
    mp4: new URL(`exports/brand-film-${theme}.mp4`, base).href,
    poster: new URL(`posters/brand-film-${theme}.webp`, base).href,
  }]));
  let theme = options.theme === 'light' ? 'light' : 'dark';
  let requestedPlay = false;
  let explicitPlay = false;
  let posterMode = true;
  let destroyed = false;
  let loaded = false;
  let generation = 0;
  let rememberedTime = 0;
  let mediaDuration = Number(options.duration) > 0 ? Number(options.duration) : 16;
  let status = 'poster';
  let error = null;
  let loadedUrl = null;
  let progressFrames = 0;
  const abort = new AbortController();
  const signal = abort.signal;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const figure = document.createElement('figure');
  figure.className = 'mew-brand-film';
  figure.dataset.theme = theme;
  figure.innerHTML = `
    <div class="mew-brand-film__screen">
      <video class="mew-brand-film__video" muted playsinline preload="none" aria-label="九喵品牌宣传动画"></video>
      <img class="mew-brand-film__poster" alt="九喵品牌静态画面" draggable="false" decoding="async">
      <button class="mew-brand-film__start" type="button" aria-label="播放九喵品牌宣传动画"><span aria-hidden="true">▶</span><span>播放影片</span></button>
    </div>
    <figcaption class="mew-brand-film__bar">
      <div class="mew-brand-film__buttons">
        <button class="mew-brand-film__toggle" type="button">播放</button>
        <button class="mew-brand-film__replay" type="button">重播</button>
      </div>
      <label class="mew-brand-film__seek-label"><span class="mew-brand-film__sr">播放进度</span><input class="mew-brand-film__seek" type="range" min="0" max="16" step="0.05" value="0" aria-valuetext="0 秒，共 16 秒"></label>
      <span class="mew-brand-film__time" aria-hidden="true">0:00 / 0:16</span>
      <button class="mew-brand-film__fullscreen" type="button">全屏</button>
      <span class="mew-brand-film__sr mew-brand-film__status" role="status" aria-live="polite"></span>
    </figcaption>`;
  const video = figure.querySelector('video');
  const poster = figure.querySelector('img');
  const start = figure.querySelector('.mew-brand-film__start');
  const toggle = figure.querySelector('.mew-brand-film__toggle');
  const replay = figure.querySelector('.mew-brand-film__replay');
  const seekInput = figure.querySelector('input');
  const clock = figure.querySelector('.mew-brand-film__time');
  const full = figure.querySelector('.mew-brand-film__fullscreen');
  const statusText = figure.querySelector('.mew-brand-film__status');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = options.loop === true;
  video.disablePictureInPicture = true;
  if (options.controls === false) figure.querySelector('figcaption').hidden = true;
  container.append(figure);
  const rect = figure.getBoundingClientRect();
  let visible = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  const phrases = {
    poster: '静态封面，按播放可观看动画。', playing: '正在播放。', paused: '已暂停。',
    suspended: '页面隐藏或画面离屏，动画暂时暂停。', ended: '播放完成。',
    'reduced-motion': '已遵循减少动态效果偏好，显示静态封面。',
    error: '视频暂时无法加载，保留静态画面。', loading: '正在载入影片。',
  };
  const timeLabel = n => `${Math.floor(Math.max(0, n) / 60)}:${String(Math.floor(Math.max(0, n) % 60)).padStart(2, '0')}`;
  function inspect() {
    return {
      status, theme, posterMode, requestedPlay, playing: !video.paused && !video.ended,
      loaded, currentTime: loaded ? video.currentTime : rememberedTime,
      duration: mediaDuration, visible, documentHidden: document.hidden,
      reducedMotion: reduce.matches, explicitPlay, error, progressFrames,
    };
  }
  function updateProgress() {
    if (destroyed) return;
    if (loaded && Number.isFinite(video.currentTime)) rememberedTime = video.currentTime;
    seekInput.max = String(mediaDuration);
    seekInput.value = String(rememberedTime);
    seekInput.setAttribute('aria-valuetext', `${rememberedTime.toFixed(1)} 秒，共 ${mediaDuration.toFixed(1)} 秒`);
    clock.textContent = `${timeLabel(rememberedTime)} / ${timeLabel(mediaDuration)}`;
  }
  function render(next = status) {
    if (destroyed) return;
    const changed = next !== status;
    status = next;
    figure.dataset.state = status;
    figure.dataset.poster = String(posterMode);
    start.hidden = !posterMode;
    start.disabled = status === 'loading';
    start.lastElementChild.textContent = status === 'loading' ? '正在载入' : (status === 'error' ? '重播影片' : '播放影片');
    toggle.textContent = requestedPlay ? '暂停' : (status === 'ended' ? '再看一次' : '播放');
    toggle.setAttribute('aria-label', requestedPlay ? '暂停九喵品牌动画' : '播放九喵品牌动画');
    if (changed || !statusText.textContent) statusText.textContent = phrases[status] || '';
    updateProgress();
    const state = inspect();
    if (typeof options.onStateChange === 'function') options.onStateChange(state);
    container.dispatchEvent(new CustomEvent('9mew:filmstate', {detail: state}));
  }
  function applyPoster() {
    if (!media[theme]?.poster || !media[theme]?.mp4) throw new TypeError(`Missing media for ${theme}.`);
    poster.src = media[theme].poster;
    video.poster = media[theme].poster;
    figure.dataset.theme = theme;
  }
  function loadMedia() {
    const entry = media[theme];
    const url = entry.webm && video.canPlayType('video/webm') ? entry.webm : entry.mp4;
    if (loadedUrl === url && !video.error) return;
    loaded = false;
    loadedUrl = url;
    video.src = url;
    video.load();
  }
  async function requestPlayback() {
    if (destroyed || !requestedPlay) return;
    if (!visible || document.hidden) { video.pause(); render('suspended'); return; }
    if (reduce.matches && !explicitPlay) { video.pause(); posterMode = true; render('reduced-motion'); return; }
    const currentGeneration = generation;
    loadMedia();
    error = null;
    render('loading');
    try {
      await video.play();
      if (destroyed || currentGeneration !== generation || !requestedPlay || !visible || document.hidden) {
        if (currentGeneration === generation) video.pause();
        return;
      }
      posterMode = false;
      render('playing');
    } catch (e) {
      if (destroyed || currentGeneration !== generation || e?.name === 'AbortError') return;
      requestedPlay = false;
      posterMode = true;
      error = e?.name === 'NotAllowedError' ? 'playback-not-allowed' : 'video-load-failed';
      render('error');
    }
  }
  function play() {
    if (destroyed) return;
    explicitPlay = true;
    requestedPlay = true;
    if (video.ended || rememberedTime >= mediaDuration - 0.04) {
      rememberedTime = 0;
      if (loaded) video.currentTime = 0;
    }
    requestPlayback();
  }
  function pause() {
    if (destroyed) return;
    requestedPlay = false;
    generation += 1;
    video.pause();
    render(posterMode ? 'poster' : 'paused');
  }
  function replayFromStart() {
    if (destroyed) return;
    rememberedTime = 0;
    if (loaded) video.currentTime = 0;
    play();
  }
  function showPoster() {
    if (destroyed) return;
    requestedPlay = false;
    generation += 1;
    video.pause();
    posterMode = true;
    render(reduce.matches ? 'reduced-motion' : 'poster');
  }
  function setTheme(next) {
    if (destroyed || !['dark', 'light'].includes(next) || theme === next) return;
    if (loaded) rememberedTime = video.currentTime;
    generation += 1;
    video.pause();
    video.removeAttribute('src');
    video.load();
    loaded = false;
    loadedUrl = null;
    theme = next;
    posterMode = true;
    error = null;
    applyPoster();
    if (requestedPlay) requestPlayback();
    else render(reduce.matches ? 'reduced-motion' : 'poster');
  }
  function seek(seconds) {
    if (destroyed || !Number.isFinite(Number(seconds))) return;
    rememberedTime = Math.min(Math.max(Number(seconds), 0), mediaDuration);
    if (loaded) video.currentTime = rememberedTime;
    updateProgress();
  }
  function suspendOrResume() {
    if (destroyed) return;
    if (document.hidden || !visible) {
      video.pause();
      if (requestedPlay) render('suspended');
    } else if (requestedPlay) requestPlayback();
  }
  video.addEventListener('loadedmetadata', () => {
    if (destroyed) return;
    loaded = true;
    if (Number.isFinite(video.duration) && video.duration > 0) mediaDuration = video.duration;
    video.currentTime = Math.min(rememberedTime, Math.max(0, mediaDuration - 0.01));
    updateProgress();
  }, {signal});
  video.addEventListener('timeupdate', () => { progressFrames += 1; updateProgress(); }, {signal});
  video.addEventListener('ended', () => {
    requestedPlay = false;
    posterMode = false;
    render('ended');
  }, {signal});
  video.addEventListener('error', () => {
    if (destroyed || !video.getAttribute('src')) return;
    error = 'video-load-failed';
    requestedPlay = false;
    posterMode = true;
    render('error');
  }, {signal});
  start.addEventListener('click', play, {signal});
  toggle.addEventListener('click', () => requestedPlay ? pause() : play(), {signal});
  replay.addEventListener('click', replayFromStart, {signal});
  seekInput.addEventListener('input', () => seek(seekInput.value), {signal});
  full.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === figure) await document.exitFullscreen();
      else if (figure.requestFullscreen) await figure.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch { statusText.textContent = '当前浏览器未开启全屏，可以直接在页面中播放。'; }
  }, {signal});
  document.addEventListener('fullscreenchange', () => { full.textContent = document.fullscreenElement === figure ? '退出全屏' : '全屏'; }, {signal});
  document.addEventListener('visibilitychange', suspendOrResume, {signal});
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      explicitPlay = false;
      requestedPlay = false;
      generation += 1;
      video.pause();
      posterMode = true;
      render('reduced-motion');
    }
  }, {signal});
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting === true;
    suspendOrResume();
  }, {threshold: 0.05});
  observer.observe(figure);
  applyPoster();
  render(reduce.matches ? 'reduced-motion' : 'poster');
  if (options.autoplay === true && !reduce.matches) {
    requestedPlay = true;
    requestPlayback();
  }
  return {
    element: figure, video, play, pause, replay: replayFromStart, showPoster, setTheme, seek, inspect,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      requestedPlay = false;
      generation += 1;
      observer.disconnect();
      abort.abort();
      video.pause();
      video.removeAttribute('src');
      video.load();
      figure.remove();
    },
  };
}
