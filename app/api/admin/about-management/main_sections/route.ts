import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all about content
    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "About content fetched successfully",
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch about content" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const value = await AboutService.addValueToSection("main_section", {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Main section added successfully",
      data: {
        id: (value as any)._id,
        title: value.title,
        description: value.description,
        order: value.order,
      },
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create main section" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    if (!payload.headline) {
      return NextResponse.json(
        { success: false, message: "Headline is required" },
        { status: 400 },
      );
    }

    const headlineSection = await AboutService.updateHeadline(payload.headline);
    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Headline updated successfully",
      data: {
        id: headlineSection._id.toString(),
        title: headlineSection.title,
      },
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update headline" },
      { status: 500 },
    );
  }
}
