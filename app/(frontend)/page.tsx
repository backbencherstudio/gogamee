import React from 'react'
import HeroSection from './home/components/Hero/herosection'
import Faq from './home/components/faq/faq'
import HowItWorks from './home/components/howitworks/howitworks'
import Leagues from './home/components/leagues/leagues'
import Reviews from './home/components/review/reviews'
import Mailus from './home/components/mailus/mailus'


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
