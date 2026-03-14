import React, { Suspense } from "react";
import PackageHero from "./components/hero/packagehero";
import PackageTable from "./components/package-table/packagetable";
import Reviews from "../home/components/review/reviews";
import {
  PackageService,
  TestimonialService,
  StartingPriceService,
  ComparisonFeatureService,
} from "@/backend";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [
      priceFootball,
      priceBasketball,
      priceCombined,
      testimonialsData,
      fbFeatures,
      bbFeatures,
    ] = await Promise.all([
      StartingPriceService.getByType("football"),
      StartingPriceService.getByType("basketball"),
      StartingPriceService.getByType("combined"),
      TestimonialService.getAll({ limit: 10 }),
      ComparisonFeatureService.getByType("football"),
      ComparisonFeatureService.getByType("basketball"),
    ]);

    const priceFootballObj = priceFootball
      ? JSON.parse(JSON.stringify((priceFootball as any).toObject ? (priceFootball as any).toObject() : priceFootball))
      : null;
    const priceBasketballObj = priceBasketball
      ? JSON.parse(JSON.stringify((priceBasketball as any).toObject ? (priceBasketball as any).toObject() : priceBasketball))
      : null;
    const priceCombinedObj = priceCombined
      ? JSON.parse(JSON.stringify((priceCombined as any).toObject ? (priceCombined as any).toObject() : priceCombined))
      : null;

    const fbFeaturesObj = fbFeatures
      ? JSON.parse(JSON.stringify((fbFeatures as any).toObject ? (fbFeatures as any).toObject() : fbFeatures))
      : null;
    const bbFeaturesObj = bbFeatures
      ? JSON.parse(JSON.stringify((bbFeatures as any).toObject ? (bbFeatures as any).toObject() : bbFeatures))
      : null;

    const initialStartingPrices = {
      football: priceFootballObj
        ? {
            id: priceFootballObj._id.toString(),
            type: "football" as const,
            pricesByDuration: priceFootballObj.pricesByDuration,
            currency: priceFootballObj.currency,
            updatedAt: priceFootballObj.updatedAt,
          }
        : null,
      basketball: priceBasketballObj
        ? {
            id: priceBasketballObj._id.toString(),
            type: "basketball" as const,
            pricesByDuration: priceBasketballObj.pricesByDuration,
            currency: priceBasketballObj.currency,
            updatedAt: priceBasketballObj.updatedAt,
          }
        : null,
      combined: priceCombinedObj
        ? {
            id: priceCombinedObj._id.toString(),
            type: "combined" as const,
            pricesByDuration: priceCombinedObj.pricesByDuration,
            currency: priceCombinedObj.currency,
            updatedAt: priceCombinedObj.updatedAt,
          }
        : null,
    };

    /* Commented out as per user request
    const initialPackages = packagesData.packages.map((p: any) => {
      const obj = p.toObject ? p.toObject() : p;
      return {
        id: obj._id.toString(),
        sport: obj.sport,
        included: obj.included,
        included_es: obj.included_es,
        plan: obj.plan,
        duration: obj.duration,
        description: obj.description,
        description_es: obj.description_es,
        standardPrice: obj.standardPrice,
        premiumPrice: obj.premiumPrice,
        currency: obj.currency,
      };
    });
    */
    const initialPackages: any[] = [];

    const initialReviews = testimonialsData.testimonials.map((t: any) => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        id: obj._id.toString(),
        name: obj.name,
        role: obj.role,
        image: obj.image,
        rating: obj.rating,
        review: obj.review,
        created_at: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
      };
    });

    const initialComparisonFeatures = {
      football: fbFeaturesObj?.features || [],
      basketball: bbFeaturesObj?.features || [],
    };

    // DEBUG LOG
    console.log(`PackagesPage - Loaded ${initialPackages.length} packages (Disabled fetch)`);
    console.log(`PackagesPage - FB Features: ${initialComparisonFeatures.football.length}`);

    return { 
      initialPackages, 
      initialStartingPrices, 
      initialReviews,
      initialComparisonFeatures 
    };
  } catch (error) {
    console.error("Error fetching packages page data", error);
    return {
      initialPackages: [],
      initialStartingPrices: {
        football: null,
        basketball: null,
        combined: null,
      },
      initialReviews: [],
    };
  }
}

export default async function PackagesPage() {
  const { 
    initialPackages, 
    initialStartingPrices, 
    initialReviews,
    initialComparisonFeatures 
  } = await getInitialData();

  return (
    <Suspense
      fallback={
        <div>
          <PackageHero />
        </div>
      }
    >
      <div>
        <PackageHero />
        <PackageTable
          initialPackages={initialPackages}
          initialStartingPrices={initialStartingPrices}
          initialComparisonFeatures={initialComparisonFeatures}
        />
        <Reviews initialReviews={initialReviews} />
      </div>
    </Suspense>
  );
}
