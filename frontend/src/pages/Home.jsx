import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useContent';
import { getTestimonials, logApiFailure } from '../lib/api';
import HomeHero from '../components/ui/HomeHero';
import HomeStory from '../components/ui/HomeStory';
import HomeMarquee from '../components/ui/HomeMarquee';
import HomeTestimonials from '../components/ui/HomeTestimonials';
import HomeCta from '../components/ui/HomeCta';

/**
 * Homepage.
 *
 * Composition and data only — each section owns its markup and motion. The
 * page opens on the hero, then tells the practice's story as the visitor
 * scrolls (what we do → DMIT → psychometric tests → books → why us), then
 * one band of colour, testimonials and a closing call to action. The hero,
 * the "why us" chapter, testimonials and the closing CTA read Admin →
 * Settings (with the bundled defaults below as fallback); the offering
 * chapters' copy lives in HomeStory beside the routes it links to.
 */

/* ─── DEFAULT FALLBACK CONTENT ───────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  'hero.badge': 'Bridging Values with Education',
  'hero.title.line1': 'Building Character Through',
  'hero.title.line2': 'Education',
  // Words the highlighted line cycles through after `hero.title.line2`.
  'hero.rotatingWords': JSON.stringify(['Guidance', 'Values', 'Clarity']),
  'hero.description':
    'Nurturing minds and building character across generations. We combine academic excellence with value-based learning to create well-rounded individuals ready for a meaningful future.',
  'hero.ctaPrimary': 'Explore Programs',
  'hero.ctaPrimaryLink': '/schools-workshops',
  'hero.ctaSecondary': 'Contact via WhatsApp',
  'homepage.whyTitle': 'Why Choose Paavan Setu for your future?',
  'homepage.whyDescription':
    'At Paavan Setu, we believe that true education goes beyond textbooks. We combine academic excellence with value-based learning to create well-rounded individuals ready to make a positive impact on society.',
  'homepage.achievements': JSON.stringify([
    '2000+ Students Guided',
    '20+ Partner Schools',
    '10 Published Books',
    '98% Satisfaction Rate',
  ]),
  'homepage.testimonials': JSON.stringify([
    { name: 'Riya Sharma', role: 'Student', text: 'The counselling session changed my perspective completely.' },
    { name: 'Anil Mehta', role: 'Parent', text: 'Paavan SETU helped my son discover his passion for design.' },
    { name: 'Priya Patel', role: 'Teacher', text: 'The school workshop was engaging, practical and truly impactful.' },
    { name: 'Raj Kumar', role: 'Student', text: 'Amazing psychometric tools.' },
    { name: 'Sneha Gupta', role: 'Parent', text: 'Highly recommend their value education books.' },
  ]),
  'testimonials.title': 'Trusted by Parents & Students',
  'cta.title': 'Ready to Begin?',
  'cta.description':
    'Book a personalised career counselling session today and take the first step towards a meaningful, confident future.',
  'cta.button': 'Book a Session',
  'cta.buttonLink': '/contact',
};

const FALLBACKS = {
  rotatingWords: JSON.parse(DEFAULT_SETTINGS['hero.rotatingWords']),
  testimonials: JSON.parse(DEFAULT_SETTINGS['homepage.testimonials']),
  achievements: JSON.parse(DEFAULT_SETTINGS['homepage.achievements']),
};

function parseJson(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) || (parsed && typeof parsed === 'object') ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/* ─── HOME COMPONENT ──────────────────────────────────────────────────────── */
export default function Home() {
  const { get } = useSettings(DEFAULT_SETTINGS);
  const [dynamicTestimonials, setDynamicTestimonials] = useState([]);

  useEffect(() => {
    getTestimonials()
      .then((data) => {
        const testims = Array.isArray(data) ? data : data?.data ?? [];
        setDynamicTestimonials(testims.filter((t) => t.isActive));
      })
      // Bundled testimonials cover this case, so it is a degradation, not a fault.
      .catch((err) => logApiFailure('load testimonials', err));
  }, []);

  const rotatingWords = parseJson(get('hero.rotatingWords'), FALLBACKS.rotatingWords);
  const staticTestimonials = parseJson(get('homepage.testimonials'), FALLBACKS.testimonials);
  const achievements = parseJson(get('homepage.achievements'), FALLBACKS.achievements);

  const displayTestimonials =
    dynamicTestimonials.length > 0 ? dynamicTestimonials : staticTestimonials;

  return (
    // overflow-x-clip, not -hidden: `hidden` makes this div a scroll container,
    // and the story's pinned stage (position: sticky) would stick to it
    // instead of the viewport — i.e. never pin at all.
    <div className="w-full max-w-full overflow-x-clip bg-white">
      <HomeHero
        get={get}
        rotatingWords={Array.isArray(rotatingWords) ? rotatingWords.map(String) : []}
      />

      <HomeStory
        whyTitle={get('homepage.whyTitle')}
        whyDescription={get('homepage.whyDescription')}
        achievements={Array.isArray(achievements) ? achievements : FALLBACKS.achievements}
      />

      <HomeMarquee />

      <HomeTestimonials title={get('testimonials.title')} testimonials={displayTestimonials} />

      <HomeCta
        title={get('cta.title')}
        description={get('cta.description')}
        ctaLabel={get('cta.button')}
        ctaLink={get('cta.buttonLink')}
        whatsappLabel={get('hero.ctaSecondary')}
      />
    </div>
  );
}
