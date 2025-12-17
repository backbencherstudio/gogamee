'use client'
import React, { useState, useEffect } from 'react'
import { getLegalPageContent } from '../../../../../services/publicSettingsService'
import { useLanguage } from '../../../../context/LanguageContext'

export default function PrivacyPolicy() {
  const { language } = useLanguage()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getLegalPageContent('privacy', language === 'es' ? 'es' : 'en')
      if (response.success && response.content && typeof response.content === 'string') {
        setContent(response.content)
      } else {
        setError('Failed to load privacy policy content')
      }
    } catch (err) {
      console.error('Error loading privacy policy:', err)
      setError('Failed to load privacy policy. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className="w-full flex flex-col justify-start items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-[100px]">
          <div className="flex justify-center items-center py-12">
            <div className="text-neutral-600 text-lg font-medium">Loading privacy policy...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className="w-full flex flex-col justify-start items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-[100px]">
          <div className="flex flex-col justify-center items-center py-12 gap-4">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button 
              onClick={loadContent}
              className="px-4 py-2 bg-[#76C043] text-white rounded-lg hover:bg-lime-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className="w-full flex flex-col justify-start items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-[100px]">
          <div className="flex justify-center items-center py-12">
            <div className="text-neutral-600 text-lg font-medium">Privacy policy content is not available.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
      <div className="w-full flex flex-col justify-start items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-[100px]">
        <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-12">
          <div 
            className="w-full legal-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
}
