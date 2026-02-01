import React, { Suspense } from "react";
import HeroSection from "./components/Hero/herosection";
import HowItWorks from "./components/howitworks/howitworks";
import Leagues from "./components/leagues/leagues";
import Reviews from "./components/review/reviews";
import Faq from "./components/faq/faq";
import Mailus from "./components/mailus/mailus";
import { FAQService, TestimonialService } from "@/backend";

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
    console.error("Error fetching home page data:", error);
    return { initialFaqs: [], initialReviews: [] };
  }
}

export default async function HomePage() {
  const { initialFaqs, initialReviews } = await getInitialData();

  return (
    <Suspense
      fallback={
        <div className="w-full">
          <HeroSection />
        </div>
      }
    >
      <div className=" w-full ">
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
