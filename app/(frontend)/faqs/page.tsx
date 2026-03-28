import React from "react";
import FaqHero from "./components/hero/faqhero";
import Questions from "./components/questions/questions";
import { FAQService } from "@/backend";
async function getInitialFaqs() {
  try {
    const response = await FAQService.getAll({ page: 1, limit: 10 });
    if (response && response.faqs) {
      return response.faqs.map((faq: any) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder ?? faq.sort_order,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching initial FAQs", error);
    return [];
  }
}

export default async function FaqsPage() {
  const initialFaqs = await getInitialFaqs();

  return (
    <div>
      <FaqHero />
      <Questions initialFaqs={initialFaqs} />
    </div>
  );
}
