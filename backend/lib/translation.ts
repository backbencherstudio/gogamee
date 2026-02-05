import { redis } from "./redis";

export async function translateTextBackend(
  text: string,
  targetLanguage: string = "es",
  sourceLanguage: string = "auto",
): Promise<string> {
  if (!text) return "";
  const textStr = String(text); // Ensure it is a string
  if (sourceLanguage === targetLanguage) return textStr;

  // Generate cache key
  const cacheKey = `translate:${
    sourceLanguage || "auto"
  }:${targetLanguage}:${textStr.trim()}`;

  try {
    // 1. Check Redis Cache
    if (redis) {
      const cachedTranslation = await redis.get(cacheKey);
      if (cachedTranslation) {
        return cachedTranslation;
      }
    }

    // 2. Use free Google Translate endpoint (client=gtx)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
      sourceLanguage || "auto"
    }&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(textStr)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse 'gtx' response format
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((sentence: any) => {
        if (sentence[0]) translatedText += sentence[0];
      });
    }

    const finalResult = translatedText || textStr;

    // 3. Save to Redis Cache (TTL: 7 days)
    if (redis && finalResult) {
      await redis.set(cacheKey, finalResult, "EX", 60 * 60 * 24 * 7);
    }

    return finalResult;
  } catch (error) {
    console.error("Backend Translation error:", error);
    return textStr; // Fallback to original
  }
}
