/**
 * 9mew Screen Chase v1 — no framework, service, or runtime network dependency.
 * Source artwork is generated separately. This module only times and places it.
 */
export const CHASE_DURATION_MS = 27000;
export const CHASE_PHASES = Object.freeze([
  { id: 'ready', label: '准备出发', start: 0, end: 1100 },
  { id: 'mouse', label: '追上小老鼠', start: 1100, end: 6200 },
  { id: 'notice', label: '发现一只蝴蝶', start: 6200, end: 7400 },
  { id: 'ascend', label: '跟着蝴蝶向上跃起', start: 7400, end: 12600 },
  { id: 'cross', label: '轻轻掠过屏幕上方', start: 12600, end: 18200 },
  { id: 'descend', label: '绕个弯，回到你身边', start: 18200, end: 23200 },
  { id: 'land', label: '轻轻落地', start: 23200, end: 24400 },
  { id: 'rest', label: '乖乖歇一会儿', start: 24400, end: 27000 },
]);
const REQUIRED = ['chase-run', 'chase-look-up', 'chase-leap', 'chase-float', 'chase-land', 'rest', 'mouse-run', 'butterfly-flutter'];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
function bezier(a, b, c, d, t) {
  const q = 1 - t;
  return { x: q ** 3 * a[0] + 3 * q ** 2 * t * b[0] + 3 * q * t ** 2 * c[0] + t ** 3 * d[0],
    y: q ** 3 * a[1] + 3 * q ** 2 * t * b[1] + 3 * q * t ** 2 * c[1] + t ** 3 * d[1] };
}

function actionFrame(action, timeMs, fallbackDuration = 120, freeze = false) {
  const n = action?.frameCount || 8;
  if (freeze) return 0;
  const delays = action?.durationsMs?.length === n ? action.durationsMs : Array(n).fill(fallbackDuration);
  const total = delays.reduce((sum, item) => sum + item, 0);
  let t = action?.loop === false ? Math.min(Math.max(0, timeMs), total - 0.01) : ((timeMs % total) + total) % total;
  for (let i = 0; i < n; i++) { if (t < delays[i]) return i; t -= delays[i]; }
  return n - 1;
}

/**
 * Deterministic route sampler shared by the live player and exported videos.
 * x/y are sprite ANCHOR coordinates in CSS pixels; width/height are frame size.
 * Input time is scene time (apply playback speed before calling, not in options).
 */
