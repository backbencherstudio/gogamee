import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface QueuedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  bookingId?: string;
  type: "booking" | "contact" | "admin_notification";
  retryCount: number;
  maxRetries: number;
  lastAttempt?: number;
  nextRetry?: number;
  error?: string;
  createdAt: number;
}

export interface FailedEmailDigest {
  failedEmails: Array<{
    id: string;
    to: string;
    subject: string;
    type: string;
    error: string;
    failedAt: number;
    retryCount: number;
  }>;
  totalFailed: number;
  periodStart: number;
  periodEnd: number;
}

class EmailQueueService {
  // Queue key names
  private readonly PENDING_QUEUE = "email:queue:pending";
  private readonly PROCESSING_SET = "email:queue:processing";
  private readonly FAILED_QUEUE = "email:queue:failed";
  private readonly EMAIL_DATA_PREFIX = "email:data:";
  private readonly LAST_DIGEST_KEY = "email:last_digest_sent";

  // Retry configuration
  private readonly MAX_RETRIES = 6;
  private readonly RETRY_DELAYS = [
    0, // Immediate
    60, // 1 minute
    300, // 5 minutes
    900, // 15 minutes
    3600, // 1 hour
    14400, // 4 hours
  ];

  /**
   * Generate unique email ID
   */
  private generateEmailId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Calculate next retry time based on retry count
   */
  private calculateNextRetry(retryCount: number): number {
    const delaySeconds =
      this.RETRY_DELAYS[retryCount] ||
      this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
    return Date.now() + delaySeconds * 1000;
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
   * Add email to queue
   */
  async addToQueue(
    emailData: Omit<
      QueuedEmail,
      "id" | "retryCount" | "maxRetries" | "createdAt"
    >,
  ): Promise<string> {
    const emailId = this.generateEmailId();
    const queuedEmail: QueuedEmail = {
      ...emailData,
      id: emailId,
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
      createdAt: Date.now(),
      nextRetry: this.calculateNextRetry(0),
    };

    // Store email data
    await redis.set(
      `${this.EMAIL_DATA_PREFIX}${emailId}`,
      JSON.stringify(queuedEmail),
      { ex: 7 * 24 * 60 * 60 }, // Expire after 7 days
    );

    // Add to pending queue
    await redis.lpush(this.PENDING_QUEUE, emailId);

    console.log(`📧 Email queued for retry: ${emailId} (${emailData.type})`);
    return emailId;
  }

  /**
   * Get pending emails ready for retry
   */
  async getPendingEmails(limit: number = 10): Promise<QueuedEmail[]> {
    const now = Date.now();
    const emailIds = (await redis.lrange(
      this.PENDING_QUEUE,
      0,
      limit - 1,
    )) as string[];
    const emails: QueuedEmail[] = [];

    for (const emailId of emailIds) {
      const emailData = await redis.get<string>(
        `${this.EMAIL_DATA_PREFIX}${emailId}`,
      );
      if (!emailData) {
        // Email data expired or missing, remove from queue
        await redis.lrem(this.PENDING_QUEUE, 0, emailId);
        continue;
      }

      const email: QueuedEmail = JSON.parse(emailData);

      // Check if email is ready for retry
      if (!email.nextRetry || email.nextRetry <= now) {
        emails.push(email);
      }
    }

    return emails;
  }

  /**
   * Mark email as processing
   */
  async markAsProcessing(emailId: string): Promise<void> {
    await redis.sadd(this.PROCESSING_SET, emailId);
    await redis.lrem(this.PENDING_QUEUE, 0, emailId);
  }

  /**
   * Remove email from processing set
   */
  async removeFromProcessing(emailId: string): Promise<void> {
    await redis.srem(this.PROCESSING_SET, emailId);
  }

  /**
   * Update retry count and schedule next retry
   */
  async updateRetry(emailId: string, error: string): Promise<void> {
    const emailData = await redis.get<string>(
      `${this.EMAIL_DATA_PREFIX}${emailId}`,
    );
    if (!emailData) return;

    const email: QueuedEmail = JSON.parse(emailData);
    email.retryCount += 1;
    email.lastAttempt = Date.now();
    email.error = error;

    if (email.retryCount >= email.maxRetries) {
      // Move to failed queue
      await this.moveToFailedQueue(email);
    } else {
      // Schedule next retry
      email.nextRetry = this.calculateNextRetry(email.retryCount);
      await redis.set(
        `${this.EMAIL_DATA_PREFIX}${emailId}`,
        JSON.stringify(email),
        { ex: 7 * 24 * 60 * 60 },
      );
      await redis.lpush(this.PENDING_QUEUE, emailId);
    }

    await this.removeFromProcessing(emailId);
  }

  /**
   * Mark email as successfully sent
   */
  async markAsSuccess(emailId: string): Promise<void> {
    await redis.del(`${this.EMAIL_DATA_PREFIX}${emailId}`);
    await this.removeFromProcessing(emailId);
    console.log(
      `✅ Email sent successfully and removed from queue: ${emailId}`,
    );
  }

  /**
   * Move email to failed queue (dead letter queue)
   */
  async moveToFailedQueue(email: QueuedEmail): Promise<void> {
    await redis.lpush(this.FAILED_QUEUE, email.id);
    await redis.set(
      `${this.EMAIL_DATA_PREFIX}${email.id}`,
      JSON.stringify(email),
      { ex: 30 * 24 * 60 * 60 }, // Keep failed emails for 30 days
    );
    await this.removeFromProcessing(email.id);
    console.error(
      `❌ Email permanently failed after ${email.retryCount} retries: ${email.id}`,
    );
  }

  /**
   * Get failed emails (dead letter queue)
   */
  async getFailedEmails(limit: number = 50): Promise<QueuedEmail[]> {
    const emailIds = (await redis.lrange(
      this.FAILED_QUEUE,
      0,
      limit - 1,
    )) as string[];
    const emails: QueuedEmail[] = [];

    for (const emailId of emailIds) {
      const emailData = await redis.get<string>(
        `${this.EMAIL_DATA_PREFIX}${emailId}`,
      );
      if (emailData) {
        emails.push(JSON.parse(emailData));
      }
    }

    return emails;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pendingCount: number;
    processingCount: number;
    failedCount: number;
  }> {
    const [pendingCount, processingCount, failedCount] = await Promise.all([
      redis.llen(this.PENDING_QUEUE),
      redis.scard(this.PROCESSING_SET),
      redis.llen(this.FAILED_QUEUE),
    ]);

    return {
      pendingCount: pendingCount || 0,
      processingCount: processingCount || 0,
      failedCount: failedCount || 0,
    };
  }

  /**
   * Get new failed emails since last digest
   */
  async getNewFailedEmails(): Promise<FailedEmailDigest | null> {
    const lastDigestTime = await redis.get<number>(this.LAST_DIGEST_KEY);
    const now = Date.now();
    const failedEmails = await this.getFailedEmails(100);

    // Filter emails failed since last digest
    const newFailedEmails = failedEmails.filter(
      (email) => email.lastAttempt && email.lastAttempt > (lastDigestTime || 0),
    );

    if (newFailedEmails.length === 0) {
      return null;
    }

    return {
      failedEmails: newFailedEmails.map((email) => ({
        id: email.id,
        to: email.to,
        subject: email.subject,
        type: email.type,
        error: email.error || "Unknown error",
        failedAt: email.lastAttempt || email.createdAt,
        retryCount: email.retryCount,
      })),
      totalFailed: newFailedEmails.length,
      periodStart: lastDigestTime || now - 24 * 60 * 60 * 1000, // Last 24h if no previous digest
      periodEnd: now,
    };
  }

  /**
   * Mark digest as sent
   */
  async markDigestSent(): Promise<void> {
    await redis.set(this.LAST_DIGEST_KEY, Date.now());
  }

  /**
   * Clean up old emails (older than retention period)
   */
  async cleanupOldEmails(): Promise<number> {
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
    const failedEmails = await this.getFailedEmails(1000);
    let cleaned = 0;

    for (const email of failedEmails) {
      if (email.createdAt < cutoffTime) {
        await redis.lrem(this.FAILED_QUEUE, 0, email.id);
        await redis.del(`${this.EMAIL_DATA_PREFIX}${email.id}`);
        cleaned++;
      }
    }

    console.log(`🧹 Cleaned up ${cleaned} old emails`);
    return cleaned;
  }
  /**
   * Check if email was already sent for a booking
   * Returns true if this is the first time (should send)
   * Returns false if already sent (should skip)
   */
  async checkAndMarkEmailSent(bookingId: string): Promise<boolean> {
    const key = `email:sent:${bookingId}`;
    // Try to set key if it doesn't exist
    const result = await redis.set(key, "sent", {
      nx: true,
      ex: 7 * 24 * 60 * 60,
    });
    return result === "OK";
  }

  /**
   * Reset email sent status (for testing or manual retry)
   */
  async resetEmailSentStatus(bookingId: string): Promise<void> {
    await redis.del(`email:sent:${bookingId}`);
  }
}

export const emailQueue = new EmailQueueService();
