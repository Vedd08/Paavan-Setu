import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { brand } from '../../constants/brand';
import { RevealText, CountUp, EASE_OUT } from './TextMotion';
import counsellingSession from '../../assets/hero/counselling-session.webp';
import dmitFingerprint from '../../assets/hero/dmit-fingerprint.webp';
import psychometricOnline from '../../assets/hero/psychometric-online.webp';
import schoolClassroom from '../../assets/hero/school-classroom.webp';
import coverPathshala from '../../assets/krishna_pathsala2.webp';
import coverRamayan from '../../assets/Ramayan2.webp';
import coverGanesha from '../../assets/myfriendganesha2.webp';

/**
 * The homepage story, told as the visitor scrolls: what Paavan Setu does,
 * then what it offers in the order the practice leads with — DMIT,
 * psychometric tests, books — each with the benefit to the family, and
 * finally why Paavan Setu and what this website lets you do.
 *
 * Desktop: a pinned stage. The section is one viewport tall per chapter and
 * the stage sticks while it scrolls past, so scroll position *is* the
 * chapter. A rail across the top names every chapter and fills as you read;
 * each chapter's text rises in, and its picture wipes up over the last one.
 * Clicking a chapter on the rail scrolls to it.
 *
 * Phones: the same chapters stacked and revealed on scroll — pinned stages
 * fight touch scrolling and the mobile URL bar, so they are not used there.
 *
 * Copy is drawn from the practice's own pages (Career Counselling, Books);
 * the closing chapter reads the CMS "Why us" heading, text and achievements.
 * Photographs: Pexels License (pexels.com/photo/<id>) — fingerprint 7479537,
 * online study 4308097; the book covers are the practice's own titles.
 */

/** "2000+ Students Guided" → { value: '2000+', label: 'Students Guided' } */
function splitStat(raw) {
  const match = String(raw).match(/^([\d,]+\s*[%+]*)\s+(.*)$/);
  return match
    ? { value: match[1].replace(/\s+/g, ''), label: match[2] }
    : { value: String(raw), label: '' };
}

function buildChapters({ whyTitle, whyDescription, achievements }) {
  return [
    {
      key: 'what-we-do',
      label: 'What we do',
      title: 'We help students discover who they are, then choose with confidence.',
      body: 'Science-backed assessments meet one-on-one expert counselling, so the stream, subjects and college a student picks are grounded in who they genuinely are.',
      points: [
        'Assessments that measure strengths, not guesses',
        'Sessions with the student and parents together',
        'A written roadmap to follow afterwards',
      ],
      cta: { label: 'How counselling works', to: '/career-counselling' },
      visual: { type: 'photo', src: counsellingSession, alt: 'A counsellor in a one-on-one session', position: '62% 45%' },
    },
    {
      key: 'dmit',
      label: 'DMIT',
      title: 'DMIT: the strengths a child is born with.',
      body: 'A biometric analysis of all ten fingerprints that reveals innate potential and how a child naturally learns, long before marks and exams can show it.',
      points: [
        'Multiple intelligences mapped (Howard Gardner framework)',
        'Learning style: visual, auditory or kinesthetic',
        'IQ, EQ, AQ and CQ quotients',
      ],
      benefit: 'Know how your child learns best, and nurture it early.',
      cta: { label: 'Explore manual DMIT', to: '/dmit' },
      visual: { type: 'photo', src: dmitFingerprint, alt: 'A close-up of a fingertip showing its ridges', position: '50% 50%' },
    },
    {
      key: 'psychometric',
      label: 'Psychometric tests',
      title: 'Psychometric tests: clarity you can measure.',
      body: 'Aptitude, interest and personality assessments you take online, right here on this website, with a detailed report the moment you finish.',
      points: [
        'Stream selection for Class 9 to 12',
        'Commerce, humanities and engineering career tests',
        'A report with your top matches, and why',
      ],
      benefit: 'Choose a stream or career with evidence, not guesswork.',
      cta: { label: 'Take a test', to: '/test' },
      visual: { type: 'photo', src: psychometricOnline, alt: 'Two students working through notes on a laptop', position: '50% 55%' },
    },
    {
      key: 'books',
      label: 'Value books',
      title: 'Books that carry values home.',
      body: 'Gujarati books for children that retell the Ramayana, the Gita and more as stories a child steps into, used in 50+ schools across Gujarat.',
      points: [
        'Stories children live, not lectures',
        'Activities for home and the classroom',
        'Order online, delivered to your door',
      ],
      benefit: 'Character that grows alongside marks.',
      cta: { label: 'Browse the books', to: '/books' },
      visual: {
        type: 'books',
        covers: [
          { src: coverPathshala, alt: 'Krishna ni Pathshala book cover' },
          { src: coverRamayan, alt: 'Ramayan book cover' },
          { src: coverGanesha, alt: 'My Friend Ganesha book cover' },
        ],
      },
    },
    {
      key: 'why',
      label: 'Why Paavan Setu',
      title: whyTitle,
      body: whyDescription,
      stats: achievements.slice(0, 4).map(splitStat),
      points: [
        'Take assessments online, any time',
        'See every result and download your report',
        'Book a session or order books in a few taps',
      ],
      cta: { label: 'Book a session', to: '/contact' },
      visual: { type: 'photo', src: schoolClassroom, alt: 'Students in school uniform listening in class', position: '45% 40%' },
    },
  ];
}

