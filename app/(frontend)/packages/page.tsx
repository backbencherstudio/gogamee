import React, { Suspense } from "react";
import PackageHero from "./components/hero/packagehero";
import PackageTable from "./components/package-table/packagetable";
import Reviews from "../home/components/review/reviews";
import {
  PackageService,
  TestimonialService,
  StartingPriceService,
} from "@/backend";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [priceFootball, priceBasketball, packagesData, testimonialsData] =
      await Promise.all([
        StartingPriceService.getByType("football"),
        StartingPriceService.getByType("basketball"),
        PackageService.getAll({ limit: 1000, filters: { isActive: true } }), // Fetch ALL active packages
        TestimonialService.getAll({ limit: 10 }),
      ]);

    const priceFootballObj = priceFootball
      ? JSON.parse(JSON.stringify(priceFootball))
      : null;
    const priceBasketballObj = priceBasketball
      ? JSON.parse(JSON.stringify(priceBasketball))
      : null;

    const initialStartingPrices = {
      football: priceFootballObj
        ? {
            id: priceFootballObj._id,
            type: "football" as const,
            pricesByDuration: priceFootballObj.pricesByDuration,
            currency: priceFootballObj.currency,
            updatedAt: priceFootballObj.updatedAt,
          }
        : null,
      basketball: priceBasketballObj
        ? {
            id: priceBasketballObj._id,
            type: "basketball" as const,
            pricesByDuration: priceBasketballObj.pricesByDuration,
            currency: priceBasketballObj.currency,
            updatedAt: priceBasketballObj.updatedAt,
          }
        : null,
    };

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

    const initialReviews = testimonialsData.testimonials.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      role: t.role,
      image: t.image,
      rating: t.rating,
      review: t.review,
      created_at: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
    }));

    return { initialPackages, initialStartingPrices, initialReviews };
  } catch (error) {
    console.error("Error fetching packages page data", error);
    return {
      initialPackages: [],
      initialStartingPrices: { football: null, basketball: null },
      initialReviews: [],
    };
  }
}

export default async function PackagesPage() {
  const { initialPackages, initialStartingPrices, initialReviews } =
    await getInitialData();

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
        />
        <Reviews initialReviews={initialReviews} />
      </div>
    </Suspense>
  );
}
