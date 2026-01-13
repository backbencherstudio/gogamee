import { Router, Request, Response } from 'express';
import { sendBookingConfirmationEmail } from '../../app/api/mail/send-booking-email';
import nodemailer from 'nodemailer';

const router = Router();

// POST /api/mail
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: `Contact Form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Send mail error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    });
  }
});

// POST /api/mail/booking-confirmation
router.post('/booking-confirmation', async (req: Request, res: Response) => {
  try {
    await sendBookingConfirmationEmail(req.body);
    res.json({
      success: true,
      message: 'Booking confirmation email sent'
    });
  } catch (error) {
    console.error('Send booking confirmation error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send booking confirmation'
    });
  }
});

// GET /api/mail/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_TO || process.env.MAIL_USER,
      subject: 'Test Email',
      text: 'This is a test email from GoGame backend',
      html: '<p>This is a test email from GoGame backend</p>',
    });

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test email'
    });
  }
});

export default router;

