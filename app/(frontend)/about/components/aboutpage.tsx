'use client'
import React from 'react'
import Link from 'next/link'
import { AppData } from '@/app/lib/appdata'

export default function AboutPage() {
  // Get data from AppData instead of LanguageContext
  const aboutData = AppData.aboutPage
  const content = aboutData.getContentData()
  const sections = aboutData.getSections()
  const values = aboutData.getValues()
  const whyChooseUs = aboutData.getWhyChooseUs()

  return (
    <div className="w-full bg-[#FCFEFB] py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center gap-6 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="text-center text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              {content.headline}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50">
            <div className="flex flex-col gap-8 md:gap-10 w-full">
              
              {/* Dynamic Sections */}
              {sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <div className="flex flex-col gap-4 md:gap-5 w-full">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-lime-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{section.order}</span>
                        </div>
                      </div>
                      <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
                        {section.title}
                      </div>
                    </div>
                    <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                      {section.description}
                    </div>
                  </div>
                  {index < sections.length - 1 && (
                    <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />
                  )}
                </React.Fragment>
              ))}

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
                    {content.values.title}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {values.map((value, index) => (
                    <div key={value.id} className="flex flex-col gap-2">
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
                    {content.whyChooseUs.title}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {whyChooseUs.map((item, index) => (
                    <div key={item.id} className="flex flex-col gap-2">
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
                  Ready to play the game of your life? Discover your pack today.
                </div>
                <div className="flex justify-center w-full pt-4">
                  <Link 
                    href="/packages"
                    className="px-6 py-3 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
                  >
                    <span className="text-center text-white text-lg font-normal font-['Inter'] leading-7">
                      Start the Game
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
