import React from "react";
import CookieHero from "./components/cookiehero/cookiehero";
import CookiePolicy from "./components/cookie-policy/cookiepolicy";
import { SettingsService } from "@/backend";

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
  const initialContent = await getCookieContent();

  return (
    <div>
      <CookieHero />
      <CookiePolicy initialContent={initialContent} />
    </div>
  );
}
