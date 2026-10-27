import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { brand } from '../../constants/brand';
import { WHATSAPP_NUMBER } from '../../constants/urls';

/**
 * The homepage's one pair of actions: a filled green button and a WhatsApp
 * text link. Shared by the hero and the closing call to action so the two
 * never drift apart in size, colour or wording. White on green measures 7.8:1.
 */
export default function HomeActions({ primaryLabel, primaryTo, whatsappLabel, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-5 sm:flex-row sm:gap-8 ${className}`}>
      <Link
        to={primaryTo || '/contact'}
        className="group inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full
                   px-8 py-4 text-[0.98rem] font-semibold text-white no-underline sm:w-auto
                   transition-[background-color,transform] duration-200 ease-out
                   hover:bg-[#08481f] active:scale-[0.97]
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ backgroundColor: brand.green, outlineColor: brand.green }}
      >
        {primaryLabel}
        <ArrowRight size={17} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </Link>

      {whatsappLabel && (
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-full py-2 text-[0.98rem]
                     font-semibold no-underline
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: brand.ink, outlineColor: brand.green }}
        >
          <WhatsAppIcon sx={{ fontSize: 20 }} style={{ color: brand.green }} aria-hidden="true" />
          <span className="relative">
            {whatsappLabel}
            {/* Wipes in from the left, out to the right: the hover has a direction. */}
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 left-0 block h-px w-full origin-right scale-x-0 bg-current
                         transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100"
            />
          </span>
        </a>
      )}
    </div>
  );
}
