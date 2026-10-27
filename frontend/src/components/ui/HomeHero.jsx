import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { brand } from '../../constants/brand';
import SunGlyph from './SunGlyph';
import HomeActions from './HomeActions';
import { RevealText, RotatingWord, EASE_OUT } from './TextMotion';
import studentPortrait from '../../assets/hero/student-portrait.webp';
import schoolClassroom from '../../assets/hero/school-classroom.webp';
import counsellingSession from '../../assets/hero/counselling-session.webp';
import libraryStudy from '../../assets/hero/library-study.webp';
import campusStudy from '../../assets/hero/campus-study.webp';

/**
 * Homepage hero.
 *
 * Headline first: the first line rises letter by letter, then the highlighted
 * word (the CMS "line 2") arrives and cycles through the rotating words. Copy
 * and actions follow on a short stagger.
 *
 * Under them, the people the practice works with, in five arch-topped photo
 * windows that rise to the tallest at the centre — a bridge, the setu of the
 * logo, built out of students, a classroom and a counselling session. The
 * logo's arcs radiate from behind the windows' base with a warm sunrise glow,
 * so the photographs and the background read as one picture.
 *
 * The h1's accessible name is the CMS headline as written; the animated
 * letters and the rotating word are aria-hidden so nothing is announced twice
 * and the rotation is never read out.
 */

/* ─── Photographs ──────────────────────────────────────────────────────────
   Pexels License: free for commercial use, no attribution required. Source
   IDs are kept for provenance (pexels.com/photo/<id>). Self-hosted as ~30–60KB
   WebP so a third-party CDN can never break the hero. These are stand-ins:
   the client's own session and workshop photographs should replace them,
   keeping the same five slots.

   `scale` is the window's height relative to the tallest (the centre), and
   `position` frames the subject inside the arch. The outer two are dropped on
   phones, where five windows would be slivers. */
const GALLERY = [
  { src: studentPortrait, alt: 'A college student with a backpack', scale: 0.7, position: '48% 30%', pexels: 16562720 },
  { src: schoolClassroom, alt: 'Students in school uniform listening in class', scale: 0.86, position: '45% 40%', pexels: 3231358 },
  { src: counsellingSession, alt: 'A counsellor in a one-on-one session', scale: 1, position: '62% 45%', pexels: 14797769 },
  { src: libraryStudy, alt: 'A student reading in a library', scale: 0.86, position: '78% 40%', pexels: 16461275 },
  { src: campusStudy, alt: 'College students studying together on a campus lawn', scale: 0.7, position: '58% 55%', pexels: 4622108 },
];
/* Windows open from the centre outward, after the actions have landed. */
const REVEAL_ORDER = [3, 1, 0, 2, 4];
const GALLERY_START = 1.15;

/* ─── Arcs ─────────────────────────────────────────────────────────────────
   Half-disc geometry in a 1000×500 box whose bottom-centre (500,500) is the
   horizon — pinned to the gallery's base, so the arcs always rise from
   behind the windows. The box is `max(100vw, 56rem)` wide: on a phone it
   overflows both sides and shows the arcs' crowns rather than shrinking them
   to a smudge. Radii step by 80 so the bands read as one family. */
const ARC_RADII = [190, 270, 350, 430, 510];
const GREEN_ARC_OPACITY = [0.16, 0.13, 0.1, 0.08, 0.06];
/* The gold arc, and the one the light crosses: its crown passes above the
   headline and its sides fall through the empty margins. */
const GOLD_ARC = 3;
const arcPath = (r) => `M ${500 - r} 500 A ${r} ${r} 0 0 1 ${500 + r} 500`;
const CROSSING_S = 11;

/* A white halo around text that sits over the arcs: wherever a line passes
   behind a word it fades out just around the letters, at every width. On a
   white field the halo itself is invisible. */
const TEXT_HALO = '0 0 2px #fff, 0 0 8px #fff, 0 0 18px #fff';

