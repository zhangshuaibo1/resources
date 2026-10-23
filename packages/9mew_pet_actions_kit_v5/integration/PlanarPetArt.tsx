'use client';
import {useEffect, useRef, useState} from 'react';
import './planar-pet-art.css';

export interface PlanarPetArtProps {
  /** Use a checked same-origin image path from the application catalog. */
  src: string;
  alt?: string;
  paused?: boolean;
  reducedMotion?: boolean;
  compact?: boolean;
  className?: string;
}

/** An intact illustration with CSS motion, not frame-by-frame character animation. */
export function PlanarPetArt({src, alt = '', paused = false, reducedMotion = false, compact = false, className = ''}: PlanarPetArtProps) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false), [pageVisible, setPageVisible] = useState(true), [systemReduced, setSystemReduced] = useState(true);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => setSystemReduced(preference.matches);
    const visibilityChange = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? false));
    motionChange(); visibilityChange(); preference.addEventListener('change', motionChange); document.addEventListener('visibilitychange', visibilityChange);
    if (element.current) observer.observe(element.current);
    return () => {observer.disconnect(); preference.removeEventListener('change', motionChange); document.removeEventListener('visibilitychange', visibilityChange);};
  }, []);
  const reduced = systemReduced || reducedMotion;
  const running = !paused && !reduced && visible && pageVisible;
  return <div ref={element} className={`planar-pet-art ${compact ? 'is-compact' : ''} ${className}`} data-media-kind="motion-poster" data-running={running} data-reduced-motion={reduced}>
    <span className="planar-pet-art__aura" aria-hidden="true"/>
    <span className="planar-pet-art__shadow" aria-hidden="true"/>
    <span className="planar-pet-art__star is-one" aria-hidden="true"/>
    <span className="planar-pet-art__star is-two" aria-hidden="true"/>
    <span className="planar-pet-art__star is-three" aria-hidden="true"/>
    <span className="planar-pet-art__dot is-one" aria-hidden="true"/>
    <span className="planar-pet-art__dot is-two" aria-hidden="true"/>
    <img className="planar-pet-art__image" src={src} alt={alt} width="1024" height="1024" decoding="async" draggable={false}/>
  </div>;
}
