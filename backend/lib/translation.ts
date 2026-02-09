import { redis } from "./redis";

export async function translateTextBackend(
  text: string,
  targetLanguage: string = "es",
  sourceLanguage: string = "auto",
): Promise<string> {
  if (!text) return "";
  const textStr = String(text).trim(); // Ensure it is a string and trimmed
  if (!textStr) return "";

  if (sourceLanguage !== "auto" && sourceLanguage === targetLanguage)
    return textStr;

  // Generate cache key
  const cacheKey = `translate:${
    sourceLanguage || "auto"
  }:${targetLanguage}:${textStr}`;

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

    // Check detected language if source was auto
    if (sourceLanguage === "auto" && data && data[2]) {
      const detectedLang = data[2];
      // API might return 'es' or 'es-ES', so we check includes or simple equality
      if (
        detectedLang === targetLanguage ||
        detectedLang.startsWith(targetLanguage + "-")
      ) {
        // Detected language matches target; return original text.
        // We should cache this result to avoid re-checking API.
        const finalResult = textStr;
        if (redis) {
          await redis.set(cacheKey, finalResult, "EX", 60 * 60 * 24 * 7);
        }
        return finalResult;
      }
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