/* ─── Pieces shared by both layouts ───────────────────────────────────────── */

function ChapterCta({ cta }) {
  return (
    <Link
      to={cta.to}
      className="group inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[0.95rem] font-semibold
                 no-underline transition-[background-color,color,transform] duration-200 ease-out
                 hover:bg-[#0a5c2c] hover:text-white active:scale-[0.97]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ borderColor: brand.green, color: brand.green, outlineColor: brand.green }}
    >
      {cta.label}
      <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * A chapter's words. `trigger` decides when the heading rises: on mount for
 * the pinned stage (each chapter mounts as it becomes active), in view for
 * the stacked phone layout.
 */
function ChapterText({ chapter, trigger }) {
  const reducedMotion = useReducedMotion();
  const fade = (delay) => (reducedMotion
    ? {}
    : trigger === 'mount'
      ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE_OUT, delay } }
      : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '0px 0px -10% 0px' },
        transition: { duration: 0.6, ease: EASE_OUT, delay },
      });

  return (
    <>
      <RevealText
        as="h3"
        text={chapter.title}
        trigger={trigger}
        stagger={0.04}
        className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(1.9rem,3.3vw,3rem)] leading-[1.1]
                   tracking-[-0.02em]"
        style={{ color: brand.ink }}
      />

      <motion.p {...fade(0.25)} className="mt-5 max-w-xl text-[1.04rem] leading-[1.7]" style={{ color: brand.ash }}>
        {chapter.body}
      </motion.p>

      {chapter.stats && chapter.stats.length > 0 && (
        <motion.dl {...fade(0.35)} className="mt-7 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {chapter.stats.map((stat) => (
            <div key={stat.value + stat.label} className="flex flex-col-reverse gap-1">
              <dt className="text-[0.82rem] leading-snug" style={{ color: brand.ash }}>{stat.label}</dt>
              <dd className="m-0 font-['DM_Serif_Display',Georgia,serif] text-[1.9rem] leading-none" style={{ color: brand.ink }}>
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </motion.dl>
      )}

      <ul className="m-0 mt-7 list-none space-y-3 p-0">
        {chapter.points.map((point, i) => (
          <motion.li
            key={point}
            {...fade(0.4 + i * 0.07)}
            className="flex items-start gap-3 text-[0.98rem] leading-snug"
            style={{ color: brand.ink }}
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: 'rgba(10,92,44,0.1)', color: brand.green }}
            >
              <Check size={13} strokeWidth={3} />
            </span>
            {point}
          </motion.li>
        ))}
      </ul>

      {/* The benefit, set apart as the chapter's takeaway. */}
      {chapter.benefit && (
        <motion.p
          {...fade(0.62)}
          className="mt-7 max-w-xl border-l-2 pl-4 font-['DM_Serif_Display',Georgia,serif] text-[1.3rem] italic leading-snug"
          style={{ borderColor: brand.gold, color: brand.green }}
        >
          {chapter.benefit}
        </motion.p>
      )}

      <motion.div {...fade(0.72)} className="mt-8">
        <ChapterCta cta={chapter.cta} />
      </motion.div>
    </>
  );
}

/* The arch window — the same shape as the hero's photo bridge. */
const ARCH = 'rounded-b-[1.5rem] rounded-t-[999px]';

/* Always lazy: the pinned stage stays mounted (display:none) on phones, and
   an eager image there would download for nothing. */
function PhotoArch({ visual }) {
  return (
    <img
      src={visual.src}
      alt={visual.alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="h-full w-full select-none object-cover"
      style={{ objectPosition: visual.position }}
    />
  );
}

/* Fanned cover placements. Rotation lives in framer's `rotate` rather than a
   Tailwind class, and the centre cover is centred with offsets rather than a
   translate: the entrance tween owns `transform` and would erase both. */
const COVER_PLACEMENTS = [
  { className: 'left-[6%] top-[24%] w-[42%]', rotate: -9 },
  { className: 'left-[26%] top-[14%] z-10 w-[48%]', rotate: 0 },
  { className: 'right-[6%] top-[24%] w-[42%]', rotate: 9 },
];

/** Three of the practice's own covers, fanned inside a pale arch. */
function BooksArch({ visual, animateIn }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: brand.mist }}>
      {visual.covers.map((cover, i) => (
        <motion.img
          key={cover.alt}
          src={cover.src}
          alt={cover.alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          className={`absolute aspect-[0.64] select-none rounded-[6px] object-cover ${COVER_PLACEMENTS[i].className}`}
          style={{ rotate: COVER_PLACEMENTS[i].rotate, boxShadow: '0 24px 40px -18px rgba(15,35,23,0.55)' }}
          initial={animateIn && !reducedMotion ? { opacity: 0, y: 40 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 + [1, 0, 2][i] * 0.1 }}
        />
      ))}
    </div>
  );
}

