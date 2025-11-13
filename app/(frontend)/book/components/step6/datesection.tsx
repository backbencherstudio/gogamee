'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useFormContext } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { getAllDates } from '../../../../../services/dateManagementService'
import { getStartingPrice, StartingPriceItem } from '../../../../../services/packageService'
import { formatDateForAPI, formatApiDateForComparison } from '../../../../../lib/dateUtils'

// Types
interface DurationOption {
  days: number
  nights: number
}

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

interface ApiDateData {
  date: string
  status: string
  football_standard_package_price: number
  football_premium_package_price: number
  baskatball_standard_package_price: number
  baskatball_premium_package_price: number
  updated_football_standard_package_price: number | null
  updated_football_premium_package_price: number | null
  updated_baskatball_standard_package_price: number | null
  updated_baskatball_premium_package_price: number | null
  sportname: string
  league: string
}

type BaseSportKey = 'football' | 'basketball'
type SportKey = BaseSportKey | 'combined'

// Constants
const DURATION_OPTIONS: DurationOption[] = [
  { days: 2, nights: 1 },
  { days: 3, nights: 2 },
  { days: 4, nights: 3 },
  { days: 5, nights: 4 }
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Dynamic pricing will be calculated based on sport, package, and nights

// Utility functions
const resetTimeToMidnight = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}



const isDateInPast = (date: Date): boolean => {
  const today = resetTimeToMidnight(new Date())
  const checkDate = resetTimeToMidnight(date)
  return checkDate < today
}

const isDateAllowedForCompetition = (date: Date, restrictions: DateRestrictions): boolean => {
  // Use consistent date formatting
  const dateString = formatDateForAPI(date)
  
  // Check if date is explicitly blocked
  if (restrictions.blockedDates.includes(dateString)) {
    return false
  }
  
  // Check if date is explicitly enabled
  return restrictions.enabledDates.includes(dateString)
}

