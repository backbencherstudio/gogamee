import React from 'react'
import Menu from './_components/common/menu'
import Footer from './_components/common/footer'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <>
    <Menu />
    {children}      
    <Footer />
    </>
  )
}
