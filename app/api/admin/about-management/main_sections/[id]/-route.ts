// import { NextResponse } from "next/server";
// import { editMainSection } from "../../../../../../backendgogame/actions/about";
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
//     const response = await editMainSection(id, payload);
//     return NextResponse.json(response, {
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Edit section error", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to update section"),
//       },
//       { status: 500 }
//     );
//   }
// }
