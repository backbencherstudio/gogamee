'use client'

import React from 'react'
import { BookingProvider } from './context/BookingContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased ">
        <div className='w-full max-w-[1200px] mx-auto'> 
          <BookingProvider>
            {children}
          </BookingProvider>
        </div>
      </body>
    </html>
  )
}
