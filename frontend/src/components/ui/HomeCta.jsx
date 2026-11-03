import React, { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { brand } from '../../constants/brand';
import HomeActions from './HomeActions';
import { RevealText, EASE_OUT } from './TextMotion';

/**
 * Closing call to action. The largest type on the page, rising letter by
 * letter as it scrolls in, then one line of copy and the same pair of actions
 * as the hero — the page ends where it began.
 *
 * Behind it, the hero's sunrise comes up again: as the section scrolls into
 * view the logo's arcs draw outward from the horizon and the gold glow rises
 * under them, both tied to the scroll so the reader raises the sun.
 */

/* The hero's arc family on the same 1000×500 horizon box, kept low: the
   widest reaches the copy under the heading, never the heading itself. */
const ARC_RADII = [150, 230, 310, 390];
const GOLD_ARC = 2;
const arcPath = (r) => `M ${500 - r} 500 A ${r} ${r} 0 0 1 ${500 + r} 500`;

/* One arc of the sunrise. A component so its hook is not called in a map. */
function SunriseArc({ r, index, progress }) {
  const start = index * 0.08;
  const pathLength = useTransform(progress, [start, start + 0.55], [0, 1]);
  const gold = index === GOLD_ARC;
  return (
    <motion.path
      d={arcPath(r)}
      fill="none"
      stroke={gold ? brand.gold : brand.green}
      strokeOpacity={gold ? 0.55 : 0.16 - index * 0.02}
      strokeWidth={gold ? 1.5 : 1.2}
      style={{ pathLength }}
    />
  );
}

function Sunrise() {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const glowY = useTransform(scrollYProgress, [0, 1], ['60%', '50%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  // Under reduced motion the sunrise is simply already up.
  const done = useMotionValue(1);
  const progress = reducedMotion ? done : scrollYProgress;

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <motion.div
        className="absolute bottom-0 left-1/2 h-[40rem] w-[86rem] -translate-x-1/2"
        style={{
          y: reducedMotion ? '50%' : glowY,
          opacity: reducedMotion ? 1 : glowOpacity,
          background:
            'radial-gradient(closest-side, rgba(233,200,92,0.34) 0%, rgba(247,230,174,0.16) 45%, rgba(247,230,174,0) 100%)',
        }}
      />
      <svg
        viewBox="0 0 1000 500"
        // Never narrower than 40rem (phones see the crowns, not a smudge) and
        // never wider than 64rem (wide screens keep the arcs under the copy).
        className="absolute bottom-0 left-1/2 aspect-[2/1] h-auto w-[clamp(40rem,100vw,64rem)] -translate-x-1/2 overflow-visible"
      >
        <defs>
          <linearGradient id="cta-fadeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="55%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <mask id="cta-fade" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="600">
            <rect x="-100" y="-100" width="1200" height="600" fill="url(#cta-fadeGrad)" />
          </mask>
        </defs>
        <g mask="url(#cta-fade)">
          {ARC_RADII.map((r, i) => (
            <SunriseArc key={r} r={r} index={i} progress={progress} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* As in the hero: a white halo so an arc passing behind the words fades out
   just around the letters. Invisible on the white field itself. */
const TEXT_HALO = '0 0 2px #fff, 0 0 8px #fff, 0 0 18px #fff';

export default function HomeCta({ title, description, ctaLabel, ctaLink, whatsappLabel }) {
  const reducedMotion = useReducedMotion();
  const fadeIn = (delay) => (reducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 14 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '0px 0px -10% 0px' },
      transition: { duration: 0.8, ease: EASE_OUT, delay },
    });

  return (
    <section aria-labelledby="cta-heading" className="relative isolate overflow-hidden bg-white px-6 pb-48 pt-32 md:pb-60 md:pt-44">
      <Sunrise />
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <RevealText
          as="h2"
          id="cta-heading"
          text={title || 'Ready to Begin?'}
          by="char"
          stagger={0.025}
          className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(3rem,9vw,7.5rem)] leading-[0.98]
                     tracking-[-0.03em]"
          style={{ color: brand.ink }}
        />

        {description && (
          <motion.p
            {...fadeIn(0.35)}
            className="mx-auto mt-8 max-w-xl text-[1.05rem] leading-[1.75] sm:text-lg"
            style={{ color: brand.ash, textShadow: TEXT_HALO }}
          >
            {description}
          </motion.p>
        )}

        <motion.div {...fadeIn(0.5)} className="mt-10 w-full sm:w-auto">
          <HomeActions primaryLabel={ctaLabel} primaryTo={ctaLink} whatsappLabel={whatsappLabel} />
        </motion.div>
      </div>
    </section>
  );
}
