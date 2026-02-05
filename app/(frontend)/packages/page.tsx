import React, { Suspense } from "react";
import PackageHero from "./components/hero/packagehero";
import PackageTable from "./components/package-table/packagetable";
import Reviews from "../home/components/review/reviews";
import {
  PackageService,
  TestimonialService,
  StartingPriceService,
} from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [
      priceFootball,
      priceBasketball,
      priceCombined,
      packagesData,
      testimonialsData,
    ] = await Promise.all([
      StartingPriceService.getByType("football"),
      StartingPriceService.getByType("basketball"),
      StartingPriceService.getByType("combined"),
      PackageService.getAll({ limit: 1000, filters: { isActive: true } }), // Fetch ALL active packages
      TestimonialService.getAll({ limit: 10 }),
    ]);

    const priceFootballObj = priceFootball
      ? JSON.parse(JSON.stringify(priceFootball))
      : null;
    const priceBasketballObj = priceBasketball
      ? JSON.parse(JSON.stringify(priceBasketball))
      : null;
    const priceCombinedObj = priceCombined
      ? JSON.parse(JSON.stringify(priceCombined))
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
      combined: priceCombinedObj
        ? {
            id: priceCombinedObj._id,
            type: "combined" as const,
            pricesByDuration: priceCombinedObj.pricesByDuration,
            currency: priceCombinedObj.currency,
            updatedAt: priceCombinedObj.updatedAt,
          }
        : null,
    };

    const initialPackages = packagesData.packages.map((p: any) => {
      const obj = p.toObject ? p.toObject() : p;
      return {
        id: obj._id.toString(),
        sport: obj.sport,
        included: obj.included,
        plan: obj.plan,
        duration: obj.duration,
        description: obj.description,
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
      initialStartingPrices: {
        football: null,
        basketball: null,
        combined: null,
      },
      initialReviews: [],
    };
  }
}

async function translatePackagesData(
  packages: any[],
  targetLang: string,
): Promise<any[]> {
  if (targetLang === "es") return packages; // Spanish is usually source or already has _es fields

  return Promise.all(
    packages.map(async (pkg) => {
      const translatedPkg = { ...pkg };
      translatedPkg.plan = await translateTextBackend(pkg.plan, targetLang);
      translatedPkg.duration = await translateTextBackend(
        pkg.duration,
        targetLang,
      );
      translatedPkg.description = await translateTextBackend(
        pkg.description,
        targetLang,
      );
      translatedPkg.included = await translateTextBackend(
        pkg.included,
        targetLang,
      );
      return translatedPkg;
    }),
  );
}

async function translateReviewsData(
  reviews: any[],
  targetLang: string,
): Promise<any[]> {
  return Promise.all(
    reviews.map(async (review) => {
      const translatedReview = { ...review };
      translatedReview.role = await translateTextBackend(
        review.role,
        targetLang,
      );
      translatedReview.review = await translateTextBackend(
        review.review,
        targetLang,
      );
      return translatedReview;
    }),
  );
}

export default async function PackagesPage() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let { initialPackages, initialStartingPrices, initialReviews } =
    await getInitialData();

  if (userLang !== "es") {
    [initialPackages, initialReviews] = await Promise.all([
      translatePackagesData(initialPackages, userLang),
      translateReviewsData(initialReviews, userLang),
    ]);
  }

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
