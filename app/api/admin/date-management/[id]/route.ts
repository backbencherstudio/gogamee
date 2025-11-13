import { NextResponse } from "next/server";
import {
  updateDate,
  deleteDate,
} from "../../../../../backend/actions/dateManagement";
import { toErrorMessage } from "../../../../../backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const updated = await updateDate(id, payload);
    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update date error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update date") },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    await deleteDate(id);
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Delete date error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to delete date") },
      { status: 500 }
    );
  }
}

