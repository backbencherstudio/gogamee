'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
    about: string
  }
  // About page translations
  about: {
    headline: string
    whoWeAre: string
    whoWeAreDesc: string
    ourStory: string
    ourStoryDesc: string
    mission: string
    missionDesc: string
    vision: string
    visionDesc: string
    ourValues: string
    passionForSports: string
    passionForSportsDesc: string
    adventureSurprise: string
    adventureSurpriseDesc: string
    trustSimplicity: string
    trustSimplicityDesc: string
    community: string
    communityDesc: string
    whyChooseUs: string
    uniqueConcept: string
    uniqueConceptDesc: string
    allInOnePacks: string
    allInOnePacksDesc: string
    accessible: string
    accessibleDesc: string
    growingCommunity: string
    growingCommunityDesc: string
    cta: string
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
      contactUs: 'Contact us',
      about: 'About Us'
    },
    about: {
      headline: 'We turn sports into unforgettable surprise adventures.',
      whoWeAre: 'Who we are',
      whoWeAreDesc: 'GoGame is a sports travel platform with a twist: the destination and the match are a surprise until 48 hours before you travel. We organize everything — flights, hotel, and tickets — so you only need to enjoy the experience.',
      ourStory: 'Our Story',
      ourStoryDesc: 'GoGame was born from our passion for sports and travel. After years of following matches across Europe, we realized that fans love both the adrenaline of the game and the adventure of discovering new places — so we decided to combine them.',
      mission: 'Mission',
      missionDesc: 'To bring fans closer to live sports while adding the thrill of surprise. We create complete, worry-free trips that turn every match into a unique adventure.',
      vision: 'Vision',
      visionDesc: 'To become the leading platform for surprise sports travel in Europe, creating a global community of fans who explore new cities and live sports in a different, exciting way.',
      ourValues: 'Our Values',
      passionForSports: 'Passion for sports',
      passionForSportsDesc: 'We believe live matches are unforgettable moments.',
      adventureSurprise: 'Adventure & surprise',
      adventureSurpriseDesc: 'Every trip should feel as thrilling as the game itself.',
      trustSimplicity: 'Trust & simplicity',
      trustSimplicityDesc: 'We take care of everything so you can just enjoy.',
      community: 'Community',
      communityDesc: 'Sports are better when shared — we connect fans everywhere.',
      whyChooseUs: 'Why choose us',
      uniqueConcept: 'Unique concept',
      uniqueConceptDesc: 'The destination is always a surprise.',
      allInOnePacks: 'All-in-one packs',
      allInOnePacksDesc: 'Flights, hotel, and tickets included.',
      accessible: 'Accessible',
      accessibleDesc: 'Standard and Premium packs for all budgets.',
      growingCommunity: 'Growing community',
      growingCommunityDesc: 'A growing community of fans who love to travel and cheer together.',
      cta: 'Are you ready to play the game of travel? Discover your pack today.'
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
      contactUs: 'Contáctanos',
      about: 'Sobre nosotros'
    },
    about: {
      headline: 'Convertimos el deporte en aventuras sorpresa inolvidables.',
      whoWeAre: 'Quiénes somos',
      whoWeAreDesc: 'GoGame es una plataforma de viajes deportivos con un toque diferente: el destino y el partido son sorpresa hasta 48 horas antes de viajar. Organizamos todo (vuelos, hotel y entradas) para que solo tengas que disfrutar de la experiencia.',
      ourStory: 'Nuestra historia',
      ourStoryDesc: 'GoGame nació de nuestra pasión por el deporte y los viajes. Tras años siguiendo partidos por Europa, nos dimos cuenta de que los fans disfrutan tanto de la adrenalina del juego como de la aventura de descubrir nuevos lugares — así que decidimos unir ambas cosas.',
      mission: 'Misión',
      missionDesc: 'Acercar a los aficionados al deporte en directo, añadiendo la emoción de la sorpresa. Creamos viajes completos y sin complicaciones que convierten cada partido en una aventura única.',
      vision: 'Visión',
      visionDesc: 'Convertirnos en la plataforma líder de viajes deportivos sorpresa en Europa, creando una comunidad global de fans que exploran nuevas ciudades y viven el deporte de una forma distinta y emocionante.',
      ourValues: 'Nuestros valores',
      passionForSports: 'Pasión por el deporte',
      passionForSportsDesc: 'Creemos que un partido en directo es un momento inolvidable.',
      adventureSurprise: 'Aventura y sorpresa',
      adventureSurpriseDesc: 'Cada viaje debe ser tan emocionante como el propio juego.',
      trustSimplicity: 'Confianza y sencillez',
      trustSimplicityDesc: 'Nos encargamos de todo para que tú solo disfrutes.',
      community: 'Comunidad',
      communityDesc: 'El deporte es mejor cuando se comparte — conectamos a fans de todas partes.',
      whyChooseUs: 'Por qué elegirnos',
      uniqueConcept: 'Concepto único',
      uniqueConceptDesc: 'El destino siempre es sorpresa.',
      allInOnePacks: 'Packs todo incluido',
      allInOnePacksDesc: 'Vuelos, hotel y entradas.',
      accessible: 'Accesible',
      accessibleDesc: 'Opciones Standard y Premium para todos los presupuestos.',
      growingCommunity: 'Comunidad creciente',
      growingCommunityDesc: 'Una comunidad creciente de fans que aman viajar y animar juntos.',
      cta: '¿Listo para jugar el partido de tu vida? Descubre tu pack hoy mismo.'
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

// Google Translate types
declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void
      }
    }
  }
}

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isGoogleReady, setIsGoogleReady] = useState(false)

  // Initialize Google Translate (hidden, no banner)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Create hidden container for Google Translate
    const ensureHiddenMount = () => {
      let hiddenHost = document.getElementById('google_translate_element') as HTMLDivElement | null
      if (!hiddenHost) {
        hiddenHost = document.createElement('div')
        hiddenHost.id = 'google_translate_element'
        document.body.appendChild(hiddenHost)
      }
      hiddenHost.style.position = 'fixed'
      hiddenHost.style.top = '-9999px'
      hiddenHost.style.left = '-9999px'
      hiddenHost.style.opacity = '0'
      hiddenHost.style.pointerEvents = 'none'
      hiddenHost.style.width = '0'
      hiddenHost.style.height = '0'
    }

    ensureHiddenMount()

    const initGoogleTranslator = () => {
      if (window.google?.translate?.TranslateElement) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es',
              autoDisplay: false // Don't show banner
            },
            'google_translate_element'
          )
          setIsGoogleReady(true)
        } catch (error) {
          console.warn('Google Translate initialization error:', error)
        }
      }
    }

    window.googleTranslateElementInit = initGoogleTranslator

    // Load Google Translate script
    const existingScript = document.getElementById('google-translate-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      script.onerror = () => {
        console.warn('Failed to load Google Translate script')
      }
      document.body.appendChild(script)
    } else {
      initGoogleTranslator()
    }

    // Hide Google Translate banner and elements
    if (!document.getElementById('google-translate-hide-style')) {
      const style = document.createElement('style')
      style.id = 'google-translate-hide-style'
      style.innerHTML = `
        /* Hide Google Translate banner */
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        .goog-te-gadget-icon,
        .goog-te-gadget-simple,
        .goog-te-menu-value,
        .goog-te-menu-value span,
        .goog-te-menu-frame,
        .goog-te-ftab,
        .goog-te-ftab-link,
        .skiptranslate,
        #google_translate_element {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }
        /* Prevent body shift */
        body {
          top: 0 !important;
        }
        /* Hide language selector dropdown */
        .goog-te-combo {
          display: none !important;
        }
      `
      document.head.appendChild(style)
    }

    // Cleanup function
    return () => {
      const style = document.getElementById('google-translate-hide-style')
      if (style) {
        style.remove()
      }
    }
  }, [])

  // Apply Google Translate when language changes
  const applyGoogleTranslation = useCallback((targetLang: Language) => {
    if (!isGoogleReady) return

    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo')
    if (!combo) {
      // Retry after a short delay
      setTimeout(() => applyGoogleTranslation(targetLang), 300)
      return
    }

    // Map our language codes to Google Translate codes
    const googleLangCode = targetLang === 'es' ? 'es' : 'en'
    
    if (combo.value !== googleLangCode) {
      combo.value = googleLangCode
      combo.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }, [isGoogleReady])

  // Trigger Google Translate when language changes
  useEffect(() => {
    if (!isGoogleReady) return

    // Apply translation with multiple attempts to ensure it works
    const timers = [
      setTimeout(() => applyGoogleTranslation(language), 100),
      setTimeout(() => applyGoogleTranslation(language), 500),
      setTimeout(() => applyGoogleTranslation(language), 1000)
    ]

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [language, isGoogleReady, applyGoogleTranslation])

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