import React from "react";
import PrivacyPolicy from "./components/privacy-policy/privacypolicy";
import PrivacyHero from "./components/privacyhero/privacyhero";
import { SettingsService } from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

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
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let initialContent = await getPrivacyContent();

  if (initialContent && userLang !== "es") {
    initialContent = await translateTextBackend(initialContent, userLang);
  }

  return (
    <div>
      <PrivacyHero />
      <PrivacyPolicy initialContent={initialContent} />
    </div>
  );
}
