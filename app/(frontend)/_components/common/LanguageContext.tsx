'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// Language types
export type Language = 'en' | 'es'

// Translation interface
interface Translations {
  // Menu translations
  menu: {
    home: string
    packages: string
    faqs: string
    contactUs: string
  }
  // Hero section translations
  hero: {
    title: string
    subtitle: string
    packType: string
    departure: string
    howManyAreYou: string
    startTheGame: string
    adults: string
    children: string
    babies: string
    adultsAge: string
    childrenAge: string
    babiesAge: string
    total: string
    people: string
    // Sports
    football: string
    basketball: string
    both: string
    // Pack types
    standard: string
    premium: string
  }
  // Footer translations
  footer: {
    description: string
    quickLink: string
    packs: string
    standardPack: string
    premiumPack: string
    socialMedia: string
    tiktok: string
    instagram: string
    whatsapp: string
    copyright: string
    privacyPolicy: string
    cookiePolicy: string
    termsConditions: string
  }
  // Common translations
  common: {
    from: string
  }
}

// Translation data
const translations: Record<Language, Translations> = {
  en: {
    menu: {
      home: 'Home',
      packages: 'Packages',
      faqs: 'FAQs',
      contactUs: 'Contact us'
    },
    hero: {
      title: 'Are you ready to experience sports like never before?',
      subtitle: 'Let your passion for soccer or basketball take you to an unexpected place. The destination is a surprise.',
      packType: 'Pack type:',
      departure: 'Departure:',
      howManyAreYou: 'How many are you?:',
      startTheGame: 'Start the game',
      adults: 'Adults',
      children: 'Children',
      babies: 'Babies',
      adultsAge: '12 years or older',
      childrenAge: '2 to 11 years',
      babiesAge: '0 to 2 years',
      total: 'Total',
      people: 'people',
      football: 'Football',
      basketball: 'Basketball',
      both: 'Both',
      standard: 'Standard',
      premium: 'Premium'
    },
    footer: {
      description: 'GoGame is a surprise travel platform that creates unforgettable sports experiences',
      quickLink: 'Quick link',
      packs: 'Packs',
      standardPack: 'Standard pack',
      premiumPack: 'Premium pack',
      socialMedia: 'Social Media',
      tiktok: 'TikTok',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      copyright: 'Copyright 2025 by GoGame. All rights reserved',
      privacyPolicy: 'Privacy Policy',
      cookiePolicy: 'Cookie Policy',
      termsConditions: 'Terms & Conditions'
    },
    common: {
      from: 'from'
    }
  },
  es: {
    menu: {
      home: 'Inicio',
      packages: 'Paquetes',
      faqs: 'Preguntas',
      contactUs: 'Contáctanos'
    },
    hero: {
      title: '¿Estás listo para experimentar los deportes como nunca antes?',
      subtitle: 'Deja que tu pasión por el fútbol o el baloncesto te lleve a un lugar inesperado. El destino es una sorpresa.',
      packType: 'Tipo de paquete:',
      departure: 'Salida:',
      howManyAreYou: '¿Cuántos sois?:',
      startTheGame: 'Empezar el juego',
      adults: 'Adultos',
      children: 'Niños/as',
      babies: 'Bebés',
      adultsAge: '12 años o más',
      childrenAge: '2 a 11 años',
      babiesAge: '0 a 2 años',
      total: 'Total',
      people: 'personas',
      football: 'Fútbol',
      basketball: 'Baloncesto',
      both: 'Ambos',
      standard: 'Estándar',
      premium: 'Premium'
    },
    footer: {
      description: 'GoGame es una plataforma de viajes sorpresa que crea experiencias deportivas inolvidables',
      quickLink: 'Enlace rápido',
      packs: 'Paquetes',
      standardPack: 'Paquete estándar',
      premiumPack: 'Paquete premium',
      socialMedia: 'Redes Sociales',
      tiktok: 'TikTok',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      copyright: 'Copyright 2025 por GoGame. Todos los derechos reservados',
      privacyPolicy: 'Política de Privacidad',
      cookiePolicy: 'Política de Cookies',
      termsConditions: 'Términos y Condiciones'
    },
    common: {
      from: 'desde'
    }
  }
}

// Language context interface
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gogame_language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('gogame_language', language)
  }, [language])

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language]
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

// Helper function to format people count with proper pluralization
export function formatPeopleCount(
  adultsCount: number,
  childrenCount: number,
  babiesCount: number,
  language: Language
): string {
  const parts = []
  
  if (adultsCount > 0) {
    const adultsText = language === 'es' 
      ? `${adultsCount} adulto${adultsCount > 1 ? 's' : ''}`
      : `${adultsCount} adult${adultsCount > 1 ? 's' : ''}`
    parts.push(adultsText)
  }
  
  if (childrenCount > 0) {
    const childrenText = language === 'es'
      ? `${childrenCount} niño${childrenCount > 1 ? 's' : ''}`
      : `${childrenCount} child${childrenCount > 1 ? 'ren' : ''}`
    parts.push(childrenText)
  }
  
  if (babiesCount > 0) {
    const babiesText = language === 'es'
      ? `${babiesCount} bebé${babiesCount > 1 ? 's' : ''}`
      : `${babiesCount} bab${babiesCount > 1 ? 'ies' : 'y'}`
    parts.push(babiesText)
  }
  
  return parts.length > 0 ? parts.join(', ') : (language === 'es' ? '2 adultos' : '2 adults')
} 