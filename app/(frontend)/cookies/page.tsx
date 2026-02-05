import React from "react";
import CookieHero from "./components/cookiehero/cookiehero";
import CookiePolicy from "./components/cookie-policy/cookiepolicy";
import { SettingsService } from "@/backend";
import { cookies } from "next/headers";
import { translateTextBackend } from "@/backend/lib/translation";

async function getCookieContent() {
  try {
    const response = await SettingsService.getAllLegalPages({
      filters: { type: "cookie", isActive: true },
    });
    if (response && response.pages && response.pages.length > 0) {
      return response.pages[0].content || "";
    }
    return "";
  } catch (error) {
    console.error("Error fetching cookie content", error);
    return "";
  }
}

export default async function Cookies() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let initialContent = await getCookieContent();

  if (initialContent && userLang !== "es") {
    initialContent = await translateTextBackend(initialContent, userLang);
  }

  return (
    <div>
      <CookieHero />
      <CookiePolicy initialContent={initialContent} />
    </div>
  );
}
