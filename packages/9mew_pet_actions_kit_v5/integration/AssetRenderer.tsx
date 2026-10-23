'use client';
import {useEffect, useRef, useState} from 'react';
import type {AssetManifest, Locale, Theme, MediaFile} from './asset-types';
import {assetPath} from './asset-types';
import './asset-renderer.css';

type Props = {manifest:AssetManifest;assetId:string;baseUrl:string;theme?:Theme;locale?:Locale;mode?:'auto'|'static'|'motion';priority?:boolean;sizes?:string;className?:string};
const COPY={zh:{planned:'规划中',retired:'已停用',missing:'素材暂不可用',play:'播放动效',pause:'暂停',reduced:'已遵循减少动态效果偏好',prototype:'设计原型'},en:{planned:'Planned',retired:'Retired',missing:'Asset unavailable',play:'Play motion',pause:'Pause',reduced:'Reduced-motion preference enabled',prototype:'Design prototype'}};
export function AssetRenderer({manifest,assetId,baseUrl,theme='light',locale='zh',mode='auto',priority=false,sizes='100vw',className=''}:Props){
 const asset=manifest.assets.find(a=>a.id===assetId),variant=asset?.variants?.[theme]||asset?.variants?.neutral,still=variant?.poster||variant?.still,title=asset?.title[locale]||asset?.title.zh||assetId,copy=COPY[locale];
 const frame=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[reduced,setReduced]=useState(true),[pageVisible,setPageVisible]=useState(true),[motion,setMotion]=useState(false),[imageFailed,setImageFailed]=useState(false);
 const posterSrc=assetPath(baseUrl,still?.src),motionSrc=assetPath(baseUrl,variant?.motion?.src),isVideo=Boolean(variant?.motion?.mime?.startsWith('video/')),usable=asset?.status==='ready'||asset?.status==='prototype';
 const showMotion=usable&&motion&&!reduced&&visible&&pageVisible&&Boolean(motionSrc),image:MediaFile|undefined=showMotion&&!isVideo?variant?.motion:still,imageSrc=assetPath(baseUrl,image?.src);
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(preference.matches),visibility=()=>setPageVisible(!document.hidden),observer=new IntersectionObserver(entries=>setVisible(entries[0]?.isIntersecting??false));change();visibility();preference.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);if(frame.current)observer.observe(frame.current);return()=>{preference.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);observer.disconnect();};},[]);
 useEffect(()=>{setMotion(false);setImageFailed(false);},[assetId,theme,posterSrc]);
 useEffect(()=>{if(!video.current)return;if(showMotion)void video.current.play().catch(()=>setMotion(false));else video.current.pause();},[showMotion,motionSrc]);
 const responsive=image?.srcSet?.map(item=>{const path=assetPath(baseUrl,item.src);return path?`${path} ${item.width}w`:'';}).filter(Boolean).join(', ')||undefined,ratio=still?.width&&still?.height?`${still.width} / ${still.height}`:'4 / 3';
 return <figure ref={frame} className={`mew-asset ${className}`} data-theme={theme} data-asset-id={assetId}><div className="mew-asset__stage" style={{aspectRatio:ratio}}>
 {usable&&imageSrc&&!imageFailed?<img key={imageSrc} src={imageSrc} srcSet={responsive} sizes={responsive?sizes:undefined} width={image?.width} height={image?.height} alt={asset?.decorative?'':asset?.alt?.[locale]||title} aria-hidden={asset?.decorative||undefined} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>{if(showMotion)setMotion(false);else setImageFailed(true);}}/>:<span className="mew-asset__placeholder">{asset?.status==='planned'?copy.planned:asset?.status==='retired'?copy.retired:copy.missing}</span>}
 {usable&&isVideo&&motion&&motionSrc&&<video ref={video} src={motionSrc} poster={posterSrc} muted playsInline loop={variant?.motion?.loop!==false} preload="none" aria-label={asset?.decorative?undefined:title} aria-hidden={asset?.decorative||undefined} className={showMotion?'mew-asset__video':'mew-asset__video mew-asset__video--hidden'} onEnded={()=>{if(variant?.motion?.loop===false)setMotion(false);}} onError={()=>setMotion(false)}/>}
 {asset?.status==='prototype'&&<span className="mew-asset__badge">{copy.prototype}</span>}</div>{usable&&motionSrc&&mode!=='static'&&<div className="mew-asset__controls"><button type="button" disabled={reduced} onClick={()=>setMotion(v=>!v)} aria-pressed={motion}>{motion?copy.pause:copy.play}</button></div>}<figcaption className="mew-asset__status" aria-live="polite">{reduced&&motionSrc?copy.reduced:''}</figcaption></figure>;
}
