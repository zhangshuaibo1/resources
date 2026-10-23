export interface ChaseAction {
  sprite: string;
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  durationsMs: number[];
  anchor: {x: number; y: number};
  facing?: 'left' | 'right' | 'front';
  loop?: boolean;
}
export interface ChaseCatalog {
  schemaVersion: number | string;
  kitVersion: number | string;
  poster?: string;
  actions: Record<string, ChaseAction>;
}
export interface ChaseSprite {
  x: number; y: number; width: number; height: number;
  anchorX: number; anchorY: number;
  action: string; frame: number; flip: boolean; opacity: number; rotation: number;
  normalized: {x: number; y: number};
}
export interface ChaseSample {
  timeMs: number; durationMs: number; progress: number; phaseProgress: number;
  stage: string; stageLabel: string;
  bounds: {left: number; right: number; top: number; bottom: number};
  cat: ChaseSprite; mouse: ChaseSprite; butterfly: ChaseSprite;
}
export interface ChaseState extends ChaseSample {
  state: 'loading' | 'playing' | 'paused' | 'ready' | 'reduced-motion' | 'suspended' | 'finished' | 'fallback';
  loaded: boolean; loadFailed: boolean; playing: boolean; requestedPlay: boolean;
  reducedMotion: boolean; userOverride: boolean; visible: boolean; documentHidden: boolean;
  speed: number; repeat: number; completedCycles: number; width: number; height: number;
}
export interface ChaseOptions {
  container?: HTMLElement;
  catalogUrl?: string;
  catalog?: ChaseCatalog;
  assetMap?: Record<string, string>;
  autoplay?: boolean;
  repeat?: number;
  speed?: number;
  catSize?: number;
  margin?: number;
  zIndex?: number;
  onProgress?: (state: ChaseState) => void;
  onStateChange?: (state: ChaseState) => void;
  onError?: (error: {code: string; message: string; fallbackAvailable: boolean}) => void;
}
export interface ChaseController {
  canvas: HTMLCanvasElement;
  ready: Promise<boolean>;
  play(): void; pause(): void; replay(): void; stop(): void; destroy(): void;
  seek(timeMs: number): void; setSpeed(speed: number): void; setCatSize(size: number): void;
  inspect(): ChaseState;
}
export const CHASE_DURATION_MS: 27000;
export const CHASE_PHASES: readonly {id: string; label: string; start: number; end: number}[];
export function sampleChase(timeMs: number, width: number, height: number, options?: {catalog?: ChaseCatalog; catSize?: number; margin?: number}): ChaseSample;
export function create9mewChase(options?: ChaseOptions): ChaseController;
