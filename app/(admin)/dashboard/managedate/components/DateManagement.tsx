'use client'
import React, { useState, useEffect } from 'react'
import { Calendar, Save, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import AppData from '../../../../lib/appdata'

// Date restriction interface for calendar-based system
interface DateRestrictions {
  enabledDates: string[] // Array of date strings in YYYY-MM-DD format
  blockedDates: string[]
}

// Competition type interface
interface CompetitionType {
  id: string
  name: string
  restrictions: DateRestrictions
}

export default function DateManagement() {
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('european')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Month names
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
        name: 'European Leagues',
        restrictions: allRestrictions.european
      },
      {
        id: 'national',
        name: 'National Leagues',
        restrictions: allRestrictions.national
      }
    ]

    setCompetitionTypes(competitionTypesData)
  }

  // Calendar utility functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = (date: Date): (number | null)[] => {
    const daysInMonth = getDaysInMonth(date)
    const firstDay = getFirstDayOfMonth(date)
    const days: (number | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getDateStatus = (day: number | null, month: Date): 'enabled' | 'blocked' | 'neutral' => {
    if (!day) return 'neutral'

    const selectedComp = competitionTypes.find(comp => comp.id === selectedCompetition)
    if (!selectedComp) return 'neutral'

    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]

    if (selectedComp.restrictions.enabledDates.includes(dateString)) {
      return 'enabled'
    } else if (selectedComp.restrictions.blockedDates.includes(dateString)) {
      return 'blocked'
    } else {
      return 'neutral'
    }
  }

  const handleDateClick = (day: number, month: Date) => {
    if (!isEditing) return

    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const dateString = date.toISOString().split('T')[0]
    
    setCompetitionTypes(prev => prev.map(comp => {
      if (comp.id === selectedCompetition) {
        const newEnabledDates = [...comp.restrictions.enabledDates]
        const newBlockedDates = [...comp.restrictions.blockedDates]
        
        // Toggle date status: neutral -> enabled -> blocked -> neutral
        if (newEnabledDates.includes(dateString)) {
          // Currently enabled, move to blocked
          newEnabledDates.splice(newEnabledDates.indexOf(dateString), 1)
          newBlockedDates.push(dateString)
        } else if (newBlockedDates.includes(dateString)) {
          // Currently blocked, move to neutral
          newBlockedDates.splice(newBlockedDates.indexOf(dateString), 1)
        } else {
          // Currently neutral, move to enabled
          newEnabledDates.push(dateString)
        }

        return {
          ...comp,
          restrictions: {
            ...comp.restrictions,
            enabledDates: newEnabledDates.sort(),
            blockedDates: newBlockedDates.sort()
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
        const competitionType = selectedComp.id as 'european' | 'national'
        
        AppData.dateRestrictions.updateRestrictions(competitionType, {
          enabledDates: selectedComp.restrictions.enabledDates,
          blockedDates: selectedComp.restrictions.blockedDates
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1))
      return newMonth
    })
  }

  const selectedCompetitionData = competitionTypes.find(comp => comp.id === selectedCompetition)
  const calendarDays = generateCalendarDays(currentMonth)

  return (
    <div className="py-4 px-4 md:pl-10 md:pr-8 min-h-screen mb-4">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-2xl md:text-3xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-4 md:pt-8">
              Enable/Block Dates
            </h1>
            <p className="text-gray-600 font-['Poppins'] text-sm md:text-base">Manage specific dates for different competition types using the calendar interface</p>
          </div>
        </div>

        {/* Competition Type Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Competition Type</span>
            <div className="flex flex-col sm:flex-row gap-2">
              {competitionTypes.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`px-3 py-2 md:px-4 text-xs md:text-sm lg:text-base rounded-md font-medium font-['Poppins'] transition-all duration-200 ${
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

        {/* Calendar Interface */}
        {selectedCompetitionData && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Header with Edit/Save buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#76C043]" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Poppins']">
                    {selectedCompetitionData.name}
                  </h2>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Calendar</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className={`flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base ${
                          hasChanges && !isSaving
                            ? 'bg-[#76C043] hover:bg-lime-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save Changes</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>


              {/* Calendar Display */}
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 font-['Poppins']">
                    Calendar Management
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    </button>
                    <span className="text-base md:text-lg font-medium text-gray-900 font-['Poppins'] min-w-[150px] md:min-w-[200px] text-center">
                      {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEK_DAYS.map((day) => (
                      <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 font-['Poppins'] py-1 md:py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-8 md:h-12"></div>
                      }

                      const status = getDateStatus(day, currentMonth)
                      const isClickable = isEditing
                      
                      return (
                        <button
                          key={index}
                          onClick={() => isClickable && handleDateClick(day, currentMonth)}
                          disabled={!isClickable}
                          className={`h-8 md:h-12 rounded-lg border-2 font-medium font-['Poppins'] transition-all duration-200 ${
                            isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                          } ${
                            status === 'enabled'
                              ? 'bg-green-100 border-green-500 text-green-700'
                              : status === 'blocked'
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs md:text-sm">{day}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs md:text-sm font-['Poppins']">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                    <span className="text-green-700">Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span className="text-red-700">Blocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-700">Neutral</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 font-['Poppins']">Current Configuration</h3>
                <div className="text-xs md:text-sm text-gray-600 font-['Poppins'] space-y-1">
                  <p><strong>Enabled Dates:</strong> {selectedCompetitionData.restrictions.enabledDates.length} dates</p>
                  <p><strong>Blocked Dates:</strong> {selectedCompetitionData.restrictions.blockedDates.length} dates</p>
                  <p><strong>Neutral Dates:</strong> All other dates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Sectionn */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#76C043]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Poppins']">
              Live Preview
            </h2>
          </div>
          
          <div className="text-xs md:text-sm text-gray-600 font-['Poppins']">
            <p className="mb-2">
              These settings will be applied to the booking system. Users will only be able to select departure dates that are enabled in the calendar.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 font-medium text-xs md:text-sm">
                Changes will take effect immediately after saving. Test the booking flow to see the updated date restrictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}