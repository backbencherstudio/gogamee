import React, { Suspense } from "react";
import PackageHero from "./components/hero/packagehero";
import PackageTable from "./components/package-table/packagetable";
import Reviews from "../home/components/review/reviews";
import {
  TestimonialService,
  StartingPriceService,
  ComparisonFeatureService,
} from "@/backend";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [
      priceFootball,
      priceBasketball,
      testimonialsData,
      fbFeatures,
      bbFeatures,
    ] = await Promise.all([
      StartingPriceService.getByType("football"),
      StartingPriceService.getByType("basketball"),
      TestimonialService.getAll({ limit: 10 }),
      ComparisonFeatureService.getByType("football"),
      ComparisonFeatureService.getByType("basketball"),
    ]);

    const initialStartingPrices = {
      football: priceFootball ? JSON.parse(JSON.stringify(priceFootball)) : null,
      basketball: priceBasketball ? JSON.parse(JSON.stringify(priceBasketball)) : null,
    };

    const initialReviews = testimonialsData.testimonials.map((t: any) => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        id: obj._id?.toString() || obj.id,
        name: obj.name,
        role: obj.role,
        image: obj.image,
        rating: obj.rating,
        review: obj.review,
        created_at: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
      };
    });

    const initialComparisonFeatures = {
      football: fbFeatures ? JSON.parse(JSON.stringify(fbFeatures.features || [])) : [],
      basketball: bbFeatures ? JSON.parse(JSON.stringify(bbFeatures.features || [])) : [],
    };

    return { 
      initialStartingPrices, 
      initialReviews,
      initialComparisonFeatures 
    };
  } catch (error) {
    console.error("Error fetching packages page data", error);
    return {
      initialStartingPrices: { football: null, basketball: null },
      initialReviews: [],
      initialComparisonFeatures: { football: [], basketball: [] }
    };
  }
}

export default async function PackagesPage() {
  const { 
    initialStartingPrices, 
    initialReviews,
    initialComparisonFeatures 
  } = await getInitialData();

  return (
    <Suspense fallback={<div><PackageHero /></div>}>
      <div className="flex flex-col">
        <PackageHero />
        <PackageTable
          initialStartingPrices={initialStartingPrices}
          initialComparisonFeatures={initialComparisonFeatures}
        />
        <Reviews initialReviews={initialReviews} />
      </div>
    </Suspense>
  );
}
