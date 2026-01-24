import { NextRequest, NextResponse } from "next/server";
import { emailQueue } from "@/backend/lib/email-queue";

/**
 * Get email queue status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const stats = await emailQueue.getQueueStats();

    // Get sample emails from each queue
    const waitingEmails = await emailQueue.getWaitingEmails(10);
    const failedEmails = await emailQueue.getFailedEmails(10);

    return NextResponse.json({
      success: true,
      stats,
      queues: {
        pending: {
          count: stats.waiting,
          sample: waitingEmails.map((job) => ({
            id: job.id,
            to: (job.data as any).to,
            subject: (job.data as any).subject,
            type: (job.data as any).type,
            createdAt: new Date(job.timestamp).toISOString(),
          })),
        },
        processing: {
          count: stats.active,
        },
        failed: {
          count: stats.failed,
          sample: failedEmails.map((job) => ({
            id: job.id,
            to: (job.data as any).to,
            subject: (job.data as any).subject,
            type: (job.data as any).type,
            error: job.reason,
            failedAt: job.failedAt
              ? new Date(job.failedAt).toISOString()
              : null,
            createdAt: new Date(job.timestamp).toISOString(),
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
