'use client'
import React, { useState, useEffect } from 'react'
import { AppData } from '@/app/lib/appdata'

interface Section {
  id: string
  title: string
  description: string
  order: number
}

interface Value {
  id: string
  title: string
  description: string
  order: number
}

interface WhyChooseUs {
  id: string
  title: string
  description: string
  order: number
}



export default function AboutManagement() {
  const [activeTab, setActiveTab] = useState<'sections' | 'values' | 'whyChooseUs'>('sections')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [values, setValues] = useState<Value[]>([])
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([])
  const [headline, setHeadline] = useState('')

  // Form states for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    text: '',
    buttonText: '',
    buttonLink: '',
    backgroundImage: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const aboutData = AppData.aboutPage
    setSections(aboutData.getSections())
    setValues(aboutData.getValues())
    setWhyChooseUs(aboutData.getWhyChooseUs())
    setHeadline(aboutData.getContentData().headline)
  }

  const handleEdit = (type: string, id?: string) => {
    setIsEditing(true)
    setEditingId(id || null)
    
    if (type === 'headline') {
      setFormData({
        title: '',
        description: '',
        order: 1,
        text: headline,
        buttonText: '',
        buttonLink: '',
        backgroundImage: ''
      })
    } else {
      const data = type === 'sections' ? sections : type === 'values' ? values : whyChooseUs
      const item = data.find(item => item.id === id)
      if (item) {
        setFormData({
          title: item.title,
          description: item.description,
          order: item.order,
          text: '',
          buttonText: '',
          buttonLink: '',
          backgroundImage: ''
        })
      }
    }
  }

  const handleSave = () => {
    if (activeTab === 'sections' && editingId) {
      AppData.aboutPage.updateSection(editingId, {
        title: formData.title,
        description: formData.description,
        order: formData.order
      })
      setSections(AppData.aboutPage.getSections())
    } else if (activeTab === 'values' && editingId) {
      AppData.aboutPage.updateValue(editingId, {
        title: formData.title,
        description: formData.description,
        order: formData.order
      })
      setValues(AppData.aboutPage.getValues())
    } else if (activeTab === 'whyChooseUs' && editingId) {
      AppData.aboutPage.updateWhyChooseUs(editingId, {
        title: formData.title,
        description: formData.description,
        order: formData.order
      })
      setWhyChooseUs(AppData.aboutPage.getWhyChooseUs())
    }

    setIsEditing(false)
    setEditingId(null)
    setFormData({ title: '', description: '', order: 1, text: '', buttonText: '', buttonLink: '', backgroundImage: '' })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormData({ title: '', description: '', order: 1, text: '', buttonText: '', buttonLink: '', backgroundImage: '' })
  }

  const renderTabContent = () => {
    if (isEditing) {
      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800 mb-6">
            {activeTab === 'sections' && 'Edit Section'}
            {activeTab === 'values' && 'Edit Value'}
            {activeTab === 'whyChooseUs' && 'Edit Why Choose Us Item'}
          </h3>
          
          <div className="space-y-6">
            {activeTab === 'sections' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter section title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter section description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter display order"
                  />
                </div>
              </>
            )}

            {(activeTab === 'values' || activeTab === 'whyChooseUs') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter item title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter item description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                    placeholder="Enter display order"
                  />
                </div>
              </>
            )}

          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {activeTab === 'sections' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">Main Headline</h3>
                <button
                  onClick={() => handleEdit('headline')}
                  className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-600 font-['Poppins'] leading-relaxed">{headline}</p>
            </div>

            {sections.map((section) => (
              <div key={section.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">{section.title}</h3>
                  <button
                    onClick={() => handleEdit('sections', section.id)}
                    className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">{section.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    Order: {section.order}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'values' && (
          <div className="space-y-4">
            {values.map((value) => (
              <div key={value.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">{value.title}</h3>
                  <button
                    onClick={() => handleEdit('values', value.id)}
                    className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">{value.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    Order: {value.order}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'whyChooseUs' && (
          <div className="space-y-4">
            {whyChooseUs.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">{item.title}</h3>
                  <button
                    onClick={() => handleEdit('whyChooseUs', item.id)}
                    className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">{item.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    Order: {item.order}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    )
  }

  return (
    <div className="pt-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              About Page Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">Manage the content of your about page dynamically</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'sections', label: 'Main Sections' },
                { id: 'values', label: 'Our Values' },
                { id: 'whyChooseUs', label: 'Why Choose Us' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm font-['Poppins'] transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#76C043] text-[#76C043]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}