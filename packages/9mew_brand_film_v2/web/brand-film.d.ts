export type FilmTheme = 'dark' | 'light';
export interface BrandFilmMedia { mp4: string; poster: string; webm?: string }
export interface BrandFilmState {
  status: 'poster' | 'playing' | 'paused' | 'suspended' | 'ended' | 'reduced-motion' | 'error' | 'loading';
  theme: FilmTheme; posterMode: boolean; requestedPlay: boolean; playing: boolean;
  loaded: boolean; currentTime: number; duration: number; visible: boolean;
  documentHidden: boolean; reducedMotion: boolean; explicitPlay: boolean;
  error: string | null; progressFrames: number;
}
export interface BrandFilmOptions {
  theme?: FilmTheme; assetBase?: string | URL;
  media?: Record<FilmTheme, BrandFilmMedia>;
  autoplay?: boolean; loop?: boolean; controls?: boolean; duration?: number;
  onStateChange?: (state: BrandFilmState) => void;
}
export interface BrandFilmController {
  element: HTMLElement; video: HTMLVideoElement;
  play(): void; pause(): void; replay(): void; showPoster(): void;
  setTheme(theme: FilmTheme): void; seek(seconds: number): void;
  inspect(): BrandFilmState; destroy(): void;
}
export function createBrandFilm(container: HTMLElement, options?: BrandFilmOptions): BrandFilmController;
