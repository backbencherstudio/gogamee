import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Check configuration
    const config = {
      MAIL_HOST: process.env.MAIL_HOST || "NOT SET",
      MAIL_PORT: process.env.MAIL_PORT || "NOT SET",
      MAIL_USER: process.env.MAIL_USER || "NOT SET",
      MAIL_PASS: process.env.MAIL_PASS ? "***SET***" : "NOT SET",
      MAIL_FROM: process.env.MAIL_FROM || "NOT SET",
      MAIL_TO: process.env.MAIL_TO || "NOT SET",
    };

    // Try to send a test email
    const testEmail = process.env.MAIL_TO || process.env.MAIL_USER;
    
    if (!testEmail || testEmail === "NOT SET") {
      return NextResponse.json({
        success: false,
        error: "Email configuration incomplete",
        config,
      });
    }

    const result = await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: testEmail,
      subject: "Test Email from GoGame",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from GoGame booking system.</p>
        <p>If you receive this, email configuration is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      text: "Test Email from GoGame\n\nThis is a test email from GoGame booking system.\n\nIf you receive this, email configuration is working correctly.",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      to: testEmail,
      config: {
        ...config,
        MAIL_PASS: "***HIDDEN***",
      },
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

