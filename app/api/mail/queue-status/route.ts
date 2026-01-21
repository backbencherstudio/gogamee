import { NextRequest, NextResponse } from "next/server";
import { emailQueue } from "@/_backend/lib/email-queue";

/**
 * Get email queue status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const stats = await emailQueue.getQueueStats();

    // Get sample emails from each queue
    const pendingEmails = await emailQueue.getPendingEmails(10);
    const failedEmails = await emailQueue.getFailedEmails(10);

    return NextResponse.json({
      success: true,
      stats,
      queues: {
        pending: {
          count: stats.pendingCount,
          sample: pendingEmails.map((email) => ({
            id: email.id,
            to: email.to,
            subject: email.subject,
            type: email.type,
            retryCount: email.retryCount,
            nextRetry: email.nextRetry
              ? new Date(email.nextRetry).toISOString()
              : null,
            createdAt: new Date(email.createdAt).toISOString(),
          })),
        },
        processing: {
          count: stats.processingCount,
        },
        failed: {
          count: stats.failedCount,
          sample: failedEmails.map((email) => ({
            id: email.id,
            to: email.to,
            subject: email.subject,
            type: email.type,
            retryCount: email.retryCount,
            error: email.error,
            lastAttempt: email.lastAttempt
              ? new Date(email.lastAttempt).toISOString()
              : null,
            createdAt: new Date(email.createdAt).toISOString(),
          })),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting queue status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get queue status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
