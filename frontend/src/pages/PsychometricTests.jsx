import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Clock, Eye, ListChecks, Plus, Search, X } from 'lucide-react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { brand } from "../constants/brand";
import { WHATSAPP_NUMBER } from "../constants/urls";
import { TEST_COUPON_URL as COUPON_URL } from "../constants/booking";
import SunGlyph from "../components/ui/SunGlyph";
import { RevealText, CountUp, EASE_OUT } from "../components/ui/TextMotion";
import { getTests, logApiFailure } from "../lib/api";
import psychometricOnline from "../assets/hero/psychometric-online.webp";

/**
 * Psychometric tests — the catalogue, and only that.
 *
 * Explains what the online assessments are and how taking one works, then
 * lists every published test from the API with a preview and a start button.
 * The tests themselves, the runner at /test/:slug, coupons and reports are
 * untouched: this page only changes how the catalogue is presented.
 *
 * Same visual language as the homepage and the DMIT page: white paper, DM
 * Serif headings, brand green with gold accents, an arch-framed photograph,
 * text that rises into place. Facts about the process (coupons, autosave,
 * retakes, My Results) mirror what the runner actually does.
 *
 * Photograph: Pexels License — pexels.com/photo/4308097.
 */

/* ─── Catalogue configuration ──────────────────────────────────────────────
   Presentation is per-slug; facts (counts, time limits, sample questions)
   come from the API. */
const CATEGORY_BY_SLUG = {
  "holland-code-career-test": "Aptitude & Career",
  "engineering-branch-selector": "Stream & Subject Selection",
  "logical-reasoning-aptitude": "Aptitude & Career",
  "stream-selector-test": "Stream & Subject Selection",
  "commerce-career-selector": "Stream & Subject Selection",
  "career-stream-selector": "Stream & Subject Selection",
  "commerce-stream-selector": "Stream & Subject Selection",
  "humanities-stream-selector": "Stream & Subject Selection",
  "humanities-career-test": "Stream & Subject Selection",
};

const ALL = "All tests";
const CATEGORIES = [ALL, "Stream & Subject Selection", "Aptitude & Career"];

// COUPON_URL comes from constants/booking.js, shared with the navbar's
// "Book Session" button on this page.
const HELP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hi! I need help choosing the right psychometric test on Paavan SETU.',
)}`;

/** Everything a card and the preview need, derived from the test itself. */
const deriveMeta = (test) => {
  const count = test.questionsCount ?? (Array.isArray(test.questions) ? test.questions.length : null);
  return {
    category: CATEGORY_BY_SLUG[test.slug] || "Aptitude & Career",
    duration: test.timeLimit ? `${test.timeLimit} min` : 'Untimed',
    questions: count ? `${count} questions` : null,
    format: test.scoringMode === 'scored' ? 'Scored test' : 'Personal profile report',
    measures: (test.categories || []).slice(0, 4),
    sampleQ: test.sampleQuestion || '',
  };
};

const STEPS = [
  { title: 'Choose a test', text: 'Pick the assessment that matches the decision in front of you, from stream to career.' },
  { title: 'Sign in and add your coupon', text: 'A coupon unlocks the assessment. It is only used once you submit your answers.' },
  { title: 'Answer at your own pace', text: 'Go back to any question. Your answers are saved as you go.' },
  { title: 'Get your report instantly', text: 'See your results the moment you finish, and find them again anytime in My Results.' },
];

const REPORT_POINTS = [
  { title: 'Your top match', text: 'The stream, field or career that fits you best, and how clear the lead is.' },
  { title: 'Scores for every area', text: 'How you scored across each area the test measures, side by side.' },
  { title: 'Strengths to build on', text: 'What comes naturally to you, and the areas worth developing.' },
  { title: 'Yours to keep', text: 'Every result is saved to My Results, so you can revisit it or discuss it later.' },
];

const FAQS = [
  {
    q: 'Do I need an account?',
    a: 'Yes. Create a free account or sign in when you start a test, so your results are saved to you.',
  },
  {
    q: 'How do I get a coupon?',
    a: 'Message us on WhatsApp and we will send you one. The coupon is checked when you begin and only used when you submit, so an unfinished attempt does not use it up.',
  },
  {
    q: 'How long does a test take?',
    a: 'Each test shows its number of questions and any time limit before you begin. Most can be completed in one sitting.',
  },
  {
    q: 'What if I close the page halfway?',
    a: 'Your answers are saved on your device as you go, so you can come back and continue the same attempt.',
  },
  {
    q: 'Can I retake a test?',
    a: 'Where a test allows it, yes. You can retake it with a new coupon after a short wait.',
  },
  {
    q: 'Where can I see my results later?',
    a: 'In My Results, available from the menu once you are signed in.',
  },
];

/* ─── Shared bits ──────────────────────────────────────────────────────────── */

function useFadeIn() {
  const reducedMotion = useReducedMotion();
  return (delay = 0) => (reducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '0px 0px -10% 0px' },
      transition: { duration: 0.7, ease: EASE_OUT, delay },
    });
}

function SectionHeading({ id, title, intro, center = false }) {
  const fadeIn = useFadeIn();
  return (
    <div className={`mb-12 md:mb-14 ${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      <RevealText
        as="h2"
        id={id}
        text={title}
        className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(2rem,4vw,3.2rem)] leading-[1.08] tracking-[-0.02em]"
        style={{ color: brand.ink }}
      />
      {intro && (
        <motion.p {...fadeIn(0.2)} className="mt-5 text-[1.05rem] leading-[1.7]" style={{ color: brand.ash }}>
          {intro}
        </motion.p>
      )}
    </div>
  );
}

