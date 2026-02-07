import { NextRequest, NextResponse } from "next/server";
import { emailQueue } from "@/backend/lib/email-queue";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, source } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 },
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background-color: #000000; padding: 30px 40px; text-align: center;">
      <h1 style="color: #76C043; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">GoGame</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
      <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 20px; font-size: 22px; font-weight: 600;">New Contact Message</h2>
      <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
        You have received a new inquiry from the website contact form.
      </p>
      
      <!-- Details Box -->
      <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px; width: 80px; font-weight: 500;">Name</td>
            <td style="padding: 8px 0; color: #333333; font-size: 15px; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px; width: 80px; font-weight: 500;">Email</td>
            <td style="padding: 8px 0; color: #333333; font-size: 15px; font-weight: 600;">
              <a href="mailto:${email}" style="color: #76C043; text-decoration: none;">${email}</a>
            </td>
          </tr>
          ${
            source
              ? `
          <tr>
            <td style="padding: 8px 0; color: #888888; font-size: 14px; width: 80px; font-weight: 500;">Source</td>
            <td style="padding: 8px 0; color: #333333; font-size: 15px; font-weight: 600;">${source}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Message -->
      <div>
        <p style="color: #333333; font-size: 15px; font-weight: 600; margin-bottom: 12px;">Message:</p>
        <div style="background-color: #ffffff; border-left: 4px solid #76C043; padding: 15px 20px; color: #4a4a4a; line-height: 1.6; font-size: 15px;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; color: #999999; font-size: 13px;">
        &copy; ${new Date().getFullYear()} GoGame. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Add to Redis Queue (BullMQ)
    // The worker.ts will pick this up and handle the actual sending + retries
    const jobId = await emailQueue.addToQueue({
      to: process.env.MAIL_TO ?? process.env.MAIL_USER!,
      subject: `GoGame contact form${source ? ` - ${source}` : ""}: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n${source ? `Source: ${source}\n` : ""}\nMessage:\n${message}`,
      html: emailHtml,
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      replyTo: email,
      type: "contact",
    });

    return NextResponse.json({
      success: true,
      message: "Message received and queued for delivery",
    });
  } catch (error) {
    console.error("❌ Failed to queue contact form:", error);

    return NextResponse.json(
      { success: false, error: "Unable to process message right now." },
      { status: 500 },
    );
  }
}
