// import { NextResponse } from "next/server";
// import { addTestimonial } from "../../../../backendgogame/actions/testimonials";
// import { toErrorMessage } from "../../../../backendgogame/lib/errors";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function POST(request: Request) {
//   const payload = await request.json();
//   try {
//     const response = await addTestimonial(payload);
//     return NextResponse.json(response, {
//       status: 201,
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Add testimonial error", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to add testimonial"),
//       },
//       { status: 500 }
//     );
//   }
// }
