import { Router, Request, Response } from 'express';
import { readStore } from '../../backendgogame/lib/jsonStore';

const router = Router();

// GET /api/test-redis - Test Redis connection and data retrieval
router.get('/', async (req: Request, res: Response) => {
  try {
    const testFiles = [
      'packages.json',
      'faqs.json',
      'testimonials.json',
      'bookings.json',
      'about.json',
      'dates.json',
      'startingPrices.json',
      'legalPages.json',
      'socialContact.json',
      'admins.json',
      'sessions.json'
    ];

    const results: Record<string, any> = {
      redisConfigured: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
      redisUrl: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing',
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing',
      files: {} as Record<string, any>
    };

    for (const fileName of testFiles) {
      try {
        const data = await readStore(fileName);
        results.files[fileName] = {
          found: true,
          hasData: data ? Object.keys(data).length > 0 : false,
          keys: data ? Object.keys(data) : []
        };
      } catch (error) {
        results.files[fileName] = {
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    res.json({
      success: true,
      message: 'Redis test completed',
      results
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Redis test failed'
    });
  }
});

export default router;

