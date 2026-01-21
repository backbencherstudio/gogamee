import { NextResponse } from "next/server";
import { TestimonialService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

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
  const response = await TestimonialService.getById(id);
  const status = response ? 200 : 404;
  return NextResponse.json(
    { success: !!response, testimonial: response },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const response = await TestimonialService.updateById(id, payload);
    return NextResponse.json(
      { success: true, testimonial: response },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    console.error("Update testimonial error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update testimonial"),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    await TestimonialService.deleteById(id);
    return NextResponse.json(
      { success: true },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    console.error("Delete testimonial error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to delete testimonial"),
      },
      { status: 500 },
    );
  }
}
