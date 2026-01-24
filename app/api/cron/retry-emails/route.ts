import { NextRequest, NextResponse } from "next/server";
import { emailQueue } from "@/backend/lib/email-queue";

/**
 * Get Email Queue Status
 * Previously used for manual retries, now monitors BullMQ status.
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

    // Get queue stats from BullMQ
    const stats = await emailQueue.getQueueStats();
    const failed = await emailQueue.getFailedEmails(5);

    return NextResponse.json({
      success: true,
      status: "BitMQ Worker should be running separately",
      queueStats: stats,
      recentFailures: failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
