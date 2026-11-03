import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { brand } from '../../constants/brand';
import SunGlyph from './SunGlyph';
import { RevealText, EASE_OUT } from './TextMotion';
import dmitFingerprint from '../../assets/hero/dmit-fingerprint.webp';
import psychometricOnline from '../../assets/hero/psychometric-online.webp';
import campusStudy from '../../assets/hero/campus-study.webp';
import schoolClassroom from '../../assets/hero/school-classroom.webp';

/**
 * "Where are you right now?" — the visitor picks the stage they are at and the
 * page answers with the one service to start from, three steps, and a link.
 *
 * It is a tab set: arrow keys move between stages, and the answer panel is the
 * tabpanel. Until the visitor chooses, it walks through the stages on its own
 * (with a thin timer under the choices) so it reads as something to touch;
 * hovering the choices or focusing anything in it holds the current stage,
 * and the first real choice stops the walk for good. Hover is watched on the
 * choices only: a resting cursor is usually somewhere over a section this
 * tall, and holding on that would mean it rarely walked at all. Under reduced
 * motion it never walks.
 *
 * Every answer is also rendered, invisible, in the panel's one grid cell, so
 * the panel is always as tall as its longest answer and nothing below jumps.
 * Copy follows the DMIT, Psychometric, Career Counselling and Schools pages.
 */

const AUTOPLAY_MS = 5500;

const PATHS = [
  {
    key: 'young',
    label: 'My child is in school',
    service: 'DMIT assessment',
    title: 'Discover how your child learns, early.',
    body: 'All ten fingerprints, printed by hand and read by an expert, map the strengths a child is born with and the way they naturally learn.',
    steps: ['Prints taken in a few minutes', 'A report written for your child', 'Explained to you face to face'],
    cta: { label: 'Explore DMIT', to: '/dmit' },
    photo: { src: dmitFingerprint, alt: 'A close-up of a fingertip showing its ridges', position: '50% 50%' },
  },
  {
    key: 'stream',
    label: 'Choosing a stream',
    service: 'Psychometric tests',
    title: 'Pick science, commerce or arts with evidence.',
    body: 'Aptitude, interest and personality tests you take online, right here, with a detailed report the moment you finish.',
    steps: ['Take the stream test online', 'See your top matches, and why', 'Talk it through with a counsellor'],
    cta: { label: 'Take a test', to: '/test' },
    photo: { src: psychometricOnline, alt: 'Two students working through notes on a laptop', position: '50% 55%' },
  },
  {
    key: 'career',
    label: 'Planning a career',
    service: 'Career counselling',
    title: 'Turn who you are into a plan you can follow.',
    body: 'Assessments and one-to-one sessions with the student and parents together, ending in a written roadmap for subjects, colleges and admissions.',
    steps: ['Assessments that measure strengths', 'A session with the whole family', 'A written roadmap to follow'],
    cta: { label: 'How counselling works', to: '/career-counselling' },
    photo: { src: campusStudy, alt: 'College students studying together on a campus lawn', position: '58% 55%' },
  },
  {
    key: 'school',
    label: 'I run a school',
    service: 'Schools & workshops',
    title: 'Bring it to every student on your campus.',
    body: 'Workshops for students, teachers and parents, facilitated on site by our experts, with value books already used in 50+ schools.',
    steps: ['A programme mapped to your goals', 'Facilitated on your campus', 'Follow-up support for your faculty'],
    cta: { label: 'Workshops for schools', to: '/schools-workshops' },
    photo: { src: schoolClassroom, alt: 'Students in school uniform listening in class', position: '45% 40%' },
  },
];

function Answer({ path, animateIn }) {
  const fade = (delay) => (animateIn
    ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: EASE_OUT, delay } }
    : {});

  return (
    <>
      <motion.p {...fade(0)} className="m-0 text-[0.85rem] font-semibold uppercase tracking-[0.12em]" style={{ color: brand.green }}>
        {path.service}
      </motion.p>
      {animateIn ? (
        <RevealText
          as="h3"
          text={path.title}
          trigger="mount"
          delay={0.05}
          stagger={0.045}
          className="mt-3 font-['DM_Serif_Display',Georgia,serif] text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.02em]"
          style={{ color: brand.ink }}
        />
      ) : (
        <h3
          className="mt-3 font-['DM_Serif_Display',Georgia,serif] text-[clamp(1.75rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.02em]"
          style={{ color: brand.ink }}
        >
          {path.title}
        </h3>
      )}
      <motion.p {...fade(0.2)} className="mt-4 max-w-lg text-[1.02rem] leading-[1.7]" style={{ color: brand.ash }}>
        {path.body}
      </motion.p>

      <ol className="m-0 mt-7 list-none space-y-3 p-0">
        {path.steps.map((step, i) => (
          <motion.li
            key={step}
            {...fade(0.3 + i * 0.08)}
            className="flex items-baseline gap-4 text-[0.98rem]"
            style={{ color: brand.ink }}
          >
            <span className="w-6 shrink-0 text-[0.8rem] font-semibold tabular-nums" style={{ color: brand.goldDeep }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {step}
          </motion.li>
        ))}
      </ol>

      <motion.div {...fade(0.55)} className="mt-9">
        <Link
          to={path.cta.to}
          className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold
                     text-white no-underline transition-[background-color,transform] duration-200 ease-out
                     hover:bg-[#08481f] active:scale-[0.97]
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ backgroundColor: brand.green, outlineColor: brand.green }}
        >
          {path.cta.label}
          <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </>
  );
}

