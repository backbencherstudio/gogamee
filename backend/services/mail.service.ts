import { emailQueue } from "@/backend/lib/email-queue";

class MailService {
  private createGoGameEmailShell(title: string, intro: string, otp: string, warning: string) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f0f4f8; font-family: Arial, sans-serif;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #6AAD3C 0%, #4a8a27 100%); padding: 36px 30px; text-align: center;">
      <p style="margin: 0 0 6px; color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">GoGame Security</p>
      <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">${title}</h1>
    </div>

    <div style="padding: 24px 30px; border-bottom: 1px solid #eee; background-color: #fafffe;">
      <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
        ${intro}
      </p>
    </div>

    <div style="padding: 30px; text-align: center; border-bottom: 1px solid #eee;">
      <p style="margin: 0 0 15px; color: #333; font-size: 16px;">Your verification code is:</p>
      <div style="display: inline-block; background-color: #f4f6f8; border: 2px dashed #6AAD3C; border-radius: 8px; padding: 16px 32px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #222; margin-right: -12px;">${otp}</span>
      </div>
      <p style="margin: 20px 0 0; color: #888; font-size: 13px;">${warning}</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0 0 6px; color: #555; font-size: 13px;">Need help? Contact us at</p>
      <p style="margin: 0 0 6px; color: #6AAD3C; font-size: 13px; font-weight: 600;">${process.env.MAIL_TO || process.env.MAIL_USER || 'support@gogame.com'}</p>
      <p style="margin: 14px 0 0; color: #aaa; font-size: 11px;">&copy; ${new Date().getFullYear()} GoGame. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async sendMail(to: string, subject: string, html: string, text: string) {
    try {
      const from = process.env.MAIL_FROM || '"GoGame" <noreply@gogame.com>';
      await emailQueue.addToQueue({
        to,
        from,
        subject,
        html,
        text,
        type: "admin_notification"
      });
      console.log(`[MailService] Queued email to ${to} with subject: ${subject}`);
      return true;
    } catch (error) {
      console.error("Error queueing email:", error);
      return false;
    }
  }

  async sendOtpEmail(to: string, otp: string, context: "forgot-password" | "change-email" | "verify-email") {
    let subject = "";
    let html = "";
    let text = "";

    if (context === "forgot-password") {
      subject = "Reset Your Password - GoGame";
      html = this.createGoGameEmailShell(
        "Reset Password",
        "We received a request to reset the password for your GoGame account associated with this email address.",
        otp,
        "This code will expire in 10 minutes. If you did not request a password reset, please ignore this email."
      );
      text = `Your GoGame password reset OTP is: ${otp}. It expires in 10 minutes.`;
    } else if (context === "change-email") {
      subject = "Verify Current Email - GoGame";
      html = this.createGoGameEmailShell(
        "Verify Identity",
        "You recently requested to update your email address on your GoGame account. We need to verify it's you.",
        otp,
        "This code will expire in 10 minutes. If you did not request this change, please contact support immediately."
      );
      text = `Your GoGame verification OTP is: ${otp}. It expires in 10 minutes.`;
    } else if (context === "verify-email") {
      subject = "Verify New Email - GoGame";
      html = this.createGoGameEmailShell(
        "Verify New Email",
        "You requested to set this email address as your new primary contact for your GoGame account.",
        otp,
        "This code will expire in 10 minutes. If you did not request this change, please ignore this email."
      );
      text = `Your GoGame new email verification OTP is: ${otp}. It expires in 10 minutes.`;
    }

    return this.sendMail(to, subject, html, text);
  }
}

export const mailService = new MailService();
