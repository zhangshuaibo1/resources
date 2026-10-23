export type PetActionCategory = 'daily' | 'movement' | 'emotion' | string;

export interface PetActionFrame { src: string; durationMs: number; }
export interface PetAction {
  id: string;
  label: string;
  category: PetActionCategory;
  description: string;
  frames: PetActionFrame[];
  frameSize: {width: number; height: number};
  anchor: {x: number; y: number};
  loop?: boolean;
  playback: 'loop' | 'once';
  returnTo?: string;
  direction?: 'left' | 'right';
  mirror?: boolean;
  /** Required for a mirrored derivative; points to the source sequence in this catalog. */
  sourceActionId?: string;
  motion?: {kind: 'travel'; distance: number};
}

/** App-owned asset manifest. Never accept a user-supplied manifest or URL. */
export interface PetActionCatalog {
  schemaVersion: '1.0';
  characterId: string;
  appearanceVersion: string;
  /** Relative to catalog URL, normally './'. */
  basePath: string;
  /** Relative to catalog URL, e.g. '../illustrations/mewling_master.desktop.webp'. */
  poster: string;
  defaultAction: string;
  actions: PetAction[];
}

const IMAGE_PATH = /\.(?:png|webp|jpe?g)$/i;
const ACTION_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Validates limits and resolves URLs inside the bundled, same-origin kit directory. */
export function resolveActionCatalog(value: unknown, catalogHref: string, origin: string): PetActionCatalog {
  if (!value || typeof value !== 'object') throw new Error('Invalid action catalog.');
  const raw = value as PetActionCatalog;
  const source = new URL(catalogHref);
  if (source.origin !== origin || !/^https?:$/.test(source.protocol)) throw new Error('Use a same-origin action catalog.');
  const kitRoot = new URL('../', source);
  const base = new URL(raw.basePath || './', source);
  if (base.origin !== origin || !base.pathname.startsWith(kitRoot.pathname) || base.search || base.hash) throw new Error('Invalid asset base.');
  function imageUrl(path: unknown, root: URL): string {
    if (typeof path !== 'string' || /[\\\u0000]/.test(path)) throw new Error('Invalid image path.');
    const url = new URL(path, root);
    if (url.origin !== origin || !url.pathname.startsWith(kitRoot.pathname) || !IMAGE_PATH.test(url.pathname) || url.search || url.hash) throw new Error('Image outside the bundled kit.');
    return url.href;
  }
  if (raw.schemaVersion !== '1.0' || raw.characterId !== '9mew.character.naimiao' || !raw.appearanceVersion || !Array.isArray(raw.actions) || raw.actions.length < 1 || raw.actions.length > 64) throw new Error('Invalid action catalog version.');
  const seen = new Set<string>();
  const actions = raw.actions.map(action => {
    if (!action || !ACTION_ID.test(action.id) || seen.has(action.id) || typeof action.label !== 'string' || action.label.length > 64 || typeof action.category !== 'string') throw new Error('Invalid action identity.');
    seen.add(action.id);
    if (!['loop', 'once'].includes(action.playback) || !Array.isArray(action.frames) || action.frames.length < 2 || action.frames.length > 120) throw new Error('Invalid action frames.');
    if (!action.frameSize || !finite(action.frameSize.width) || !finite(action.frameSize.height) || action.frameSize.width < 1 || action.frameSize.height < 1 || action.frameSize.width > 4096 || action.frameSize.height > 4096) throw new Error('Invalid frame dimensions.');
    if (!action.anchor || !finite(action.anchor.x) || !finite(action.anchor.y) || action.anchor.x < 0 || action.anchor.x > 1 || action.anchor.y < 0 || action.anchor.y > 1) throw new Error('Invalid frame anchor.');
    const frames = action.frames.map(frame => {
      if (!finite(frame.durationMs) || frame.durationMs < 25 || frame.durationMs > 15000) throw new Error('Invalid frame duration.');
      return {src: imageUrl(frame.src, base), durationMs: frame.durationMs};
    });
    if (frames.reduce((sum, frame) => sum + frame.durationMs, 0) > 120000) throw new Error('Action exceeds duration budget.');
    if (action.motion && (action.motion.kind !== 'travel' || !finite(action.motion.distance) || action.motion.distance < 0 || action.motion.distance > 240)) throw new Error('Invalid travel distance.');
    return {...action, description: typeof action.description === 'string' ? action.description : '', frames};
  });
  if (!seen.has(raw.defaultAction)) throw new Error('Default action is unavailable.');
  for (const action of actions) {
    if (action.returnTo && !seen.has(action.returnTo)) throw new Error('Return action is unavailable.');
    if (action.mirror && (!action.sourceActionId || action.sourceActionId === action.id || !seen.has(action.sourceActionId))) throw new Error('Mirrored source action is unavailable.');
  }
  return {...raw, basePath: base.href, poster: imageUrl(raw.poster, source), actions};
}
