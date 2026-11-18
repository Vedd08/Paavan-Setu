const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Book = require('../models/Book');
const mongoose = require('mongoose');
const { safeRegex, paginate } = require('../utils/query');
const { sendOrderEmails } = require('../utils/orderEmails');

// Initialize Razorpay (lazily)
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

const clean = (value, max = 200) => String(value == null ? '' : value).trim().slice(0, max);

/**
 * Validates the checkout form and returns only the fields an order stores, so
 * a crafted request cannot write anything else onto the order.
 */
function readCustomer(input = {}) {
  const address = input.address || {};
  const customer = {
    name: clean(input.name, 100),
    phone: clean(input.phone, 20).replace(/\D/g, '').slice(-10),
    email: clean(input.email, 150).toLowerCase(),
    address: {
      line1: clean(address.line1),
      line2: clean(address.line2),
      city: clean(address.city, 100),
      state: clean(address.state, 100),
      pincode: clean(address.pincode, 10).replace(/\D/g, ''),
    },
  };

  if (customer.name.length < 2) return { error: 'Please enter your full name' };
  if (!/^[6-9]\d{9}$/.test(customer.phone)) return { error: 'Please enter a valid 10-digit mobile number' };
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return { error: 'Please enter a valid email address' };
  }
  if (!customer.address.line1 || !customer.address.city || !customer.address.state) {
    return { error: 'Please enter your full delivery address' };
  }
  if (!/^[1-9]\d{5}$/.test(customer.address.pincode)) return { error: 'Please enter a valid 6-digit PIN code' };

  return { customer };
}

/**
 * Marks an order paid exactly once, whichever arrives first: the browser's
 * verify call or Razorpay's webhook. The `status: { $ne: 'paid' }` guard makes
 * the claim atomic, so stock is decremented and the owner emailed only once.
 */
async function markOrderPaid(razorpayOrderId, { paymentId, signature, method } = {}) {
  const set = {
    status: 'paid',
    'payment.razorpayPaymentId': paymentId,
    'payment.verified': true,
    'payment.paidAt': new Date(),
  };
  if (signature) set['payment.razorpaySignature'] = signature;
  if (method) set['payment.method'] = method;

  const order = await Order.findOneAndUpdate(
    // Only an unpaid order moves to paid. 'failed' is included because a
    // customer can retry in the same Razorpay window after a declined card;
    // a refunded or cancelled order is never revived by a replayed signature.
    { 'payment.razorpayOrderId': razorpayOrderId, status: { $in: ['pending', 'failed'] } },
    { $set: set },
    { new: true }
  );

  if (!order) {
    const existing = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
    return { order: existing, alreadyPaid: Boolean(existing) };
  }

  // Failures here must not fail the payment — the money has already moved, and
  // stock can be corrected in the admin panel.
  try {
    await Promise.all(
      order.items.map((item) =>
        Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity } })
      )
    );
  } catch (stockError) {
    console.error('Stock update failed for order', order.orderNumber, stockError);
  }

  sendOrderEmails(order); // fire-and-forget; logs its own failures

  return { order, alreadyPaid: false };
}

/**
 * If the Razorpay account has automatic capture turned off, a successful
 * checkout only *authorises* the payment, and Razorpay refunds it after a few
 * days unless it is captured. Capturing here makes the shop independent of
 * that dashboard setting. Returns the payment method for the order record.
 */
