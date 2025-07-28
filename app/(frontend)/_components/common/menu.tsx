'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { HiGlobeAlt } from 'react-icons/hi'
import { HiMenu, HiX } from 'react-icons/hi'

// Menu items data
const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Packages', href: '/packages' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Testimonials', href: '/testimonials' },
]

const languages = [
  { code: 'En', label: 'English' },
  { code: 'Bn', label: 'Bengali' },
  { code: 'Hi', label: 'Hindi' },
  { code: 'Ur', label: 'Urdu' },
  { code: 'Ar', label: 'Arabic' },
]

export default function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(languages[0])

  const toggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen)
  }

  const selectLanguage = (lang: typeof languages[0]) => {
    setSelectedLang(lang)
    setIsLangDropdownOpen(false)
  }

  return (
    <div className="w-full bg-white py-5">
      <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center relative">
        {/* Logo */}
        <div className="font-bold font-['Poppins'] text-3xl md:text-4xl text-black">
          LOGO
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-slate-700 hover:text-lime-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex justify-center items-center gap-14">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className="text-black text-lg font-normal font-['Poppins'] leading-loose hover:text-lime-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section - Language & Contact - Desktop */}
        <div className="hidden lg:flex justify-end items-center gap-3">
          <div className="relative">
            <button 
              onClick={toggleLangDropdown}
              className="flex justify-start items-center gap-2 hover:text-lime-500 transition-colors"
            >
              <div className="p-1 rounded-[99px] outline-[0.50px] outline-offset-[-0.50px] outline-gray-200 flex justify-start items-start">
                <HiGlobeAlt className="w-6 h-6 text-slate-700" />
              </div>
              <div className="flex justify-start items-center gap-1">
                <div className="text-center text-slate-700 text-lg font-normal font-['Poppins'] leading-loose">{selectedLang.code}</div>
                <div className="w-4 h-4 relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>

            {/* Language Dropdown - Desktop */}
            {isLangDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg py-2 w-40 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                      selectedLang.code === lang.code ? 'text-lime-500' : 'text-slate-700'
                    }`}
                  >
                    <span className="font-['Poppins']">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link 
            href="/contact"
            className="px-4 py-2.5 bg-lime-500 rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
          >
            <span className="text-center text-white text-lg font-normal font-['Inter'] leading-7">Contact us</span>
          </Link>
        </div>

        {/* Mobile Menu - Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg mt-5 py-4 px-4 z-50">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href}
                  className="text-black text-lg font-normal font-['Poppins'] hover:text-lime-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Language Selector - Mobile */}
              <div className="relative">
                <button 
                  onClick={toggleLangDropdown}
                  className="flex items-center gap-2 py-2 w-full hover:text-lime-500 transition-colors"
                >
                  <HiGlobeAlt className="w-5 h-5 text-slate-700" />
                  <span className="text-slate-700 font-['Poppins']">{selectedLang.code}</span>
                  <div className="w-4 h-4 relative ml-1">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}>
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Language Dropdown - Mobile */}
                {isLangDropdownOpen && (
                  <div className="bg-gray-50 rounded-lg mt-2 py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => selectLanguage(lang)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                          selectedLang.code === lang.code ? 'text-lime-500' : 'text-slate-700'
                        }`}
                      >
                        <span className="font-['Poppins']">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/contact"
                className="px-4 py-2.5 bg-lime-500 rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-center text-white text-lg font-normal font-['Inter'] leading-7">Contact us</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
