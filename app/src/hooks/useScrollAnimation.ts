import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function useScrollAnimation<T extends HTMLElement>(
  animationCallback: (element: T, gsapInstance: typeof gsap) => gsap.core.Timeline | gsap.core.Tween | void,
  _options: ScrollAnimationOptions = {}
) {
  const elementRef = useRef<T>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const animation = animationCallback(element, gsap);
      if (animation) {
        animationRef.current = animation;
      }
    }, element);

    return () => {
      ctx.revert();
    };
  }, []);

  return elementRef;
}

export function useScrollTrigger<T extends HTMLElement>(
  callback: (element: T, scrollTrigger: ScrollTrigger) => void,
  options: ScrollAnimationOptions = {}
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: options.start || 'top 80%',
      end: options.end || 'bottom 20%',
      onEnter: () => callback(element, trigger),
      once: true,
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return elementRef;
}
