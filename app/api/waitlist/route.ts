import { NextRequest, NextResponse } from "next/server";
import { WaitlistService } from "@/backend";

// POST /api/waitlist — public, submit email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, privacyAccepted } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid email is required." },
        { status: 400 },
      );
    }

    if (privacyAccepted !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "You must accept the privacy policy before submitting.",
        },
        { status: 400 },
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const result = await WaitlistService.addEmail({
      email: email.trim(),
      name: name?.trim(),
      source: "coming-soon-page",
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 409,
    });
  } catch (error) {
    console.error("[Waitlist POST] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}

// GET /api/waitlist — admin only, list all waitlist entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await WaitlistService.getAllEmails({ page, limit });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Waitlist GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}

// DELETE /api/waitlist?id=xxx — admin only
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Entry ID is required." },
        { status: 400 },
      );
    }

    const deleted = await WaitlistService.deleteEmail(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("[Waitlist DELETE] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
