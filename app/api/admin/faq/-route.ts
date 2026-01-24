// import { NextResponse } from "next/server";
// import { getAllFaqs, addFaq } from "../../../../backendgogame/actions/faq";
// import { toErrorMessage } from "../../../../backendgogame/lib/errors";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   const response = await getAllFaqs();
//   return NextResponse.json(response, {
//     headers: { "Cache-Control": "no-store" },
//   });
// }

// export async function POST(request: Request) {
//   const payload = await request.json();
//   try {
//     const response = await addFaq(payload);
//     return NextResponse.json(response, {
//       status: 201,
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Add FAQ error", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to add FAQ"),
//       },
//       { status: 500 }
//     );
//   }
// }
