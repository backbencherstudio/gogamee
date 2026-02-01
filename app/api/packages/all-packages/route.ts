import { NextRequest } from "next/server";
import { PackageService } from "@/backend";
import {
  sendResponse,
  sendError,
  sendPaginatedResponse,
} from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? undefined;

  try {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { packages, total } = await PackageService.getAll({
      filters: sport ? { sport, isActive: true } : { isActive: true },
      limit,
      page,
    });

    const mappedPackages = packages.map((p: any) => {
      const obj = p.toObject();
      return {
        id: obj._id.toString(),
        sport: obj.sport,
        included: obj.included,
        ...(obj.included_es && { included_es: obj.included_es }), // Only include if exists
        plan: obj.plan,
        duration: obj.duration,
        description: obj.description,
        ...(obj.description_es && { description_es: obj.description_es }), // Only include if exists
        standardPrice: obj.standardPrice,
        premiumPrice: obj.premiumPrice,
        currency: obj.currency,
        isActive: obj.isActive,
        sortOrder: obj.sortOrder,
      };
    });

    return sendPaginatedResponse(
      mappedPackages,
      total,
      page,
      limit,
      "Packages fetched successfully",
    );
  } catch (error) {
    return sendError("Failed to fetch packages", 500, error);
  }
}
