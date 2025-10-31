import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2022-11-15',
});

const router = express.Router();

// Enable CORS so frontend can call this API
router.use(cors({ origin: 'https://book-trading-club-delta.vercel.app' }));

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }

    // Filter out donated books (price 0) because Stripe cannot handle 0 amount
    const payableItems = products.filter(
      (product) => product.book.Exchange !== 'Donate'
    );

    if (payableItems.length === 0) {
      return res.status(400).json({
        error: 'Cart contains only donated items. Nothing to pay for.',
      });
    }

    const lineItems = payableItems.map((product) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.book.title,
          images: product.book.imageUrl ? [product.book.imageUrl] : [],
        },
        unit_amount: product.book.price * 100, // Stripe expects amount in cents
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url:
        'https://book-trading-club-delta.vercel.app/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url:
        'https://book-trading-club-delta.vercel.app/dashboard/payment-failure',
    });

    // Return the URL so frontend can redirect directly
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error.message || error);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
});

export default router;
