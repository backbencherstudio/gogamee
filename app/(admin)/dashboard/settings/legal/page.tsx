import React from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function LegalPagesOverview() {
  const legalPages = [
    { title: 'Privacy Policy', href: '/dashboard/settings/legal/privacy', description: 'Manage privacy policy content in English and Spanish' },
    { title: 'Cookie Policy', href: '/dashboard/settings/legal/cookie', description: 'Manage cookie policy content in English and Spanish' },
    { title: 'Terms & Conditions', href: '/dashboard/settings/legal/terms', description: 'Manage terms and conditions content in English and Spanish' },
  ]

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Legal Pages Management
        </h1>
        <p className="text-gray-600 mb-8">
          Manage the content for all legal pages. Each page supports both English and Spanish translations.
        </p>

        <div className="grid gap-4 md:grid-cols-1">
          {legalPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#76C043]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#76C043]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{page.title}</h3>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

