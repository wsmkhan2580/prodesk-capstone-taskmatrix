const express = require('express');
const Stripe = require('stripe');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payments/create-checkout-session
// @desc    Create a Stripe Checkout session for the "Upgrade to Pro" flow
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TaskMatrix Pro — Upgrade',
              description: 'Unlock unlimited tasks and priority support',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/upgrade`,
      metadata: {
        userId: req.user.id,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Stripe error', error: err.message });
  }
});

// @route   GET /api/payments/verify-session/:sessionId
// @desc    Confirm a Stripe session was paid, then mark the user as Pro
router.get('/verify-session/:sessionId', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    if (session.metadata.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isPro: true, subscribedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Subscription activated', isPro: user.isPro });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
