/**
 * Order emails, sent through Resend once a payment is confirmed.
 *
 * - The shop owner (EMAIL_USER) always gets a "new paid order" email with the
 *   delivery address, so nothing waits on someone checking the admin panel.
 * - The customer gets a receipt only when ORDER_EMAIL_FROM is set. Resend only
 *   delivers to arbitrary addresses from a verified domain; the default
 *   onboarding sender can reach the account owner and no one else.
 *
 * Email is best-effort: a failure is logged and never affects the order.
 */

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('re_123') || key.includes('placeholder')) return null;
  const { Resend } = require('resend');
  return new Resend(key);
};

const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatAddress = (address = {}) =>
  [address.line1, address.line2, address.city, address.state && `${address.state} ${address.pincode || ''}`.trim()]
    .filter(Boolean)
    .map(escapeHtml)
    .join('<br>');

const itemsTable = (order) => `
  <table cellpadding="6" style="border-collapse:collapse;width:100%;max-width:520px">
    ${order.items.map((i) => `
      <tr style="border-bottom:1px solid #eee">
        <td>${escapeHtml(i.title)}</td>
        <td align="center">× ${i.quantity}</td>
        <td align="right">${rupees(i.price * i.quantity)}</td>
      </tr>`).join('')}
    ${order.shipping ? `<tr><td colspan="2">Shipping</td><td align="right">${rupees(order.shipping)}</td></tr>` : ''}
    <tr><td colspan="2"><b>Total paid</b></td><td align="right"><b>${rupees(order.total)}</b></td></tr>
  </table>`;

async function sendOrderEmails(order) {
  const resend = getResend();
  if (!resend) return;

  const c = order.customer || {};

  if (process.env.EMAIL_USER) {
    try {
      await resend.emails.send({
        from: process.env.ORDER_EMAIL_FROM || 'Paavan Setu <onboarding@resend.dev>',
        to: process.env.EMAIL_USER,
        subject: `New paid order ${order.orderNumber} — ${rupees(order.total)}`,
        html: `
          <h2>New paid order ${escapeHtml(order.orderNumber)}</h2>
          <p><b>Customer:</b> ${escapeHtml(c.name)}<br>
             <b>Phone:</b> ${escapeHtml(c.phone)}<br>
             <b>Email:</b> ${escapeHtml(c.email || '—')}</p>
          <p><b>Deliver to:</b><br>${formatAddress(c.address) || '—'}</p>
          ${itemsTable(order)}
          <p style="color:#666">Razorpay payment: ${escapeHtml(order.payment?.razorpayPaymentId || '')}
             ${order.payment?.method ? ` (${escapeHtml(order.payment.method)})` : ''}</p>
        `,
      });
    } catch (err) {
      console.error('Order email (owner) failed:', order.orderNumber, err.message);
    }
  }

  if (c.email && process.env.ORDER_EMAIL_FROM) {
    try {
      await resend.emails.send({
        from: process.env.ORDER_EMAIL_FROM,
        to: c.email,
        subject: `Your Paavan Setu order ${order.orderNumber} is confirmed`,
        html: `
          <p>Hi ${escapeHtml(c.name)},</p>
          <p>Thank you for your order! We've received your payment and will ship your books soon.</p>
          <p><b>Order number:</b> ${escapeHtml(order.orderNumber)}</p>
          ${itemsTable(order)}
          <p><b>Delivering to:</b><br>${formatAddress(c.address)}</p>
          <p>Questions? Just reply to this email or message us on WhatsApp.</p>
          <p>Warm regards,<br>Team Paavan Setu</p>
        `,
      });
    } catch (err) {
      console.error('Order email (customer) failed:', order.orderNumber, err.message);
    }
  }
}

module.exports = { sendOrderEmails };
