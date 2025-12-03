'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAboutManagement, type MainSection, type OurValue, type WhyChooseUs } from '../../../../services/aboutService'
import { useLanguage } from '../../../context/LanguageContext'

export default function AboutPage() {
  const { language, translateText } = useLanguage();
  const [sections, setSections] = useState<MainSection[]>([])
  const [values, setValues] = useState<OurValue[]>([])
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([])
  const [translatedSections, setTranslatedSections] = useState<MainSection[]>([])
  const [translatedValues, setTranslatedValues] = useState<OurValue[]>([])
  const [translatedWhyChooseUs, setTranslatedWhyChooseUs] = useState<WhyChooseUs[]>([])
  const [headline, setHeadline] = useState('We turn sports into unforgettable surprise adventures.')
  const [translatedHeadline, setTranslatedHeadline] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAboutManagement();
        if (response.success && response.content) {
          setSections(response.content.sections || []);
          setValues(response.content.values?.items || []);
          setWhyChooseUs(response.content.whyChooseUs?.items || []);
          setHeadline(response.content.headline || 'We turn sports into unforgettable surprise adventures.');
        } else {
          setError('Failed to fetch about page data');
        }
      } catch (err) {
        console.error('Error fetching about page data:', err);
        setError('Failed to load about page data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Translate content when language changes
  useEffect(() => {
    const translateContent = async () => {
      if (language === 'es') {
        // If Spanish, use original content (no translation needed)
        setTranslatedSections(sections);
        setTranslatedValues(values);
        setTranslatedWhyChooseUs(whyChooseUs);
        setTranslatedHeadline(headline);
      } else {
        // If English, translate all content
        const [translatedHeadlineText, translatedSectionsData, translatedValuesData, translatedWhyChooseUsData] = await Promise.all([
          translateText(headline),
          Promise.all(sections.map(async (section) => ({
            ...section,
            title: await translateText(section.title),
            description: await translateText(section.description),
          }))),
          Promise.all(values.map(async (value) => ({
            ...value,
            title: await translateText(value.title),
            description: await translateText(value.description),
          }))),
          Promise.all(whyChooseUs.map(async (item) => ({
            ...item,
            title: await translateText(item.title),
            description: await translateText(item.description),
          }))),
        ]);
        
        setTranslatedHeadline(translatedHeadlineText);
        setTranslatedSections(translatedSectionsData);
        setTranslatedValues(translatedValuesData);
        setTranslatedWhyChooseUs(translatedWhyChooseUsData);
      }
    };

    if (sections.length > 0 || values.length > 0 || whyChooseUs.length > 0) {
      translateContent();
    }
  }, [language, sections, values, whyChooseUs, headline, translateText]);

  return (
    <div className="w-full bg-[#FCFEFB] py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center gap-6 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="text-center text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              {translatedHeadline || headline}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-neutral-600 text-lg font-medium">Loading about page content...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-12 gap-4">
                <div className="text-red-600 text-lg font-medium">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8 md:gap-10 w-full">
              
              {/* Dynamic Sections */}
              {translatedSections.map((section, index) => (
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
                  {index < translatedSections.length - 1 && (
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
                    Our Values
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {translatedValues.map((value) => (
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
                    Why Choose Us
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full pl-7 md:pl-8 lg:pl-9">
                  {translatedWhyChooseUs.map((item) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