export function sampleChase(timeMs, width, height, options = {}) {
  width = Math.max(1, Number(width) || 1); height = Math.max(1, Number(height) || 1);
  const catalog = options.catalog || {};
  const actions = catalog.actions || {};
  const t = clamp(Number(timeMs) || 0, 0, CHASE_DURATION_MS);
  const phase = CHASE_PHASES.find(p => t < p.end) || CHASE_PHASES.at(-1);
  const phaseTime = t - phase.start;
  const p = clamp(phaseTime / (phase.end - phase.start), 0, 1);
  const margin = clamp(Number(options.margin ?? 32), 0, Math.min(width, height) * .18);
  const size = clamp(Number(options.catSize) || 160, 64, 240);
  const catSize = Math.min(size, Math.max(32, (width - margin * 2) * .32), Math.max(32, (height - margin * 2) * .36));
  const anchor = actions.rest?.anchor || { x: .5, y: .86 };
  const bounds = { left: margin + catSize * anchor.x, right: Math.max(margin + catSize * anchor.x, width - margin - catSize * (1 - anchor.x)),
    top: margin + catSize * anchor.y, bottom: Math.max(margin + catSize * anchor.y, height - margin - catSize * (1 - anchor.y)) };
  const position = point => ({ x: lerp(bounds.left, bounds.right, clamp(point.x, 0, 1)), y: lerp(bounds.top, bounds.bottom, clamp(point.y, 0, 1)) });
  let normal = { x: 1, y: 1 }, catAction = 'rest', catFlip = false, catTime = phaseTime;
  let mouseNormal = { x: 1, y: 1 }, mouseOpacity = 0;
  let butterflyNormal = { x: 0, y: .76 }, butterflyOpacity = 0, butterflyFlip = false;
  const chase = bezier([0, 1], [.07, .8], [0, .32], [.08, .12], smooth(p));
  if (phase.id === 'ready') {
    mouseNormal = { x: .97 - smooth(p) * .09, y: 1 }; mouseOpacity = smooth(p * 3);
  } else if (phase.id === 'mouse') {
    normal = { x: 1 - smooth(p), y: 1 };
    catAction = 'chase-run'; catFlip = true; catTime = phaseTime;
    mouseNormal = { x: normal.x - .12 - Math.sin(p * Math.PI) * .025, y: 1 };
    mouseOpacity = 1 - smooth((p - .88) / .12);
  } else if (phase.id === 'notice') {
    normal = { x: 0, y: 1 }; catAction = 'chase-look-up'; catFlip = false;
    butterflyNormal = { x: .05 + Math.sin(phaseTime / 240) * .018 * Math.sin(Math.PI * p), y: .78 - smooth(p) * .06 };
    butterflyOpacity = smooth(p * 3);
  } else if (phase.id === 'ascend') {
    normal = chase; catAction = phaseTime < 900 ? 'chase-leap' : 'chase-float'; catFlip = false;
    catTime = phaseTime < 900 ? phaseTime : phaseTime - 900;
    const lead = bezier([.05, .72], [.10, .48], [.01, .15], [.16, .005], smooth(p));
    butterflyNormal = { x: lead.x + Math.sin(phaseTime / 360) * .016 * Math.sin(Math.PI * p), y: lead.y };
    butterflyOpacity = 1;
  } else if (phase.id === 'cross') {
    normal = bezier([.08, .12], [.32, .015], [.67, .20], [.93, .12], smooth(p));
    catAction = 'chase-float'; catFlip = false;
    const lead = bezier([.16, .005], [.40, -.04], [.75, .09], [.97, .02], smooth(p));
    butterflyNormal = { x: lead.x, y: lead.y + Math.sin(phaseTime / 330) * .018 * Math.sin(Math.PI * p) }; butterflyOpacity = 1;
  } else if (phase.id === 'descend') {
    normal = bezier([.93, .12], [.99, .38], [.94, .72], [1, 1], smooth(p));
    catAction = 'chase-float'; catFlip = false;
    const lead = bezier([.97, .02], [1.04, .30], [.90, .84], [.96, 1], clamp(smooth(p) + .14 * Math.sin(Math.PI * p), 0, 1));
    butterflyNormal = { x: lead.x + Math.sin(phaseTime / 340) * .018 * Math.sin(Math.PI * p), y: lead.y };
    butterflyOpacity = 1 - smooth((p - .82) / .18);
  } else if (phase.id === 'land') {
    catAction = 'chase-land'; catFlip = false;
  } else {
    catFlip = false;
  }
  // The body remains upright; small path motion supports actual limb animation.
  const catPoint = position(normal);
  if (phase.id === 'mouse') catPoint.y -= Math.sin(phaseTime / 83) ** 2 * Math.min(4, catSize * .02) * Math.sin(Math.PI * p);
  const cat = { ...catPoint, width: catSize, height: catSize, anchorX: actions[catAction]?.anchor?.x ?? .5,
    anchorY: actions[catAction]?.anchor?.y ?? .86, action: catAction, frame: actionFrame(actions[catAction], catTime, catAction === 'chase-run' ? 85 : 130),
    flip: catFlip, opacity: 1, rotation: 0, normalized: normal };
  function companion(action, point, opacity, scale, flip, rotation = 0) {
    const edge = catSize * scale, a = actions[action]?.anchor || { x: .5, y: action === 'mouse-run' ? .86 : .5 };
    const pos = { x: lerp(bounds.left, bounds.right, point.x), y: lerp(bounds.top, bounds.bottom, point.y) };
    // Clamp the whole sprite to the safe area; no clipped tail or antennae.
    pos.x = clamp(pos.x, margin + edge * a.x, width - margin - edge * (1 - a.x));
    pos.y = clamp(pos.y, margin + edge * a.y, height - margin - edge * (1 - a.y));
    return { ...pos, width: edge, height: edge, anchorX: a.x, anchorY: a.y, action,
      frame: actionFrame(actions[action], t, 75), flip, opacity: clamp(opacity, 0, 1), rotation, normalized: point };
  }
  const mouse = companion('mouse-run', mouseNormal, mouseOpacity, .37, true);
  const butterfly = companion('butterfly-flutter', butterflyNormal, butterflyOpacity, .32, butterflyFlip, Math.sin(t / 350) * .075);
  return { timeMs: t, durationMs: CHASE_DURATION_MS, progress: t / CHASE_DURATION_MS, phaseProgress: p,
    stage: phase.id, stageLabel: phase.label, bounds, cat, mouse, butterfly };
}

