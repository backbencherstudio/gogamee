import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { emailQueue } from "@/_backend/lib/email-queue";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send admin notification email about permanently failed emails
 */
async function sendAdminDigest() {
  const digest = await emailQueue.getNewFailedEmails();

  if (!digest || digest.totalFailed === 0) {
    console.log("No new failed emails to report");
    return { sent: false, reason: "No new failures" };
  }

  const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
  if (!adminEmail) {
    console.error("Admin email not configured");
    return { sent: false, reason: "Admin email not configured" };
  }

  const periodHours = Math.round(
    (digest.periodEnd - digest.periodStart) / (1000 * 60 * 60),
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; border-radius: 8px; }
        h1 { margin: 0; font-size: 24px; }
        .summary { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .failed-email { background: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .failed-email h3 { margin: 0 0 10px 0; color: #d32f2f; }
        .detail { margin: 5px 0; }
        .label { font-weight: bold; color: #666; }
        .error { background: #ffebee; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; margin-top: 10px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Email Delivery Failure Report</h1>
          <p>GoGame Email System Alert</p>
        </div>

        <div class="summary">
          <h2>📊 Summary</h2>
          <p><strong>Total Failed Emails:</strong> ${digest.totalFailed}</p>
          <p><strong>Time Period:</strong> Last ${periodHours} hours</p>
          <p><strong>Report Generated:</strong> ${new Date(digest.periodEnd).toLocaleString()}</p>
        </div>

        <h2>❌ Failed Emails</h2>
        ${digest.failedEmails
          .map(
            (email) => `
          <div class="failed-email">
            <h3>Email ID: ${email.id}</h3>
            <div class="detail"><span class="label">Recipient:</span> ${email.to}</div>
            <div class="detail"><span class="label">Subject:</span> ${email.subject}</div>
            <div class="detail"><span class="label">Type:</span> ${email.type}</div>
            <div class="detail"><span class="label">Failed At:</span> ${new Date(email.failedAt).toLocaleString()}</div>
            <div class="detail"><span class="label">Retry Attempts:</span> ${email.retryCount}</div>
            <div class="error">
              <strong>Error:</strong><br>
              ${email.error}
            </div>
          </div>
        `,
          )
          .join("")}

        <div class="footer">
          <h3>🔧 Next Steps</h3>
          <ul>
            <li>Review the error messages above</li>
            <li>Check email service configuration</li>
            <li>Verify recipient email addresses</li>
            <li>Contact affected customers if needed</li>
          </ul>
          <p><em>This is an automated report from GoGame Email System</em></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
GoGame Email Delivery Failure Report

SUMMARY:
- Total Failed Emails: ${digest.totalFailed}
- Time Period: Last ${periodHours} hours
- Report Generated: ${new Date(digest.periodEnd).toLocaleString()}

FAILED EMAILS:
${digest.failedEmails
  .map(
    (email, index) => `
${index + 1}. Email ID: ${email.id}
   Recipient: ${email.to}
   Subject: ${email.subject}
   Type: ${email.type}
   Failed At: ${new Date(email.failedAt).toLocaleString()}
   Retry Attempts: ${email.retryCount}
   Error: ${email.error}
`,
  )
  .join("\n")}

NEXT STEPS:
- Review the error messages above
- Check email service configuration
- Verify recipient email addresses
- Contact affected customers if needed

This is an automated report from GoGame Email System
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: adminEmail,
      subject: `⚠️ GoGame Email Failures Report - ${digest.totalFailed} Failed`,
      html: htmlContent,
      text: textContent,
    });

    await emailQueue.markDigestSent();
    console.log(`✅ Admin digest sent for ${digest.totalFailed} failed emails`);

    return { sent: true, count: digest.totalFailed };
  } catch (error) {
    console.error("❌ Failed to send admin digest:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process email queue and retry failed emails
 * This endpoint should be called periodically by a cron job
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (simple secret token)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-token-here";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("🔄 Starting email retry worker...");

    // Get pending emails ready for retry
    const pendingEmails = await emailQueue.getPendingEmails(20);
    console.log(`📧 Found ${pendingEmails.length} emails ready for retry`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await emailQueue.markAsProcessing(email.id);
        results.processed++;

        console.log(
          `📤 Retrying email ${email.id} (attempt ${email.retryCount + 1}/${email.maxRetries})`,
        );

        // Try to send the email
        await transporter.sendMail({
          from: email.from ?? process.env.MAIL_FROM ?? process.env.MAIL_USER,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          replyTo: email.replyTo,
        });

        // Success! Remove from queue
        await emailQueue.markAsSuccess(email.id);
        results.succeeded++;
        console.log(`✅ Email ${email.id} sent successfully`);
      } catch (error) {
        // Failed, update retry count
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await emailQueue.updateRetry(email.id, errorMessage);
        results.failed++;
        results.errors.push(`${email.id}: ${errorMessage}`);
        console.error(`❌ Email ${email.id} failed:`, errorMessage);
      }
    }

    // Send admin digest if there are new failures
    const digestResult = await sendAdminDigest();

    // Cleanup old emails (optional, run occasionally)
    const cleaned = await emailQueue.cleanupOldEmails();

    // Get queue stats
    const stats = await emailQueue.getQueueStats();

    console.log("✅ Email retry worker completed", results);

    return NextResponse.json({
      success: true,
      results,
      digestSent: digestResult.sent,
      digestCount: digestResult.sent ? digestResult.count : 0,
      cleaned,
      queueStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Email retry worker error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Worker failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
