// import { NextResponse } from "next/server";
// import {
//   getLegalPages,
// } from "../../../../../backendgogame/actions/settings";
// import { toErrorMessage } from "../../../../../backendgogame/lib/errors";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   try {
//     const response = await getLegalPages();
//     return NextResponse.json(response, {
//       headers: { "Cache-Control": "no-store" },
//     });
//   } catch (error) {
//     console.error("Error fetching legal pages:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: toErrorMessage(error, "Failed to fetch legal pages"),
//       },
//       { status: 500 }
//     );
//   }
// }