function validateCatalog(input) {
  if (!input || !input.actions || Array.isArray(input.actions)) throw new Error('Invalid chase catalog');
  for (const id of REQUIRED) {
    const a = input.actions[id];
    if (!a || typeof a.sprite !== 'string' || !a.sprite) throw new Error('Missing action sprite: ' + id);
    for (const key of ['columns', 'rows', 'frameWidth', 'frameHeight', 'frameCount']) {
      if (!Number.isInteger(a[key]) || a[key] < 1) throw new Error('Invalid ' + id + '.' + key);
    }
    if (a.frameCount > a.columns * a.rows || a.frameCount > 64 || a.frameWidth > 2048 || a.frameHeight > 2048) throw new Error('Sprite dimensions exceed limits: ' + id);
    if (!Array.isArray(a.durationsMs) || a.durationsMs.length !== a.frameCount || a.durationsMs.some(t => !Number.isFinite(t) || t < 16 || t > 10000)) throw new Error('Invalid frame timing: ' + id);
    if (!a.anchor || !Number.isFinite(a.anchor.x) || !Number.isFinite(a.anchor.y) || a.anchor.x < 0 || a.anchor.x > 1 || a.anchor.y < 0 || a.anchor.y > 1) throw new Error('Invalid anchor: ' + id);
  }
  return input;
}

function loadImage(src, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => { image.onload = null; image.onerror = null; signal?.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); image.src = ''; reject(new DOMException('Cancelled', 'AbortError')); };
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    image.onload = async () => {
      try { if (image.decode) await image.decode(); if (signal?.aborted) return; cleanup(); resolve(image); }
      catch { cleanup(); reject(new Error('Image decode failed')); }
    };
    image.onerror = () => { cleanup(); reject(new Error('Image failed to load')); };
    image.src = src;
  });
}

/**
 * Create an overlay. Omit container for the full viewport; provide a positioned
 * element for a contained scene. By default it loads and rests until play().
 */
