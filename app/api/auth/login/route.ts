import { NextResponse } from "next/server";
import { login } from "../../../../backend/actions/auth";
import { toErrorMessage } from "../../../../backend/lib/errors";

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const result = await login(payload);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Login error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Login failed"),
      },
      { status: 500 }
    );
  }
}

