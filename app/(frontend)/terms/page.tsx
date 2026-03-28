import React from "react";
import TermsHero from "./components/termshero/termshero";
import TermsContent from "./components/terms/terms";
import { SettingsService } from "@/backend";

async function getTermsContent() {
  try {
    const response = await SettingsService.getAllLegalPages({
      filters: { type: "terms", isActive: true },
    });
    if (response && response.pages && response.pages.length > 0) {
      return response.pages[0].content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching terms content", error);
    return "";
  }
}

export default async function Terms() {
  const initialContent = await getTermsContent();

  return (
    <div>
      <TermsHero />
      <TermsContent initialContent={initialContent} />
    </div>
  );
}
