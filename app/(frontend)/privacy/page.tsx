import React from "react";
import PrivacyPolicy from "./components/privacy-policy/privacypolicy";
import PrivacyHero from "./components/privacyhero/privacyhero";
import { SettingsService } from "@/backend";

async function getPrivacyContent() {
  try {
    const response = await SettingsService.getAllLegalPages({
      filters: { type: "privacy", isActive: true },
    });
    if (response && response.pages && response.pages.length > 0) {
      return response.pages[0].content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching privacy content", error);
    return "";
  }
}

export default async function Privacy() {
  const initialContent = await getPrivacyContent();

  return (
    <div>
      <PrivacyHero />
      <PrivacyPolicy initialContent={initialContent} />
    </div>
  );
}