export function create9mewChase(options = {}) {
  if (typeof document === 'undefined') throw new Error('create9mewChase requires a browser');
  const container = options.container || null;
  if (container && !(container instanceof HTMLElement)) throw new TypeError('container must be an HTMLElement');
  const host = container || document.body;
  const canvas = document.createElement('canvas');
  canvas.className = 'mew-chase-overlay';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `position:${container ? 'absolute' : 'fixed'};inset:0;width:100%;height:100%;pointer-events:none;user-select:none;z-index:${clamp(Number(options.zIndex) || 1000, 0, 2147483647)};`;
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); throw new Error('Canvas 2D is unavailable'); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const abortController = new AbortController();
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const images = new Map();
  let poster = null, catalog = null, destroyed = false, loaded = false, loadFailed = false;
  let wantsPlay = Boolean(options.autoplay), userOverride = false, visible = true;
  let speed = clamp(Number(options.speed) || 1, .5, 2), catSize = clamp(Number(options.catSize) || 160, 64, 240);
  let width = 1, height = 1, dpr = 1, elapsed = 0, raf = 0, lastNow = null, repeats = 0;
  const repeatLimit = options.repeat === Infinity ? Infinity : Math.max(1, Math.floor(Number(options.repeat) || 1));
  let lastStage = '', lastEventTime = -Infinity, state = 'loading', lastSample = sampleChase(0, 1, 1);
  const catalogURL = new URL(options.catalogUrl || '../catalog.json', document.baseURI).href;
  const assetMap = options.assetMap || {};
  const resolveAsset = path => assetMap[path] || new URL(path, catalogURL).href;
  const emit = (type, detail) => { if (destroyed) return; if (type === 'state') options.onStateChange?.(detail); if (type === 'error') options.onError?.(detail); canvas.dispatchEvent(new CustomEvent('9mew:' + type, { detail })); };
  function currentStatus() {
    return { state, loaded, loadFailed, playing: canRun(), requestedPlay: wantsPlay, reducedMotion: media.matches,
      userOverride, visible, documentHidden: document.hidden, timeMs: elapsed, speed, repeat: repeatLimit,
      completedCycles: repeats, width, height, ...lastSample };
  }
  function transition(next) { if (state !== next) { state = next; emit('state', currentStatus()); } }
  function canRun() { return loaded && !loadFailed && wantsPlay && visible && !document.hidden && (!media.matches || userOverride) && !destroyed; }
  function drawSprite(sprite) {
    if (sprite.opacity <= .001) return;
    const art = images.get(sprite.action), action = catalog?.actions[sprite.action];
    if (!art || !action) return;
    const sourceX = (sprite.frame % action.columns) * action.frameWidth;
    const sourceY = Math.floor(sprite.frame / action.columns) * action.frameHeight;
    ctx.save(); ctx.globalAlpha = sprite.opacity;
    ctx.translate(sprite.x, sprite.y);
    if (sprite.rotation) ctx.rotate(sprite.rotation);
    if (sprite.flip) ctx.scale(-1, 1);
    const anchorX = sprite.flip ? 1 - sprite.anchorX : sprite.anchorX;
    ctx.drawImage(art, sourceX, sourceY, action.frameWidth, action.frameHeight,
      -sprite.width * anchorX, -sprite.height * sprite.anchorY, sprite.width, sprite.height);
    ctx.restore();
  }
  function drawFallback() {
    if (!poster) return;
    const s = sampleChase(0, width, height, { catSize, margin: options.margin ?? 32, catalog });
    const cat = s.cat;
    ctx.drawImage(poster, cat.x - cat.width * .5, cat.y - cat.height * .86, cat.width, cat.height);
  }
  function draw() {
    if (destroyed) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.clearRect(0, 0, width, height);
    lastSample = sampleChase(elapsed, width, height, { catSize, margin: options.margin ?? 32, catalog });
    if (!loaded || loadFailed || (media.matches && !userOverride)) { drawFallback(); return; }
    drawSprite(lastSample.mouse); drawSprite(lastSample.butterfly); drawSprite(lastSample.cat);
    canvas.dataset.stage = lastSample.stage;
    canvas.dataset.catAction = lastSample.cat.action;
    canvas.dataset.catFrame = String(lastSample.cat.frame);
    canvas.dataset.timeMs = String(Math.round(elapsed));
  }
  function stopRaf() { if (raf) cancelAnimationFrame(raf); raf = 0; lastNow = null; }
  function tick(now) {
    raf = 0;
    if (!canRun()) { lastNow = null; sync(); return; }
    if (lastNow !== null) elapsed += Math.min(80, Math.max(0, now - lastNow)) * speed;
    lastNow = now;
    if (elapsed >= CHASE_DURATION_MS) {
      repeats++;
      if (repeats >= repeatLimit) { elapsed = CHASE_DURATION_MS; wantsPlay = false; draw(); transition('finished'); lastNow = null; return; }
      elapsed %= CHASE_DURATION_MS;
    }
    draw();
    if (lastSample.stage !== lastStage || now - lastEventTime > 100) {
      lastStage = lastSample.stage; lastEventTime = now; emit('progress', currentStatus()); options.onProgress?.(currentStatus());
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    if (canRun()) { if (!raf) { lastNow = null; raf = requestAnimationFrame(tick); } transition('playing'); }
    else {
      stopRaf(); draw();
      transition(loadFailed ? 'fallback' : !loaded ? 'loading' : media.matches && !userOverride ? 'reduced-motion' : !visible || document.hidden ? 'suspended' : elapsed >= CHASE_DURATION_MS ? 'finished' : wantsPlay ? 'ready' : 'paused');
    }
  }
  function resize() {
    if (destroyed) return;
    const r = container?.getBoundingClientRect();
    width = Math.max(1, r ? r.width : window.innerWidth); height = Math.max(1, r ? r.height : window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    draw();
  }
  const onVisibility = () => sync();
  const onMotion = () => { if (media.matches) userOverride = false; sync(); };
  document.addEventListener('visibilitychange', onVisibility);
  media.addEventListener('change', onMotion);
  window.addEventListener('resize', resize, { passive: true });
  const observer = container && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  observer?.observe(container);
  const intersection = container && typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true; sync();
  }, { threshold: .01 }) : null;
  intersection?.observe(container);
  resize();

  const ready = (async () => {
    try {
      let input = options.catalog;
      if (!input) {
        const response = await fetch(catalogURL, { signal: abortController.signal, credentials: 'same-origin' });
        if (!response.ok) throw new Error('Cannot load chase catalog');
        input = await response.json();
      }
      // Attempt the still before validating animated resources, preserving fallback.
      if (input.poster) {
        try { poster = await loadImage(resolveAsset(input.poster), abortController.signal); draw(); }
        catch (error) { if (error.name === 'AbortError') throw error; }
      }
      catalog = validateCatalog(input);
      const entries = await Promise.all(REQUIRED.map(async id => {
        const action = catalog.actions[id];
        const image = await loadImage(resolveAsset(action.sprite), abortController.signal);
        if (image.naturalWidth !== action.columns * action.frameWidth || image.naturalHeight !== action.rows * action.frameHeight) throw new Error('Sprite atlas dimensions do not match: ' + id);
        return [id, image];
      }));
      if (destroyed) return false;
      for (const [id, image] of entries) images.set(id, image);
      loaded = true; sync(); return true;
    } catch (error) {
      if (destroyed || error.name === 'AbortError') return false;
      loadFailed = true; wantsPlay = false; sync();
      emit('error', { code: 'ASSET_LOAD_FAILED', message: error.message, fallbackAvailable: Boolean(poster) });
      return false;
    }
  })();
  return {
    canvas, ready,
    play() { if (destroyed || loadFailed) return; if (elapsed >= CHASE_DURATION_MS) { elapsed = 0; repeats = 0; } userOverride = true; wantsPlay = true; sync(); },
    pause() { wantsPlay = false; sync(); },
    replay() { if (destroyed || loadFailed) return; elapsed = 0; repeats = 0; userOverride = true; wantsPlay = true; draw(); sync(); },
    stop() { wantsPlay = false; elapsed = 0; repeats = 0; userOverride = false; sync(); },
    seek(timeMs) { if (!Number.isFinite(timeMs)) throw new TypeError('timeMs must be finite'); elapsed = clamp(timeMs, 0, CHASE_DURATION_MS); draw(); emit('progress', currentStatus()); options.onProgress?.(currentStatus()); },
    setSpeed(value) { if (!Number.isFinite(value) || value < .5 || value > 2) throw new RangeError('speed must be 0.5–2'); speed = value; },
    setCatSize(value) { if (!Number.isFinite(value) || value < 64 || value > 240) throw new RangeError('catSize must be 64–240'); catSize = value; draw(); },
    inspect: currentStatus,
    destroy() {
      if (destroyed) return; destroyed = true; stopRaf(); abortController.abort();
      document.removeEventListener('visibilitychange', onVisibility); media.removeEventListener('change', onMotion);
      window.removeEventListener('resize', resize); observer?.disconnect(); intersection?.disconnect();
      images.clear(); poster = null; canvas.remove();
    },
  };
}
