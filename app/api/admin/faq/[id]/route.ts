import { NextResponse } from "next/server";
import { editFaq, deleteFaq } from "../../../../../backendgogame/actions/faq";
import { toErrorMessage } from "../../../../../backendgogame/lib/errors";

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
    const response = await editFaq(id, payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Edit FAQ error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update FAQ"),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    const response = await deleteFaq(id);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Delete FAQ error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to delete FAQ"),
      },
      { status: 500 }
    );
  }
}

