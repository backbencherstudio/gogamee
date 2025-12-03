"use client";

import React from 'react'
import Menu from './_components/common/menu'
import Footer from './_components/common/footer'
import { LanguageProvider } from '../context/LanguageContext'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <LanguageProvider>
      <Menu />
      {children}      
      <Footer />
    </LanguageProvider>
  )
}
