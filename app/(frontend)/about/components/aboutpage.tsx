'use client'
import React from 'react'
import { useLanguage } from '../../_components/common/LanguageContext'
import Link from 'next/link'

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    {
      title: t.about.passionForSports,
      description: t.about.passionForSportsDesc
    },
    {
      title: t.about.adventureSurprise,
      description: t.about.adventureSurpriseDesc
    },
    {
      title: t.about.trustSimplicity,
      description: t.about.trustSimplicityDesc
    },
    {
      title: t.about.community,
      description: t.about.communityDesc
    }
  ]

  const whyChooseUs = [
    {
      title: t.about.uniqueConcept,
      description: t.about.uniqueConceptDesc
    },
    {
      title: t.about.allInOnePacks,
      description: t.about.allInOnePacksDesc
    },
    {
      title: t.about.accessible,
      description: t.about.accessibleDesc
    },
    {
      title: t.about.growingCommunity,
      description: t.about.growingCommunityDesc
    }
  ]

  return (
    <div className="w-full bg-[#FCFEFB] py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center gap-6 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="text-center text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              {t.about.headline}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50">
            <div className="flex flex-col gap-8 md:gap-10 w-full">
              
              {/* Who We Are Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.whoWeAre}
                  </div>
                </div>
                <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                  {t.about.whoWeAreDesc}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* Our Story Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.ourStory}
                  </div>
                </div>
                <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                  {t.about.ourStoryDesc}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* Mission Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.mission}
                  </div>
                </div>
                <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                  {t.about.missionDesc}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* Vision Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.vision}
                  </div>
                </div>
                <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                  {t.about.visionDesc}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* Our Values Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.ourValues}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {values.map((value, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="text-lime-900 text-base md:text-lg font-medium font-['Poppins']">
                        {value.title}
                      </div>
                      <div className="text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed">
                        {value.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* Why Choose Us Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">6</span>
                    </div>
                  </div>
                  <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                    {t.about.whyChooseUs}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {whyChooseUs.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="text-lime-900 text-base md:text-lg font-medium font-['Poppins']">
                        {item.title}
                      </div>
                      <div className="text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />

              {/* CTA Section */}
              <div className="flex flex-col gap-4 md:gap-5 w-full">
                <div className="text-center text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full">
                  {t.about.cta}
                </div>
                <div className="flex justify-center w-full pt-4">
                  <Link 
                    href="/packages"
                    className="px-6 py-3 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
                  >
                    <span className="text-center text-white text-lg font-normal font-['Inter'] leading-7">
                      {t.hero.startTheGame}
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
