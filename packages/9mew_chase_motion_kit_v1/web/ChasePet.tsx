'use client';

import { useEffect, useRef } from 'react';
import { create9mewChase, type ChaseController, type ChaseOptions } from './chase-scene.js';

/** Mounts the transparent viewport overlay; does not render a duplicate container. */
export function ChasePet({ catalogUrl, autoplay = false, repeat = 1, speed = 1,
  catSize = 160, margin = 32, onReady }: {
  catalogUrl: string;
  autoplay?: boolean;
  repeat?: number;
  speed?: number;
  catSize?: number;
  margin?: number;
  onReady?: (controller: ChaseController) => void;
}) {
  const callback = useRef(onReady);
  callback.current = onReady;
  useEffect(() => {
    const controller = create9mewChase({ catalogUrl, autoplay, repeat, speed, catSize, margin } satisfies ChaseOptions);
    let active = true;
    controller.ready.then(ok => { if (active && ok) callback.current?.(controller); });
    return () => { active = false; controller.destroy(); };
  }, [catalogUrl, autoplay, repeat, speed, catSize, margin]);
  return null;
}
