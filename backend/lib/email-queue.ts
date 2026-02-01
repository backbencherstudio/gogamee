import { Queue, QueueEvents, Job } from "bullmq";
import { redis, redisUrl } from "./redis";
import Redis from "ioredis";

// Define the queue name
export const MAIL_QUEUE_NAME = "mail-queue";

// Initialize BullMQ Queue
// Producers can share the connection
export const mailQueue = new Queue(MAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// QueueEvents needs a blocking connection, so we create a new one
export const mailQueueEvents = new QueueEvents(MAIL_QUEUE_NAME, {
  connection: new Redis(redisUrl, { maxRetriesPerRequest: null }),
});

export interface QueuedEmail {
  to: string;
  subject: string;
  html?: string;
  text: string;
  from?: string;
  replyTo?: string;
  bookingId?: string;
  type: "booking" | "contact" | "admin_notification";
  // helper for custom data
  [key: string]: any;
}

class EmailQueueService {
  /**
   * Add email to queue
   */
  async addToQueue(
    emailData: QueuedEmail,
    options?: { delay?: number },
  ): Promise<string> {
    const job = await mailQueue.add(emailData.type, emailData, {
      delay: options?.delay,
    });
    console.log(
      `📧 Email queued: ${job.id} (${emailData.type}) ${options?.delay ? `(delayed by ${Math.round(options.delay / 1000 / 60)}m)` : ""}`,
    );
    return job.id || "";
  }

  /**
   * Check if error is transient (should retry) or permanent (should not retry)
   */
  isTransientError(error: Error): boolean {
    const transientPatterns = [
      "ETIMEDOUT",
      "ECONNRESET",
      "ENOTFOUND",
      "ECONNREFUSED",
      "EHOSTUNREACH",
      "timeout",
      "network",
      "421", // Temporary failure
      "450", // Mailbox unavailable
      "451", // Local error
      "452", // Insufficient storage
    ];

    const errorMessage = error.message.toLowerCase();
    return transientPatterns.some((pattern) =>
      errorMessage.includes(pattern.toLowerCase()),
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return await mailQueue.getJobCounts(
      "active",
      "waiting",
      "completed",
      "failed",
      "delayed",
    );
  }

  /**
   * Get waiting emails (jobs in queue not yet processed)
   */
  async getWaitingEmails(limit: number = 50) {
    const jobs = await mailQueue.getJobs(["waiting"], 0, limit - 1, true);
    return jobs.map((job) => ({
      id: job.id,
      data: job.data,
      timestamp: job.timestamp,
    }));
  }

  /**
   * Get recent failed emails
   */
  async getFailedEmails(limit: number = 50) {
    const failedJobs = await mailQueue.getJobs(["failed"], 0, limit - 1, true);
    return failedJobs.map((job) => ({
      id: job.id,
      data: job.data,
      reason: job.failedReason,
      failedAt: job.finishedOn,
      timestamp: job.timestamp,
    }));
  }

  /**
   * Check if email was already sent for a booking
   * Returns true if this is the first time (should send)
   * Returns false if already sent (should skip)
   */
  async checkAndMarkEmailSent(bookingId: string): Promise<boolean> {
    if (!redis) return true; // Fail safe

    const key = `email:sent:${bookingId}`;
    // Try to set key if it doesn't exist
    const result = await redis.set(key, "sent", "EX", 7 * 24 * 60 * 60, "NX");
    return result === "OK";
  }

  /**
   * Reset email sent status (for testing or manual retry)
   */
  async resetEmailSentStatus(bookingId: string): Promise<void> {
    if (!redis) return;
    await redis.del(`email:sent:${bookingId}`);
  }
}

export const emailQueue = new EmailQueueService();
