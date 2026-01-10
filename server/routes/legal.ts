import { Router, Request, Response } from 'express';
import { getSettings } from '../../backendgogame/actions/settings';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// GET /api/legal-pages
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await getSettings();
    const legalPages = {
      privacy: response.data?.legalPages?.privacy || { en: '', es: '' },
      cookie: response.data?.legalPages?.cookie || { en: '', es: '' },
      terms: response.data?.legalPages?.terms || { en: '', es: '' }
    };
    res.json({ success: true, data: legalPages });
  } catch (error) {
    console.error('Get legal pages error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch legal pages')
    });
  }
});

export default router;

