import React from 'react';
import { Marquee } from './Marquee';
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

/**
 * The page's one block of colour: a slow band of the practice's vocabulary in
 * large italic type on brand green, with the logo's sun between terms.
 *
 * Decorative and aria-hidden — every term is a service the list above already
 * names in full. Marquee stops under reduced motion.
 */
export default function HomeMarquee() {
  return (
    <div aria-hidden="true" className="overflow-hidden py-7 md:py-9" style={{ backgroundColor: brand.green }}>
      <Marquee repeat={3} className="[--duration:55s] [--gap:3rem] md:[--gap:4.5rem]">
        {TERMS.map((term) => (
          <span
            key={term}
            className="flex items-center gap-12 whitespace-nowrap font-['DM_Serif_Display',Georgia,serif] italic
                       text-[clamp(2rem,4.6vw,4rem)] leading-none md:gap-[4.5rem]"
            style={{ color: brand.ivory }}
          >
            {term}
            <SunGlyph className="h-7 w-7 shrink-0 md:h-9 md:w-9" color={brand.gold} />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
