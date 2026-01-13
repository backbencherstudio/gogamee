import { NextResponse } from "next/server";
import {
  getPackageById,
  editPackage,
  deletePackage,
} from "../../../../backendgogame/actions/packages";
import { toErrorMessage } from "../../../../backendgogame/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function GET(_: Request, context: RouteContext) {
  const id = await getId(context);
  const response = await getPackageById(id);
  const status = response.success ? 200 : 404;
  return NextResponse.json(response, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const response = await editPackage(id, payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Edit package error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update package"),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    const response = await deletePackage(id);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Delete package error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to delete package"),
      },
      { status: 500 }
    );
  }
}

