import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';

/**
 * Text motion primitives for the homepage.
 *
 * One vocabulary across the page: text rises out of a mask on a single strong
 * ease-out curve. Every primitive renders the plain, final text under
 * prefers-reduced-motion, and none of them changes what a screen reader hears —
 * split text is aria-hidden behind one sr-only copy of the whole string.
 */

export const EASE_OUT = [0.22, 1, 0.36, 1];

const splitWords = (text) => String(text ?? '').split(/\s+/).filter(Boolean);

/* The mask is padded and negatively margined by the same amount so it does not
   clip descenders (or the overhang of an italic). */
const MASK = 'inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]';

const rise = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE_OUT } },
};

/**
 * Text that rises into place, word by word or letter by letter.
 *
 * @param {'word'|'char'} by        Split granularity. Letters are grouped per
 *                                  word so lines still break between words.
 * @param {'mount'|'inView'} trigger When to play.
 * @param {number} delay            Seconds before the first unit moves.
 * @param {number} stagger          Seconds between units.
 */
export function RevealText({
  text,
  as: Tag = 'span',
  by = 'word',
  trigger = 'inView',
  delay = 0,
  stagger,
  className = '',
  style,
  id,
}) {
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);

  if (reducedMotion) {
    return <Tag id={id} className={className} style={style}>{text}</Tag>;
  }

  const MotionTag = motion[Tag] || motion.span;
  const play = trigger === 'mount'
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, margin: '0px 0px -12% 0px' } };

  return (
    <MotionTag
      id={id}
      className={className}
      style={style}
      initial="hidden"
      {...play}
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren: delay, staggerChildren: stagger ?? (by === 'char' ? 0.02 : 0.06) },
        },
      }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <React.Fragment key={`${word}-${wi}`}>
            <span className={`${MASK} whitespace-nowrap`}>
              {by === 'char'
                ? Array.from(word).map((ch, ci) => (
                  <motion.span key={ci} variants={rise} className="inline-block will-change-transform">
                    {ch}
                  </motion.span>
                ))
                : (
                  <motion.span variants={rise} className="inline-block will-change-transform">
                    {word}
                  </motion.span>
                )}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </span>
    </MotionTag>
  );
}

/* One word of a ScrollFillText. A component of its own so the hook is called
   once per render of a stable element, not inside a map. */
function FillWord({ progress, range, from, children }) {
  const opacity = useTransform(progress, range, [from, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/**
 * A paragraph whose words fill in from faint to full ink as it scrolls up
 * through the viewport — reading pace set by the reader's own scrolling.
 */
export function ScrollFillText({ text, as: Tag = 'p', className = '', style, from = 0.16 }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });

  if (reducedMotion) {
    return <Tag className={className} style={style}>{text}</Tag>;
  }

  return (
    <Tag ref={ref} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <FillWord progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} from={from}>
              {word}
            </FillWord>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </span>
    </Tag>
  );
}

const charIn = {
  hidden: { y: '110%' },
  visible: ({ i, base }) => ({ y: '0%', transition: { duration: 0.6, ease: EASE_OUT, delay: base + i * 0.035 } }),
  exit: ({ i }) => ({ y: '-110%', transition: { duration: 0.32, ease: [0.77, 0, 0.175, 1], delay: i * 0.015 } }),
};

/**
 * A word that cycles through a list, letters leaving upward as the next word's
 * letters rise in. Decorative: the caller supplies the accessible text.
 *
 * Pauses while the tab is hidden, so a returning visitor does not land
 * mid-sequence on a word they never saw arrive. Under reduced motion it shows
 * the first word and stays still.
 */
export function RotatingWord({ words, interval = 2800, startDelay = 0, className = '', style }) {
  const reducedMotion = useReducedMotion();
  const list = useMemo(() => words.filter(Boolean), [words]);
  /* A step counter rather than an index: it keys each swap uniquely, so a word
     coming round again still re-enters, and step 0 alone carries the page-load
     delay. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion || list.length < 2) return undefined;
    // The first swap waits for the entrance to finish and the word to be read.
    const id = setInterval(() => {
      if (!document.hidden) setStep((s) => s + 1);
    }, interval);
    return () => clearInterval(id);
  }, [reducedMotion, list.length, interval]);

  if (reducedMotion || list.length === 0) {
    return <span className={className} style={style}>{list[0]}</span>;
  }

  const word = list[step % list.length];
  const base = step === 0 ? startDelay : 0;

  return (
    <span aria-hidden="true" className={`${MASK} pr-[0.08em] ${className}`} style={style}>
      <AnimatePresence mode="wait" initial>
        <motion.span
          key={step}
          className="inline-block whitespace-nowrap"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {Array.from(word).map((ch, i) => (
            <motion.span
              key={i}
              custom={{ i, base }}
              variants={charIn}
              className="inline-block will-change-transform"
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * A stat that counts up from zero the first time it scrolls into view.
 * Accepts the CMS format ("2000+", "98%", "1,200+") and keeps its suffix and
 * thousands separator. Tabular figures stop the width jittering as it counts.
 */
export function CountUp({ value, className = '', style }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  // No inset margin: a stat sitting right at the fold must start counting the
  // moment any of it shows, or the visitor reads a row of zeros.
  const inView = useInView(ref, { once: true });
  const raw = String(value ?? '');
  const target = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  const suffix = raw.replace(/[\d,\s]/g, '');
  const grouped = raw.includes(',');
  const [shown, setShown] = useState(reducedMotion || !Number.isFinite(target) ? target : 0);

  useEffect(() => {
    if (!inView || reducedMotion || !Number.isFinite(target)) return undefined;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reducedMotion, target]);

  if (!Number.isFinite(target)) {
    return <span className={className} style={style}>{raw}</span>;
  }

  const display = grouped ? shown.toLocaleString('en-IN') : String(shown);
  return (
    <span ref={ref} className={`tabular-nums ${className}`} style={style}>
      <span className="sr-only">{raw}</span>
      <span aria-hidden="true">{display}{suffix}</span>
    </span>
  );
}
