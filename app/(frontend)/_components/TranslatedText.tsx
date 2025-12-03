"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TranslatedTextProps {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

/**
 * Component that automatically translates Spanish text to English when language is toggled
 * Does NOT translate if language is Spanish (shows original content)
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  as: Component = 'span',
  className = ''
}) => {
  const { language, translateText } = useLanguage();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const translate = async () => {
      if (language === 'es') {
        // If Spanish, show original text (no translation)
        setDisplayText(text);
      } else {
        // If English, translate from Spanish to English
        const translated = await translateText(text);
        setDisplayText(translated);
      }
    };

    translate();
  }, [text, language, translateText]);

  return <Component className={className}>{displayText}</Component>;
};

