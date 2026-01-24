// import { NextResponse } from "next/server";
// import { createBooking } from "../../../../backendgogame/actions/bookings";
// import { toErrorMessage } from "../../../../backendgogame/lib/errors";

// export async function POST(request: Request) {
//   const payload = await request.json();
//   try {
//     const response = await createBooking(payload);
//     return NextResponse.json(response, { status: 201 });
//   } catch (error: unknown) {
//     console.error("Create booking error", error);
//     return NextResponse.json(
//       { message: toErrorMessage(error, "Failed to create booking") },
//       { status: 500 }
//     );
//   }
// }
