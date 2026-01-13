import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Raw body for Stripe webhooks (must be before json middleware)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running', port: PORT });
});

// Import route handlers
import packageRoutes from './routes/package';
import faqRoutes from './routes/faq';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import testimonialRoutes from './routes/testimonial';
import mailRoutes from './routes/mail';
import webhookRoutes from './routes/webhook';
import uploadRoutes from './routes/upload';
import legalRoutes from './routes/legal';
import socialRoutes from './routes/social';
import userRoutes from './routes/user';
import translateRoutes from './routes/translate';
import paymentRoutes from './routes/payment';
import testRedisRoutes from './routes/test-redis';

// API Routes
app.use('/api/package', packageRoutes);
app.use('/api/admin/faq', faqRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonial-management', testimonialRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/upload-image', uploadRoutes);
app.use('/api/legal-pages', legalRoutes);
app.use('/api/social-contact', socialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/test-redis', testRedisRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
});
