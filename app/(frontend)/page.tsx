import React, { Suspense } from "react";
import HeroSection from "./home/components/Hero/herosection";
import Faq from "./home/components/faq/faq";
import HowItWorks from "./home/components/howitworks/howitworks";
import Leagues from "./home/components/leagues/leagues";
import Reviews from "./home/components/review/reviews";
import Mailus from "./home/components/mailus/mailus";
import PaymentNotification from "./_components/PaymentNotification";
import { FAQService, TestimonialService } from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [faqData, testimonialData] = await Promise.all([
      FAQService.getAll({ limit: 5 }),
      TestimonialService.getAll({ limit: 10 }),
    ]);

    const initialFaqs = faqData.faqs.map((f: any) => ({
      id: f._id.toString(),
      question: f.question,
      answer: f.answer,
      sort_order: f.sortOrder || 0,
    }));

    const initialReviews = testimonialData.testimonials.map((t: any) => ({
      id: t._id.toString(),
      name: t.name,
      role: t.role,
      image: t.image,
      rating: t.rating,
      review: t.review,
      created_at: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
    }));

    return { initialFaqs, initialReviews };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { initialFaqs: [], initialReviews: [] };
  }
}

async function translateFaqs(faqs: any[], targetLang: string) {
  if (targetLang === "es") return faqs;
  return Promise.all(
    faqs.map(async (f) => ({
      ...f,
      question: await translateTextBackend(f.question, targetLang),
      answer: await translateTextBackend(f.answer, targetLang),
    })),
  );
}

async function translateReviews(reviews: any[], targetLang: string) {
  if (targetLang === "es") return reviews;
  return Promise.all(
    reviews.map(async (r) => ({
      ...r,
      role: await translateTextBackend(r.role, targetLang),
      review: await translateTextBackend(r.review, targetLang),
    })),
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let { initialFaqs, initialReviews } = await getInitialData();

  if (userLang !== "es") {
    [initialFaqs, initialReviews] = await Promise.all([
      translateFaqs(initialFaqs, userLang),
      translateReviews(initialReviews, userLang),
    ]);
  }

  return (
    <Suspense
      fallback={
        <div className="w-full">
          <HeroSection />
        </div>
      }
    >
      <div className=" w-full ">
        <PaymentNotification />
        <div className="">
          <HeroSection />
          <HowItWorks />
          <Leagues />
          <Reviews initialReviews={initialReviews} />
          <Faq className="w-full bg-[#FCFEFB]" initialFaqs={initialFaqs} />
          <Mailus />
        </div>
      </div>
    </Suspense>
  );
}
