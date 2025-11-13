'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, Save, RefreshCw, ChevronLeft, ChevronRight, DollarSign, X } from 'lucide-react'
import AppData from '../../../../lib/appdata'
import { useToast } from '../../../../../components/ui/toast'
import { getStartingPrice, type StartingPriceItem } from '../../../../../services/packageService'
import { getAllDates, updateDate, createDate, deleteDate, DateManagementItem } from '../../../../../services/dateManagementService'
import { formatDateForAPI, formatApiDateForComparison, createCalendarDate } from '../../../../../lib/dateUtils'

// Date restriction interface for calendar-based system
interface DateRestrictions {
  enabledDates: string[] // Array of date strings in YYYY-MM-DD format
  blockedDates: string[]
  customPrices: Record<string, {
    football?: {
      standard?: number;
      premium?: number;
    };
    basketball?: {
      standard?: number;
      premium?: number;
    };
  }>
}

// Competition type interface
interface CompetitionType {
  id: string
  name: string
  restrictions: DateRestrictions
}

// Price editing interface
interface PriceEditData {
  date: string
  sport: 'football' | 'basketball'
  standardPrice: number
  premiumPrice: number
  apiItemId?: string
}

const FALLBACK_DURATION_PRICES = {
  football: {
    '1': { standard: 379, premium: 1499 },
    '2': { standard: 379, premium: 1499 },
    '3': { standard: 379, premium: 1499 },
    '4': { standard: 379, premium: 1499 }
  },
  basketball: {
    '1': { standard: 359, premium: 1479 },
    '2': { standard: 359, premium: 1479 },
    '3': { standard: 359, premium: 1479 },
    '4': { standard: 359, premium: 1479 }
  }
} satisfies Record<'football' | 'basketball', Record<'1' | '2' | '3' | '4', { standard: number; premium: number }>>

