import React from "react";
import { cookies } from "next/headers";
import AboutTop from "./components/abouttop";
import AboutPage from "./components/aboutpage";
import { AboutService } from "@/backend";
import { AboutContent } from "@/services/aboutService";
export const dynamic = "force-dynamic";

async function getInitialData() {
  try {
    const content = await AboutService.getAllAboutContent();
    return content as AboutContent; // Type assertion
  } catch (error) {
    console.error("Error fetching about page data", error);
    return null;
  }
}

export default async function Page() {
  const initialContent = await getInitialData();

  return (
    <>
      <AboutTop />
      <AboutPage initialContent={initialContent as AboutContent} />
    </>
  );
}
