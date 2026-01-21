import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await AboutService.getAllWhyChooseUs();

    // Mapped to match legacy structure: { content: { whyChooseUs: { items: [] } } }
    return NextResponse.json({
      success: true,
      message: "Why choose us items fetched successfully",
      content: {
        whyChooseUs: {
          items: items.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            isActive: item.isActive,
          })),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch why choose us items" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const item = await AboutService.createWhyChooseUs({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why Choose Us item added successfully",
      data: {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        order: item.order,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        deleted_at: item.deletedAt || null,
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
          items: ourValues.map((val) => ({
            id: val._id.toString(),
            title: val.title,
            description: val.description,
            order: val.order,
            created_at: val.createdAt,
            updated_at: val.updatedAt,
            deleted_at: val.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((w) => ({
            id: w._id.toString(),
            title: w.title,
            description: w.description,
            order: w.order,
            created_at: w.createdAt,
            updated_at: w.updatedAt,
            deleted_at: w.deletedAt || null,
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
      { success: false, message: "Failed to create why choose us item" },
      { status: 500 },
    );
  }
}
