import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { brand } from '../../constants/brand';
import { EASE_OUT } from './TextMotion';

/**
 * Testimonials, one at a time and large. Each quote resolves word by word out
 * of a slight blur, then holds long enough to read.
 *
 * - Auto-advances every 7s, but pauses while the pointer or keyboard focus is
 *   in the section and while the tab is hidden, and never auto-advances under
 *   reduced motion — the arrows are always there.
 * - Every quote is also rendered, invisible, in the same grid cell, so the
 *   section is always as tall as its longest quote and the page below never
 *   jumps when a short quote replaces a long one.
 */

const AUTOPLAY_MS = 7000;

function Quote({ text, animateIn }) {
  const words = useMemo(() => String(text ?? '').split(/\s+/).filter(Boolean), [text]);
  if (!animateIn) return <>&ldquo;{text}&rdquo;</>;
  return (
    <>
      <span className="sr-only">&ldquo;{text}&rdquo;</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: '0.3em', filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.05 + i * 0.03 }}
            >
              {i === 0 ? '“' : ''}{word}{i === words.length - 1 ? '”' : ''}
            </motion.span>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </span>
    </>
  );
}

function Attribution({ name, role }) {
  return (
    <figcaption className="mt-10 text-[0.98rem]">
      <span className="font-semibold" style={{ color: brand.ink }}>{name}</span>
      {role && <span style={{ color: brand.ash }}>{`, ${role}`}</span>}
    </figcaption>
  );
}

export default function HomeTestimonials({ title, testimonials = [] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (reducedMotion || paused || count < 2) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reducedMotion, paused, count]);

  // A shorter list arriving from the API must not leave the index out of range.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!count) return null;

  const current = testimonials[Math.min(index, count - 1)];
  const go = (delta) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="px-6 py-28 md:py-40"
      style={{ backgroundColor: brand.mist }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="testimonials-heading" className="font-body text-[0.95rem] font-medium" style={{ color: brand.green }}>
          {title}
        </h2>

        <div className="mt-10 grid md:mt-12">
          {/* Height reservers: every quote, invisible, stacked in one cell. */}
          {testimonials.map((t, i) => (
            <figure key={`ghost-${i}`} aria-hidden="true" className="invisible m-0 [grid-area:1/1]">
              <blockquote className="m-0 font-['DM_Serif_Display',Georgia,serif] text-[clamp(1.7rem,3.6vw,2.9rem)] leading-[1.25]">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <Attribution name={t.name} role={t.role} />
            </figure>
          ))}

          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={index}
              className="m-0 [grid-area:1/1]"
              exit={reducedMotion ? undefined : { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE_OUT } }}
            >
              <blockquote
                className="m-0 font-['DM_Serif_Display',Georgia,serif] text-[clamp(1.7rem,3.6vw,2.9rem)]
                           leading-[1.25] tracking-[-0.01em]"
                style={{ color: brand.ink }}
              >
                <Quote text={current.text} animateIn={!reducedMotion} />
              </blockquote>
              <motion.div
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <Attribution name={current.name} role={current.role} />
              </motion.div>
            </motion.figure>
          </AnimatePresence>
        </div>

        {count > 1 && (
          <div className="mt-12 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border bg-white transition-[border-color,transform]
                         duration-200 ease-out hover:border-[#0a5c2c] active:scale-[0.95]
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: 'rgba(15,35,23,0.15)', color: brand.ink, outlineColor: brand.green }}
            >
              <ArrowLeft size={18} />
            </button>
            <span className="min-w-[3.5rem] text-[0.9rem] tabular-nums" style={{ color: brand.ash }}>
              {Math.min(index, count - 1) + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid h-11 w-11 place-items-center rounded-full border bg-white transition-[border-color,transform]
                         duration-200 ease-out hover:border-[#0a5c2c] active:scale-[0.95]
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: 'rgba(15,35,23,0.15)', color: brand.ink, outlineColor: brand.green }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