export default function HomePathfinder() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [held, setHeld] = useState(false);

  const walking = !reducedMotion && !chosen && !held && inView;

  /* A timeout per stage rather than an interval, so the timer bar (keyed on
     the same stage) and the swap always start together. */
  useEffect(() => {
    if (!walking) return undefined;
    const id = setTimeout(() => {
      if (!document.hidden) setActive((i) => (i + 1) % PATHS.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [walking, active]);

  const choose = (index) => {
    setChosen(true);
    setActive(index);
  };

  const onTabKeyDown = (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next;
    if (delta) next = (active + delta + PATHS.length) % PATHS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = PATHS.length - 1;
    else return;
    e.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  };

  const path = PATHS[active];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="pathfinder-heading"
      className="bg-white px-6 py-24 md:py-36"
      onFocus={() => setHeld(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false); }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="m-0 inline-flex items-center gap-2.5 text-[0.92rem] font-medium" style={{ color: brand.green }}>
            <SunGlyph className="h-4 w-4 shrink-0" />
            Find your starting point
          </p>
          <RevealText
            as="h2"
            id="pathfinder-heading"
            text="Where are you right now?"
            className="mt-4 font-['DM_Serif_Display',Georgia,serif] text-[clamp(2.25rem,5vw,3.9rem)] leading-[1.05] tracking-[-0.025em]"
            style={{ color: brand.ink }}
          />
        </div>

        <div
          role="tablist"
          aria-label="Your stage"
          className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5 md:mt-12"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
        >
          {PATHS.map((p, i) => {
            const selected = i === active;
            return (
              <button
                key={p.key}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
                role="tab"
                id={`pathfinder-tab-${p.key}`}
                aria-selected={selected}
                aria-controls="pathfinder-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={onTabKeyDown}
                className="relative rounded-full border px-5 py-2.5 text-[0.95rem] font-semibold transition-colors duration-300
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  borderColor: selected ? brand.green : 'rgba(15,35,23,0.15)',
                  color: selected ? '#fff' : brand.ink,
                  outlineColor: brand.green,
                }}
              >
                {selected && (
                  <motion.span
                    layoutId={reducedMotion ? undefined : 'pathfinder-pill'}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: brand.green }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* The walk's timer. Keyed on the stage so it restarts with each swap. */}
        <div className="mx-auto mt-5 h-[2px] w-24 overflow-hidden rounded-full" style={{ backgroundColor: walking ? 'rgba(15,35,23,0.1)' : 'transparent' }}>
          {walking && (
            <motion.span
              key={active}
              className="block h-full w-full"
              style={{ backgroundColor: brand.gold, originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            />
          )}
        </div>

        <div
          id="pathfinder-panel"
          role="tabpanel"
          aria-labelledby={`pathfinder-tab-${path.key}`}
          aria-live={chosen ? 'polite' : 'off'}
          // On touch screens there is no hover: a finger landing on the answer
          // (usually to scroll while reading it) holds it in place.
          onPointerDown={() => setHeld(true)}
          className="mt-8 grid items-center gap-10 overflow-hidden rounded-[2rem] p-8 sm:p-10 md:mt-10 md:grid-cols-[1.15fr_0.85fr] md:p-14"
          style={{ backgroundColor: brand.mist }}
        >
          <div className="grid">
            {/* Height reservers: every answer, invisible, stacked in one cell. */}
            {PATHS.map((p) => (
              <div key={`ghost-${p.key}`} aria-hidden="true" className="invisible [grid-area:1/1]">
                <Answer path={p} animateIn={false} />
              </div>
            ))}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={path.key}
                className="[grid-area:1/1]"
                exit={reducedMotion ? undefined : { opacity: 0, y: -10, transition: { duration: 0.22, ease: EASE_OUT } }}
              >
                <Answer path={path} animateIn={!reducedMotion} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The arch window, as in the hero and the story; photos wipe up
              over one another. Decorative beside the words, so phones skip it. */}
          <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-[22rem] md:block">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[9px] rounded-b-[1.6rem] rounded-t-[999px] border"
              style={{ borderColor: 'rgba(233,200,92,0.7)' }}
            />
            <div
              className="relative h-full w-full overflow-hidden rounded-b-[1.5rem] rounded-t-[999px] bg-[#e9efe9]"
              style={{ boxShadow: '0 30px 60px -34px rgba(15,35,23,0.55)' }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={path.key}
                  className="absolute inset-0"
                  style={{ zIndex: 1 }}
                  initial={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
                  animate={reducedMotion ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 0, zIndex: 0, transition: { duration: 0.5, delay: reducedMotion ? 0 : 0.35 } }}
                  transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
                >
                  <motion.img
                    src={path.photo.src}
                    alt={path.photo.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                    style={{ objectPosition: path.photo.position }}
                    initial={reducedMotion ? false : { scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.3, ease: EASE_OUT }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
