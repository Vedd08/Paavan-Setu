import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Phone, Plus } from 'lucide-react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { brand, FIELD_GRADIENT } from '../constants/brand';
import { CONTACT } from '../constants/urls';
import { inr, DMIT_PRICE as PRICE, DMIT_SAVING as SAVING, DMIT_BOOK_URL as BOOK_URL } from '../constants/booking';
import SunGlyph from '../components/ui/SunGlyph';
import { RevealText, EASE_OUT } from '../components/ui/TextMotion';
import inkPrints from '../assets/dmit/dmit-ink-prints.webp';
import fingertip from '../assets/hero/dmit-fingerprint.webp';

/**
 * DMIT — the practice's manual Dermatoglyphics Multiple Intelligence Test.
 *
 * One job: explain why a hand-read DMIT is worth booking, show the price, and
 * make booking one tap. The differentiator is that every print is taken in
 * ink and read by a trained analyst rather than a scanner, which is what the
 * practice credits for its accuracy across ages 3 to 50 — so "manual" leads
 * every section rather than being one bullet among many.
 *
 * Same visual language as the homepage: white paper, DM Serif headings, brand
 * green with gold accents, arch-framed photographs, text that rises into
 * place. One block of colour — the pricing card — at the moment of decision.
 *
 * Photographs: Pexels License (pexels.com/photo/<id>) — ink prints 11591912,
 * fingertip 7479537.
 */

/* The price and the WhatsApp booking link live in constants/booking.js.
   Change the price there. */

/* ─── Content ──────────────────────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: 'Every ridge read by an expert',
    text: 'A trained analyst counts and classifies each print by eye, instead of leaving the reading to a scanner’s software.',
  },
  {
    title: 'Accurate from age 3 to 50',
    text: 'Ink captures small fingers and faint ridges clearly, so young children can be assessed as reliably as adults.',
  },
  {
    title: 'The whole print, edge to edge',
    text: 'Rolled ink prints record the complete pattern of every finger, including the edges a flat scanner can miss.',
  },
  {
    title: 'A report written for one person',
    text: 'Your results are interpreted by the person who studied your prints, not assembled from a template.',
  },
  {
    title: 'Explained to you face to face',
    text: 'Every report comes with a one-on-one session that walks you, or your child and you, through what it means.',
  },
  {
    title: 'Gentle for young children',
    text: 'No machines and no bright lights. A child simply presses each finger on an ink pad, and it is done in minutes.',
  },
];

const REPORT_ITEMS = [
  { title: 'Multiple intelligences', text: 'Your profile across Howard Gardner’s intelligences, from logical to interpersonal.' },
  { title: 'Learning style', text: 'Whether you learn best by seeing, hearing or doing.' },
  { title: 'IQ, EQ, AQ and CQ', text: 'Intelligence, emotional, adversity and creativity quotients.' },
  { title: 'Brain dominance', text: 'How the left and right sides of the brain share the work.' },
  { title: 'Innate talents', text: 'The natural strengths worth building on early.' },
  { title: 'Stream and career direction', text: 'Fields and subjects that suit how you are wired.' },
];

const AGE_BANDS = [
  { range: '3–12', who: 'Children', text: 'How they learn best, so parents and teachers can teach to it.' },
  { range: '13–18', who: 'Teenagers', text: 'Stream and subject choices that suit their natural strengths.' },
  { range: '19–30', who: 'Young adults', text: 'Courses, career direction and the kind of work that fits.' },
  { range: '31–50', who: 'Adults & parents', text: 'Self-understanding, career change and parenting with insight.' },
];

const STEPS = [
  { title: 'Book your slot', text: 'Message us on WhatsApp or call, and pick a time that suits you.' },
  { title: 'Prints taken by hand', text: 'All ten fingers are printed in ink by our analyst. It takes a few minutes.' },
  { title: 'Expert analysis', text: 'Each print is studied manually and your profile is worked out from the ridges.' },
  { title: 'Report and session', text: 'You receive a detailed written report and a one-on-one session to explain it.' },
];

const INCLUDED = [
  'Ink prints of all ten fingers, taken by hand',
  'Manual analysis by a trained expert',
  'A detailed written report',
  'A one-on-one session to explain your results',
];

const FAQS = [
  {
    q: 'What is DMIT?',
    a: 'DMIT stands for Dermatoglyphics Multiple Intelligence Test. It studies the patterns of your fingerprints to understand your innate strengths, intelligences and learning style.',
  },
  {
    q: 'Why is a manual DMIT better?',
    a: 'Because a trained analyst reads every ridge of every print, instead of software reading a scan. Ink prints also capture small fingers and faint ridges clearly, which is why the assessment stays accurate from age 3 to 50.',
  },
  {
    q: 'Who can take it?',
    a: 'Anyone from 3 to 50 years old: young children, school students choosing a stream, young adults choosing a career, and parents or professionals who want to understand themselves better.',
  },
  {
    q: 'Does it hurt, or take long?',
    a: 'Not at all. Each finger is simply pressed on an ink pad and rolled on paper. Taking the prints takes a few minutes.',
  },
  {
    q: 'What do I receive?',
    a: 'A detailed written report of your DMIT profile, and a one-on-one session in which we explain the results and what to do with them.',
  },
  {
    q: 'How much does it cost, and how do I book?',
    a: `The assessment is ${inr(PRICE.regular)}, now available at a special price of ${inr(PRICE.special)}. Book on WhatsApp or call us on ${CONTACT.phone}.`,
  },
];

/* ─── Small pieces ─────────────────────────────────────────────────────────── */

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

