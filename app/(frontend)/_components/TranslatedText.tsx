'use client'

import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

interface TranslatedTextProps {
  text: string
  english?: string // Optional English fallback to bypass API calls
  as?: keyof React.JSX.IntrinsicElements
  className?: string
}

/**
 * Shows Spanish text by default and switches to English when the language is English.
 * - If `english` is provided, it is used directly (no API call).
 * - Otherwise, it falls back to the translateText API for dynamic content.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  english,
  as: Component = 'span',
  className = '',
}) => {
  const { language, translateText } = useLanguage()
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    const translate = async () => {
      if (language === 'es') {
        setDisplayText(text)
      } else if (english) {
        setDisplayText(english)
      } else {
        const translated = await translateText(text)
        setDisplayText(translated)
      }
    }

    translate()
  }, [text, english, language, translateText])

  return <Component className={className}>{displayText}</Component>
}