export default function DateSection() {
  const { formData, updateFormData, nextStep } = useBooking()
  
  // Optional React Hook Form integration
  const formContext = useFormContext?.() || null
  const setValue = formContext?.setValue


  
  // Consistent default values
  const getDefaultValues = () => ({
    selectedDuration: 1,
    selectedStartDate: null as number | null,
    selectedMonth: null as number | null,
    selectedYear: null as number | null,
    currentDate: new Date(2024, 0, 1) // Use a fixed date initially
  })
  
  const defaultValues = getDefaultValues()
  
  // State
  const [selectedDuration, setSelectedDuration] = useState(defaultValues.selectedDuration)
  const [selectedStartDate, setSelectedStartDate] = useState<number | null>(defaultValues.selectedStartDate)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(defaultValues.selectedMonth)
  const [selectedYear, setSelectedYear] = useState<number | null>(defaultValues.selectedYear)
  const [currentDate, setCurrentDate] = useState(defaultValues.currentDate)
  const [isHydrated, setIsHydrated] = useState(false)
  const [apiDateData, setApiDateData] = useState<ApiDateData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Package pricing state (from package API)
  const [packagePrices, setPackagePrices] = useState<{
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
    combined: StartingPriceItem | null;
  }>({
    football: null,
    basketball: null,
    combined: null
  })
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  // Get date restrictions based on API data and competition type
  const getDateRestrictions = useCallback((): DateRestrictions => {
    const selectedLeague = formData.selectedLeague
    const enabledDates: string[] = []
    const blockedDates: string[] = []
    const customPrices: Record<string, {
      football?: {
        standard?: number;
        premium?: number;
      };
      basketball?: {
        standard?: number;
        premium?: number;
      };
    }> = {}

    // Filter API data based on selected league and sport
    const filteredApiData = apiDateData.filter(item => {
      const matchesLeague = !selectedLeague || item.league === selectedLeague
      const matchesSport = !formData.selectedSport || 
        (formData.selectedSport === 'football' && item.sportname === 'football') ||
        (formData.selectedSport === 'basketball' && item.sportname === 'basketball') ||
        (formData.selectedSport === 'both')
      return matchesLeague && matchesSport
    })

    // Process API data
    filteredApiData.forEach(item => {
      // Use consistent date formatting
      const dateString = formatApiDateForComparison(item.date)
      
      if (item.status === 'enabled') {
        enabledDates.push(dateString)
        
        // Store custom prices for this date
        customPrices[dateString] = {
          football: {
            standard: item.updated_football_standard_package_price ?? item.football_standard_package_price,
            premium: item.updated_football_premium_package_price ?? item.football_premium_package_price
          },
          basketball: {
            standard: item.updated_baskatball_standard_package_price ?? item.baskatball_standard_package_price,
            premium: item.updated_baskatball_premium_package_price ?? item.baskatball_premium_package_price
          }
        }
      } else {
        blockedDates.push(dateString)
      }
    })

    return {
      enabledDates,
      blockedDates,
      customPrices
    }
  }, [formData.selectedLeague, formData.selectedSport, apiDateData])

  const getDurationKey = (nights: number): '1' | '2' | '3' | '4' => {
    if (nights <= 1) return '1'
    if (nights === 2) return '2'
    if (nights === 3) return '3'
    return '4'
  }

  const getCurrencySymbolFromCode = (currency?: string | null): string => {
    if (currency === 'usd') return '$'
    if (currency === 'gbp') return '£'
    return '€'
  }

  const getItemCurrencySymbol = useCallback((item?: StartingPriceItem | null): string => getCurrencySymbolFromCode(item?.currency), [])

  const selectedDurationOption = DURATION_OPTIONS[selectedDuration]
  const selectedDurationKey = getDurationKey(selectedDurationOption.nights)

  const getBaseNightPrice = useCallback((sport: SportKey, pkg: 'standard' | 'premium', nights: number): number => {
    const item = packagePrices[sport]
    if (!item) return 0
    const durationKey = getDurationKey(nights)
    const entry = item.pricesByDuration?.[durationKey]
    if (!entry) return 0
    return pkg === 'standard' ? entry.standard : entry.premium
  }, [packagePrices])

  const calculatePrice = useCallback((nights: number): string => {
    const sport = formData.selectedSport
    const packageType = formData.selectedPackage
    if (!packageType) return '€'

    let totalPrice = 0
    let currencySymbol = '€'

    if (sport === 'both') {
      const combinedBase = getBaseNightPrice('combined', packageType as 'standard' | 'premium', nights)
      if (combinedBase > 0) {
        totalPrice = combinedBase * nights
        currencySymbol = getItemCurrencySymbol(packagePrices.combined)
      } else {
        const footballBase = getBaseNightPrice('football', packageType as 'standard' | 'premium', nights)
        const basketballBase = getBaseNightPrice('basketball', packageType as 'standard' | 'premium', nights)
        totalPrice = (footballBase + basketballBase) * nights
        currencySymbol = getItemCurrencySymbol(packagePrices.football ?? packagePrices.basketball)
      }
    } else {
      const base = getBaseNightPrice(sport as BaseSportKey, packageType as 'standard' | 'premium', nights)
      totalPrice = base * nights
      currencySymbol = getItemCurrencySymbol(packagePrices[sport as BaseSportKey])
    }

    return `${totalPrice}${currencySymbol}`
  }, [formData.selectedSport, formData.selectedPackage, packagePrices, getBaseNightPrice, getItemCurrencySymbol])

  const calculatePriceForDate = useCallback((startDate: Date, nights: number): string => {
    const sport = formData.selectedSport
    const packageType = formData.selectedPackage
    if (!sport || !packageType) return '€'

    const restrictions = getDateRestrictions()
    let totalPrice = 0

    for (let i = 0; i < nights; i++) {
      const nightDate = new Date(startDate)
      nightDate.setDate(startDate.getDate() + i)
      const dateKey = formatDateForAPI(nightDate)
      const custom = restrictions.customPrices[dateKey]

      if (sport === 'both') {
        let footballNightPrice: number | undefined
        let basketballNightPrice: number | undefined
        if (custom?.football) {
          footballNightPrice = packageType === 'standard' ? (custom.football.standard ?? undefined) : (custom.football.premium ?? undefined)
        }
        if (custom?.basketball) {
          basketballNightPrice = packageType === 'standard' ? (custom.basketball.standard ?? undefined) : (custom.basketball.premium ?? undefined)
        }

        const hasCustomOverride = typeof footballNightPrice === 'number' || typeof basketballNightPrice === 'number'
        if (!hasCustomOverride) {
          const combinedNightPrice = getBaseNightPrice('combined', packageType as 'standard' | 'premium', nights)
          if (combinedNightPrice > 0) {
            totalPrice += combinedNightPrice
            continue
          }
        }

        const footballPrice = footballNightPrice ?? getBaseNightPrice('football', packageType as 'standard' | 'premium', nights)
        const basketballPrice = basketballNightPrice ?? getBaseNightPrice('basketball', packageType as 'standard' | 'premium', nights)
        totalPrice += footballPrice + basketballPrice
      } else if (sport === 'football' || sport === 'basketball') {
        let nightPrice: number | undefined
        if (sport === 'football') {
          nightPrice = packageType === 'standard' ? custom?.football?.standard : custom?.football?.premium
        } else {
          nightPrice = packageType === 'standard' ? custom?.basketball?.standard : custom?.basketball?.premium
        }
        if (typeof nightPrice !== 'number') {
          nightPrice = getBaseNightPrice(sport, packageType as 'standard' | 'premium', nights)
        }
        totalPrice += nightPrice
      }
    }

    let currencyItem: StartingPriceItem | null | undefined
    if (sport === 'football') {
      currencyItem = packagePrices.football
    } else if (sport === 'basketball') {
      currencyItem = packagePrices.basketball
    } else {
      currencyItem = packagePrices.combined ?? packagePrices.football ?? packagePrices.basketball
    }

    const currency = getItemCurrencySymbol(currencyItem)
    return `${totalPrice}${currency}`
  }, [formData.selectedSport, formData.selectedPackage, getDateRestrictions, getBaseNightPrice, packagePrices, getItemCurrencySymbol])

  // Fetch API data
  useEffect(() => {
    const fetchDateData = async () => {
      try {
        setIsLoading(true)
        const data = await getAllDates()
        setApiDateData(data)
      } catch (error) {
        console.error('Error fetching date data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDateData()
  }, [])

  // Fetch package pricing data
  useEffect(() => {
    const fetchPackagePrices = async () => {
      try {
        setIsLoadingPrices(true)
        const [footballRes, basketballRes, combinedRes] = await Promise.all([
          getStartingPrice('football'),
          getStartingPrice('basketball'),
          getStartingPrice('combined')
        ])
        
        if (footballRes.success && basketballRes.success && combinedRes.success) {
          setPackagePrices({
            football: footballRes.data?.[0] || null,
            basketball: basketballRes.data?.[0] || null,
            combined: combinedRes.data?.[0] || null
          })
        }
      } catch (error) {
        console.error('Error fetching package prices:', error)
      } finally {
        setIsLoadingPrices(false)
      }
    }
    
    fetchPackagePrices()
  }, [])

  // Set proper current date after hydration
  useEffect(() => {
    setIsHydrated(true)
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }, [])

  // Load existing data when component mounts or when BookingContext data changes
  useEffect(() => {
    if (isHydrated && formData.departureDate && formData.returnDate) {
      const startDate = new Date(formData.departureDate)
      const endDate = new Date(formData.returnDate)
      
      // Calculate duration from date difference
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      // Find matching duration option
      const durationIndex = DURATION_OPTIONS.findIndex(option => option.days === diffDays)
      
      setSelectedDuration(durationIndex >= 0 ? durationIndex : 1)
      setSelectedStartDate(startDate.getDate())
      setSelectedMonth(startDate.getMonth())
      setSelectedYear(startDate.getFullYear())
      setCurrentDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1))
    }
  }, [formData.departureDate, formData.returnDate, isHydrated])

  // Ensure current month or later on mount
  useEffect(() => {
    if (isHydrated) {
      const today = new Date()
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const displayedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      
      if (displayedMonth < currentMonth) {
        setCurrentDate(currentMonth)
      }
    }
  }, [currentDate, isHydrated])

  // Update form data when selection changes (only if form context is available)
  useEffect(() => {
    if (setValue && selectedStartDate && selectedMonth !== null && selectedYear !== null) {
      const startDate = new Date(selectedYear, selectedMonth, selectedStartDate)
      const duration = DURATION_OPTIONS[selectedDuration]
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + duration.days - 1)
      
      setValue('dateSelection', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: duration,
        nights: duration.nights
      })
    }
  }, [selectedStartDate, selectedMonth, selectedYear, selectedDuration, setValue])

  // Memoized calculations
  const nextMonth = useMemo(() => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    return next
  }, [currentDate])

  const selectedDateRange = useMemo(() => {
    if (!selectedStartDate || selectedMonth === null || selectedYear === null) {
      return null
    }
    
    const startDate = new Date(selectedYear, selectedMonth, selectedStartDate)
    const duration = DURATION_OPTIONS[selectedDuration].days
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + duration - 1)
    
    return { startDate, endDate }
  }, [selectedStartDate, selectedMonth, selectedYear, selectedDuration])

  // Event handlers
  const handleDateClick = useCallback((day: number, monthIndex: number, year: number) => {
    const selectedDate = new Date(year, monthIndex, day)
    
    if (!isDateInPast(selectedDate)) {
      setSelectedStartDate(day)
      setSelectedMonth(monthIndex)
      setSelectedYear(year)
    }
  }, [])

  const handleDurationChange = useCallback((index: number) => {
    setSelectedDuration(index)
    // Clear selection when duration changes
    setSelectedStartDate(null)
    setSelectedMonth(null)
    setSelectedYear(null)
  }, [])

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1))
      
      // Don't allow navigation to past months
      const today = new Date()
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const targetMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      
      return targetMonth >= currentMonth ? newDate : prevDate
    })
  }, [])

  // Helper functions
  const getDaysInMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }, [])

  const generateCalendarDays = useCallback((date: Date): (number | null)[] => {
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

    // Add empty cells to complete the last week
    const remainder = days.length % 7
    if (remainder !== 0) {
      const cellsToAdd = 7 - remainder
      for (let i = 0; i < cellsToAdd; i++) {
        days.push(null)
      }
    }

    return days
  }, [getDaysInMonth, getFirstDayOfMonth])

  const getDateStatus = useCallback((day: number | null, monthIndex: number, year: number) => {
    if (!day) {
      return { isSelected: false, isInRange: false, isDisabled: false }
    }

    const currentCheckDate = new Date(year, monthIndex, day)
    const restrictions = getDateRestrictions()
    
    // Check if date is in the past
    const isPast = isDateInPast(currentCheckDate)
    
    // Check if date is allowed for the competition type
    const isAllowed = isDateAllowedForCompetition(currentCheckDate, restrictions)
    
    // Date is disabled if it's in the past OR not allowed for competition
    const isDisabled = isPast || !isAllowed
    
    // Check selection status
    if (!selectedDateRange) {
      return { isSelected: false, isInRange: false, isDisabled }
    }

    const { startDate, endDate } = selectedDateRange
    const isSelected = currentCheckDate >= startDate && currentCheckDate <= endDate
    const isInRange = currentCheckDate > startDate && currentCheckDate < endDate

    return { isSelected, isInRange, isDisabled }
  }, [selectedDateRange, getDateRestrictions])

  // Render functions
  const renderEmptyDay = useCallback(() => (
    <div className="w-12 h-12 inline-flex flex-col justify-center items-center">
      <div className="text-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight"> </div>
      <div className="text-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed"> </div>
    </div>
  ), [])

  const renderCalendarDay = useCallback((day: number | null, monthIndex: number, year: number, isCurrentMonth: boolean = true) => {
    if (!day) return renderEmptyDay()

    const currentCheckDate = new Date(year, monthIndex, day)
    const { isSelected, isInRange, isDisabled } = getDateStatus(day, monthIndex, year)
    const textColor = isDisabled ? 'text-zinc-400' : 'text-zinc-950'
    const cursorClass = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'

    const handleClick = () => {
      if (isCurrentMonth && !isDisabled) {
        handleDateClick(day, monthIndex, year)
      }
    }

    // Calculate price for the selected duration and this specific date
    const currentPrice = calculatePriceForDate(currentCheckDate, DURATION_OPTIONS[selectedDuration].nights)
    

    if (isSelected) {
      const bgColor = isInRange ? 'bg-[#D5EBC5]' : 'bg-[#76C043]'
      const textColorSelected = isInRange ? 'text-lime-600' : 'text-white'
      const outline = "rounded outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden"
      
      // Check if this is the start date (main selection) - only show price on start date
      const isStartDate = selectedDateRange && 
        currentCheckDate.getTime() === selectedDateRange.startDate.getTime()

      return (
        <div className={outline}>
          <div className={`w-12 h-12 ${bgColor} rounded inline-flex flex-col justify-center items-center cursor-pointer`} 
               onClick={handleClick}>
            <div className={`text-center ${textColorSelected} text-sm font-medium font-['Poppins'] leading-tight`}>
              {day}
            </div>
            {isStartDate && (
              <div className={`text-center ${textColorSelected} text-sm font-normal font-['Poppins'] leading-relaxed`}>
                {currentPrice}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={`w-12 h-12 rounded inline-flex flex-col justify-center items-center ${cursorClass}`} 
           onClick={handleClick}>
        <div className={`text-center ${textColor} text-sm font-medium font-['Poppins'] leading-tight`}>
          {day}
        </div>
        {!isDisabled && (
          <div className="text-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
            {currentPrice}
          </div>
        )}
      </div>
    )
  }, [getDateStatus, handleDateClick, renderEmptyDay, calculatePriceForDate, selectedDuration, selectedDateRange])

  const renderCalendarWeeks = useCallback((days: (number | null)[], monthIndex: number, year: number) => {
    const weeks: (number | null)[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="self-stretch inline-flex justify-start items-center">
        {week.map((day, dayIndex) => {
          const { isSelected, isInRange } = getDateStatus(day, monthIndex, year)
          
          if (isSelected && isInRange && day) {
            return (
              <div key={dayIndex} className="rounded outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
                {renderCalendarDay(day, monthIndex, year, true)}
              </div>
            )
          }

          return (
            <div key={dayIndex}>
              {renderCalendarDay(day, monthIndex, year, true)}
            </div>
          )
        })}
      </div>
    ))
  }, [getDateStatus, renderCalendarDay])

  const renderCalendarHeader = useCallback((date: Date, showPrevNav: boolean, showNextNav: boolean) => (
    <div className="self-stretch inline-flex justify-between items-center">
      <div className={`w-8 h-8 bg-white rounded-full border border-white ${showPrevNav ? 'cursor-pointer hover:bg-gray-50' : ''} flex items-center justify-center`} 
           onClick={showPrevNav ? () => navigateMonth('prev') : undefined}>
        {showPrevNav && <FaChevronLeft size={12} className="text-zinc-950" />}
      </div>
      <div className="px-2 py-[5px] rounded-xl flex justify-start items-start gap-2.5">
        <div className="justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight">
          {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
        </div>
      </div>
      <div className={`w-8 h-8 bg-white rounded-full border border-white ${showNextNav ? 'cursor-pointer hover:bg-gray-50' : ''} flex items-center justify-center`} 
           onClick={showNextNav ? () => navigateMonth('next') : undefined}>
        {showNextNav && <FaChevronRight size={12} className="text-zinc-950" />}
      </div>
    </div>
  ), [navigateMonth])

  const renderWeekDaysHeader = useCallback(() => (
    <div className="self-stretch py-3 inline-flex justify-start items-center gap-6">
      {WEEK_DAYS.map((day) => (
        <div key={day} className="w-7 h-4 relative">
          <div className="w-7 h-4 left-0 top-0 absolute text-center justify-center text-zinc-950 text-xs font-medium font-['Poppins'] leading-none">
            {day}
          </div>
        </div>
      ))}
    </div>
  ), [])

  // Memoized calendar data
  const currentMonthDays = useMemo(() => generateCalendarDays(currentDate), [generateCalendarDays, currentDate])
  const nextMonthDays = useMemo(() => generateCalendarDays(nextMonth), [generateCalendarDays, nextMonth])

  // Show loading state
  if (isLoading || isLoadingPrices) {
    return (
      <div className="w-full xl:w-[894px] xl:min-h-[754px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-center items-center gap-6 min-h-[600px]">
        <div className="text-center text-neutral-800 text-xl font-medium font-['Poppins']">
          Loading available dates...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full xl:w-[894px] xl:min-h-[754px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-start items-start gap-6 min-h-[600px]">
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">Date Section</div>
        </div>
        
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          {/* Package and Price Info */}
          {formData.selectedSport && formData.selectedPackage && (
            <div className="w-full p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-600 font-medium">
                  {formData.selectedPackage.charAt(0).toUpperCase() + formData.selectedPackage.slice(1)} Package - {formData.selectedSport.charAt(0).toUpperCase() + formData.selectedSport.slice(1)}
                </div>
                <div className="text-lg font-bold text-lime-600">
                  From {calculatePrice(DURATION_OPTIONS[selectedDuration].nights)}
                </div>
                <div className="text-xs text-gray-500">
                  {DURATION_OPTIONS[selectedDuration].days} days, {DURATION_OPTIONS[selectedDuration].nights} nights
                </div>
              </div>
            </div>
          )}

          {/* Competition Type and Date Restrictions Info */}
          {/* {formData.selectedLeague && (
            <div className="w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-blue-800">
                  {formData.selectedLeague === 'european' ? '🏆 European Leagues' : '⚽ National Leagues'}
                </div>
                <div className="text-xs text-blue-500">
                  Available departure dates: Specific dates enabled in calendar
                </div>
              </div>
            </div>
          )} */}

          {/* Duration Selectionn */}
          <div className="p-1 bg-white rounded-xl outline-1 outline-offset-[-1px] outline-gray-200 w-full overflow-x-auto">
            <div className="flex xl:inline-flex justify-start items-center gap-1 xl:gap-0 min-w-max xl:min-w-0">
              {DURATION_OPTIONS.map((option, index) => (
                <div
                  key={index}
                  className={`w-32 xl:w-36 px-4 xl:px-6 py-3 rounded-lg flex flex-col justify-start items-center cursor-pointer flex-shrink-0 ${
                    selectedDuration === index ? 'bg-[#76C043]' : 'bg-white'
                  }`}
                  onClick={() => handleDurationChange(index)}
                >
                  <div className={`justify-center text-base xl:text-lg font-medium font-['Poppins'] leading-loose ${
                    selectedDuration === index ? 'text-white' : 'text-black'
                  }`}>
                    {option.days} day
                  </div>
                  <div className={`justify-center text-xs xl:text-sm font-normal font-['Poppins'] leading-relaxed ${
                    selectedDuration === index ? 'text-white' : 'text-black'
                  }`}>
                    {option.nights}{option.nights === 1 ? ' Night' : ' Night'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Sectioon */}
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="w-full p-4 xl:p-6 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-start overflow-x-auto">
              <div className="flex flex-col xl:flex-row justify-start items-start gap-6 xl:gap-8 min-w-full xl:min-w-0">
                {/* Current Month Calendar */}
                <div className="w-full xl:w-96 flex flex-col justify-start items-center gap-4 xl:gap-6">
                  {renderCalendarHeader(currentDate, true, false)}
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {renderWeekDaysHeader()}
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {renderCalendarWeeks(currentMonthDays, currentDate.getMonth(), currentDate.getFullYear())}
                    </div>
                  </div>
                </div>
                
                {/* Next Month Calendar */}
                <div className="w-full xl:w-96 flex flex-col justify-start items-center gap-4 xl:gap-6">
                  {renderCalendarHeader(nextMonth, false, true)}
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {renderWeekDaysHeader()}
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {renderCalendarWeeks(nextMonthDays, nextMonth.getMonth(), nextMonth.getFullYear())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Pricing Debugger */}
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="w-full p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex flex-col gap-3">
              <div className="text-lg font-semibold text-gray-800 font-['Poppins']">
                Package Pricing Data (From Package API)
              </div>
              <div className="text-sm text-gray-600 font-['Poppins']">
                Dynamic pricing data from package service - same as package table
              </div>
              
              {/* Package Pricing Content */}
              <div className="w-full border border-gray-200 rounded-lg bg-white p-4">
                {isLoadingPrices ? (
                  <div className="text-center text-gray-500 font-['Poppins']">
                    Loading package prices...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Football Pricing */}
                    <div className="flex flex-col gap-2">
                      <div className="font-medium text-gray-700 font-['Poppins']">Football</div>
                      {packagePrices.football ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-['Poppins']">Standard:</span>
                            <span className="font-semibold text-lime-600 font-['Poppins']">
                              {packagePrices.football.pricesByDuration?.[selectedDurationKey]?.standard ?? 0}
                              {getItemCurrencySymbol(packagePrices.football)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-['Poppins']">Premium:</span>
                            <span className="font-semibold text-lime-600 font-['Poppins']">
                              {packagePrices.football.pricesByDuration?.[selectedDurationKey]?.premium ?? 0}
                              {getItemCurrencySymbol(packagePrices.football)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">No football pricing data</div>
                      )}
                    </div>
                    
                    {/* Basketball Pricing */}
                    <div className="flex flex-col gap-2">
                      <div className="font-medium text-gray-700 font-['Poppins']">Basketball</div>
                      {packagePrices.basketball ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-['Poppins']">Standard:</span>
                            <span className="font-semibold text-lime-600 font-['Poppins']">
                              {packagePrices.basketball.pricesByDuration?.[selectedDurationKey]?.standard ?? 0}
                              {getItemCurrencySymbol(packagePrices.basketball)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-['Poppins']">Premium:</span>
                            <span className="font-semibold text-lime-600 font-['Poppins']">
                              {packagePrices.basketball.pricesByDuration?.[selectedDurationKey]?.premium ?? 0}
                              {getItemCurrencySymbol(packagePrices.basketball)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">No basketball pricing data</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
               {/* Current Selection Info */}
               <div className="text-sm text-gray-600 font-['Poppins']">
                 Current selection: {formData.selectedSport} - {formData.selectedPackage} package
                 {formData.selectedSport && formData.selectedPackage && (
                   <span className="ml-2 font-semibold text-lime-600">
                     {formData.selectedSport === 'both' ? (
                       packagePrices.combined ? (
                         <>
                           (Combined base price: {formData.selectedPackage === 'standard'
                             ? (packagePrices.combined.pricesByDuration?.[selectedDurationKey]?.standard ?? 0)
                             : (packagePrices.combined.pricesByDuration?.[selectedDurationKey]?.premium ?? 0)}
                           {getItemCurrencySymbol(packagePrices.combined)})
                         </>
                       ) : 'Loading...'
                     ) : (
                       packagePrices[formData.selectedSport as BaseSportKey] && (
                         <>
                           (Base price: {formData.selectedPackage === 'standard' 
                             ? packagePrices[formData.selectedSport as BaseSportKey]?.pricesByDuration?.[selectedDurationKey]?.standard
                             : packagePrices[formData.selectedSport as BaseSportKey]?.pricesByDuration?.[selectedDurationKey]?.premium}
                           {getItemCurrencySymbol(packagePrices[formData.selectedSport as BaseSportKey])})
                         </>
                       )
                     )}
                   </span>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={() => {
            if (selectedStartDate && selectedMonth !== null && selectedYear !== null) {
              const startDate = new Date(selectedYear, selectedMonth, selectedStartDate)
              const duration = DURATION_OPTIONS[selectedDuration]
              const endDate = new Date(startDate)
              endDate.setDate(startDate.getDate() + duration.days - 1)
              
              updateFormData({ 
                departureDate: startDate.toISOString(),
                returnDate: endDate.toISOString()
              })
              
              nextStep()
            }
          }}
          disabled={!selectedStartDate || selectedMonth === null || selectedYear === null}
          className={`w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-colors ${
            selectedStartDate && selectedMonth !== null && selectedYear !== null
              ? 'bg-[#76C043] hover:bg-lime-600 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Next</div>
        </button>
      </div>
    </div>
  )
}
