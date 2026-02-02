"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en"; // Spanish (default) or English

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("es"); // Default Spanish
  const [isTranslating, setIsTranslating] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage") as Language;
    if (saved === "en" || saved === "es") {
      setLanguage(saved);
      document.cookie = `user_lang=${saved}; path=/; max-age=31536000`;
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "es" ? "en" : "es";
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
    // Set cookie for SSR (expires in 1 year)
    document.cookie = `user_lang=${newLang}; path=/; max-age=31536000`;
  };

  const translateText = async (text: string): Promise<string> => {
    // Return original if no text provided
    if (!text || text.trim() === "") {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${language}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);

      // Call translation API with auto-detection for source language
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          targetLanguage: language,
          sourceLanguage: "auto",
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      const translated = data.translatedText || text;

      // Cache the translation
      translationCache.set(cacheKey, translated);

      return translated;
    } catch (error) {
      console.error("Translation error:", error);
      // Return original text if translation fails
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, translateText, isTranslating }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Helper function to format people count
export function formatPeopleCount(
  adultsCount: number,
  childrenCount: number,
  babiesCount: number,
  language: Language = "es",
): string {
  const parts = [];

  if (adultsCount > 0) {
    const adultsText =
      language === "en"
        ? `${adultsCount} ${adultsCount > 1 ? "adults" : "adult"}`
        : `${adultsCount} ${adultsCount > 1 ? "adultos" : "adulto"}`;
    parts.push(adultsText);
  }

  if (childrenCount > 0) {
    const childrenText =
      language === "en"
        ? `${childrenCount} ${childrenCount > 1 ? "children" : "child"}`
        : `${childrenCount} ${childrenCount > 1 ? "niños" : "niño"}`;
    parts.push(childrenText);
  }

  if (babiesCount > 0) {
    const babiesText =
      language === "en"
        ? `${babiesCount} ${babiesCount > 1 ? "babies" : "baby"}`
        : `${babiesCount} ${babiesCount > 1 ? "bebés" : "bebé"}`;
    parts.push(babiesText);
  }

  if (parts.length === 0) {
    return language === "en" ? "2 adults" : "2 adultos";
  }

  return parts.join(", ");
}
