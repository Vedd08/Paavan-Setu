import React, { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import SunGlyph from './SunGlyph';
import { brand } from '../../constants/brand';

/* The practice's vocabulary — what a parent would search for. */
const TERMS = [
  'Career counselling',
  'Psychometric tests',
  'DMIT assessment',
  'Stream selection',
  'School workshops',
  'Value education',
];

/* The track holds COPIES identical runs of the terms, so shifting it by one
   run (100 / COPIES %) lands exactly where it started. */
const COPIES = 4;
const RUN = 100 / COPIES;
/* Resting drift, in % of the track per second: one run every ~55s. */
const BASE_SPEED = RUN / 55;

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * The page's one block of colour: a band of the practice's vocabulary in
 * large italic type on brand green, with the logo's sun between terms.
 *
 * It answers the reader's scrolling: it drifts on its own, races ahead while
 * the page is scrolled, turns round when the page is scrolled back up, and
 * leans into the motion while it is fast — then eases back to its drift.
 *
 * Decorative and aria-hidden — every term is a service the story above
 * already names in full. Under reduced motion it stands still.
 */
export default function HomeMarquee() {
  const reducedMotion = useReducedMotion();
  const offset = useMotionValue(0);
  const direction = useRef(-1);

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const skewX = useTransform(velocity, [-2500, 2500], [5, -5]);
  const x = useTransform(offset, (v) => `${wrap(-RUN, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    const b = boost.get();
    // Scrolling down pulls the band left; scrolling up sends it back.
    if (b < 0) direction.current = 1;
    else if (b > 0) direction.current = -1;
    const step = direction.current * BASE_SPEED * (delta / 1000);
    offset.set(offset.get() + step + step * Math.abs(b));
  });

  return (
    <div aria-hidden="true" className="overflow-hidden py-7 md:py-9" style={{ backgroundColor: brand.green }}>
      <motion.div className="flex w-max will-change-transform" style={{ x, skewX: reducedMotion ? 0 : skewX }}>
        {Array.from({ length: COPIES }, (_, copy) => (
          <div key={copy} className="flex shrink-0">
            {TERMS.map((term) => (
              <span
                key={term}
                className="flex items-center gap-12 whitespace-nowrap pr-12 font-['DM_Serif_Display',Georgia,serif]
                           italic text-[clamp(2rem,4.6vw,4rem)] leading-none md:gap-[4.5rem] md:pr-[4.5rem]"
                style={{ color: brand.ivory }}
              >
                {term}
                <SunGlyph className="h-7 w-7 shrink-0 md:h-9 md:w-9" color={brand.gold} />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
