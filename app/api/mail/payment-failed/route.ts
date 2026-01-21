import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { emailQueue } from "@/_backend/lib/email-queue";

interface PaymentFailedRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
  amount: number;
  errorMessage?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateFailedPaymentEmail(data: PaymentFailedRequest): string {
  // Styles matching send-booking-email.ts
  const STYLES = {
    container:
      "max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Poppins', Arial, sans-serif;",
    header:
      "background: linear-gradient(135deg, #76C043 0%, #4a9e2a 100%); padding: 40px 30px; text-align: center;",
    headerTitle:
      "margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;",
    section: "padding: 30px 30px;",
    button:
      "display: inline-block; background-color: #76C043; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;",
    footer:
      "background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed - GoGame</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; color: #333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <div style="${STYLES.container}">
          
          <!-- Header with Gradient -->
          <div style="${STYLES.header}">
            <h1 style="${STYLES.headerTitle}">Payment Failed</h1>
          </div>

          <!-- Content -->
          <div style="${STYLES.section}">
            <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
              Dear <strong>${data.userName}</strong>,
            </p>

            <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
              Unfortunately, your payment for booking <strong>#${data.bookingId}</strong> could not be processed at this time.
            </p>

            <!-- Alert Box -->
            <div style="margin: 30px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; padding: 20px;">
              <p style="margin: 0; color: #856404; font-size: 15px; font-weight: 600;">
                ⚠️ Important Notice
              </p>
              <p style="margin: 10px 0 0; color: #856404; font-size: 14px; line-height: 1.6;">
                If any amount was deducted from your account, please contact our admin team immediately with your booking ID. We will assist you as soon as possible.
              </p>
            </div>

            <!-- Booking Details -->
            <div style="margin: 30px 0; background-color: #F1F9EC; border-radius: 12px; padding: 25px;">
              <h3 style="margin: 0 0 15px; color: #4a9e2a; font-size: 18px; font-weight: 600;">Booking Details</h3>
              
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color: #666; font-size: 14px;">Booking ID:</td>
                  <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right;">#${data.bookingId}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 14px;">Amount:</td>
                  <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right;">€${Number(data.amount).toFixed(2)}</td>
                </tr>
                ${
                  data.errorMessage
                    ? `
                <tr>
                  <td style="color: #666; font-size: 14px;">Error:</td>
                  <td style="color: #d32f2f; font-size: 14px; font-weight: 500; text-align: right;">${data.errorMessage}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

            <!-- Support Link -->
             <div style="text-align: center; margin-top: 30px;">
                <p style="margin: 0 0 10px; color: #666;">Need assistance?</p>
                <a href="mailto:${process.env.MAIL_TO || "support@gogame.com"}" style="${STYLES.button}">
                  Contact Support
                </a>
            </div>

            <p style="margin: 30px 0 0; color: #333; font-size: 16px; line-height: 1.6;">
              Thank you,<br>
              <strong style="color: #76C043;">GoGame Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="${STYLES.footer}">
             <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from GoGame.<br>
              Please do not reply to this email.
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentFailedRequest = await request.json();
    const { bookingId, userEmail, userName, amount, errorMessage } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Auto-fill missing data from DB if possible
    let finalUserEmail = userEmail;
    let finalUserName = userName;
    let finalAmount = amount;

    if (!finalUserEmail || !finalUserName) {
      try {
        const { BookingService } = await import("@/_backend");
        const booking = await BookingService.getById(bookingId);
        if (booking) {
          finalUserEmail = finalUserEmail || booking.email;
          finalUserName = finalUserName || booking.fullName || "Guest";
          finalAmount = finalAmount || Number(booking.totalCost);
        }
      } catch (err) {
        console.error(
          "Error fetching booking details for failed payment:",
          err,
        );
      }
    }

    if (!finalUserEmail) {
      // Fallback or error if we still don't have email
      console.warn(
        `⚠️ Could not find email for booking ${bookingId}, using fallback admin notification only`,
      );
      // We return success to not crash frontend, but log warning
      return NextResponse.json({
        success: true,
        message: "Logged failure, but no email to send to.",
      });
    }

    console.log(
      `📧 Sending payment failed email for booking ${bookingId} to ${finalUserEmail}`,
    );

    // Update body data for template generation
    const templateData = {
      ...body,
      userEmail: finalUserEmail,
      userName: finalUserName,
      amount: finalAmount,
    };

    const htmlContent = generateFailedPaymentEmail(templateData);

    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        to: finalUserEmail,
        subject: `Payment Failed - Booking #${bookingId} - GoGame`,
        html: htmlContent,
        text: `Payment Failed\n\nDear ${finalUserName},\n\nUnfortunately, your payment for booking #${bookingId} could not be processed.\n\nBooking Details:\n- Booking ID: #${bookingId}\n- Amount: €${Number(finalAmount).toFixed(2)}\n${errorMessage ? `- Error: ${errorMessage}\n` : ""}\nIMPORTANT: If any amount was deducted from your account, please contact our admin team immediately.\n\nContact: ${process.env.MAIL_TO || "info@gogame2025.com"}\n\nThank you,\nGoGame Team`,
      });

      console.log(
        `✅ Payment failed email sent successfully to ${finalUserEmail}`,
      );

      return NextResponse.json({
        success: true,
        message: "Payment failed notification sent",
      });
    } catch (emailError) {
      console.error("❌ Direct email send failed:", emailError);

      // Queue for retry
      const isTransient = emailQueue.isTransientError(emailError as Error);
      if (isTransient) {
        console.log("📨 Queueing payment failed email for retry...");
        await emailQueue.addToQueue({
          type: "booking",
          to: finalUserEmail,
          subject: `Payment Failed - Booking #${bookingId} - GoGame`,
          html: htmlContent,
          text: `Payment failed for booking #${bookingId}. Amount: €${finalAmount}. Contact: ${process.env.MAIL_TO}`,
        });

        return NextResponse.json({
          success: true,
          message: "Email queued for retry",
        });
      }

      throw emailError;
    }
  } catch (error) {
    console.error("❌ Payment failed email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send payment failed notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
