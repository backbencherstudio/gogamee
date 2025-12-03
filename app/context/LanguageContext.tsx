"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en'; // Spanish (default) or English

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  translateText: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es'); // Default Spanish
  const [isTranslating, setIsTranslating] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') as Language;
    if (saved === 'en' || saved === 'es') {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  const translateText = async (text: string): Promise<string> => {
    // If language is Spanish, return original text (no translation needed)
    if (language === 'es' || !text || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${language}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      setIsTranslating(true);
      
      // Call Google Translate API via our API route
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: language,
          sourceLanguage: 'es',
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translated = data.translatedText || text;
      
      // Cache the translation
      translationCache.set(cacheKey, translated);
      
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text if translation fails
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, translateText, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

