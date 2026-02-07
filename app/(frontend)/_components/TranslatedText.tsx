"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";

interface TranslatedTextProps {
  text: string; // Source text (can be in any language)
  english?: string; // Optional fallback for English (used if API fails)
  spanish?: string; // Optional fallback for Spanish (used if API fails)
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  skipTranslation?: boolean; // If true, use fallbacks directly without API
}

/**
 * Auto-translates text to the current language (Spanish by default).
 *
 * Features:
 * - Source text can be in ANY language (auto-detected)
 * - Translates on-the-fly using API
 * - Caches translations for performance
 * - Falls back to provided props if API fails
 *
 * Usage:
 * - <TranslatedText text="Hello World" /> - Auto translates to current language
 * - <TranslatedText text="Hola Mundo" spanish="Hola Mundo" english="Hello World" skipTranslation /> - Uses provided translations
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  english,
  spanish,
  as: Component = "span",
  className = "",
  skipTranslation = false,
}) => {
  const { language, translateText, translateToBoth } = useLanguage();
  const [displayText, setDisplayText] = useState(text);
  const [translations, setTranslations] = useState<{
    es: string;
    en: string;
  } | null>(null);
  const hasTranslatedRef = useRef(false);
  const lastTextRef = useRef(text);

  useEffect(() => {
    // Reset if text changes
    if (lastTextRef.current !== text) {
      hasTranslatedRef.current = false;
      lastTextRef.current = text;
    }

    const translate = async () => {
      // If skipTranslation is true, use provided fallbacks directly
      if (skipTranslation) {
        if (language === "es" && spanish) {
          setDisplayText(spanish);
        } else if (language === "en" && english) {
          setDisplayText(english);
        } else {
          setDisplayText(text);
        }
        return;
      }

      // If we already have cached translations for this text, use them
      if (translations && hasTranslatedRef.current) {
        setDisplayText(language === "en" ? translations.en : translations.es);
        return;
      }

      // Translate to both languages on first load
      if (!hasTranslatedRef.current) {
        hasTranslatedRef.current = true;

        try {
          const result = await translateToBoth(text);
          setTranslations(result);
          setDisplayText(language === "en" ? result.en : result.es);
        } catch {
          // Fallback to provided props or original text
          if (language === "es") {
            setDisplayText(spanish || text);
          } else {
            setDisplayText(english || text);
          }
        }
      } else if (translations) {
        // Just switch display based on language
        setDisplayText(language === "en" ? translations.en : translations.es);
      }
    };

    translate();
  }, [
    text,
    english,
    spanish,
    language,
    translateText,
    translateToBoth,
    translations,
    skipTranslation,
  ]);

  return <Component className={className}>{displayText}</Component>;
};
