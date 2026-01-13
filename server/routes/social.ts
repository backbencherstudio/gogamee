import { Router, Request, Response } from 'express';
import { getSettings } from '../../backendgogame/actions/settings';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// GET /api/social-contact
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await getSettings();
    const socialContact = response.data?.socialContact || {
      whatsapp: '',
      instagram: '',
      tiktok: '',
      linkedin: '',
      email: ''
    };
    res.json({ success: true, data: socialContact });
  } catch (error) {
    console.error('Get social contact error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch social contact')
    });
  }
});

export default router;

