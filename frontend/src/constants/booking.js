/**
 * Booking links for the two bookable offerings — DMIT and the psychometric
 * tests. Booking happens on those two pages only (there is no booking button
 * in the navbar), and every button on them reads its link from here.
 */
import { WHATSAPP_NUMBER } from './urls';

const whatsapp = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/** ₹4000 → "₹4,000" */
export const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

/* ─── DMIT ─────────────────────────────────────────────────────────────────
   The one place to change the price. The DMIT page (hero, pricing card,
   phone booking bar) and its WhatsApp message read from here. */
export const DMIT_PRICE = { regular: 5000, special: 4000 };
export const DMIT_SAVING = DMIT_PRICE.regular - DMIT_PRICE.special;
export const DMIT_BOOK_URL = whatsapp(
  `Hi, I would like to book a manual DMIT assessment at the special price of ${inr(DMIT_PRICE.special)}. Please share the available slots.`,
);

/* ─── Psychometric tests ───────────────────────────────────────────────────
   A coupon is what unlocks a test, so "booking" one means asking for it. */
export const TEST_COUPON_URL = whatsapp(
  'Hi, I would like a coupon code to take a psychometric test on your website.',
);
