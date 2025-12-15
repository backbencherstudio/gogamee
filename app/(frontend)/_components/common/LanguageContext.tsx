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
  const [language, setLanguageState] = useState<Language>('en')

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
  babiesCount: number
): string {
  const parts = []
  
  if (adultsCount > 0) {
    const adultsText = `${adultsCount} ${adultsCount > 1 ? 'adultos' : 'adulto'}`
    parts.push(adultsText)
  }
  
  if (childrenCount > 0) {
    const childrenText = `${childrenCount} ${childrenCount > 1 ? 'niños' : 'niño'}`
    parts.push(childrenText)
  }
  
  if (babiesCount > 0) {
    const babiesText = `${babiesCount} ${babiesCount > 1 ? 'bebés' : 'bebé'}`
    parts.push(babiesText)
  }
  
  return parts.length > 0 ? parts.join(', ') : '2 adultos'
} 