import { NextRequest } from "next/server";
import { DateManagementService, StartingPriceService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sport = (searchParams.get("sport") || "").toLowerCase();
  const league = (searchParams.get("league") || "national").toLowerCase();
  const duration = searchParams.get("duration") || "1";
  const monthsParam = searchParams.get("months");
  const yearParam = searchParams.get("year");

  if (!sport || !duration || !monthsParam || !yearParam) return sendError("Invalid parameters", 400);

  const months = monthsParam.split(",");
  const year = parseInt(yearParam);

  // 1. Fetch Default Prices from StartingPriceService
  let defaultStandard = 0;
  let defaultPremium = 0;

  try {
    if (sport === "both") {
      const [f, b] = await Promise.all([
        StartingPriceService.getByType("football"),
        StartingPriceService.getByType("basketball")
      ]);
      
      const fPrices = f?.pricesByDuration?.[duration] || { standard: 0, premium: 0 };
      const bPrices = b?.pricesByDuration?.[duration] || { standard: 0, premium: 0 };
      
      defaultStandard = (Number(fPrices.standard) || 0) + (Number(bPrices.standard) || 0);
      defaultPremium = (Number(fPrices.premium) || 0) + (Number(bPrices.premium) || 0);
    } else {
      const sp = await StartingPriceService.getByType(sport);
      const spPrices = sp?.pricesByDuration?.[duration] || { standard: 0, premium: 0 };
      
      defaultStandard = Number(spPrices.standard) || 0;
      defaultPremium = Number(spPrices.premium) || 0;
    }
  } catch (err) {
    console.error("Error fetching default prices:", err);
  }

  // 2. Fetch Custom Dates
  const { data } = await DateManagementService.getAll({ duration, sportName: sport, league, months, year });

  // 3. Map with Fallback logic
  const mapped = (data || []).map((d: any) => {
    const s = sport === "both" ? "combined" : sport;
    const config = d.sports?.[s] || {};
    
    const customStandard = Number(config.standard) || 0;
    const customPremium = Number(config.premium) || 0;

    return {
      id: d._id.toString(), 
      date: d.date, 
      duration: d.duration, 
      league: d.league,
      sportName: sport, 
      prices: { 
        // Use custom price if > 0, otherwise use default from StartingPrice
        standard: customStandard > 0 ? customStandard : defaultStandard, 
        premium: customPremium > 0 ? customPremium : defaultPremium 
      },
      status: config.status || "disabled", 
      created_at: d.createdAt, 
      updated_at: d.updatedAt
    };
  });

  // 4. Return response with global default_prices in meta_data
  return sendResponse(mapped, "Dates fetched successfully", { 
    months, 
    year,
    default_prices: {
      standard: defaultStandard,
      premium: defaultPremium
    }
  } as any);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const p = await request.json();
  if (!p.sportName || !p.date || !p.duration || !p.league) return sendError("Invalid payload", 400);

  await DateManagementService.initDate({ date: p.date, sportName: p.sportName, duration: p.duration, league: p.league });
  return sendResponse(null, "Date updated");
});

export const DELETE = withErrorHandling(async () => {
  await DateManagementService.resetDateManagement();
  return sendResponse(null, "Management reset");
});