function ChapterVisual({ visual, animateIn }) {
  return visual.type === 'books'
    ? <BooksArch visual={visual} animateIn={animateIn} />
    : <PhotoArch visual={visual} />;
}

/* ─── Desktop: pinned stage ───────────────────────────────────────────────── */

function RailItem({ chapter, index, count, progress, active, onSelect }) {
  const fill = useTransform(progress, [index / count, (index + 1) / count], [0, 1]);
  const isActive = active === index;
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-current={isActive ? 'step' : undefined}
      className="group min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ outlineColor: brand.green }}
    >
      <span
        className={`flex items-baseline gap-2 truncate text-[0.88rem] transition-colors duration-300 ${isActive ? 'font-semibold' : 'font-medium'}`}
        style={{ color: isActive ? brand.ink : brand.ash }}
      >
        <span className="text-[0.75rem] tabular-nums" style={{ color: isActive ? brand.green : brand.ash }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {chapter.label}
      </span>
      <span className="mt-3 block h-[2px] w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15,35,23,0.1)' }}>
        <motion.span className="block h-full w-full" style={{ scaleX: fill, originX: 0, backgroundColor: brand.green }} />
      </span>
    </button>
  );
}

function PinnedStory({ chapters }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const count = chapters.length;
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(v * count)));
    setActive((prev) => (prev === next ? prev : next));
  });

  /* Scroll to a point a little inside the chapter, so it is unambiguously the
     active one when the scroll settles. */
  const jumpTo = (index) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * ((index + 0.08) / count), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const chapter = chapters[active];

  return (
    <div ref={ref} className="relative" style={{ height: `${count * 100}svh` }}>
      {/* pt-36 clears the floating navbar (it sits ~118px deep) with room to spare. */}
      <div className="sticky top-0 flex h-[100svh] flex-col px-6 pb-10 pt-36">
        <nav aria-label="Story chapters" className="mx-auto grid w-full max-w-6xl gap-5" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {chapters.map((c, i) => (
            <RailItem key={c.key} chapter={c} index={i} count={count} progress={scrollYProgress} active={active} onSelect={jumpTo} />
          ))}
        </nav>

        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-12 items-center gap-10 pt-8">
          <div className="col-span-7 xl:col-span-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chapter.key}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.22, ease: EASE_OUT } }}
              >
                <ChapterText chapter={chapter} trigger="mount" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="col-span-5 flex justify-center xl:col-span-6">
            <div className="relative aspect-[4/5] w-full max-w-[27rem]" style={{ maxHeight: 'calc(100svh - 16rem)' }}>
              {/* A thin gold frame, offset like the logo's ring round its sun. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-[9px] border ${ARCH}`}
                style={{ borderColor: 'rgba(233,200,92,0.7)' }}
              />
              <div className={`relative h-full w-full overflow-hidden ${ARCH}`} style={{ boxShadow: '0 30px 60px -34px rgba(15,35,23,0.55)' }}>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={chapter.key}
                    className="absolute inset-0"
                    style={{ zIndex: 1 }}
                    initial={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
                    animate={reducedMotion ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0, zIndex: 0, transition: { duration: 0.5, delay: reducedMotion ? 0 : 0.35 } }}
                    transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
                  >
                    <motion.div
                      className="h-full w-full"
                      initial={reducedMotion ? false : { scale: 1.12 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.3, ease: EASE_OUT }}
                    >
                      <ChapterVisual visual={chapter.visual} animateIn />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Phones: stacked chapters ────────────────────────────────────────────── */

function StackedStory({ chapters }) {
  return (
    <div className="space-y-24 px-6 py-20 sm:space-y-28">
      {chapters.map((chapter, i) => (
        <article key={chapter.key} className="mx-auto max-w-xl">
          <p className="mb-6 flex items-baseline gap-2 text-[0.9rem] font-semibold" style={{ color: brand.green }}>
            <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            {chapter.label}
          </p>
          <div className="relative mx-auto mb-10 aspect-[4/5] w-full max-w-sm">
            <div className={`h-full w-full overflow-hidden ${ARCH}`} style={{ boxShadow: '0 26px 50px -30px rgba(15,35,23,0.5)' }}>
              <ChapterVisual visual={chapter.visual} animateIn={false} />
            </div>
          </div>
          <ChapterText chapter={chapter} trigger="inView" />
        </article>
      ))}
    </div>
  );
}

export default function HomeStory({ whyTitle, whyDescription, achievements = [] }) {
  const chapters = buildChapters({ whyTitle, whyDescription, achievements });

  return (
    <section aria-labelledby="story-heading" className="relative bg-white">
      <h2 id="story-heading" className="sr-only">How Paavan Setu helps</h2>
      <div className="hidden lg:block">
        <PinnedStory chapters={chapters} />
      </div>
      <div className="lg:hidden">
        <StackedStory chapters={chapters} />
      </div>
    </section>
  );
}
