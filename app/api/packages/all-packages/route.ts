import { NextRequest } from "next/server";
import { PackageService } from "@/backend";
import { sendPaginatedResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { packages, total } = await PackageService.getAll({
    filters: sport ? { sport, isActive: true } : { isActive: true },
    limit, page
  });

  const list = packages.map((p: any) => ({
    id: p.id, sport: p.sport, included: p.included, included_es: p.included_es,
    plan: p.plan, duration: p.duration, description: p.description, 
    description_es: p.description_es, standardPrice: p.standardPrice, 
    premiumPrice: p.premiumPrice, currency: p.currency, isActive: p.isActive, sortOrder: p.sortOrder
  }));

  return sendPaginatedResponse(list, total, page, limit, "Packages fetched successfully");
});