async function capturePaymentIfNeeded(paymentId) {
  const instance = getRazorpay();
  if (!instance || !paymentId) return null;
  try {
    const payment = await instance.payments.fetch(paymentId);
    if (payment.status === 'authorized') {
      await instance.payments.capture(paymentId, payment.amount, payment.currency);
    }
    return payment.method || null;
  } catch (err) {
    console.error('Razorpay payment fetch/capture failed:', paymentId, err?.error?.description || err.message);
    return null;
  }
}

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/create-order - Create Razorpay order
exports.createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'No items provided',
      });
    }

    const { customer, error: customerError } = readCustomer(req.body.customer);
    if (customerError) {
      return res.status(400).json({ success: false, message: customerError });
    }

    if (items.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Too many items in one order. Please split it or contact us.',
      });
    }

    // Validate and calculate amount from server-side data
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // An invalid id would otherwise surface as a CastError 500 rather than a
      // clear 400 the checkout can show.
      if (!mongoose.isValidObjectId(item.bookId)) {
        return res.status(400).json({ success: false, message: 'Invalid book reference' });
      }

      const book = await Book.findById(item.bookId);
      if (!book || !book.isPublished) {
        return res.status(400).json({
          success: false,
          message: `Book ${item.bookId} not found or unavailable`,
        });
      }

      // Quantity comes from the client, so clamp it: a negative value would
      // subtract from the total, and a fractional one would produce a price
      // Razorpay rejects.
      const quantity = Math.floor(Number(item.quantity) || 1);
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({
          success: false,
          message: `Quantity for "${book.title}" must be between 1 and 50`,
        });
      }

      if (book.stock < quantity) {
        return res.status(409).json({
          success: false,
          message: book.stock > 0
            ? `Only ${book.stock} copies of "${book.title}" are left.`
            : `"${book.title}" is out of stock.`,
        });
      }

      const price = book.salePrice || book.price;
      subtotal += price * quantity;

      orderItems.push({
        book: book._id,
        title: book.title,
        price,
        quantity,
      });
    }

    // Minimum amount check (100 paise = ₹1)
    if (subtotal < 1) {
      return res.status(400).json({
        success: false,
        message: 'Order total must be at least ₹1',
      });
    }

    const total = subtotal; // Add shipping logic here if needed

    // Create Razorpay order
    const razorpayInstance = getRazorpay();
    if (!razorpayInstance) {
      console.error('Checkout blocked: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set');
      return res.status(503).json({
        success: false,
        message: 'Online payment is not available right now. Please order on WhatsApp and we will help you.',
      });
    }

    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(total * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email || '',
          items: orderItems.map((i) => `${i.title} x${i.quantity}`).join(', ').slice(0, 250),
        },
      });
    } catch (gatewayError) {
      // The Razorpay SDK rejects with { statusCode, error: { description } }
      // rather than an Error — most often wrong or mismatched keys.
      console.error('Razorpay order creation failed:', gatewayError?.statusCode, gatewayError?.error?.description || gatewayError?.message);
      return res.status(502).json({
        success: false,
        message: 'Could not reach the payment gateway. Please try again in a moment.',
      });
    }

    // Create order in database
    const order = await Order.create({
      customer,
      items: orderItems,
      subtotal,
      total,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        currency: 'INR',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

// POST /api/verify-payment - Verify Razorpay payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('verify-payment: RAZORPAY_KEY_SECRET is not set');
      return res.status(503).json({
        success: false,
        message: 'We could not confirm your payment right now. If money was debited, contact us and we will sort it out.',
      });
    }

    // Verify signature using HMAC-SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // timingSafeEqual needs equal-length buffers; both are hex digests of the
    // same algorithm, so a length mismatch already means "not authentic".
    const expected = Buffer.from(expectedSignature, 'utf8');
    const received = Buffer.from(String(razorpay_signature), 'utf8');
    const isAuthentic =
      expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const method = await capturePaymentIfNeeded(razorpay_payment_id);

    // A replay (Razorpay retry, double-submit, refreshed tab, or the webhook
    // having got there first) still reports success, so the customer is never
    // told a completed payment failed.
    const { order, alreadyPaid } = await markOrderPaid(razorpay_order_id, {
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      method,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (alreadyPaid) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: { orderNumber: order.orderNumber, status: order.status },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

// POST /api/payment/fallback - Handle payment failure/cancellation
exports.handlePaymentFailure = async (req, res, next) => {
  try {
    const { razorpay_order_id, error } = req.body;

    if (razorpay_order_id) {
      // This endpoint is public (the browser reports the failure), so it must
      // only ever move an order *forward* from pending. Without the status
      // guard anyone who learned an order id could flip a completed, paid order
      // to "failed".
      await Order.findOneAndUpdate(
        {
          'payment.razorpayOrderId': razorpay_order_id,
          status: 'pending',
        },
        {
          $set: {
            status: 'failed',
            notes: `Payment failed: ${String(error?.description || 'Unknown error').slice(0, 500)}`,
          },
        }
      );
    }

    // Always a plain acknowledgement: this is best-effort telemetry, and
    // revealing whether an order id exists would let it be probed.
    res.json({
      success: true,
      message: 'Payment failure recorded',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/webhook - Razorpay server-to-server events
//
// The safety net for the browser flow: if the customer pays and then closes
// the tab, loses signal, or the verify call fails, the order is still marked
// paid here. Configure in Razorpay Dashboard → Settings → Webhooks with the
// events payment.authorized, payment.captured, order.paid and payment.failed,
// and the same secret as RAZORPAY_WEBHOOK_SECRET.
exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set');
    return res.status(503).json({ success: false });
  }

  // The signature covers the exact bytes Razorpay sent, so verify against the
  // raw body captured by the JSON parser, not a re-serialised object.
  const signature = String(req.headers['x-razorpay-signature'] || '');
  const expected = crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  try {
    const { event, payload } = req.body || {};
    const payment = payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id || payload?.order?.entity?.id;

    if (razorpayOrderId) {
      if (event === 'payment.authorized') {
        await capturePaymentIfNeeded(payment.id);
        await markOrderPaid(razorpayOrderId, { paymentId: payment.id, method: payment.method });
      } else if (event === 'payment.captured' || event === 'order.paid') {
        await markOrderPaid(razorpayOrderId, { paymentId: payment?.id, method: payment?.method });
      } else if (event === 'payment.failed') {
        await Order.findOneAndUpdate(
          { 'payment.razorpayOrderId': razorpayOrderId, status: 'pending' },
          { $set: { status: 'failed', notes: `Payment failed: ${clean(payment?.error_description || 'Unknown error', 500)}` } }
        );
      }
    }
  } catch (err) {
    // A 5xx makes Razorpay retry later, which is what we want for a transient
    // database problem.
    console.error('Razorpay webhook processing failed:', err);
    return res.status(500).json({ success: false });
  }

  res.json({ success: true });
};

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/admin/orders - Admin: Get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;
    const { page, limit, skip } = paginate(req.query);

    const query = {};
    if (status) query.status = status;
    if (search) {
      // Escaped: the raw value used to be compiled as a regex pattern.
      const term = safeRegex(search);
      query.$or = [
        { orderNumber: term },
        { 'customer.name': term },
        { 'customer.email': term },
        { 'customer.phone': term },
      ];
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('items.book', 'title coverImage'),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders/:id - Admin: Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title coverImage price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status - Admin: Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders/stats - Admin: Order statistics
exports.getOrderStats = async (req, res, next) => {
  try {
    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const PAID = { $in: ['paid', 'completed'] };

    // Run the counts concurrently — they were awaited one after another, so the
    // dashboard paid eight sequential round-trips before rendering.
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      failedOrders,
      recentOrders,
      recentRevenue,
      totalBooks,
      publishedBooks,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: PAID } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'failed' }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([
        { $match: { status: PAID, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      // The dashboard reads `totalBooks`, which this endpoint never returned —
      // that card sat empty regardless of the catalogue size.
      Book.countDocuments(),
      Book.countDocuments({ isPublished: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        failedOrders,
        recentOrders,
        recentRevenue: recentRevenue[0]?.total || 0,
        totalBooks,
        publishedBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/admin/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