const ARCH = 'rounded-b-[1.5rem] rounded-t-[999px]';
const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

function scrollToCatalogue() {
  document.getElementById('pt-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── Hero ─────────────────────────────────────────────────────────────────── */

/**
 * An illustrative report beside the photo — what a finished test hands back.
 * Clearly labelled "Sample"; decorative, so hidden from assistive tech.
 */
function SampleReport() {
  const reducedMotion = useReducedMotion();
  const rows = [
    { label: 'Commerce', value: 82, colour: brand.green },
    { label: 'Science', value: 64, colour: brand.teal },
    { label: 'Humanities', value: 48, colour: brand.goldDeep },
  ];
  return (
    <motion.div
      aria-hidden="true"
      className="absolute -bottom-6 left-0 w-[62%] min-w-[13.5rem] rounded-2xl border bg-white p-5"
      style={{ borderColor: 'rgba(15,35,23,0.08)', boxShadow: '0 28px 50px -28px rgba(15,35,23,0.45)' }}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 1.1 }}
    >
      <p className="text-[0.78rem] font-medium" style={{ color: brand.ash }}>Sample report</p>
      <p className="mt-1 font-['DM_Serif_Display',Georgia,serif] text-[1.25rem] leading-tight" style={{ color: brand.ink }}>
        Top match: Commerce
      </p>
      <div className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-[0.78rem]" style={{ color: brand.ash }}>
              <span>{row.label}</span>
              <span className="tabular-nums">{row.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15,35,23,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ width: `${row.value}%`, backgroundColor: row.colour, originX: 0 }}
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 1.35 + i * 0.12 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Hero({ testCount }) {
  const reducedMotion = useReducedMotion();
  const after = (delay) => (reducedMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE_OUT, delay } });

  return (
    <section aria-labelledby="pt-heading" className="px-6 pb-24 pt-32 sm:pt-36 lg:pb-32 lg:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.p {...after(0)} className="mb-6 inline-flex items-center gap-2.5 text-[0.92rem] font-medium" style={{ color: brand.green }}>
            <SunGlyph className="h-4 w-4 shrink-0" />
            Psychometric tests
          </motion.p>

          <RevealText
            as="h1"
            id="pt-heading"
            text="Know your strengths before you choose."
            trigger="mount"
            delay={0.1}
            stagger={0.05}
            className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(2.6rem,5.4vw,4.5rem)] leading-[1.04] tracking-[-0.025em]"
            style={{ color: brand.ink }}
          />

          <motion.p {...after(0.55)} className="mt-7 max-w-xl text-[1.06rem] leading-[1.7] sm:text-lg" style={{ color: brand.ash }}>
            Online aptitude, interest and personality assessments for students choosing a stream,
            subjects or a career. Take a test right here, at your own pace, and get a detailed
            report the moment you finish.
          </motion.p>

          <motion.div {...after(0.75)} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className={`group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-4 text-[0.98rem]
                         font-semibold text-white transition-[background-color,transform] duration-200 ease-out
                         hover:bg-[#08481f] active:scale-[0.97] ${FOCUS}`}
              style={{ backgroundColor: brand.green, outlineColor: brand.green }}
            >
              Choose a test
              <ArrowRight size={17} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </button>
            <a
              href={COUPON_URL}
              target="_blank"
              rel="noreferrer"
              className={`group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full py-2 text-[0.98rem] font-semibold no-underline ${FOCUS}`}
              style={{ color: brand.ink, outlineColor: brand.green }}
            >
              <WhatsAppIcon sx={{ fontSize: 20 }} style={{ color: brand.green }} aria-hidden="true" />
              <span className="relative">
                Get a coupon on WhatsApp
                <span aria-hidden="true" className="absolute -bottom-0.5 left-0 block h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
              </span>
            </a>
          </motion.div>

          <motion.dl {...after(0.95)} className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t pt-7" style={{ borderColor: 'rgba(15,35,23,0.1)' }}>
            {[
              { value: testCount ? <CountUp value={String(testCount)} /> : '—', label: 'Online assessments' },
              { value: 'Instant', label: 'Detailed report' },
              { value: 'Saved', label: 'Answers kept as you go' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-[0.84rem] leading-snug" style={{ color: brand.ash }}>{stat.label}</dt>
                <dd className="m-0 font-['DM_Serif_Display',Georgia,serif] text-[1.9rem] leading-none" style={{ color: brand.ink }}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="relative ml-auto aspect-[4/5] w-[86%]">
            <span aria-hidden="true" className={`pointer-events-none absolute -inset-[9px] border ${ARCH}`} style={{ borderColor: 'rgba(233,200,92,0.75)' }} />
            <motion.div
              className={`relative h-full w-full overflow-hidden ${ARCH}`}
              style={{ boxShadow: '0 30px 60px -34px rgba(15,35,23,0.55)' }}
              initial={reducedMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1], delay: 0.5 }}
            >
              <img
                src={psychometricOnline}
                alt="Two students working through a test on a laptop"
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 55%' }}
                fetchpriority="high"
                decoding="async"
              />
            </motion.div>
          </div>
          <SampleReport />
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─────────────────────────────────────────────────────────── */

function HowItWorks() {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="pt-steps-heading" className="px-6 py-24 md:py-28" style={{ backgroundColor: brand.mist }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="pt-steps-heading" title="How taking a test works" />
        <ol className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, i) => (
            <motion.li key={step.title} {...fadeIn(0.08 * i)}>
              <span aria-hidden="true" className="block font-['DM_Serif_Display',Georgia,serif] text-[3rem] leading-none" style={{ color: brand.goldDeep }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-['DM_Serif_Display',Georgia,serif] text-[1.45rem] leading-tight" style={{ color: brand.ink }}>
                <span className="sr-only">{`Step ${i + 1}: `}</span>
                {step.title}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.65]" style={{ color: brand.ash }}>{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Catalogue ────────────────────────────────────────────────────────────── */

/* forwardRef: AnimatePresence's popLayout mode measures each exiting card
   through a ref, and a plain function component cannot take one. */
const TestCard = React.forwardRef(function TestCard({ test, index, onStart, onPreview }, ref) {
  const reducedMotion = useReducedMotion();
  const meta = deriveMeta(test);

  return (
    <motion.article
      ref={ref}
      layout={!reducedMotion}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT, delay: Math.min(index * 0.06, 0.3) } }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      className="group flex flex-col rounded-[1.75rem] border bg-white p-7 transition-[border-color,box-shadow,transform] duration-300 ease-out
                 hover:-translate-y-0.5 hover:border-[#0a5c2c]/35 hover:shadow-[0_26px_50px_-30px_rgba(15,35,23,0.4)] sm:p-8"
      style={{ borderColor: 'rgba(15,35,23,0.1)' }}
      aria-labelledby={`test-${test.slug}`}
    >
      {/* Grows to fill the card, so every card's buttons line up at the bottom. */}
      <div className="flex-1">
        <p className="text-[0.85rem] font-medium" style={{ color: brand.green }}>{meta.category}</p>
        <h3
          id={`test-${test.slug}`}
          className="mt-2 font-['DM_Serif_Display',Georgia,serif] text-[1.75rem] leading-[1.12] tracking-[-0.01em] sm:text-[2rem]"
          style={{ color: brand.ink }}
        >
          {test.name}
        </h3>
        {test.description && (
          <p className="mt-3 line-clamp-3 text-[1rem] leading-[1.65]" style={{ color: brand.ash }}>{test.description}</p>
        )}

        <ul className="m-0 mt-5 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[0.9rem]" style={{ color: brand.ink }}>
          {meta.questions && (
            <li className="inline-flex items-center gap-1.5">
              <ListChecks size={16} aria-hidden="true" style={{ color: brand.green }} />
              {meta.questions}
            </li>
          )}
          <li className="inline-flex items-center gap-1.5">
            <Clock size={16} aria-hidden="true" style={{ color: brand.green }} />
            {meta.duration}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Check size={16} aria-hidden="true" style={{ color: brand.green }} />
            {meta.format}
          </li>
        </ul>

        {meta.measures.length > 0 && (
          <p className="mt-4 text-[0.9rem] leading-relaxed" style={{ color: brand.ash }}>
            <span className="font-semibold" style={{ color: brand.ink }}>Measures: </span>
            {meta.measures.join(', ')}
          </p>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t pt-6" style={{ borderColor: 'rgba(15,35,23,0.08)' }}>
        <button
          type="button"
          onClick={() => onPreview(test)}
          className={`inline-flex items-center gap-2 rounded-full py-2 text-[0.92rem] font-semibold transition-colors duration-200 hover:text-[#0a5c2c] ${FOCUS}`}
          style={{ color: brand.ash, outlineColor: brand.green }}
        >
          <Eye size={17} aria-hidden="true" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onStart(test.slug)}
          className={`group/start inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.92rem] font-semibold text-white
                     transition-[background-color,transform] duration-200 ease-out hover:bg-[#08481f] active:scale-[0.97] ${FOCUS}`}
          style={{ backgroundColor: brand.green, outlineColor: brand.green }}
        >
          Start test
          <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover/start:translate-x-1" />
        </button>
      </div>
    </motion.article>
  );
});

function Catalogue({ tests, loading, error, onStart, onPreview }) {
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...tests];
    if (category !== ALL) result = result.filter((t) => deriveMeta(t).category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)));
    }
    return result;
  }, [tests, category, search]);

  const countFor = (cat) => (cat === ALL ? tests.length : tests.filter((t) => deriveMeta(t).category === cat).length);

  return (
    <section id="pt-grid" aria-labelledby="pt-grid-heading" className="scroll-mt-28 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              id="pt-grid-heading"
              title="Choose your test"
              intro="Every test runs online on this website. Preview any of them to see what it measures and a sample question."
            />
          </div>
          {/* Search */}
          <div className="relative lg:col-span-5 lg:mb-14">
            <label htmlFor="pt-search" className="sr-only">Search tests</label>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: brand.ash }} />
            <input
              id="pt-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or topic"
              className="w-full rounded-full border bg-white py-3.5 pl-11 pr-4 text-[0.98rem] outline-none transition-[border-color,box-shadow] duration-200
                         focus:border-[#0a5c2c]/50 focus:shadow-[0_0_0_4px_rgba(10,92,44,0.1)]"
              style={{ borderColor: 'rgba(15,35,23,0.15)', color: brand.ink }}
            />
          </div>
        </div>

        {/* Category filter */}
        <div role="group" aria-label="Filter tests by category" className="mb-10 flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.92rem] font-semibold
                           transition-[background-color,color,border-color] duration-200 ease-out ${FOCUS}`}
                style={isActive
                  ? { backgroundColor: brand.green, borderColor: brand.green, color: '#ffffff', outlineColor: brand.green }
                  : { backgroundColor: '#ffffff', borderColor: 'rgba(15,35,23,0.15)', color: brand.ink, outlineColor: brand.green }}
              >
                {cat}
                <span
                  className="rounded-full px-2 py-0.5 text-[0.75rem] tabular-nums"
                  style={isActive ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'rgba(15,35,23,0.06)', color: brand.ash }}
                >
                  {countFor(cat)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="min-h-[22rem] animate-pulse rounded-[1.75rem]" style={{ backgroundColor: brand.mist }} />
            ))
          ) : error || tests.length === 0 ? (
            <div className="rounded-[1.75rem] px-6 py-16 text-center md:col-span-2" style={{ backgroundColor: brand.mist }}>
              <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.6rem]" style={{ color: brand.ink }}>
                The tests could not be loaded
              </h3>
              <p className="mx-auto mt-3 max-w-md" style={{ color: brand.ash }}>Check your connection and try again.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`mt-7 rounded-full px-7 py-3 text-[0.95rem] font-semibold text-white ${FOCUS}`}
                style={{ backgroundColor: brand.green, outlineColor: brand.green }}
              >
                Try again
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[1.75rem] px-6 py-16 text-center md:col-span-2"
                  style={{ backgroundColor: brand.mist }}
                >
                  <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.6rem]" style={{ color: brand.ink }}>
                    No tests match
                  </h3>
                  <p className="mx-auto mt-3 max-w-md" style={{ color: brand.ash }}>Try another word, or show every test.</p>
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setCategory(ALL); }}
                    className={`mt-7 rounded-full px-7 py-3 text-[0.95rem] font-semibold text-white ${FOCUS}`}
                    style={{ backgroundColor: brand.green, outlineColor: brand.green }}
                  >
                    Show all tests
                  </button>
                </motion.div>
              ) : filtered.map((test, index) => (
                <TestCard key={test.slug} test={test} index={index} onStart={onStart} onPreview={onPreview} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Preview dialog ───────────────────────────────────────────────────────── */

function PreviewDialog({ test, onClose, onStart }) {
  const reducedMotion = useReducedMotion();

  // Escape closes the preview; while it is open the page behind does not scroll.
  useEffect(() => {
    if (!test) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [test, onClose]);

  return (
    <AnimatePresence>
      {test && (() => {
        const meta = deriveMeta(test);
        return (
          <div key="preview" className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <motion.div
              className="fixed inset-0 bg-[#0f2317]/45 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pt-preview-title"
              className="relative z-10 w-full max-w-2xl rounded-[1.75rem] bg-white p-7 sm:p-10"
              style={{ boxShadow: '0 40px 90px -30px rgba(15,35,23,0.5)' }}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className={`absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full transition-colors duration-150 hover:bg-[#f3f6f2] ${FOCUS}`}
                style={{ color: brand.ash, outlineColor: brand.green }}
                autoFocus
              >
                <X size={20} />
              </button>

              <p className="text-[0.85rem] font-medium" style={{ color: brand.green }}>{meta.category}</p>
              <h3 id="pt-preview-title" className="mt-2 pr-10 font-['DM_Serif_Display',Georgia,serif] text-[2rem] leading-[1.1]" style={{ color: brand.ink }}>
                {test.name}
              </h3>
              {test.description && (
                <p className="mt-4 text-[1.02rem] leading-[1.7]" style={{ color: brand.ash }}>{test.description}</p>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y py-5 sm:grid-cols-3" style={{ borderColor: 'rgba(15,35,23,0.08)' }}>
                {[
                  { label: 'Questions', value: meta.questions || '—' },
                  { label: 'Time', value: meta.duration },
                  { label: 'Result', value: meta.format },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col-reverse gap-1">
                    <dt className="text-[0.82rem]" style={{ color: brand.ash }}>{item.label}</dt>
                    <dd className="m-0 text-[1rem] font-semibold" style={{ color: brand.ink }}>{item.value}</dd>
                  </div>
                ))}
              </dl>

              {meta.measures.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-['DM_Sans',sans-serif] text-[0.95rem] font-semibold" style={{ color: brand.ink }}>What it measures</h4>
                  <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
                    {meta.measures.map((m) => (
                      <li key={m} className="flex items-center gap-2.5 text-[0.95rem]" style={{ color: brand.ash }}>
                        <Check size={16} aria-hidden="true" style={{ color: brand.green }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {meta.sampleQ && (
                <blockquote className="m-0 mt-6 border-l-2 pl-4" style={{ borderColor: brand.gold }}>
                  <p className="text-[0.82rem] font-medium" style={{ color: brand.ash }}>Sample question</p>
                  <p className="mt-1 font-['DM_Serif_Display',Georgia,serif] text-[1.2rem] italic leading-snug" style={{ color: brand.green }}>
                    {meta.sampleQ}
                  </p>
                </blockquote>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => { onClose(); onStart(test.slug); }}
                  className={`group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[0.98rem] font-semibold text-white
                             transition-[background-color,transform] duration-200 ease-out hover:bg-[#08481f] active:scale-[0.97] ${FOCUS}`}
                  style={{ backgroundColor: brand.green, outlineColor: brand.green }}
                >
                  Start this test
                  <ArrowRight size={17} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-full px-6 py-4 text-[0.98rem] font-semibold transition-colors duration-150 hover:bg-[#f3f6f2] ${FOCUS}`}
                  style={{ color: brand.ash, outlineColor: brand.green }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}

/* ─── What the report shows ────────────────────────────────────────────────── */

function ReportShows() {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="pt-report-heading" className="px-6 py-24 md:py-28" style={{ backgroundColor: brand.mist }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="pt-report-heading"
          title="What your report tells you"
          intro="Not just a score. A clear picture you can act on, ready the moment you submit."
        />
        <ul className="m-0 grid list-none gap-x-10 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_POINTS.map((point, i) => (
            <motion.li key={point.title} {...fadeIn(0.07 * i)} className="border-t pt-6" style={{ borderColor: 'rgba(15,35,23,0.14)' }}>
              <span aria-hidden="true" className="mb-5 block h-[3px] w-10 rounded-full" style={{ backgroundColor: brand.gold }} />
              <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.45rem] leading-tight" style={{ color: brand.ink }}>{point.title}</h3>
              <p className="mt-3 text-[1rem] leading-[1.65]" style={{ color: brand.ash }}>{point.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── FAQ + help ───────────────────────────────────────────────────────────── */

function Faq() {
  return (
    <section aria-labelledby="pt-faq-heading" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading id="pt-faq-heading" title="Questions about the tests" center />
        <div className="border-t" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden ${FOCUS}`}
                style={{ outlineColor: brand.green }}
              >
                <span className="font-['DM_Serif_Display',Georgia,serif] text-[1.3rem] leading-snug" style={{ color: brand.ink }}>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-transform duration-200 ease-out group-open:rotate-45"
                  style={{ borderColor: 'rgba(15,35,23,0.18)', color: brand.green }}
                >
                  <Plus size={18} />
                </span>
              </summary>
              <p className="-mt-1 pb-6 pr-14 text-[1.02rem] leading-[1.7]" style={{ color: brand.ash }}>{item.a}</p>
            </details>
          ))}
        </div>

        {/* Help choosing — still about the tests. */}
        <div className="mt-16 rounded-[1.75rem] px-7 py-10 text-center sm:px-12" style={{ backgroundColor: brand.mist }}>
          <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.8rem] leading-tight" style={{ color: brand.ink }}>
            Not sure which test to take?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-[1.02rem] leading-[1.7]" style={{ color: brand.ash }}>
            Tell us your class and the decision you are facing, and we will point you to the right one.
          </p>
          <a
            href={HELP_URL}
            target="_blank"
            rel="noreferrer"
            className={`mt-7 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[0.98rem] font-semibold text-white no-underline
                       transition-[background-color,transform] duration-200 ease-out hover:bg-[#08481f] active:scale-[0.97] ${FOCUS}`}
            style={{ backgroundColor: brand.green, outlineColor: brand.green }}
          >
            <WhatsAppIcon sx={{ fontSize: 20 }} aria-hidden="true" />
            Ask us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function PsychometricTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewTest, setPreviewTest] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await getTests();
        setTests(Array.isArray(data) ? data : data?.data ?? []);
      } catch (err) {
        // The catalogue renders an error state for this, so it is handled; only
        // unexpected faults (5xx, network) are worth a console entry.
        logApiFailure('load test catalogue', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const startTest = (slug) => navigate(`/test/${slug}`);

  return (
    <div className="w-full overflow-x-clip bg-white">
      <Hero testCount={loading || error ? 0 : tests.length} />
      <HowItWorks />
      <Catalogue tests={tests} loading={loading} error={error} onStart={startTest} onPreview={setPreviewTest} />
      <ReportShows />
      <Faq />
      <PreviewDialog test={previewTest} onClose={() => setPreviewTest(null)} onStart={startTest} />
    </div>
  );
}
