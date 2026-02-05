import React from "react";
import FaqHero from "./components/hero/faqhero";
import Questions from "./components/questions/questions";
import { FAQService } from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

async function getInitialFaqs() {
  try {
    const response = await FAQService.getAll({ page: 1, limit: 10 });
    if (response && response.faqs) {
      return response.faqs.map((faq: any) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching initial FAQs", error);
    return [];
  }
}

async function translateFaqs(faqs: any[], targetLang: string) {
  if (targetLang === "es") return faqs;

  return Promise.all(
    faqs.map(async (faq) => ({
      ...faq,
      question: await translateTextBackend(faq.question, targetLang),
      answer: await translateTextBackend(faq.answer, targetLang),
    })),
  );
}

export default async function FaqsPage() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let initialFaqs = await getInitialFaqs();

  if (userLang !== "es") {
    initialFaqs = await translateFaqs(initialFaqs, userLang);
  }

  return (
    <div>
      <FaqHero />
      <Questions initialFaqs={initialFaqs} />
    </div>
  );
}