function HeroArcs() {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
      {/* Sunrise, centred on the horizon. A CSS gradient fades out on its own,
          where an SVG fill was cut off by its box's edge. */}
      <div
        className="absolute bottom-0 left-1/2 h-[46rem] w-[92rem] -translate-x-1/2 translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(233,200,92,0.28) 0%, rgba(247,230,174,0.13) 45%, rgba(247,230,174,0) 100%)',
        }}
      />

      <svg
        viewBox="0 0 1000 500"
        className="absolute bottom-0 left-1/2 aspect-[2/1] h-auto w-[max(100vw,56rem)] -translate-x-1/2 overflow-visible"
      >
        <defs>
          {/* Fades the arcs out toward the horizon, where the windows stand. */}
          <linearGradient id="hb-fadeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="62%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <mask id="hb-fade" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="600">
            <rect x="-100" y="-100" width="1200" height="600" fill="url(#hb-fadeGrad)" />
          </mask>
        </defs>

        <g mask="url(#hb-fade)">
          {ARC_RADII.map((r, i) => (
            <motion.path
              key={r}
              d={arcPath(r)}
              fill="none"
              stroke={i === GOLD_ARC ? brand.gold : brand.green}
              strokeOpacity={i === GOLD_ARC ? 0.45 : GREEN_ARC_OPACITY[i]}
              strokeWidth={i === GOLD_ARC ? 1.5 : 1.2}
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.15 + i * 0.12 }}
            />
          ))}

          {/* The light crossing the bridge. SMIL so it follows the arc exactly;
              it is not covered by the global reduced-motion rule, so it is
              simply not rendered then. Hidden until the arcs have drawn. */}
          {!reducedMotion && (
            <g opacity="0">
              <circle r="11" fill={brand.gold} opacity="0.25" />
              <circle r="4" fill={brand.gold} />
              <animateMotion dur={`${CROSSING_S}s`} begin="2.4s" repeatCount="indefinite" path={arcPath(ARC_RADII[GOLD_ARC])} />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.88;1"
                dur={`${CROSSING_S}s`}
                begin="2.4s"
                repeatCount="indefinite"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/**
 * The five arch windows, bottom-aligned on one baseline. Each opens upward
 * with a clip-path wipe while its photo settles from a slight zoom — the
 * camera finding the subject — then holds still. The centre window carries a
 * thin gold frame, offset like the logo's ring around its sun.
 *
 * Heights come from one CSS variable, so the whole bridge scales together
 * with the viewport height and the centre is always the tallest.
 */
function HeroGallery() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="flex w-full items-end justify-center gap-2.5 sm:gap-4 lg:gap-5
                 [--arch-h:14rem] sm:[--arch-h:17rem] lg:[--arch-h:clamp(13rem,31vh,19rem)]"
    >
      {GALLERY.map((photo, i) => {
        const delay = GALLERY_START + REVEAL_ORDER[i] * 0.1;
        const isCentre = i === 2;
        return (
          <div
            key={photo.pexels}
            className={`relative min-w-0 max-w-[15rem] flex-1 ${i === 0 || i === GALLERY.length - 1 ? 'hidden md:block' : ''}`}
            style={{ height: `calc(var(--arch-h) * ${photo.scale})` }}
          >
            {isCentre && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[7px] rounded-b-[1.6rem] rounded-t-[999px] border"
                style={{ borderColor: 'rgba(233,200,92,0.75)' }}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: delay + 0.7 }}
              />
            )}
            <motion.figure
              className="relative m-0 h-full w-full overflow-hidden rounded-b-[1.25rem] rounded-t-[999px] bg-[#e9efe9]"
              style={{ boxShadow: '0 26px 50px -30px rgba(15,35,23,0.5)' }}
              initial={reducedMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1], delay }}
            >
              <motion.img
                src={photo.src}
                alt={photo.alt}
                draggable={false}
                decoding="async"
                {...(isCentre ? { fetchpriority: 'high' } : {})}
                className="h-full w-full select-none object-cover"
                style={{ objectPosition: photo.position }}
                initial={reducedMotion ? false : { scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: EASE_OUT, delay }}
              />
            </motion.figure>
          </div>
        );
      })}
    </div>
  );
}

export default function HomeHero({ get, rotatingWords = [] }) {
  const reducedMotion = useReducedMotion();
  const line1 = get('hero.title.line1');
  const line2 = get('hero.title.line2');
  // The CMS word always leads, so editing it in the admin panel is visible at once.
  const words = [line2, ...rotatingWords.filter((w) => w && w !== line2)];

  /* Everything after the headline fades up on one shared timeline. */
  const after = (delay) => (reducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: EASE_OUT, delay },
    });

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-white px-6 pb-10 pt-28 sm:pt-32 lg:pt-36"
    >
      {/* Hands the hero back to plain white so it meets the next section
          without a seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-white/0 to-white"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center text-center">
        {get('hero.badge') && (
          <motion.p
            {...after(0)}
            className="mb-6 inline-flex items-center gap-2.5 text-[0.92rem] font-medium"
            style={{ color: brand.green, textShadow: TEXT_HALO }}
          >
            <SunGlyph className="h-4 w-4 shrink-0" />
            {get('hero.badge')}
          </motion.p>
        )}

        <h1
          id="hero-heading"
          // Sized so the default first line holds on one line from ~1024px up
          // and the photo windows still clear a 900px fold.
          className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(2.5rem,5.4vw,4.75rem)]
                     leading-[1.04] tracking-[-0.025em]"
          // No TEXT_HALO here: every letter is its own composited layer
          // during the reveal, so each letter's halo painted over its
          // neighbour and mottled the strokes.
          style={{ color: brand.ink }}
        >
          <span className="sr-only">{`${line1} ${line2}`}</span>
          <span aria-hidden="true" className="block">
            <RevealText text={line1} by="char" trigger="mount" delay={0.1} stagger={0.018} />
          </span>
          <span aria-hidden="true" className="relative mt-1 inline-block italic" style={{ color: brand.green }}>
            <RotatingWord words={words} startDelay={0.55} interval={3200} />
            {/* A short gold rule under the word, drawn once. Fixed width so it
                stays put while the word changes length; centred with
                `inset-x-0 mx-auto` because the scaleX tween owns transform. */}
            <motion.span
              className="absolute inset-x-0 -bottom-1 mx-auto block h-[3px] w-16 rounded-full sm:w-24"
              style={{ backgroundColor: brand.gold, originX: 0.5 }}
              initial={reducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.1 }}
            />
          </span>
        </h1>

        <motion.p
          {...after(0.95)}
          className="mx-auto mt-8 max-w-xl text-[1.05rem] leading-[1.7] sm:text-lg"
          style={{ color: brand.ash, textShadow: TEXT_HALO }}
        >
          {get('hero.description')}
        </motion.p>

        <motion.div {...after(1.05)} className="mt-8 w-full sm:w-auto">
          <HomeActions
            primaryLabel={get('hero.ctaPrimary')}
            primaryTo={get('hero.ctaPrimaryLink')}
            whatsappLabel={get('hero.ctaSecondary')}
          />
        </motion.div>

        {/* The arcs hang from this wrapper's foot, so they always rise from
            behind the windows whatever the copy above them does. */}
        <div className="relative mt-12 w-full sm:mt-14">
          <HeroArcs />
          <HeroGallery />
        </div>
      </div>

    </section>
  );
}
