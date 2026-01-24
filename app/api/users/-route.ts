// import { NextResponse } from "next/server";

// const users: Array<{ id: string; name: string; email: string }> = [];

// export async function GET() {
//   return NextResponse.json({ users });
// }

// export async function POST(request: Request) {
//   const payload = await request.json();
//   const user = {
//     id: `user-${Date.now()}`,
//     name: payload.name,
//     email: payload.email,
//   };
//   users.push(user);
//   return NextResponse.json(user, { status: 201 });
// }
