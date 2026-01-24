// import { NextResponse } from "next/server";
// import { deleteBooking } from "../../../../../backendgogame/actions/bookings";
// import { toErrorMessage } from "../../../../../backendgogame/lib/errors";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// interface RouteContext {
//   params: Promise<{ id: string }>;
// }

// async function getId(context: RouteContext) {
//   const { id } = await context.params;
//   return id;
// }

// export async function DELETE(_: Request, context: RouteContext) {
//   try {
//     const id = await getId(context);
//     await deleteBooking(id);
//     return new NextResponse(null, {
//       status: 204,
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Delete booking error", error);
//     return NextResponse.json(
//       { message: toErrorMessage(error, "Failed to delete booking") },
//       { status: 500 }
//     );
//   }
// }
