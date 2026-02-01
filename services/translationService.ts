import axiosClient from "../lib/axiosClient";

export interface TranslationResponse {
  success: boolean;
  translatedText: string;
}

/**
 * Translates text on-the-fly using the backend translate API.
 * Uses auto-detection for source language by default.
 */
export const translateText = async (
  text: string,
  targetLang: string = "es",
  sourceLang: string = "auto",
): Promise<string> => {
  if (!text || text.trim() === "") return text;

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
      }),
    });

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error("Translation service failed:", error);
    return text;
  }
};

/**
 * Detects the language of a text and returns both original and translated versions.
 * Useful for dashboard auto-filling.
 */
export const autoTranslateContent = async (text: string) => {
  if (!text || text.trim() === "") return { en: "", es: "" };

  // 1. Translate to Spanish (assume input might be English)
  const toEs = await translateText(text, "es", "auto");

  // 2. Translate to English (assume input might be Spanish)
  const toEn = await translateText(text, "en", "auto");

  // Logic: if input was English, toEn will be similar to original.
  // If input was Spanish, toEs will be similar to original.
  // However, the gtx API is good enough that we can just return both.

  return {
    en: toEn,
    es: toEs,
  };
};