/** Regular price struck through, special price large, saving beside it. */
function Price({ onDark = false, size = 'lg' }) {
  const big = size === 'lg' ? 'text-[3.4rem] sm:text-[4rem]' : 'text-[2.4rem]';
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
      <p className="m-0 flex items-baseline gap-3">
        <span className="sr-only">Special price</span>
        <strong
          className={`font-['DM_Serif_Display',Georgia,serif] font-normal leading-none ${big}`}
          style={{ color: onDark ? '#ffffff' : brand.green }}
        >
          {inr(PRICE.special)}
        </strong>
        <span className="sr-only">, regular price</span>
        <del
          className="text-[1.25rem] font-medium decoration-2"
          style={{ color: onDark ? 'rgba(255,255,255,0.7)' : brand.ash }}
        >
          {inr(PRICE.regular)}
        </del>
      </p>
      <span
        className="mb-1.5 inline-flex items-center rounded-full px-3 py-1 text-[0.82rem] font-semibold"
        style={onDark
          ? { backgroundColor: brand.gold, color: brand.ink }
          : { backgroundColor: 'rgba(233,200,92,0.28)', color: '#6b511a' }}
      >
        Special price · save {inr(SAVING)}
      </span>
    </div>
  );
}

/** WhatsApp booking (primary) and a phone call (secondary). */
function BookActions({ onDark = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7 ${className}`}>
      <a
        href={BOOK_URL}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-4
                   text-[0.98rem] font-semibold no-underline transition-[background-color,transform] duration-200
                   ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={onDark
          ? { backgroundColor: brand.gold, color: brand.ink, outlineColor: brand.gold }
          : { backgroundColor: brand.green, color: '#ffffff', outlineColor: brand.green }}
      >
        <WhatsAppIcon sx={{ fontSize: 20 }} aria-hidden="true" />
        Book DMIT on WhatsApp
      </a>
      <a
        href={`tel:${CONTACT.phoneRaw}`}
        className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full py-2 text-[0.98rem]
                   font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ color: onDark ? '#ffffff' : brand.ink, outlineColor: onDark ? brand.gold : brand.green }}
      >
        <Phone size={18} aria-hidden="true" style={{ color: onDark ? brand.goldLight : brand.green }} />
        <span className="relative">
          Call {CONTACT.phone}
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 left-0 block h-px w-full origin-right scale-x-0 bg-current
                       transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100"
          />
        </span>
      </a>
    </div>
  );
}

function SectionHeading({ id, title, intro, center = false }) {
  const fadeIn = useFadeIn();
  return (
    <div className={`mb-12 md:mb-16 ${center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
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

/* ─── Sections ─────────────────────────────────────────────────────────────── */

function Hero({ ctaRef }) {
  const reducedMotion = useReducedMotion();
  const after = (delay) => (reducedMotion
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE_OUT, delay } });
  const wipe = (delay) => (reducedMotion
    ? {}
    : {
      initial: { clipPath: 'inset(100% 0% 0% 0%)' },
      animate: { clipPath: 'inset(0% 0% 0% 0%)' },
      transition: { duration: 1.1, ease: [0.77, 0, 0.175, 1], delay },
    });

  return (
    <section aria-labelledby="dmit-heading" className="px-6 pb-20 pt-32 sm:pt-36 lg:pb-28 lg:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <motion.p {...after(0)} className="mb-6 inline-flex items-center gap-2.5 text-[0.92rem] font-medium" style={{ color: brand.green }}>
            <SunGlyph className="h-4 w-4 shrink-0" />
            Manual DMIT assessment
          </motion.p>

          <RevealText
            as="h1"
            id="dmit-heading"
            text="Discover the strengths you were born with."
            trigger="mount"
            delay={0.1}
            stagger={0.05}
            className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(2.6rem,5.4vw,4.5rem)] leading-[1.04] tracking-[-0.025em]"
            style={{ color: brand.ink }}
          />

          <motion.p {...after(0.55)} className="mt-7 max-w-xl text-[1.06rem] leading-[1.7] sm:text-lg" style={{ color: brand.ash }}>
            Your fingerprints are formed before birth and never change. In our DMIT, all ten are printed
            by hand and every ridge is read by a trained analyst, not a scanner, for an accurate
            picture of how you think and learn, from age 3 to 50.
          </motion.p>

          <motion.ul {...after(0.7)} className="m-0 mt-7 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
            {['Ages 3 to 50', 'Prints taken by hand', 'One-on-one session included'].map((fact) => (
              <li key={fact} className="inline-flex items-center gap-2 text-[0.95rem] font-medium" style={{ color: brand.ink }}>
                <Check size={17} strokeWidth={2.6} aria-hidden="true" style={{ color: brand.green }} />
                {fact}
              </li>
            ))}
          </motion.ul>

          <motion.div {...after(0.85)} className="mt-10">
            <Price />
          </motion.div>

          <motion.div {...after(1)} ref={ctaRef} className="mt-8">
            <BookActions />
          </motion.div>
        </div>

        {/* Two arch windows: the ink prints themselves, and the ridges up
            close — the "manual" story in two pictures. */}
        <figure className="m-0 mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          {/* The small arch is positioned against this wrapper, not the whole
              figure, so it overlaps the large photo and never the caption. */}
          <div className="relative pb-10">
            <div className="relative ml-auto aspect-[4/5] w-[82%]">
              <span aria-hidden="true" className={`pointer-events-none absolute -inset-[9px] border ${ARCH}`} style={{ borderColor: 'rgba(233,200,92,0.75)' }} />
              <motion.div {...wipe(0.5)} className={`relative h-full w-full overflow-hidden ${ARCH}`} style={{ boxShadow: '0 30px 60px -34px rgba(15,35,23,0.55)' }}>
                <img src={inkPrints} alt="Fingerprints taken in ink on paper, beside an ink pad" className="h-full w-full object-cover" fetchpriority="high" decoding="async" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 aspect-[4/5] w-[44%]">
              <motion.div
                {...wipe(0.75)}
                className={`h-full w-full overflow-hidden border-[6px] border-white ${ARCH}`}
                style={{ boxShadow: '0 24px 44px -26px rgba(15,35,23,0.6)' }}
              >
                <img src={fingertip} alt="A fingertip up close, showing its ridges" className="h-full w-full object-cover" decoding="async" />
              </motion.div>
            </div>
          </div>
          <figcaption className="mt-5 text-right text-[0.88rem]" style={{ color: brand.ash }}>
            All ten fingers, printed in ink and read by hand.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function WhyManual() {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="why-manual-heading" className="px-6 py-24 md:py-32" style={{ backgroundColor: brand.mist }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="why-manual-heading"
          title="Why we do it by hand"
          intro="A scanner reads a fingerprint in seconds. We take the time to read it properly, and that is where the accuracy comes from."
        />
        <ul className="m-0 grid list-none gap-x-10 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => (
            <motion.li key={benefit.title} {...fadeIn(0.06 * i)} className="border-t pt-6" style={{ borderColor: 'rgba(15,35,23,0.14)' }}>
              <span aria-hidden="true" className="mb-5 block h-[3px] w-10 rounded-full" style={{ backgroundColor: brand.gold }} />
              <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.55rem] leading-[1.15]" style={{ color: brand.ink }}>
                {benefit.title}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.7]" style={{ color: brand.ash }}>{benefit.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Report() {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="report-heading" className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="report-heading"
            title="What your DMIT report reveals"
            intro="A clear picture of how you are wired, written in plain language and explained to you in person."
          />
        </div>
        <ul className="m-0 list-none border-t p-0 lg:col-span-7" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
          {REPORT_ITEMS.map((item, i) => (
            <motion.li
              key={item.title}
              {...fadeIn(0.05 * i)}
              className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-1 border-b py-6 sm:grid-cols-[auto_14rem_1fr]"
              style={{ borderColor: 'rgba(15,35,23,0.12)' }}
            >
              <span
                aria-hidden="true"
                className="row-span-2 mt-1 grid h-7 w-7 place-items-center rounded-full sm:row-span-1"
                style={{ backgroundColor: 'rgba(10,92,44,0.1)', color: brand.green }}
              >
                <Check size={15} strokeWidth={3} />
              </span>
              <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[1.35rem] leading-tight" style={{ color: brand.ink }}>
                {item.title}
              </h3>
              <p className="text-[1rem] leading-[1.65]" style={{ color: brand.ash }}>{item.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The 3–50 age range as a scale, with what DMIT answers at each stage. */
function Ages() {
  const reducedMotion = useReducedMotion();
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="ages-heading" className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="ages-heading"
          title="One assessment, from 3 to 50"
          intro="Because the prints are taken and read by hand, the test works as well for a three-year-old as for a parent. What changes is the question it answers."
        />

        <div className="relative">
          {/* The scale. Fills left to right, green into gold, as it comes into view. */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-[7px] hidden h-[3px] rounded-full md:block" style={{ backgroundColor: 'rgba(15,35,23,0.1)' }}>
            <motion.div
              className="h-full w-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${brand.green}, ${brand.teal} 55%, ${brand.gold})`, originX: 0 }}
              initial={reducedMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
            />
          </div>

          <ol className="m-0 grid list-none gap-10 p-0 md:grid-cols-4 md:gap-8">
            {AGE_BANDS.map((band, i) => (
              <motion.li key={band.range} {...fadeIn(0.15 + i * 0.12)} className="relative border-l pl-6 md:border-l-0 md:pl-0" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
                <span
                  aria-hidden="true"
                  className="absolute -left-[8px] top-1 block h-[17px] w-[17px] rounded-full border-[3px] bg-white md:left-0 md:top-0"
                  style={{ borderColor: i === AGE_BANDS.length - 1 ? brand.gold : brand.green }}
                />
                <p className="m-0 font-['DM_Serif_Display',Georgia,serif] text-[2.4rem] leading-none md:mt-9" style={{ color: brand.ink }}>
                  {band.range}
                  <span className="ml-2 font-['DM_Sans',sans-serif] text-[0.9rem]" style={{ color: brand.ash }}>years</span>
                </p>
                <h3 className="mt-3 font-['DM_Sans',sans-serif] text-[1.05rem] font-semibold" style={{ color: brand.green }}>
                  {band.who}
                </h3>
                <p className="mt-2 text-[0.98rem] leading-[1.65]" style={{ color: brand.ash }}>{band.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="steps-heading" className="px-6 py-24 md:py-32" style={{ backgroundColor: brand.mist }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="steps-heading" title="How it works" />
        <ol className="m-0 grid list-none gap-10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, i) => (
            <motion.li key={step.title} {...fadeIn(0.08 * i)}>
              <span className="block font-['DM_Serif_Display',Georgia,serif] text-[3rem] leading-none" style={{ color: brand.goldDeep }} aria-hidden="true">
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

function Pricing({ cardRef }) {
  const fadeIn = useFadeIn();
  return (
    <section aria-labelledby="pricing-heading" className="px-6 py-24 md:py-32">
      <motion.div
        {...fadeIn()}
        ref={cardRef}
        className="relative mx-auto grid max-w-6xl gap-12 overflow-hidden rounded-[2rem] px-7 py-12 sm:px-12 md:py-16 lg:grid-cols-12 lg:gap-10"
        style={{ background: FIELD_GRADIENT }}
      >
        {/* The logo's sun, faint, in the corner of the one colour block. */}
        <SunGlyph className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-[0.12]" color={brand.goldLight} />

        <div className="relative lg:col-span-7">
          <p className="mb-4 inline-flex items-center gap-2.5 text-[0.92rem] font-medium" style={{ color: brand.goldLight }}>
            <SunGlyph className="h-4 w-4 shrink-0" color={brand.goldLight} />
            Manual DMIT assessment
          </p>
          <h2 id="pricing-heading" className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] text-white">
            Book your DMIT at the special price
          </h2>
          <div className="mt-8">
            <Price onDark />
          </div>
          <BookActions onDark className="mt-9" />
        </div>

        <div className="relative lg:col-span-5">
          <h3 className="font-['DM_Sans',sans-serif] text-[1rem] font-semibold" style={{ color: brand.goldLight }}>
            What’s included
          </h3>
          <ul className="m-0 mt-5 list-none space-y-4 p-0">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[1.02rem] leading-snug" style={{ color: 'rgba(255,255,255,0.92)' }}>
                <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ backgroundColor: 'rgba(247,230,174,0.18)', color: brand.goldLight }}>
                  <Check size={14} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function Faq({ endRef }) {
  return (
    <section aria-labelledby="faq-heading" className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading id="faq-heading" title="Questions parents ask" center />
        <div className="border-t" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b" style={{ borderColor: 'rgba(15,35,23,0.12)' }}>
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden"
                style={{ outlineColor: brand.green }}
              >
                <span className="font-['DM_Serif_Display',Georgia,serif] text-[1.3rem] leading-snug" style={{ color: brand.ink }}>
                  {item.q}
                </span>
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
        <div ref={endRef} aria-hidden="true" className="h-px" />
      </div>
    </section>
  );
}

/**
 * Phone booking bar: price and the WhatsApp button, pinned to the bottom of
 * the screen once the hero's buttons have scrolled away — and out of the way
 * again while the pricing card (which has its own buttons) or the end of the
 * page is on screen, so it never sits on top of the footer.
 */
function BookingBar({ show }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 ease-out lg:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ borderColor: 'rgba(15,35,23,0.1)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      aria-hidden={!show}
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        <p className="m-0 leading-tight">
          <span className="block font-['DM_Serif_Display',Georgia,serif] text-[1.6rem]" style={{ color: brand.green }}>
            {inr(PRICE.special)}
          </span>
          <del className="text-[0.85rem]" style={{ color: brand.ash }}>{inr(PRICE.regular)}</del>
          <span className="sr-only"> regular price</span>
        </p>
        <a
          href={BOOK_URL}
          target="_blank"
          rel="noreferrer"
          tabIndex={show ? 0 : -1}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[0.95rem] font-semibold text-white no-underline active:scale-[0.97]"
          style={{ backgroundColor: brand.green }}
        >
          <WhatsAppIcon sx={{ fontSize: 19 }} aria-hidden="true" />
          Book DMIT
        </a>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function DMIT() {
  const heroCtaRef = useRef(null);
  const pricingRef = useRef(null);
  const endRef = useRef(null);
  const [showBar, setShowBar] = useState(false);

  /* Measured on scroll (once per frame) rather than with an
     IntersectionObserver: a fast fling — or a jump to the footer — can carry
     the end marker from below the screen to above it in one frame, and an
     observer never reports a crossing it did not see. Rects always tell the
     truth. */
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const hero = heroCtaRef.current?.getBoundingClientRect();
      const pricing = pricingRef.current?.getBoundingClientRect();
      const end = endRef.current?.getBoundingClientRect();
      if (!hero || !pricing || !end) return;
      const heroPassed = hero.bottom < 0;
      const pricingOnScreen = pricing.top < vh && pricing.bottom > 0;
      const endReached = end.top < vh;
      setShowBar(heroPassed && !pricingOnScreen && !endReached);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="w-full overflow-x-clip bg-white">
      <Hero ctaRef={heroCtaRef} />
      <WhyManual />
      <Report />
      <Ages />
      <Steps />
      <Pricing cardRef={pricingRef} />
      <Faq endRef={endRef} />
      <BookingBar show={showBar} />
    </div>
  );
}
