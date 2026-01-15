import { NextResponse } from "next/server";
import { PackageService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

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
  const pkg = await PackageService.getById(id);

  if (!pkg) {
    return NextResponse.json(
      {
        success: false,
        message: "Package not found",
      },
      { status: 404 }
    );
  }

  // Legacy format: { success: true, message: "...", data: pkg }
  return NextResponse.json(
    {
      success: true,
      message: "Package fetched successfully",
      data: pkg,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const updated = await PackageService.updateById(id, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Package updated successfully",
        data: updated,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
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
    const response = await PackageService.deleteById(id);
    return NextResponse.json(
      {
        success: true,
        message: "Package deleted successfully",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
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
