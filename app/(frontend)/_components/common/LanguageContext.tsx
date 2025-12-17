'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// Language types
export type Language = 'en' | 'es'

// Language context interface
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gogame_language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gogame_language', language)
  }, [language])

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const value: LanguageContextType = {
    language,
    setLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper function to format people count in Spanish (default)
export function formatPeopleCount(
  adultsCount: number,
  childrenCount: number,
  babiesCount: number,
  language: Language = 'es'
): string {
  const parts = []
  
  if (adultsCount > 0) {
    const adultsText = language === 'en'
      ? `${adultsCount} ${adultsCount > 1 ? 'adults' : 'adult'}`
      : `${adultsCount} ${adultsCount > 1 ? 'adultos' : 'adulto'}`
    parts.push(adultsText)
  }
  
  if (childrenCount > 0) {
    const childrenText = language === 'en'
      ? `${childrenCount} ${childrenCount > 1 ? 'children' : 'child'}`
      : `${childrenCount} ${childrenCount > 1 ? 'niños' : 'niño'}`
    parts.push(childrenText)
  }
  
  if (babiesCount > 0) {
    const babiesText = language === 'en'
      ? `${babiesCount} ${babiesCount > 1 ? 'babies' : 'baby'}`
      : `${babiesCount} ${babiesCount > 1 ? 'bebés' : 'bebé'}`
    parts.push(babiesText)
  }
  
  if (parts.length === 0) {
    return language === 'en' ? '2 adults' : '2 adultos'
  }

  return parts.join(', ')
} 