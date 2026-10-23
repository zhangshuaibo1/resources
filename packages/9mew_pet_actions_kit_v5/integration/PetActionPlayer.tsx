'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import type {CSSProperties} from 'react';
import type {PetAction, PetActionCatalog} from './pet-action-types';
import {resolveActionCatalog} from './pet-action-types';
import './pet-action-player.css';

const catalogs = new Map<string, Promise<unknown>>();
const frames = new Map<string, Promise<void>>();

export function usePetActionCatalog(catalogUrl: string, supplied?: PetActionCatalog) {
  const [catalog, setCatalog] = useState<PetActionCatalog | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    setCatalog(null); setError(false);
    (async () => {
      try {
        const href = new URL(catalogUrl, document.baseURI);
        if (href.origin !== location.origin || !/^https?:$/.test(href.protocol)) throw new Error('Use a same-origin catalog URL.');
        let promise = supplied ? Promise.resolve(supplied) : catalogs.get(href.href);
        if (!promise) {
          promise = fetch(href, {credentials: 'omit', cache: 'no-cache'}).then(response => {
            if (!response.ok) throw new Error('Catalog unavailable.');
            return response.json() as Promise<unknown>;
          });
          catalogs.set(href.href, promise);
          promise.catch(() => catalogs.delete(href.href));
        }
        const value = resolveActionCatalog(await promise, href.href, location.origin);
        if (alive) setCatalog(value);
      } catch {if (alive) setError(true);}
    })();
    return () => {alive = false;};
  }, [catalogUrl, supplied]);
  return {catalog, error, loading: !catalog && !error};
}

function preload(action: PetAction) {
  return Promise.all(action.frames.map(frame => {
    let promise = frames.get(frame.src);
    if (!promise) {
      promise = new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {if (image.naturalWidth > 0) resolve(); else reject(new Error('Empty frame.'));};
        image.onerror = () => reject(new Error('Frame unavailable.'));
        image.src = frame.src;
      });
      frames.set(frame.src, promise);
      promise.catch(() => frames.delete(frame.src));
    }
    return promise;
  }));
}

const gentle = (catalog: PetActionCatalog) => ['blink', 'tail-swish'].includes(catalog.defaultAction) ? catalog.defaultAction : catalog.actions.find(action => action.id === 'blink')?.id || '';

export interface PetActionPlayerProps {
  catalogUrl?: string;
  catalog?: PetActionCatalog;
  fallbackSrc: string;
  /** Bind frame assets to an approved appearance reference when used in the product. */
  expectedAppearanceVersion?: string;
  alt?: string;
  /** Request an available action. Omit for gentle idle animation. */
  actionId?: string;
  /** Increment to replay the same one-shot action. */
  playKey?: number;
  paused?: boolean;
  reducedMotion?: boolean;
  compact?: boolean;
  /** Travel stays inside the component; it never moves the floating UI. */
  allowTravel?: boolean;
  className?: string;
  onActionChange?: (id: string) => void;
  onActionComplete?: (id: string) => void;
}

