"use client";

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
      aria-label="Toggle language"
    >
      <Languages className="w-5 h-5" />
      <span className="font-medium">
        {language === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
};

