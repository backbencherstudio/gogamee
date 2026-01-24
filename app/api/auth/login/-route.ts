// import { NextResponse } from "next/server";
// import { cookies, headers } from "next/headers";
// import { login } from "../../../../backendgogame/actions/auth";
// import { toErrorMessage } from "../../../../backendgogame/lib/errors";

// const SESSION_COOKIE = "gogame_admin_session";
// const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// export async function POST(request: Request) {
//   const payload = await request.json();

//   try {
//     // Get request context for login
//     const hdrs = await headers();
//     const requestContext = {
//       ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
//       userAgent: hdrs.get("user-agent") ?? null,
//     };

//     const result = await login(payload, requestContext);

//     // Set cookie if login successful
//     if (result.success && result.sessionToken) {
//       const cookieStore = await cookies();
//       const now = Date.now();
//       cookieStore.set({
//         name: SESSION_COOKIE,
//         value: result.sessionToken,
//         httpOnly: true,
//         secure: true,
//         sameSite: "strict",
//         path: "/",
//         expires: new Date(now + SESSION_TTL_MS),
//       });
//     }

//     return NextResponse.json(result);
//   } catch (error: unknown) {
//     console.error("Login error", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Login failed"),
//       },
//       { status: 500 }
//     );
//   }
// }
