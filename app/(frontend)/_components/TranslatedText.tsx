"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

interface TranslatedTextProps {
  text: string;
  english?: string; // Optional English fallback to bypass API calls
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

/**
 * Shows Spanish text by default and switches to English when the language is English.
 * - If `english` is provided, it is used directly (no API call).
 * - Otherwise, it falls back to the translateText API for dynamic content.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  english,
  as: Component = "span",
  className = "",
}) => {
  const { language, translateText } = useLanguage();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const translate = async () => {
      // Logic update:
      // If 'english' prop is missing, we treat it as dynamic source content.
      // We call translateText for dynamic content to handle mixed source languages,
      // relying on the backend's 'auto' detection logic.
      // The Redis cache handles efficiency.

      const isDynamicSource = !english;

      if (isDynamicSource) {
        // Always attempt translation for dynamic content to support auto-detection
        // even when target matches presumed source, because we don't actually know the source.
        const translated = await translateText(text);
        setDisplayText(translated);
      } else {
        // Source is Spanish (Legacy Frontend Pattern) where 'text' is ES and 'english' is EN fallback
        if (language === "es") {
          setDisplayText(text);
        } else if (english) {
          setDisplayText(english);
        } else {
          // Provide fallback if language is neither ES nor EN or if we want to force API
          const translated = await translateText(text);
          setDisplayText(translated);
        }
      }
    };

    translate();
  }, [text, english, language, translateText]);

  return <Component className={className}>{displayText}</Component>;
};
