import { Worker, Job } from "bullmq";
import { transporter } from "./backend/lib/mail-transport";
import { MAIL_QUEUE_NAME, QueuedEmail } from "./backend/lib/email-queue";
import { redisUrl } from "./backend/lib/redis";
import Redis from "ioredis";
import Booking from "./backend/models/Booking.model";
import connectToDatabase from "./backend/lib/mongoose";

console.log("🚀 Starting Email Worker...");
console.log("📡 Redis URL:", redisUrl ? "configured" : "NOT SET");
console.log("📧 MAIL_USER:", process.env.MAIL_USER ? "set" : "NOT SET");
console.log("🔑 MAIL_PASS:", process.env.MAIL_PASS ? "set" : "NOT SET");
console.log("🌐 MAIL_HOST:", process.env.MAIL_HOST || "NOT SET");
console.log("🔌 MAIL_PORT:", process.env.MAIL_PORT || "587 (default)");

// Worker requires a blocking connection, so we create a new one
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

connection.on("connect", () => console.log("✅ Worker Redis connected"));
connection.on("error", (err) =>
  console.error("❌ Worker Redis error:", err.message),
);

const worker = new Worker<QueuedEmail>(
  MAIL_QUEUE_NAME,
  async (job: Job<QueuedEmail>) => {
    console.log(
      `\n📨 Processing job ${job.id} | type: ${job.name} | to: ${job.data.to}`,
    );

    const {
      to,
      subject,
      html,
      text,
      from,
      replyTo,
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
            `⚠️ Skipping email for booking ${bookingId}: status is '${booking?.status || "not found"}'`,
          );
          return;
        }
      }

      const mailFrom = from || process.env.MAIL_FROM || process.env.MAIL_USER;

      console.log(`   From: ${mailFrom}`);
      console.log(`   To:   ${to}`);
      console.log(`   Subject: ${subject}`);

      const info = await transporter.sendMail({
        from: mailFrom,
        to,
        subject,
        html,
        text,
        replyTo,
      });

      console.log(
        `✅ Email sent! Message ID: ${info.messageId} (job: ${job.id})`,
      );
      return info;
    } catch (error) {
      console.error(`❌ Failed to send email (job: ${job.id}):`, error);
      throw error; // Let BullMQ handle retry
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed after retries: ${err.message}`);
});

worker.on("stalled", (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

console.log(`👂 Worker listening on queue: ${MAIL_QUEUE_NAME}`);