export default function DateManagement() {
  const { addToast } = useToast()
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>('national')
  const [selectedSport, setSelectedSport] = useState<'football' | 'basketball'>('football')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [priceEditData, setPriceEditData] = useState<PriceEditData | null>(null)
  const [editingPrices, setEditingPrices] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<'1' | '2' | '3' | '4'>('1')
  const [basePrices, setBasePrices] = useState<{
    football: StartingPriceItem | null
    basketball: StartingPriceItem | null
  }>({
    football: null,
    basketball: null
  })

  const getCurrencySymbol = (currency?: string): string => {
    if (!currency) return '€'
    const normalized = currency.toLowerCase()
    if (normalized === 'usd' || normalized === 'dollar' || normalized === 'us dollar') return '$'
    if (normalized === 'gbp' || normalized === 'pound' || normalized === 'british pound') return '£'
    if (normalized === 'eur' || normalized === 'euro' || normalized === '€') return '€'
    return currency
  }

  const getBasePrice = useCallback((
    sport: 'football' | 'basketball',
    packageType: 'standard' | 'premium',
    durationKey?: '1' | '2' | '3' | '4'
  ): number => {
    const duration = durationKey ?? selectedDuration
    const item = basePrices[sport]
    const durationPrices = item?.pricesByDuration?.[duration]

    if (durationPrices) {
      return packageType === 'standard' ? durationPrices.standard : durationPrices.premium
    }

    const fallback = FALLBACK_DURATION_PRICES[sport][duration] ?? FALLBACK_DURATION_PRICES[sport]['1']
    return fallback ? fallback[packageType] : 0
  }, [basePrices, selectedDuration])
  
  // API data state
  const [apiDateData, setApiDateData] = useState<(DateManagementItem & { duration: '1' | '2' | '3' | '4' })[]>([])
  const [isLoadingApiData, setIsLoadingApiData] = useState(true)
  const [isSavingApiData, setIsSavingApiData] = useState(false)

  // Month names
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Load API date data
  const loadApiDateData = useCallback(async () => {
    try {
      setIsLoadingApiData(true)
      const data = await getAllDates()
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Date Management - API returned non-array data, using empty array');
        setApiDateData([])
        return
      }
      
      setApiDateData(
        data.map((item) => ({
          ...item,
          duration: (item.duration ?? '1') as '1' | '2' | '3' | '4',
        }))
      )
    } catch (error) {
      console.error('Error loading API date data:', error)
      setApiDateData([]) // Set empty array on error
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load date data from API',
        duration: 5000
      })
    } finally {
      setIsLoadingApiData(false)
    }
  }, [addToast])

  // Load data from AppData, base prices from package service, and API data
  useEffect(() => {
    loadDateRestrictions()
    loadBasePrices()
    loadApiDateData()
  }, [loadApiDateData])

  const loadDateRestrictions = () => {
    // Load from AppData
    const allRestrictions = AppData.dateRestrictions.getAllRestrictions()
    
    const competitionTypesData = [
      {
        id: 'national',
        name: 'National Leagues',
        restrictions: allRestrictions.national
      },
      {
        id: 'european',
        name: 'European Leagues',
        restrictions: allRestrictions.european
      }
    ]

    setCompetitionTypes(competitionTypesData)
  }

  // Load base prices from package service
  const loadBasePrices = async () => {
    try {
      const [footballPriceRes, basketballPriceRes] = await Promise.all([
        getStartingPrice('football'),
        getStartingPrice('basketball')
      ])

      setBasePrices({
        football: footballPriceRes.success && footballPriceRes.data?.length ? footballPriceRes.data[0] : null,
        basketball: basketballPriceRes.success && basketballPriceRes.data?.length ? basketballPriceRes.data[0] : null
      })
    } catch (error) {
      console.error('Error loading base prices:', error)
    }
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

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day)
    const dateString = formatDateForAPI(date)

    // Find API data for this date, selected competition, sport, AND duration
    // Each duration has independent date entries - filtering by duration ensures
    // that dates enabled for one duration don't affect other durations
    const apiDateItem = apiDateData.find(item => {
      const itemDateString = formatApiDateForComparison(item.date)
      return itemDateString === dateString && 
             item.league === selectedCompetition &&
             item.sportname === selectedSport &&
             item.duration === selectedDuration // Critical: each duration has its own date entries
    })

    if (apiDateItem) {
      return apiDateItem.status === 'enabled' ? 'enabled' : 'blocked'
    }

    // For durations beyond 1-night, do not fallback to static data
    if (selectedDuration !== '1') {
      return 'neutral'
    }

    // Fallback to AppData only for legacy 1-night defaults if available
    const selectedComp = competitionTypes.find(comp => comp.id === selectedCompetition)
    if (!selectedComp || !selectedComp.restrictions) return 'neutral'

    // Ensure arrays exist before calling includes
    const enabledDates = selectedComp.restrictions.enabledDates || []
    const blockedDates = selectedComp.restrictions.blockedDates || []

    if (Array.isArray(enabledDates) && enabledDates.includes(dateString)) {
      return 'enabled'
    }
    if (Array.isArray(blockedDates) && blockedDates.includes(dateString)) {
      return 'blocked'
    }
    return 'neutral'
  }

  const handleDateClick = async (day: number, month: Date) => {
    if (!isEditing) return

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day)
    const dateString = formatDateForAPI(date)
    
    // Find existing API data for this date, competition, sport, AND duration
    // Each duration has completely independent date entries - same date can exist for multiple durations
    const existingItem = Array.isArray(apiDateData) 
      ? apiDateData.find(item => {
          const itemDateString = formatApiDateForComparison(item.date)
          return itemDateString === dateString && 
                 item.league === selectedCompetition &&
                 item.sportname === selectedSport &&
                 item.duration === selectedDuration // Critical: filter by duration to allow same date for different durations
        })
      : undefined

    try {
      setIsSavingApiData(true)
      
      if (existingItem) {
        // Update existing item
        const newStatus = existingItem.status === 'enabled' ? 'blocked' : 'enabled'
        await updateDate(existingItem.id, { status: newStatus })
        
        // Update local state
        setApiDateData(prev => {
          if (!Array.isArray(prev)) return []
          return prev.map(item => 
            item.id === existingItem.id 
              ? { ...item, status: newStatus }
              : item
          )
        })
      } else {
        // Create new item via API - this creates a completely independent entry for the selected duration
        // Even if the same date exists for other durations, this creates a new entry for this specific duration
        try {
          // Set time to 12:00 UTC to avoid timezone shifting the calendar day
          const utcNoon = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0))
          const newDateData = {
            date: utcNoon.toISOString(),
            status: 'enabled',
            league: selectedCompetition,
            sportname: selectedSport,
            football_standard_package_price: getBasePrice('football', 'standard'),
            football_premium_package_price: getBasePrice('football', 'premium'),
            baskatball_standard_package_price: getBasePrice('basketball', 'standard'),
            baskatball_premium_package_price: getBasePrice('basketball', 'premium'),
            approve_status: 'pending',
            duration: selectedDuration // This ensures each duration has its own independent data
          }
          
          const createdItem = await createDate(newDateData)
          
          // Update local state with the created item
          setApiDateData(prev => [...prev, { ...createdItem, duration: createdItem.duration ?? selectedDuration }])
          
          addToast({
            type: 'success',
            title: 'Date Created',
            description: 'New date has been created successfully',
            duration: 3000
          })
        } catch (createError) {
          console.error('Error creating new date:', createError)
          addToast({
            type: 'error',
            title: 'Error',
            description: 'Failed to create new date',
            duration: 5000
          })
        }
      }
      
      setHasChanges(true)
    } catch (error) {
      console.error('Error updating date status:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update date status',
        duration: 5000
      })
    } finally {
      setIsSavingApiData(false)
    }
  }

  // Handle price editing
  const handlePriceClick = (day: number, month: Date) => {
    if (!editingPrices) return

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day)
    const dateString = formatDateForAPI(date)
    
    // Find API data for this date, competition, and sport
    const apiDateItem = apiDateData.find(item => {
      const itemDateString = formatApiDateForComparison(item.date)
      return itemDateString === dateString && 
             item.league === selectedCompetition &&
             item.sportname === selectedSport &&
             item.duration === selectedDuration
    })
    
    // Check if date is enabled
    if (!apiDateItem || apiDateItem.status !== 'enabled') {
      addToast({
        type: 'warning',
        title: 'Date Not Enabled',
        description: 'Please enable this date first before setting custom prices',
        duration: 4000
      })
      return
    }

    // Get existing prices from API data based on selected sport
    let standardPrice: number | null = null
    let premiumPrice: number | null = null
    
    if (selectedSport === 'football') {
      standardPrice = apiDateItem.updated_football_standard_package_price ?? apiDateItem.football_standard_package_price
      premiumPrice = apiDateItem.updated_football_premium_package_price ?? apiDateItem.football_premium_package_price
    } else {
      standardPrice = apiDateItem.updated_baskatball_standard_package_price ?? apiDateItem.baskatball_standard_package_price
      premiumPrice = apiDateItem.updated_baskatball_premium_package_price ?? apiDateItem.baskatball_premium_package_price
    }
    
    // If no custom prices exist, use base prices from package service
    if (standardPrice == null) {
      standardPrice = getBasePrice(selectedSport, 'standard')
    }
    if (premiumPrice == null) {
      premiumPrice = getBasePrice(selectedSport, 'premium')
    }
    
    console.log('Price Edit Data:', {
      date: dateString,
      selectedSport,
      apiItem: apiDateItem,
      prices: {
        standard: standardPrice,
        premium: premiumPrice,
        base: basePrices[selectedSport]?.pricesByDuration
      }
    })
    
    setPriceEditData({
      date: dateString,
      sport: selectedSport,
      standardPrice,
      premiumPrice,
      apiItemId: apiDateItem.id // Store API item ID for updates
    })
    setShowPriceModal(true)
  }

  const handleSavePrice = async () => {
    if (!priceEditData || !priceEditData.apiItemId) return

    try {
      setIsSavingApiData(true)
      
      // Ensure prices are valid numbers
      const standardPrice = typeof priceEditData.standardPrice === 'number' && !isNaN(priceEditData.standardPrice) 
        ? priceEditData.standardPrice 
        : null
      const premiumPrice = typeof priceEditData.premiumPrice === 'number' && !isNaN(priceEditData.premiumPrice)
        ? priceEditData.premiumPrice
        : null
      
      // Validate that at least one price is set
      if ((!standardPrice || standardPrice <= 0) && (!premiumPrice || premiumPrice <= 0)) {
        addToast({
          type: 'error',
          title: 'Invalid Prices',
          description: 'Please enter at least one valid price greater than 0',
          duration: 4000
        })
        setIsSavingApiData(false)
        return
      }
      
      // Prepare update data based on sport
      const updateData: {
        sportname: string;
        updated_football_standard_package_price?: number;
        updated_football_premium_package_price?: number;
        updated_baskatball_standard_package_price?: number;
        updated_baskatball_premium_package_price?: number;
      } = {
        sportname: priceEditData.sport
      }
      
      if (priceEditData.sport === 'football') {
        if (standardPrice && standardPrice > 0) {
          updateData.updated_football_standard_package_price = standardPrice
        }
        if (premiumPrice && premiumPrice > 0) {
          updateData.updated_football_premium_package_price = premiumPrice
        }
      } else {
        if (standardPrice && standardPrice > 0) {
          updateData.updated_baskatball_standard_package_price = standardPrice
        }
        if (premiumPrice && premiumPrice > 0) {
          updateData.updated_baskatball_premium_package_price = premiumPrice
        }
      }
      
      console.log('Saving price update:', {
        id: priceEditData.apiItemId,
        updateData,
        standardPrice,
        premiumPrice
      })
      
      // Update via API
      const updated = await updateDate(priceEditData.apiItemId, updateData)
      
      console.log('Price update successful:', updated)
      
      // Update local state
      setApiDateData(prev => {
        if (!Array.isArray(prev)) return []
        return prev.map(item => 
          item.id === priceEditData.apiItemId 
            ? {
                ...item,
                sportname: priceEditData.sport,
                updated_football_standard_package_price: priceEditData.sport === 'football' ? priceEditData.standardPrice : item.updated_football_standard_package_price,
              updated_football_premium_package_price: priceEditData.sport === 'football' ? priceEditData.premiumPrice : item.updated_football_premium_package_price,
              updated_baskatball_standard_package_price: priceEditData.sport === 'basketball' ? priceEditData.standardPrice : item.updated_baskatball_standard_package_price,
              updated_baskatball_premium_package_price: priceEditData.sport === 'basketball' ? priceEditData.premiumPrice : item.updated_baskatball_premium_package_price
            }
          : item
        )
      })
      
      setShowPriceModal(false)
      setPriceEditData(null)
      setHasChanges(true)
      
      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Prices updated successfully',
        duration: 4000
      })
      
    } catch (error) {
      console.error('Error saving prices:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update prices',
        duration: 5000
      })
    } finally {
      setIsSavingApiData(false)
    }
  }

  const getCustomPrice = (date: string, sport: 'football' | 'basketball', packageType: 'standard' | 'premium', duration: '1' | '2' | '3' | '4'): number | null => {
    // Find API data for this date, competition, and sport
    const apiDateItem = apiDateData.find(item => {
      const itemDateString = formatApiDateForComparison(item.date)
      return itemDateString === date && 
             item.league === selectedCompetition &&
             item.sportname === sport &&
             item.duration === duration
    })
    
    if (apiDateItem) {
      if (sport === 'football') {
        return packageType === 'standard' 
          ? (apiDateItem.updated_football_standard_package_price ?? apiDateItem.football_standard_package_price)
          : (apiDateItem.updated_football_premium_package_price ?? apiDateItem.football_premium_package_price)
      } else {
        return packageType === 'standard'
          ? (apiDateItem.updated_baskatball_standard_package_price ?? apiDateItem.baskatball_standard_package_price)
          : (apiDateItem.updated_baskatball_premium_package_price ?? apiDateItem.baskatball_premium_package_price)
      }
    }
    
    // Fallback to AppData if no API data found
    const selectedComp = competitionTypes.find(comp => comp.id === selectedCompetition)
    if (!selectedComp) return null
    
    return selectedComp.restrictions.customPrices[date]?.[sport]?.[packageType] || null
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Update AppData with new restrictions and custom prices
      const selectedComp = competitionTypes.find(comp => comp.id === selectedCompetition)
      if (selectedComp) {
        const competitionType = selectedComp.id as 'european' | 'national'
        
        AppData.dateRestrictions.updateRestrictions(competitionType, {
          enabledDates: selectedComp.restrictions.enabledDates,
          blockedDates: selectedComp.restrictions.blockedDates,
          customPrices: selectedComp.restrictions.customPrices
        })
        
        console.log(`Updated ${competitionType} restrictions and prices:`, selectedComp.restrictions)
      }
      
      setIsEditing(false)
      setEditingPrices(false)
      setHasChanges(false)
      
      // Show success message
      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Date restrictions and custom prices updated successfully!',
        duration: 4000
      })
      
    } catch (error) {
      console.error('Error saving date restrictions:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Error saving date restrictions. Please try again.',
        duration: 5000
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingPrices(false)
    setHasChanges(false)
    loadDateRestrictions() // Reload original data
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditPrices = () => {
    setEditingPrices(true)
  }

  const handleResetDuration = async (duration: '1' | '2' | '3' | '4') => {
    // Confirm before resetting
    const confirmMessage = `Are you sure you want to reset all data for ${duration} Night${duration === '1' ? '' : 's'} package?\n\nThis will delete all enabled dates, blocked dates, and custom prices for:\n- ${selectedCompetition === 'national' ? 'National' : 'European'} Leagues\n- ${selectedSport === 'football' ? 'Football' : 'Basketball'}\n- ${duration} Night${duration === '1' ? '' : 's'} duration\n\nThis action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setIsSavingApiData(true)
      
      // Find all dates for this duration, competition, and sport
      const datesToDelete = Array.isArray(apiDateData) 
        ? apiDateData.filter(item => 
            item.league === selectedCompetition &&
            item.sportname === selectedSport &&
            item.duration === duration
          )
        : []

      // Delete all matching dates
      if (datesToDelete.length > 0) {
        await Promise.all(datesToDelete.map(item => deleteDate(item.id)))
      }

      // Reload data to refresh the UI
      await loadApiDateData()

      addToast({
        type: 'success',
        title: 'Reset Complete',
        description: `All data for ${duration} Night${duration === '1' ? '' : 's'} package has been reset successfully`,
        duration: 4000
      })

      setHasChanges(true)
    } catch (error) {
      console.error('Error resetting duration data:', error)
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to reset duration data. Please try again.',
        duration: 5000
      })
    } finally {
      setIsSavingApiData(false)
    }
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
                  {!isEditing && !editingPrices ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Calendar</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={handleEditPrices}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Prices</span>
                        <span className="sm:hidden">Prices</span>
                      </button>
                    </>
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
                        disabled={isSaving || isSavingApiData || !hasChanges}
                        className={`flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base ${
                          hasChanges && !isSaving && !isSavingApiData
                            ? 'bg-[#76C043] hover:bg-lime-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {(isSaving || isSavingApiData) ? (
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

          {/* Sport Selection */}
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex flex-col gap-3">
              <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Sport</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setSelectedSport('football')}
                  className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedSport === 'football'
                      ? 'bg-[#76C043] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span>⚽</span>
                  <span>Football</span>
                </button>
                <button
                  onClick={() => setSelectedSport('basketball')}
                  className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedSport === 'basketball'
                      ? 'bg-[#76C043] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span>🏀</span>
                  <span>Basketball</span>
                </button>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
            <div className="flex flex-col gap-3">
              <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Package Duration</span>
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2">
                  {(['1', '2', '3', '4'] as const).map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedDuration === duration
                          ? 'bg-[#76C043] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <span>{duration}</span>
                      <span>Night{duration === '1' ? '' : 's'}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleResetDuration(selectedDuration)}
                  disabled={isSavingApiData}
                  className={`px-3 py-2 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSavingApiData
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                  title={`Reset all data for ${selectedDuration} Night${selectedDuration === '1' ? '' : 's'} package`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>

              {/* Calendar Display */}
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 font-['Poppins']">
                    Calendar Management
                    {isLoadingApiData && (
                      <span className="ml-2 text-sm text-blue-600 font-normal">
                        (Loading API data...)
                      </span>
                    )}
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
                       const isClickable = isEditing || editingPrices
                       const date = createCalendarDate(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                       const dateString = formatDateForAPI(date)
                       
                       // Check for custom prices from API data for selected sport and duration
                       const apiDateItem = apiDateData.find(item => {
                         const itemDateString = formatApiDateForComparison(item.date)
                         return itemDateString === dateString && 
                                item.league === selectedCompetition &&
                                item.sportname === selectedSport &&
                                item.duration === selectedDuration
                       })
                      
                      // Check if this date has custom prices for the selected sport and duration
                      const hasCustomPrices = apiDateItem ? (
                        selectedSport === 'football' 
                          ? (apiDateItem.updated_football_standard_package_price !== null ||
                             apiDateItem.updated_football_premium_package_price !== null)
                          : (apiDateItem.updated_baskatball_standard_package_price !== null ||
                             apiDateItem.updated_baskatball_premium_package_price !== null)
                      ) : false
                      
                      // Get currency symbol
                      const currencySymbol = getCurrencySymbol(
                        basePrices[selectedSport]?.currency ??
                        basePrices.football?.currency ??
                        basePrices.basketball?.currency ??
                        'euro'
                      )
                      
                      // Get prices for selected sport
                      let displayStandard: number | null = null
                      let displayPremium: number | null = null
                      
                      if (apiDateItem) {
                        if (selectedSport === 'football') {
                          displayStandard = apiDateItem.updated_football_standard_package_price ?? apiDateItem.football_standard_package_price
                          displayPremium = apiDateItem.updated_football_premium_package_price ?? apiDateItem.football_premium_package_price
                        } else {
                          displayStandard = apiDateItem.updated_baskatball_standard_package_price ?? apiDateItem.baskatball_standard_package_price
                          displayPremium = apiDateItem.updated_baskatball_premium_package_price ?? apiDateItem.baskatball_premium_package_price
                        }
                      }

                      const baseStandard = getBasePrice(selectedSport, 'standard')
                      const basePremium = getBasePrice(selectedSport, 'premium')

                      if (status === 'enabled') {
                        if (displayStandard == null || displayStandard === 0) {
                          displayStandard = baseStandard
                        }
                        if (displayPremium == null || displayPremium === 0) {
                          displayPremium = basePremium
                        }
                      }

                      const shouldDisplayPrices = status === 'enabled' &&
                        displayStandard !== null &&
                        displayPremium !== null &&
                        (displayStandard !== 0 || displayPremium !== 0)

                      const standardToDisplay = displayStandard ?? 0
                      const premiumToDisplay = displayPremium ?? 0
                      
                      return (
                        <div key={index} className="relative">
                          <button
                            onClick={() => {
                              if (isEditing) {
                                handleDateClick(day, currentMonth)
                              } else if (editingPrices) {
                                handlePriceClick(day, currentMonth)
                              }
                            }}
                            disabled={!isClickable}
                            className={`h-auto min-h-[2rem] md:min-h-[3rem] w-full rounded-lg border-2 font-medium font-['Poppins'] transition-all duration-200 flex flex-col items-center justify-center p-1 ${
                              isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                            } ${
                              status === 'enabled'
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : status === 'blocked'
                                ? 'bg-red-100 border-red-500 text-red-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-xs md:text-sm font-semibold">{day}</div>
                            {/* Display prices (custom or base) */}
                            {shouldDisplayPrices && (
                              <div className="flex items-center justify-center gap-1 mt-0.5 w-full px-0.5">
                                <span className="text-[10px] md:text-[11px]">{selectedSport === 'football' ? '⚽' : '🏀'}</span>
                                <span className="text-[10px] md:text-[11px] font-medium">
                                  {currencySymbol}{Math.round(standardToDisplay)}
                                  <span className="text-[9px] md:text-[10px] opacity-75">/{currencySymbol}{Math.round(premiumToDisplay)}</span>
                                </span>
                              </div>
                            )}
                          </button>
                          
                          {/* Custom price indicator */}
                          {hasCustomPrices && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <DollarSign className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
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
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-blue-700">Custom Price</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 font-['Poppins']">Current Configuration ({selectedSport === 'football' ? '⚽ Football' : '🏀 Basketball'})</h3>
                <div className="text-xs md:text-sm text-gray-600 font-['Poppins'] space-y-1">
                  <p><strong>API Data:</strong> {apiDateData.filter(item => item.league === selectedCompetition && item.sportname === selectedSport && item.duration === selectedDuration).length} dates loaded</p>
                  <p><strong>Enabled Dates:</strong> {apiDateData.filter(item => item.league === selectedCompetition && item.sportname === selectedSport && item.duration === selectedDuration && item.status === 'enabled').length} dates</p>
                  <p><strong>Blocked Dates:</strong> {apiDateData.filter(item => item.league === selectedCompetition && item.sportname === selectedSport && item.duration === selectedDuration && item.status === 'blocked').length} dates</p>
                  <p><strong>Custom Prices:</strong> {apiDateData.filter(item => 
                    item.league === selectedCompetition && 
                    item.sportname === selectedSport && 
                    item.duration === selectedDuration && (
                      (selectedSport === 'football' && (
                        item.updated_football_standard_package_price !== null ||
                        item.updated_football_premium_package_price !== null
                      )) ||
                      (selectedSport === 'basketball' && (
                        item.updated_baskatball_standard_package_price !== null ||
                        item.updated_baskatball_premium_package_price !== null
                      ))
                    )
                  ).length} dates</p>
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

      {/* Price Editing Modal */}
      {showPriceModal && priceEditData && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPriceModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">Set Custom Prices</h2>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-['Poppins']">
                  <strong>Date:</strong> {new Date(priceEditData.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  {(() => {
                    const hasCustomPrices = getCustomPrice(priceEditData.date, priceEditData.sport, 'standard', selectedDuration) !== null || 
                                          getCustomPrice(priceEditData.date, priceEditData.sport, 'premium', selectedDuration) !== null
                    return hasCustomPrices ? '✏️ Editing existing custom prices' : '📦 Using base package prices (can be overridden)'
                  })()}
                </p>
                
                {/* Debug info for both sports */}
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Football Base:</span>
                  <span>
                    {basePrices.football
                      ? `${getCurrencySymbol(basePrices.football.currency)}${Math.round(getBasePrice('football', 'standard', selectedDuration))}/${getCurrencySymbol(basePrices.football.currency)}${Math.round(getBasePrice('football', 'premium', selectedDuration))}`
                      : 'Not loaded'}
                  </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Basketball Base:</span>
                  <span>
                    {basePrices.basketball
                      ? `${getCurrencySymbol(basePrices.basketball.currency)}${Math.round(getBasePrice('basketball', 'standard', selectedDuration))}/${getCurrencySymbol(basePrices.basketball.currency)}${Math.round(getBasePrice('basketball', 'premium', selectedDuration))}`
                      : 'Not loaded'}
                  </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Sport:</span>
                    <span className="font-medium">{priceEditData.sport}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Sport *
                </label>
                <select
                  value={priceEditData.sport}
                  onChange={(e) => {
                    const newSport = e.target.value as 'football' | 'basketball'
                    const currentStandardPrice = getCustomPrice(priceEditData.date, newSport, 'standard', selectedDuration)
                    const currentPremiumPrice = getCustomPrice(priceEditData.date, newSport, 'premium', selectedDuration)
                    
                    // Use custom prices if they exist, otherwise use base prices
                    const standardPrice = currentStandardPrice ?? getBasePrice(newSport, 'standard')
                    const premiumPrice = currentPremiumPrice ?? getBasePrice(newSport, 'premium')
                    
                    setPriceEditData(prev => prev ? {
                      ...prev, 
                      sport: newSport,
                      standardPrice,
                      premiumPrice
                    } : null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                >
                  <option value="football">
                    Football {basePrices.football ? `(${getCurrencySymbol(basePrices.football.currency)}${Math.round(getBasePrice('football', 'standard', selectedDuration))}/${getCurrencySymbol(basePrices.football.currency)}${Math.round(getBasePrice('football', 'premium', selectedDuration))})` : ''}
                  </option>
                  <option value="basketball">
                    Basketball {basePrices.basketball ? `(${getCurrencySymbol(basePrices.basketball.currency)}${Math.round(getBasePrice('basketball', 'standard', selectedDuration))}/${getCurrencySymbol(basePrices.basketball.currency)}${Math.round(getBasePrice('basketball', 'premium', selectedDuration))})` : ''}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                    Standard Package Price ({getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceEditData.standardPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      const numValue = value === '' ? 0 : Number(value)
                      setPriceEditData(prev => prev ? {...prev, standardPrice: isNaN(numValue) ? 0 : numValue} : null)
                    }}
                    placeholder={`Current: ${getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')}${getBasePrice(priceEditData.sport, 'standard')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Base package price: {getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')}{getBasePrice(priceEditData.sport, 'standard')} | Set custom price to override for this date only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                    Premium Package Price ({getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceEditData.premiumPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      const numValue = value === '' ? 0 : Number(value)
                      setPriceEditData(prev => prev ? {...prev, premiumPrice: isNaN(numValue) ? 0 : numValue} : null)
                    }}
                    placeholder={`Current: ${getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')}${getBasePrice(priceEditData.sport, 'premium')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-['Poppins']"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Base package price: {getCurrencySymbol(basePrices[priceEditData.sport]?.currency ?? 'euro')}{getBasePrice(priceEditData.sport, 'premium')} | Set custom price to override for this date only
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  disabled={(!priceEditData.standardPrice || priceEditData.standardPrice <= 0) && (!priceEditData.premiumPrice || priceEditData.premiumPrice <= 0)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DollarSign className="w-4 h-4" />
                  Set Prices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}