import React from 'react'
import HeroSection from './components/Hero/herosection'
import HowItWorks from './components/howitworks/howitworks'
import Leagues from './components/leagues/leagues'
import Reviews from './components/review/reviews'
import Faq from './components/faq/faq'
import Mailus from './components/mailus/mailus'

export default function HomePage() {
  return (
    <div className=" w-full ">
      <div className="">
        <HeroSection />
        <HowItWorks />
        <Leagues className="w-full bg-[#D5EBC5]" />
        <Reviews />
        <Faq className="w-full bg-[#FCFEFB]" />
        <Mailus />
      </div>
    </div>
  )
}
