import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const values = await AboutService.getAllOurValues();

    // Mapped to match legacy structure: { content: { values: { items: [] } } }
    return NextResponse.json({
      success: true,
      message: "Our values fetched successfully",
      content: {
        values: {
          items: values.map((value) => ({
            id: value._id.toString(),
            title: value.title,
            description: value.description,
            order: value.order,
            isActive: value.isActive,
          })),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch our values" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const value = await AboutService.createOurValue({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Value created successfully",
      data: {
        id: value._id.toString(),
        title: value.title,
        description: value.description,
        order: value.order,
        created_at: value.createdAt,
        updated_at: value.updatedAt,
        deleted_at: value.deletedAt || null,
      },
      content: {
        headline: "Experience unforgettable live sports adventures.",
        sections: mainSections.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          description: s.description,
          order: s.order,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
          deleted_at: s.deletedAt || null,
        })),
        values: {
          title: "Our Values",
          items: ourValues.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        meta: {
          version: 1,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create our value" },
      { status: 500 },
    );
  }
}
