import React, { Suspense } from "react";
import HeroSection from "./home/components/Hero/herosection";
import Faq from "./home/components/faq/faq";
import HowItWorks from "./home/components/howitworks/howitworks";
import Leagues from "./home/components/leagues/leagues";
import Reviews from "./home/components/review/reviews";
import Mailus from "./home/components/mailus/mailus";
import PaymentNotification from "./_components/PaymentNotification";
import { FAQService, SettingsService, TestimonialService } from "@/backend";

export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const [faqData, testimonialData, homepageContent] = await Promise.all([
      FAQService.getAll({ limit: 5 }),
      TestimonialService.getAll({ limit: 10 }),
      SettingsService.getHomepageContent(),
    ]);

    const initialFaqs = faqData.faqs.map((f: any) => ({
      id: f._id?.toString() || f.id || "",
      question: f.question,
      answer: f.answer,
      sort_order: f.sortOrder || 0,
    }));

    const initialReviews = testimonialData.testimonials.map((t: any) => ({
      id: t._id?.toString() || t.id || "",
      name: t.name,
      role: t.role,
      image: t.image,
      rating: t.rating,
      review: t.review,
      created_at: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
    }));

    return { initialFaqs, initialReviews, homepageContent };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { initialFaqs: [], initialReviews: [], homepageContent: null };
  }
}

export default async function HomePage() {
  const { initialFaqs, initialReviews, homepageContent } =
    await getInitialData();

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
          <HeroSection content={homepageContent} />
          <HowItWorks content={homepageContent} />
          <Leagues />
          <Reviews initialReviews={initialReviews} />
          <Faq className="w-full bg-[#FCFEFB]" initialFaqs={initialFaqs} />
          <Mailus />
        </div>
      </div>
    </Suspense>
  );
}
