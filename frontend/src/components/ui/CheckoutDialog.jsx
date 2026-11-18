import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Box, Typography, IconButton, MenuItem
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';

import { startCheckout } from '../../lib/razorpay';
import { colors as T } from '../../constants/tokens';

/* ─── CHECKOUT DIALOG ─────────────────────────────────────────────────────── */
/* Collects who is buying and where the books go, then hands over to Razorpay.
   The server re-validates every field and recalculates the price, so this form
   is for the customer's convenience, not for trust. */

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const MAX_QTY = 10;
const SAVED_KEY = 'ps.checkout.details';

const EMPTY = {
  name: '', phone: '', email: '',
  line1: '', line2: '', city: '', state: 'Gujarat', pincode: '',
};

/* Returning customers should not retype their address. Per-browser only, and
   storage can be unavailable (private mode), so every access is guarded. */
function loadSaved() {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
function saveDetails(form) {
  try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(form)); } catch { /* ignore */ }
}

const digits = (v) => v.replace(/\D/g, '');

export default function CheckoutDialog({ book, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [quantity, setQuantity] = useState(1);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  // Fresh state each time a book is opened, prefilled from the last order.
  useEffect(() => {
    if (book) {
      setForm(loadSaved());
      setQuantity(1);
      setTouched({});
      setStatus({ state: 'idle', message: '' });
    }
  }, [book]);

  if (!book) return null;

  const busy = status.state === 'paying';
  const done = status.state === 'done';
  const total = book.price * quantity;

  const phone = digits(form.phone).slice(-10);
  const errors = {
    name: form.name.trim().length < 2 ? 'Enter your full name' : '',
    phone: /^[6-9]\d{9}$/.test(phone) ? '' : '10-digit Indian mobile number',
    email: form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Check the email address' : '',
    line1: form.line1.trim() ? '' : 'House / flat and street',
    city: form.city.trim() ? '' : 'Enter your city',
    state: form.state ? '' : 'Choose your state',
    pincode: /^[1-9]\d{5}$/.test(digits(form.pincode)) ? '' : '6-digit PIN code',
  };
  const valid = Object.values(errors).every((e) => !e);

  function field(name, extra = {}) {
    const showError = touched[name] && Boolean(errors[name]);
    return {
      value: form[name],
      onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
      error: showError,
      helperText: showError ? errors[name] : extra.helperText,
      disabled: busy,
      fullWidth: true,
      size: 'small',
    };
  }

  function pay() {
    if (!valid) {
      // Reveal every message at once rather than leaving the button inert.
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
      return;
    }

    saveDetails(form);
    setStatus({ state: 'paying', message: '' });
    startCheckout({
      items: [{ bookId: book.id, quantity }],
      customer: {
        name: form.name.trim(),
        phone,
        email: form.email.trim(),
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state,
          pincode: digits(form.pincode),
        },
      },
      onSuccess: (order) => {
        setStatus({ state: 'done', message: order.orderNumber });
      },
      onError: (message) => {
        setStatus({ state: 'error', message });
      },
      onDismiss: () => {
        setStatus({ state: 'idle', message: '' });
      },
    });
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ fontFamily: "'DM Serif Display',Georgia,serif", fontWeight: 600, pb: 0.5 }}>
        {done ? 'Thank you for your order!' : 'Checkout'}
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important' }}>
        {done ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment received. Your order number is <b>{status.message}</b>.
            </Alert>
            <Typography sx={{ color: T.ash, fontSize: '0.95rem', lineHeight: 1.7 }}>
              We&rsquo;ll pack <b>{quantity} × {book.title}</b> and ship it to {form.city}.
              We&rsquo;ll contact you on {phone} with delivery updates. Please keep your order number
              handy if you need to reach us.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Order summary */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1.5, mb: 2.5, borderRadius: 3, bgcolor: book.accentBg || '#f5f5f0' }}>
              {book.image && (
                <Box component="img" src={book.image} alt="" sx={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0 }} />
              )}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }}>{book.title}</Typography>
                <Typography sx={{ color: T.ash, fontSize: '0.85rem' }}>₹{book.price} each</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', borderRadius: 50, border: '1px solid rgba(0,0,0,0.1)' }}>
                <IconButton size="small" aria-label="Decrease quantity" disabled={busy || quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography aria-live="polite" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                <IconButton size="small" aria-label="Increase quantity" disabled={busy || quantity >= MAX_QTY} onClick={() => setQuantity((q) => q + 1)}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {status.state === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>{status.message}</Alert>
            )}

            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.ash, mb: 1.25 }}>
              Your details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75, mb: 2.5 }}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField {...field('name')} label="Full name" required autoComplete="name" autoFocus />
              </Box>
              <TextField {...field('phone')} label="Mobile number" required autoComplete="tel" inputProps={{ inputMode: 'tel' }} />
              <TextField {...field('email', { helperText: 'For your receipt (optional)' })} label="Email" type="email" autoComplete="email" />
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.ash, mb: 1.25 }}>
              Delivery address
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField {...field('line1')} label="House / flat no., building, street" required autoComplete="address-line1" />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField {...field('line2')} label="Area, landmark (optional)" autoComplete="address-line2" />
              </Box>
              <TextField {...field('city')} label="City" required autoComplete="address-level2" />
              <TextField {...field('pincode')} label="PIN code" required autoComplete="postal-code" inputProps={{ inputMode: 'numeric', maxLength: 6 }} />
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField {...field('state')} select label="State" required autoComplete="address-level1">
                  {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 3, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
              <Typography sx={{ color: T.ash }}>Total{quantity > 1 ? ` (${quantity} books)` : ''}</Typography>
              <Typography sx={{ fontFamily: "'DM Serif Display',Georgia,serif", fontWeight: 700, fontSize: '1.6rem', ml: 'auto' }}>
                ₹{total.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: T.ash, fontSize: '0.78rem', mt: 0.5 }}>
              <LockIcon sx={{ fontSize: 14 }} /> Secure payment by Razorpay: UPI, cards, net banking and wallets
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {done ? (
          <Button onClick={onClose} variant="contained"
            sx={{ bgcolor: T.green, borderRadius: 50, px: 3, '&:hover': { bgcolor: T.blue } }}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={busy} sx={{ color: T.ash }}>Cancel</Button>
            <motion.div whileHover={!busy ? { scale: 1.04 } : {}} whileTap={!busy ? { scale: 0.96 } : {}}>
              <Button
                onClick={pay}
                disabled={busy}
                variant="contained"
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />}
                sx={{
                  bgcolor: T.green,
                  borderRadius: 50,
                  px: { xs: 2.5, sm: 4 },
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 10px 25px rgba(10, 79, 34, 0.3)',
                  transition: 'background-color 0.3s ease',
                  '&:hover': { bgcolor: T.blue, boxShadow: '0 15px 35px rgba(23, 74, 114, 0.4)' }
                }}
              >
                {busy ? 'Opening payment…' : `Pay ₹${total.toLocaleString('en-IN')}`}
              </Button>
            </motion.div>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
