'use client'
import React, { useState, useEffect } from 'react'
import { Calendar, Save, RefreshCw, Clock, CalendarDays } from 'lucide-react'
import AppData from '../../../../lib/appdata'

// Date restriction interface
interface DateRestrictions {
  allowedStartDays: number[] // 0 = Sunday, 1 = Monday, etc.
  blockedDays: number[]
  description: string
}

// Competition type interface
interface CompetitionType {
  id: string
  name: string
  description: string
  restrictions: DateRestrictions
}

export default function DateManagement() {
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('european')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Week day names
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Load data from AppData
  useEffect(() => {
    loadDateRestrictions()
  }, [])

  const loadDateRestrictions = () => {
    // Load from AppData
    const allRestrictions = AppData.dateRestrictions.getAllRestrictions()
    
    const competitionTypesData = [
      {
        id: 'european',
        name: 'European Competition',
        description: allRestrictions.european.description,
        restrictions: allRestrictions.european
      },
      {
        id: 'nationalWeekend',
        name: 'National League - Weekend',
        description: allRestrictions.nationalWeekend.description,
        restrictions: allRestrictions.nationalWeekend
      },
      {
        id: 'nationalMidweek',
        name: 'National League - Midweek',
        description: allRestrictions.nationalMidweek.description,
        restrictions: allRestrictions.nationalMidweek
      }
    ]

    setCompetitionTypes(competitionTypesData)
  }

  const handleDayToggle = (dayIndex: number) => {
    if (!isEditing) return

    setCompetitionTypes(prev => prev.map(comp => {
      if (comp.id === selectedCompetition) {
        const newAllowedDays = [...comp.restrictions.allowedStartDays]
        const newBlockedDays = [...comp.restrictions.blockedDays]
        
        if (newAllowedDays.includes(dayIndex)) {
          // Remove from allowed, add to blocked
          newAllowedDays.splice(newAllowedDays.indexOf(dayIndex), 1)
          newBlockedDays.push(dayIndex)
        } else {
          // Remove from blocked, add to allowed
          newBlockedDays.splice(newBlockedDays.indexOf(dayIndex), 1)
          newAllowedDays.push(dayIndex)
        }

        return {
          ...comp,
          restrictions: {
            ...comp.restrictions,
            allowedStartDays: newAllowedDays.sort(),
            blockedDays: newBlockedDays.sort()
          }
        }
      }
      return comp
    }))
    setHasChanges(true)
  }

  const handleDescriptionChange = (newDescription: string) => {
    if (!isEditing) return

    setCompetitionTypes(prev => prev.map(comp => {
      if (comp.id === selectedCompetition) {
        return {
          ...comp,
          restrictions: {
            ...comp.restrictions,
            description: newDescription
          }
        }
      }
      return comp
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Update AppData with new restrictions
      const selectedComp = competitionTypes.find(comp => comp.id === selectedCompetition)
      if (selectedComp) {
        // Update AppData with the new restrictions
        const competitionType = selectedComp.id as 'european' | 'nationalWeekend' | 'nationalMidweek'
        
        AppData.dateRestrictions.updateRestrictions(competitionType, {
          allowedStartDays: selectedComp.restrictions.allowedStartDays,
          blockedDays: selectedComp.restrictions.blockedDays,
          description: selectedComp.restrictions.description
        })
        
        console.log(`Updated ${competitionType} restrictions:`, selectedComp.restrictions)
      }
      
      setIsEditing(false)
      setHasChanges(false)
      
      // Show success message
      alert('Date restrictions updated successfully!')
      
    } catch (error) {
      console.error('Error saving date restrictions:', error)
      alert('Error saving date restrictions. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setHasChanges(false)
    loadDateRestrictions() // Reload original data
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const selectedCompetitionData = competitionTypes.find(comp => comp.id === selectedCompetition)

  return (
    <div className="py-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Date Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">Customize available departure days for different competition types</p>
          </div>
        </div>

        {/* Competition Type Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-gray-700 font-medium font-['Poppins']">Select Competition Type</span>
            <div className="flex flex-wrap gap-2">
              {competitionTypes.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`px-4 py-2 text-sm md:text-base rounded-md font-medium font-['Poppins'] transition-all duration-200 ${
                    selectedCompetition === comp.id
                      ? 'bg-[#76C043] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Restrictions Configuration */}
        {selectedCompetitionData && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              {/* Header with Edit/Save buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-[#76C043]" />
                  <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                    {selectedCompetitionData.name}
                  </h2>
                </div>
                
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Edit Restrictions
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                          hasChanges && !isSaving
                            ? 'bg-[#76C043] hover:bg-lime-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Description
                </label>
                <textarea
                  value={selectedCompetitionData.restrictions.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors resize-vertical ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>

              {/* Week Days Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 font-['Poppins']">
                  Available Departure Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => {
                    const isAllowed = selectedCompetitionData.restrictions.allowedStartDays.includes(index)
                    const isBlocked = selectedCompetitionData.restrictions.blockedDays.includes(index)
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="text-xs font-medium text-gray-600 font-['Poppins']">
                          {weekDaysShort[index]}
                        </div>
                        <button
                          onClick={() => handleDayToggle(index)}
                          disabled={!isEditing}
                          className={`w-12 h-12 rounded-lg border-2 font-medium font-['Poppins'] transition-all duration-200 ${
                            isEditing
                              ? isAllowed
                                ? 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200'
                                : isBlocked
                                ? 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                              : isAllowed
                              ? 'bg-green-100 border-green-500 text-green-700'
                              : isBlocked
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-gray-100 border-gray-300 text-gray-700'
                          }`}
                        >
                          {isAllowed ? '✓' : isBlocked ? '✗' : '○'}
                        </button>
                        <div className="text-xs text-gray-500 font-['Poppins']">
                          {isAllowed ? 'Allowed' : isBlocked ? 'Blocked' : 'Neutral'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2 font-['Poppins']">Current Configuration</h3>
                <div className="text-sm text-gray-600 font-['Poppins']">
                  <p><strong>Allowed Days:</strong> {
                    selectedCompetitionData.restrictions.allowedStartDays
                      .map(day => weekDays[day])
                      .join(', ')
                  }</p>
                  <p><strong>Blocked Days:</strong> {
                    selectedCompetitionData.restrictions.blockedDays
                      .map(day => weekDays[day])
                      .join(', ')
                  }</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-[#76C043]" />
            <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
              Live Preview
            </h2>
          </div>
          
          <div className="text-sm text-gray-600 font-['Poppins']">
            <p className="mb-2">
              These settings will be applied to the booking system. Users will only be able to select departure dates on the allowed days.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 font-medium">
                💡 Tip: Changes will take effect immediately after saving. Test the booking flow to see the updated date restrictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}