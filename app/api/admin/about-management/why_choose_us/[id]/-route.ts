// import { NextResponse } from "next/server";
// import { editWhyChooseUs } from "../../../../../../backendgogame/actions/about";
// import { toErrorMessage } from "../../../../../../backendgogame/lib/errors";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// interface RouteContext {
//   params: Promise<{ id: string }>;
// }

// export async function PUT(request: Request, context: RouteContext) {
//   const payload = await request.json();
//   try {
//     const { id } = await context.params;
//     const response = await editWhyChooseUs(id, payload);
//     return NextResponse.json(response, {
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Edit why choose us error", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to update why choose us item"),
//       },
//       { status: 500 }
//     );
//   }
// }
