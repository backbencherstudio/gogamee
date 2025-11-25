'use client'
import React, { useState, useEffect } from 'react'
import {
  getLegalPages,
  updatePrivacyPolicy,
  updateCookiePolicy,
  updateTermsConditions,
  type LegalPageContent,
} from '../../../../../../services/settingsService'
import { useToast } from '../../../../../../components/ui/toast'

type PageType = 'privacy' | 'cookie' | 'terms'

interface LegalPageManagementProps {
  pageType: PageType
  pageTitle: string
}

export default function LegalPageManagement({ pageType, pageTitle }: LegalPageManagementProps) {
  const [content, setContent] = useState<LegalPageContent>({ en: '', es: '' })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es'>('en')
  const { addToast } = useToast()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getLegalPages()
      if (response.success && response.content) {
        const pageContent = response.content[pageType]
        if (pageContent) {
          setContent(pageContent)
        }
      } else {
        setError('Failed to fetch legal page content')
      }
    } catch (err) {
      console.error('Error fetching legal page content:', err)
      setError('Failed to load legal page content. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (lang: 'en' | 'es', value: string) => {
    setContent((prev) => ({ ...prev, [lang]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      let response
      switch (pageType) {
        case 'privacy':
          response = await updatePrivacyPolicy(content)
          break
        case 'cookie':
          response = await updateCookiePolicy(content)
          break
        case 'terms':
          response = await updateTermsConditions(content)
          break
      }

      if (response.success) {
        addToast({ type: 'success', title: `${pageTitle} updated successfully` })
        await loadData()
      } else {
        setError('Failed to update content')
      }
    } catch (err) {
      console.error('Error updating legal page content:', err)
      setError('Failed to update content. Please try again later.')
      addToast({ type: 'error', title: 'Failed to update content' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-4 min-h-screen mb-4 p-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 text-lg font-medium">Loading {pageTitle.toLowerCase()} content...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          {pageTitle}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Language Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveLanguage('en')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeLanguage === 'en'
                    ? 'text-[#76C043] border-b-2 border-[#76C043]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLanguage('es')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeLanguage === 'es'
                    ? 'text-[#76C043] border-b-2 border-[#76C043]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Spanish (Español)
              </button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content ({activeLanguage === 'en' ? 'English' : 'Spanish'})
            </label>
            <textarea
              id="content"
              value={content[activeLanguage] || ''}
              onChange={(e) => handleContentChange(activeLanguage, e.target.value)}
              rows={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent font-mono text-sm"
              placeholder={`Enter ${pageTitle.toLowerCase()} content in ${activeLanguage === 'en' ? 'English' : 'Spanish'}...`}
            />
            <p className="text-sm text-gray-500">
              You can use HTML tags for formatting. Current language: <strong>{activeLanguage === 'en' ? 'English' : 'Spanish'}</strong>
            </p>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#76C043] text-white rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

