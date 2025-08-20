'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useFormContext } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { pricing } from '../../../../lib/appdata'

// Types
interface DurationOption {
  days: number
  nights: number
}



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

export default function DateSection() {
  const { formData, updateFormData, nextStep } = useBooking()
  
  // Optional React Hook Form integration
  const formContext = useFormContext?.() || null
  const setValue = formContext?.setValue

  // Calculate dynamic price based on sport, package, and nights
  const calculatePrice = useCallback((nights: number): string => {
    const sport = formData.selectedSport as 'football' | 'basketball'
    const packageType = formData.selectedPackage as 'standard' | 'premium'
    
    if (!sport || !packageType) return '€'
    
    const price = pricing.getPrice(sport, packageType, nights)
    return `${price}€`
  }, [formData.selectedSport, formData.selectedPackage])
  
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
    if (!day || !selectedDateRange) {
      return { isSelected: false, isInRange: false, isDisabled: day ? isDateInPast(new Date(year, monthIndex, day)) : false }
    }

    const currentCheckDate = new Date(year, monthIndex, day)
    const { startDate, endDate } = selectedDateRange
    
    const isSelected = currentCheckDate >= startDate && currentCheckDate <= endDate
    const isInRange = currentCheckDate > startDate && currentCheckDate < endDate
    const isDisabled = isDateInPast(currentCheckDate)

    return { isSelected, isInRange, isDisabled }
  }, [selectedDateRange])

  // Render functions
  const renderEmptyDay = useCallback(() => (
    <div className="w-12 h-12 inline-flex flex-col justify-start items-center">
      <div className="self-stretch h-7 relative">
        <div className="w-7 h-7 left-[11px] top-0 absolute text-center justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight"> </div>
      </div>
      <div className="self-stretch text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed"> </div>
    </div>
  ), [])

  const renderCalendarDay = useCallback((day: number | null, monthIndex: number, year: number, isCurrentMonth: boolean = true) => {
    if (!day) return renderEmptyDay()

    const { isSelected, isInRange, isDisabled } = getDateStatus(day, monthIndex, year)
    const textColor = isDisabled ? 'text-zinc-400' : 'text-zinc-950'
    const cursorClass = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'

    const handleClick = () => {
      if (isCurrentMonth && !isDisabled) {
        handleDateClick(day, monthIndex, year)
      }
    }

    // Calculate price for the selected duration
    const currentPrice = calculatePrice(DURATION_OPTIONS[selectedDuration].nights)

    if (isSelected) {
      const bgColor = isInRange ? 'bg-[#D5EBC5]' : 'bg-[#76C043]'
      const textColorSelected = isInRange ? 'text-lime-600' : 'text-white'
      const outline = "rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden"

      return (
        <div className={isInRange ? outline : ''}>
          <div className={`w-12 h-12 ${bgColor} rounded inline-flex flex-col justify-start items-center cursor-pointer pt-2`} 
               onClick={handleClick}>
            <div className={`text-center justify-center ${textColorSelected} text-sm font-medium font-['Poppins'] leading-tight`}>
              {day}
            </div>
            <div className={`text-center justify-center ${textColorSelected} text-sm font-normal font-['Poppins'] leading-relaxed`}>
              {currentPrice}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`w-12 h-12 rounded inline-flex flex-col justify-start items-center ${cursorClass} pt-2`} 
           onClick={handleClick}>
        <div className={`text-center justify-center ${textColor} text-sm font-medium font-['Poppins'] leading-tight`}>
          {day}
        </div>
        <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
          {currentPrice}
        </div>
      </div>
    )
  }, [getDateStatus, handleDateClick, renderEmptyDay, calculatePrice, selectedDuration])

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
              <div key={dayIndex} className="rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
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

  return (
    <div className="w-full xl:w-[894px] xl:min-h-[754px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-start items-start gap-6 min-h-[600px]">
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
                  {pricing.getPackageName(
                    formData.selectedSport as 'football' | 'basketball',
                    formData.selectedPackage as 'standard' | 'premium'
                  )}
                </div>
                <div className="text-lg font-bold text-lime-600">
                  {calculatePrice(DURATION_OPTIONS[selectedDuration].nights)}
                </div>
                <div className="text-xs text-gray-500">
                  {DURATION_OPTIONS[selectedDuration].days} days, {DURATION_OPTIONS[selectedDuration].nights} nights
                </div>
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div className="p-1 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 w-full overflow-x-auto">
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
                    {option.nights}{option.nights === 1 ? ' Night' : 'Night'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="w-full p-4 xl:p-6 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-start overflow-x-auto">
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
