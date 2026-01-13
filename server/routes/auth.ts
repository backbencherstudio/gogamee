import { Router, Request, Response } from 'express';
import { login } from '../../backendgogame/actions/auth';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Create request context for login
    const requestContext = {
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || (req.headers['x-real-ip'] as string) || null,
      userAgent: req.headers['user-agent'] || null,
    };
    
    // Call login function
    const response = await login(req.body, requestContext);
    
    // Set cookie if session token exists
    if (response.sessionToken) {
      res.cookie('gogame_admin_session', response.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: toErrorMessage(error, 'Login failed')
    });
  }
});

export default router;

