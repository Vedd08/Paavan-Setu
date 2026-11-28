import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

/* Lenis takes over wheel events on the window, so any nested scroll container
   (the admin sidebar, admin tables and dialogs) stops responding to the mouse
   wheel. The admin panel has its own layout and no use for smooth scrolling,
   so Lenis is only run on the public site. */
export default function SmoothScroller({ children }) {
  const { pathname } = useLocation();
  const enabled = !pathname.startsWith('/admin');

  useEffect(() => {
    if (!enabled) return undefined;

    let lenis = null;
    let rafId = null;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        if (lenis) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis smooth scroller failed to initialize:', e);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        try {
          lenis.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
        lenis = null;
      }
    };
  }, [enabled]);

  return <>{children}</>;
}
