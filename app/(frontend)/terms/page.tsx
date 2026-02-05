import React from "react";
import TermsHero from "./components/termshero/termshero";
import Term from "./components/terms/terms";
import { SettingsService } from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

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
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let initialContent = await getTermsContent();

  if (initialContent && userLang !== "es") {
    initialContent = await translateTextBackend(initialContent, userLang);
  }

  return (
    <div>
      <TermsHero />
      <Term initialContent={initialContent} />
    </div>
  );
}
