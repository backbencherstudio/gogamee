import { Router, Request, Response } from 'express';
import { createStripeCheckoutSession } from '../../backendgogame/actions/bookings';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// POST /api/payment/stripe
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const response = await createStripeCheckoutSession(req.body);
    res.json(response);
  } catch (error) {
    console.error('Create Stripe session error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to create payment session')
    });
  }
});

export default router;