/** Discrete, preloaded character frames. No crossfade or image-wide fake limb motion. */
export function PetActionPlayer({catalogUrl = '../pet-actions/catalog.json', catalog: supplied, fallbackSrc, expectedAppearanceVersion, alt = '', actionId, playKey = 0, paused = false, reducedMotion = false, compact = false, allowTravel = true, className = '', onActionChange, onActionComplete}: PetActionPlayerProps) {
  const {catalog: loadedCatalog, error: catalogError} = usePetActionCatalog(catalogUrl, supplied);
  const versionMismatch = Boolean(loadedCatalog && expectedAppearanceVersion && loadedCatalog.appearanceVersion !== expectedAppearanceVersion);
  const catalog = versionMismatch ? null : loadedCatalog;
  const error = catalogError || versionMismatch;
  const element = useRef<HTMLDivElement>(null), travel = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0), generation = useRef(0), callback = useRef({onActionChange, onActionComplete});
  callback.current = {onActionChange, onActionComplete};
  const [selected, setSelected] = useState(''), [frameIndex, setFrameIndex] = useState(0), [cycle, setCycle] = useState(0);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [visible, setVisible] = useState(false), [pageVisible, setPageVisible] = useState(true), [systemReduced, setSystemReduced] = useState(true);
  const action = useMemo(() => catalog?.actions.find(item => item.id === selected), [catalog, selected]);
  const reduced = reducedMotion || systemReduced;
  const running = Boolean(action && ready && !failed && !paused && !reduced && visible && pageVisible);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setSystemReduced(media.matches);
    const visibilityChange = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false));
    motionChange(); visibilityChange(); media.addEventListener('change', motionChange); document.addEventListener('visibilitychange', visibilityChange);
    if (element.current) observer.observe(element.current);
    return () => {observer.disconnect();media.removeEventListener('change', motionChange);document.removeEventListener('visibilitychange', visibilityChange);};
  }, []);

  useEffect(() => {
    const id = catalog ? catalog.actions.some(item => item.id === actionId) ? actionId! : gentle(catalog) : '';
    elapsed.current = 0; generation.current += 1; setFrameIndex(0); setSelected(id); setCycle(value => value + 1);
    travel.current?.style.setProperty('--pet-travel', '0px');
  }, [catalog, actionId, playKey]);

  useEffect(() => {
    let alive = true; setReady(false); setFailed(false); elapsed.current = 0; setFrameIndex(0);
    travel.current?.style.setProperty('--pet-travel', '0px');
    if (action) {
      callback.current.onActionChange?.(action.id);
      void preload(action).then(() => {if (alive) setReady(true);}, () => {if (alive) setFailed(true);});
    }
    return () => {alive = false;};
  }, [action, cycle]);

  useEffect(() => {
    if (!running || !action || !catalog) return;
    let raf = 0, last = performance.now();
    const total = action.frames.reduce((sum, frame) => sum + frame.durationMs, 0);
    const epoch = generation.current;
    const tick = (now: number) => {
      if (epoch !== generation.current) return;
      elapsed.current += Math.min(100, now - last); last = now;
      if (elapsed.current >= total) {
        if (action.playback === 'once') {
          callback.current.onActionComplete?.(action.id);
          const next = action.returnTo || gentle(catalog);
          elapsed.current = 0; generation.current += 1; setFrameIndex(0); setSelected(next); setCycle(value => value + 1);
          travel.current?.style.setProperty('--pet-travel', '0px');
          return;
        }
        elapsed.current %= total;
      }
      let end = 0, index = 0;
      for (; index < action.frames.length - 1; index++) {end += action.frames[index].durationMs;if (elapsed.current < end) break;}
      setFrameIndex(previous => previous === index ? previous : index);
      if (travel.current) {
        // The complete pose changes on its own frames; travel only sets stage position.
        const width = element.current?.clientWidth || 0;
        const distance = allowTravel && !compact && action.motion ? Math.min(action.motion.distance, width * .24) : 0;
        const offset = distance * (elapsed.current / total - .5) * (action.direction === 'left' ? -1 : 1);
        travel.current.style.setProperty('--pet-travel', `${offset.toFixed(2)}px`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, action, catalog, allowTravel, compact, cycle]);

  const showAction = Boolean(action && ready && !failed && !reduced);
  const src = showAction ? action!.frames[Math.min(frameIndex, action!.frames.length - 1)].src : catalog?.poster || fallbackSrc;
  const style = {'--pet-frame-ratio': action ? `${action.frameSize.width} / ${action.frameSize.height}` : '1 / 1'} as CSSProperties;
  return <div ref={element} className={`pet-action-player ${compact ? 'is-compact' : ''} ${className}`} style={style} data-media-kind="character-frames" data-action={showAction ? selected : 'poster'} data-frame={showAction ? frameIndex : -1} data-running={running} data-reduced-motion={reduced} data-fallback={error || failed || !catalog} data-fallback-reason={versionMismatch ? 'appearance-version' : catalogError ? 'catalog' : failed ? 'frame' : !loadedCatalog ? 'loading' : undefined} aria-label={alt || undefined} role={alt ? 'img' : undefined}>
    <span className="pet-action-player__aura" aria-hidden="true"/>
    <div ref={travel} className="pet-action-player__travel">
      <img className="pet-action-player__image" src={src} alt="" aria-hidden="true" draggable={false} width={showAction ? action!.frameSize.width : 1024} height={showAction ? action!.frameSize.height : 1024} style={{transform: showAction && action!.mirror ? 'scaleX(-1)' : undefined}} onError={() => setFailed(true)}/>
    </div>
  </div>;
}
