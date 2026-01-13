import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { updateBooking } from '../../backendgogame/actions/bookings';
import { sendBookingConfirmationEmail } from '../../app/api/mail/send-booking-email';

const router = Router();

// Stripe webhook endpoint (raw body is handled at app level)
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is missing');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!sig) {
    console.error('❌ Stripe signature missing');
    return res.status(400).json({ error: 'Stripe signature missing' });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });

    // req.body is already a Buffer from express.raw() middleware
    const body = req.body as Buffer;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return res.status(400).json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.error('❌ No bookingId in session metadata');
        return res.status(400).json({ error: 'No bookingId in session metadata' });
      }

      console.log('✅ Payment successful for booking:', bookingId);

      // Update booking status
      const updateResponse = await updateBooking(bookingId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        paymentDate: new Date().toISOString(),
      });

      if (!updateResponse.success) {
        console.error('❌ Failed to update booking:', updateResponse.message);
        return res.status(500).json({ error: 'Failed to update booking' });
      }

      // Send confirmation email
      try {
        const bookingData = updateResponse.data;
        if (bookingData) {
          await sendBookingConfirmationEmail(bookingData);
          console.log('✅ Confirmation email sent');
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }

      return res.json({ received: true, bookingId });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

