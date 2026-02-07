import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { AuthService } from "@/backend/modules";
import { toErrorMessage } from "@/backend/lib/errors";

const SESSION_COOKIE = "gogame_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload.email || !payload.password) {
    return NextResponse.json(
      {
        success: false,
        message: "Email and password are required",
      },
      { status: 400 },
    );
  }

  try {
    // Get request context for login
    const hdrs = await headers();
    const requestContext = {
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
    };

    const result = await AuthService.login({
      identifier: payload.email,
      password: payload.password,
    });

    // Set cookie if login successful
    if (result && result.accessToken) {
      const cookieStore = await cookies();
      const now = Date.now();
      cookieStore.set({
        name: SESSION_COOKIE,
        value: result.accessToken,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(now + SESSION_TTL_MS),
      });

      return NextResponse.json({
        success: true,
        message: "Login successful",
        sessionToken: result.accessToken,
        authorization: {
          type: "Bearer",
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    );
  } catch (error: unknown) {
    console.error("Login error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Login failed"),
      },
      { status: 500 },
    );
  }
}
