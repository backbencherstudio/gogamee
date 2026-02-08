import { Worker, Job } from "bullmq";
import { transporter } from "./backend/lib/mail-transport";
import { MAIL_QUEUE_NAME, QueuedEmail } from "./backend/lib/email-queue";
import { redisUrl } from "./backend/lib/redis"; // Reuse URL for dedicated connection
import Redis from "ioredis";
import Booking from "./backend/models/Booking.model";
import connectToDatabase from "./backend/lib/mongoose";

console.log("🚀 Starting Email Worker...");

// Worker requires a blocking connection, so we create a new one
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker<QueuedEmail>(
  MAIL_QUEUE_NAME,
  async (job: Job<QueuedEmail>) => {
    console.log(`📨 Processing job ${job.id}: ${job.name}`);
    const {
      to,
      subject,
      html,
      text,
      from,
      replyTo,
      type,
      requiresStatusCheck,
      bookingId,
    } = job.data;

    try {
      // Check booking status if required (e.g., for delayed reveal emails)
      if (requiresStatusCheck && bookingId) {
        await connectToDatabase();
        const booking = await Booking.findById(bookingId);

        if (!booking || booking.status !== "confirmed") {
          console.log(
            `⚠️ Skipping email for booking ${bookingId}: Status is ${booking?.status || "not found"}, expected 'confirmed'`,
          );
          return;
        }
      }

      const info = await transporter.sendMail({
        from: from || process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject,
        html,
        text,
        replyTo,
      });

      console.log(`✅ Email sent: ${info.messageId} (job: ${job.id})`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send email (job: ${job.id}):`, error);
      throw error; // Let BullMQ handle retry
    }
  },
  {
    connection, // Use dedicated connection
    concurrency: 5, // Process 5 emails at a time
    limiter: {
      max: 10, // Max 10 emails
      duration: 1000, // per 1 second
    },
  },
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed: ${err.message}`);
});

console.log(`👂 Worker listening on queue: ${MAIL_QUEUE_NAME}`);
