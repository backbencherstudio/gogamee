import React from "react";
import { cookies } from "next/headers";
import AboutTop from "./components/abouttop";
import AboutPage from "./components/aboutpage";
import { AboutService } from "@/backend";
import { AboutContent } from "@/services/aboutService";
import { translateTextBackend } from "@/backend/lib/translation";

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

// Helper to translate deep object structure
async function translateAboutContent(
  content: AboutContent,
  targetLang: string,
): Promise<AboutContent> {
  if (targetLang === "es") return content; // Assuming DB is 'es' or we trust client to handle it if mixed?
  // Actually usually DB is 'es' or 'en' mixed. But backend translation handles 'auto'.
  // If target is 'es', and source is 'es', it returns original.
  // If we just want to ensure it matches user lang, we run it.

  // Parallelize top-level translations
  const [headline, sections, values, whyChooseUs] = await Promise.all([
    translateTextBackend(content.headline || "", targetLang),
    Promise.all(
      (content.sections || []).map(async (s) => ({
        ...s,
        title: await translateTextBackend(s.title, targetLang),
        description: await translateTextBackend(s.description, targetLang),
      })),
    ),
    Promise.all(
      (content.values?.items || []).map(async (v) => ({
        ...v,
        title: await translateTextBackend(v.title, targetLang),
        description: await translateTextBackend(v.description, targetLang),
      })),
    ),
    Promise.all(
      (content.whyChooseUs?.items || []).map(async (w) => ({
        ...w,
        title: await translateTextBackend(w.title, targetLang),
        description: await translateTextBackend(w.description, targetLang),
      })),
    ),
  ]);

  return {
    ...content,
    headline,
    sections,
    values: {
      ...content.values,
      title: content.values?.title || "",
      items: values,
    },
    whyChooseUs: {
      ...content.whyChooseUs,
      title: content.whyChooseUs?.title || "",
      items: whyChooseUs,
    },
  };
}

export default async function Page() {
  const cookieStore = await cookies();
  const userLang = cookieStore.get("user_lang")?.value || "es";

  let initialContent = await getInitialData();

  if (initialContent) {
    // Perform SSR translation
    // We assume source is 'auto' handled by translateTextBackend
    initialContent = await translateAboutContent(initialContent, userLang);
  }

  return (
    <>
      <AboutTop headline={initialContent?.headline} />
      <AboutPage initialContent={initialContent as AboutContent} />
    </>
  );
}
