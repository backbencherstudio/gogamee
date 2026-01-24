// import { NextResponse } from "next/server";
// import {
//   updateDate,
//   deleteDate,
// } from "../../../../../backendgogame/actions/dateManagement";
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

// export async function PATCH(request: Request, context: RouteContext) {
//   try {
//     const payload = await request.json();
//     const id = await getId(context);

//     console.log("PATCH /api/admin/date-management/[id] - Request:", {
//       id,
//       payload,
//       payloadKeys: Object.keys(payload)
//     });

//     const updated = await updateDate(id, payload);

//     console.log("PATCH /api/admin/date-management/[id] - Success:", {
//       id,
//       updatedId: updated.id
//     });

//     return NextResponse.json(updated, {
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("PATCH /api/admin/date-management/[id] - Error:", error);
//     console.error("Error details:", {
//       message: error instanceof Error ? error.message : "Unknown error",
//       stack: error instanceof Error ? error.stack : undefined,
//       name: error instanceof Error ? error.name : undefined
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to update date"),
//         error: error instanceof Error ? error.message : "Unknown error"
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_: Request, context: RouteContext) {
//   try {
//     const id = await getId(context);
//     await deleteDate(id);
//     return new NextResponse(null, {
//       status: 204,
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error: unknown) {
//     console.error("Delete date error", error);
//     return NextResponse.json(
//       { message: toErrorMessage(error, "Failed to delete date") },
//       { status: 500 }
//     );
//   }
// }
