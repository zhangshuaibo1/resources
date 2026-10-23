export type Locale = 'zh' | 'en';
export type Theme = 'light' | 'dark';
export interface MediaFile {
  src: string;
  mime?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  loop?: boolean;
  sha256?: string;
  srcSet?: Array<{src: string; width: number; height?: number; bytes?: number; sha256?: string}>;
}
export interface AssetVariant {
  poster?: MediaFile;
  still?: MediaFile;
  motion?: MediaFile;
}
export interface VisualAsset {
  id: string;
  version?: string;
  title: Partial<Record<Locale, string>>;
  status: 'ready' | 'prototype' | 'planned' | 'retired';
  kind: string;
  alt?: Partial<Record<Locale, string>>;
  decorative?: boolean;
  placements?: string[];
  variants?: Partial<Record<Theme | 'neutral', AssetVariant>>;
}
export interface AssetManifest {
  schemaVersion: 1;
  basePath?: string;
  assets: VisualAsset[];
}
/** Curated public manifest paths only. Never serialize signed/private URLs into it. */
export function assetPath(baseUrl: string, src?: string): string | undefined {
  if (!src || /[\\?#\u0000]/.test(src) || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(src) || src.split('/').includes('..')) return undefined;
  let decoded:string;try{decoded=decodeURIComponent(src);}catch{return undefined;}
  if(decoded.split('/').includes('..')||/[\\\u0000]/.test(decoded))return undefined;
  return `${baseUrl.replace(/\/$/, '')}/${src.replace(/^\.\//, '')}`;
}
