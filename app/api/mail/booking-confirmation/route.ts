import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "../send-booking-email";

import { IBooking } from "@/backend/models/Booking.model";

export async function POST(request: NextRequest) {
  try {
    // Check if email configuration is available
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error(
        "❌ Email configuration missing: MAIL_USER or MAIL_PASS not set",
      );
      console.error("❌ MAIL_USER:", process.env.MAIL_USER ? "SET" : "NOT SET");
      console.error("❌ MAIL_PASS:", process.env.MAIL_PASS ? "SET" : "NOT SET");
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service not configured. Please check environment variables.",
          details: "MAIL_USER or MAIL_PASS is missing",
          config: {
            MAIL_HOST: process.env.MAIL_HOST || "NOT SET",
            MAIL_PORT: process.env.MAIL_PORT || "NOT SET",
            MAIL_USER: process.env.MAIL_USER ? "SET" : "NOT SET",
            MAIL_PASS: process.env.MAIL_PASS ? "SET" : "NOT SET",
          },
        },
        { status: 500 },
      );
    }

    const { booking: rawBooking } = await request.json();

    if (!rawBooking) {
      return NextResponse.json(
        { success: false, error: "Booking data is required." },
        { status: 400 },
      );
    }

    const email = rawBooking.travelers?.primaryContact?.email;

    if (!email) {
      console.error("❌ Missing booking email:", {
        booking: !!rawBooking,
        email: email,
      });
      return NextResponse.json(
        { success: false, error: "Booking email is required." },
        { status: 400 },
      );
    }

    // Use shared email function
    // Pass rawBooking as it has the full structure required by the email service (IBooking interface)
    const emailResult = await sendBookingConfirmationEmail(
      rawBooking as IBooking,
    );

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: emailResult.message,
        customerEmail: email,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.message,
          details: emailResult.error,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to send confirmation email right now.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
