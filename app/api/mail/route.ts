import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { emailQueue } from "@/backend/lib/email-queue";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, source } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    const emailSubject = `GoGame contact form${source ? ` - ${source}` : ""}: ${name}`;
    const emailText = `
Name: ${name}
Email: ${email}
${source ? `Source: ${source}\n` : ""}
Message:
${message}
    `.trim();

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: process.env.MAIL_TO ?? process.env.MAIL_USER,
      subject: emailSubject,
      replyTo: email,
      text: emailText,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mail send error:", error);

    // Queue for retry if transient error
    const isTransient =
      error instanceof Error && emailQueue.isTransientError(error);
    if (isTransient) {
      try {
        const { name, email, message, source } = await request.json();
        await emailQueue.addToQueue({
          to: process.env.MAIL_TO ?? process.env.MAIL_USER!,
          subject: `GoGame contact form${source ? ` - ${source}` : ""}: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n${source ? `Source: ${source}\n` : ""}\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>${source ? `<p><strong>Source:</strong> ${source}</p>` : ""}<p><strong>Message:</strong></p><p>${message}</p>`,
          from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          replyTo: email,
          type: "contact",
        });

        return NextResponse.json({
          success: true,
          message: "Contact form queued for delivery",
        });
      } catch (queueError) {
        console.error("Failed to queue contact form:", queueError);
      }
    }

    return NextResponse.json(
      { success: false, error: "Unable to send message right now." },
      { status: 500 },
    );
  }
}
