import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { brand } from '../../constants/brand';
import HomeActions from './HomeActions';
import { RevealText, EASE_OUT } from './TextMotion';

/**
 * Closing call to action. The largest type on the page, rising letter by
 * letter as it scrolls in, then one line of copy and the same pair of actions
 * as the hero — the page ends where it began.
 */
export default function HomeCta({ title, description, ctaLabel, ctaLink, whatsappLabel }) {
  const reducedMotion = useReducedMotion();
  const fadeIn = (delay) => (reducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 14 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '0px 0px -10% 0px' },
      transition: { duration: 0.8, ease: EASE_OUT, delay },
    });

  return (
    <section aria-labelledby="cta-heading" className="bg-white px-6 py-32 md:py-44">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <RevealText
          as="h2"
          id="cta-heading"
          text={title || 'Ready to Begin?'}
          by="char"
          stagger={0.025}
          className="font-['DM_Serif_Display',Georgia,serif] text-[clamp(3rem,9vw,7.5rem)] leading-[0.98]
                     tracking-[-0.03em]"
          style={{ color: brand.ink }}
        />

        {description && (
          <motion.p
            {...fadeIn(0.35)}
            className="mx-auto mt-8 max-w-xl text-[1.05rem] leading-[1.75] sm:text-lg"
            style={{ color: brand.ash }}
          >
            {description}
          </motion.p>
        )}

        <motion.div {...fadeIn(0.5)} className="mt-10 w-full sm:w-auto">
          <HomeActions primaryLabel={ctaLabel} primaryTo={ctaLink} whatsappLabel={whatsappLabel} />
        </motion.div>
      </div>
    </section>
  );
}
