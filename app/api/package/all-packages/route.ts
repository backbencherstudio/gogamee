import { NextResponse } from "next/server";
import { PackageService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? undefined;

  try {
    const { packages } = await PackageService.getAll({
      filters: sport ? { sport, isActive: true } : { isActive: true },
      limit: 1000,
    });

    // Mapped to match legacy response format
    // Mapped to match legacy response format
    // Mapped to match legacy response format
    // Mapped to match legacy response format
    // Mapped to match legacy response format
    const mappedPackages = packages.map((p: any) => {
      const obj = p.toObject();
      return {
        id: obj._id.toString(),
        sport: obj.sport,
        category: obj.category,
        standard: obj.standard,
        premium: obj.premium,
        standardPrice: obj.standardPrice,
        premiumPrice: obj.premiumPrice,
        currency: obj.currency,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Packages fetched successfully",
        list: mappedPackages, // Legacy compatible
        count: packages.length,
        filter: sport ? { sport } : undefined,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch packages"),
      },
      { status: 500 }
    );
  }
}
