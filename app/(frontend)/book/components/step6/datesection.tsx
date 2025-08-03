'use client'
import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface DurationOption {
  days: number
  nights: number
}

export default function DateSection() {
  const [selectedDuration, setSelectedDuration] = useState(1) // 3-day option selected by default
  const [selectedStartDate, setSelectedStartDate] = useState<number | null>(null) // No default selection
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null) // No default month
  const [selectedYear, setSelectedYear] = useState<number | null>(null) // No default year
  const [currentDate, setCurrentDate] = useState(new Date()) // Use current date

  const durationOptions: DurationOption[] = [
    { days: 2, nights: 1 },
    { days: 3, nights: 2 },
    { days: 4, nights: 3 },
    { days: 5, nights: 4 }
  ]

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Ensure we always start from current month or later
  useEffect(() => {
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const displayedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    if (displayedMonth < currentMonth) {
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array to run only once on mount

  const handleDateClick = (day: number, monthIndex: number, year: number) => {
    // Only allow selection of current date or future dates
    const selectedDate = new Date(year, monthIndex, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare only dates
    
    if (selectedDate >= today) {
      setSelectedStartDate(day)
      setSelectedMonth(monthIndex)
      setSelectedYear(year)
    }
  }

  const isDateSelected = (day: number, monthIndex: number, year: number) => {
    if (!selectedStartDate || selectedMonth === null || selectedYear === null) return false
    
    const selectedDate = new Date(selectedYear, selectedMonth, selectedStartDate)
    const currentCheckDate = new Date(year, monthIndex, day)
    const duration = durationOptions[selectedDuration].days
    const endDate = new Date(selectedDate)
    endDate.setDate(selectedDate.getDate() + duration - 1)
    
    return currentCheckDate >= selectedDate && currentCheckDate <= endDate
  }

  const isDateInRange = (day: number, monthIndex: number, year: number) => {
    if (!selectedStartDate || selectedMonth === null || selectedYear === null) return false
    
    const selectedDate = new Date(selectedYear, selectedMonth, selectedStartDate)
    const currentCheckDate = new Date(year, monthIndex, day)
    const duration = durationOptions[selectedDuration].days
    const endDate = new Date(selectedDate)
    endDate.setDate(selectedDate.getDate() + duration - 1)
    
    return currentCheckDate > selectedDate && currentCheckDate < endDate
  }

  const isDateDisabled = (day: number, monthIndex: number, year: number) => {
    // Disable past dates
    const selectedDate = new Date(year, monthIndex, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare only dates
    
    return selectedDate < today
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date)
    const firstDay = getFirstDayOfMonth(date)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    // Only add empty cells to complete the last week (make it divisible by 7)
    const remainder = days.length % 7
    if (remainder !== 0) {
      const cellsToAdd = 7 - remainder
      for (let i = 0; i < cellsToAdd; i++) {
        days.push(null)
      }
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      
      // Don't allow navigation to past months
      const today = new Date()
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const targetMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
      
      if (targetMonth >= currentMonth) {
        return newDate
      }
      
      return prevDate // Return previous date if trying to go to past month
    })
  }

  const getNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  }

  const renderCalendarDay = (day: number | null, isCurrentMonth: boolean = true) => {
    if (!day) {
      return (
        <div className="w-12 h-12 inline-flex flex-col justify-start items-center">
          <div className="self-stretch h-7 relative">
            <div className="w-7 h-7 left-[11px] top-0 absolute text-center justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight"> </div>
          </div>
          <div className="self-stretch text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed"> </div>
        </div>
      )
    }

    const isSelected = day ? isDateSelected(day, currentDate.getMonth(), currentDate.getFullYear()) : false
    const isInRange = day ? isDateInRange(day, currentDate.getMonth(), currentDate.getFullYear()) : false
    const isDisabled = isCurrentMonth && isDateDisabled(day, currentDate.getMonth(), currentDate.getFullYear())

    if (isSelected) {
      if (isInRange) {
        return (
          <div className="w-12 h-12 bg-[#D5EBC5] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
               onClick={() => isCurrentMonth && handleDateClick(day, currentDate.getMonth(), currentDate.getFullYear())}>
            <div className="text-center justify-center text-lime-600 text-sm font-medium font-['Poppins'] leading-tight">
              {day}
            </div>
            <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
              150€
            </div>
          </div>
        )
      } else {
        return (
          <div className="w-12 h-12 bg-[#76C043] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
               onClick={() => isCurrentMonth && handleDateClick(day, currentDate.getMonth(), currentDate.getFullYear())}>
            <div className="text-center justify-center text-white text-sm font-medium font-['Poppins'] leading-tight">
              {day}
            </div>
            <div className="text-center justify-center text-white text-sm font-normal font-['Poppins'] leading-relaxed">
              150€
            </div>
          </div>
        )
      }
    }

    const textColor = isDisabled ? 'text-zinc-400' : 'text-zinc-950'
    
    return (
      <div className="w-12 h-12 inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
           onClick={() => isCurrentMonth && !isDisabled && handleDateClick(day, currentDate.getMonth(), currentDate.getFullYear())}>
        <div className={`text-center justify-center ${textColor} text-sm font-medium font-['Poppins'] leading-tight`}>
          {day}
        </div>
        <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
          150€
        </div>
      </div>
    )
  }

  const renderCalendarWeeks = (days: (number | null)[]) => {
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7)
      weeks.push(week)
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="self-stretch inline-flex justify-start items-center">
        {week.map((day, dayIndex) => {
          const isSelected = day ? isDateSelected(day, currentDate.getMonth(), currentDate.getFullYear()) : false
          const isInRange = day ? isDateInRange(day, currentDate.getMonth(), currentDate.getFullYear()) : false
          
          if (isSelected) {
            if (isInRange) {
              return (
                <div key={dayIndex} className="rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
                  <div className="w-12 h-12 bg-[#D5EBC5] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
                       onClick={() => handleDateClick(day!, currentDate.getMonth(), currentDate.getFullYear())}>
                    <div className="text-center justify-center text-lime-600 text-sm font-medium font-['Poppins'] leading-tight">
                      {day}
                    </div>
                    <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
                      150€
                    </div>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={dayIndex} className="rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
                  <div className="w-12 h-12 bg-[#76C043] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
                       onClick={() => handleDateClick(day!, currentDate.getMonth(), currentDate.getFullYear())}>
                    <div className="text-center justify-center text-white text-sm font-medium font-['Poppins'] leading-tight">
                      {day}
                    </div>
                    <div className="text-center justify-center text-white text-sm font-normal font-['Poppins'] leading-relaxed">
                      150€
                    </div>
                  </div>
                </div>
              )
            }
          }
          
          return (
            <div key={dayIndex}>
              {renderCalendarDay(day, true)}
            </div>
          )
        })}
      </div>
    ))
  }

  const currentMonthDays = generateCalendarDays(currentDate)
  const nextMonth = getNextMonth()
  const nextMonthDays = generateCalendarDays(nextMonth)

  return (
    <div className="w-[894px] min-h-[754px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-start items-start gap-6">
  <div className="self-stretch flex flex-col justify-center items-start gap-3">
    <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
      <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">Date Section </div>
    </div>
    <div className="self-stretch flex flex-col justify-start items-start gap-3">
      <div className="p-1 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center">
            {durationOptions.map((option, index) => (
              <div
                key={index}
                className={`w-36 px-6 py-3 rounded-lg inline-flex flex-col justify-start items-center cursor-pointer ${
                  selectedDuration === index ? 'bg-[#76C043]' : 'bg-white'
                }`}
                onClick={() => {
                  setSelectedDuration(index)
                  // Clear selection when duration changes to avoid confusion
                  setSelectedStartDate(null)
                  setSelectedMonth(null)
                  setSelectedYear(null)
                }}
              >
                <div className={`justify-center text-lg font-medium font-['Poppins'] leading-loose ${
                  selectedDuration === index ? 'text-white' : 'text-black'
                }`}>
                  {option.days} day
                </div>
                <div className={`justify-center text-sm font-normal font-['Poppins'] leading-relaxed ${
                  selectedDuration === index ? 'text-white' : 'text-black'
                }`}>
                  {option.nights}{option.nights === 1 ? ' Night' : 'Night'}
                </div>
              </div>
            ))}
                  </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="p-6 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-center items-start gap-8">
              <div className="flex justify-start items-start gap-8">
                {/* Current Month Calendar */}
                <div className="w-96 inline-flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="w-8 h-8 bg-white rounded-full border border-white cursor-pointer flex items-center justify-center hover:bg-gray-50" 
                         onClick={() => navigateMonth('prev')}>
                      <FaChevronLeft size={12} className="text-zinc-950" />
                    </div>
                    <div className="px-2 py-[5px] rounded-xl flex justify-start items-start gap-2.5">
                      <div className="justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full border border-white" />
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch py-3 inline-flex justify-start items-center gap-6">
                      {weekDays.map((day) => (
                        <div key={day} className="w-7 h-4 relative">
                          <div className="w-7 h-4 left-0 top-0 absolute text-center justify-center text-zinc-950 text-xs font-medium font-['Poppins'] leading-none">
                            {day}
                    </div>
                        </div>
                      ))}
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {renderCalendarWeeks(currentMonthDays)}
                    </div>
                  </div>
                </div>
                
                {/* Next Month Calendar */}
            <div className="w-96 inline-flex flex-col justify-start items-center gap-6">
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="w-8 h-8 bg-white rounded-full border border-white" />
                <div className="px-2 py-[5px] rounded-xl flex justify-start items-start gap-2.5">
                      <div className="justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight">
                        {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full border border-white cursor-pointer flex items-center justify-center hover:bg-gray-50" 
                         onClick={() => navigateMonth('next')}>
                      <FaChevronRight size={12} className="text-zinc-950" />
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch py-3 inline-flex justify-start items-center gap-6">
                      {weekDays.map((day) => (
                        <div key={day} className="w-7 h-4 relative">
                          <div className="w-7 h-4 left-0 top-0 absolute text-center justify-center text-zinc-950 text-xs font-medium font-['Poppins'] leading-none">
                            {day}
                    </div>
                  </div>
                      ))}
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {(() => {
                        const weeks = []
                        for (let i = 0; i < nextMonthDays.length; i += 7) {
                          const week = nextMonthDays.slice(i, i + 7)
                          weeks.push(week)
                        }
                        
                        return weeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="self-stretch inline-flex justify-start items-center">
                            {week.map((day, dayIndex) => {
                              if (!day) {
                                return (
                                  <div key={dayIndex} className="w-12 h-12 inline-flex flex-col justify-start items-center">
                      <div className="self-stretch h-7 relative">
                                      <div className="w-7 h-7 left-[11px] top-0 absolute text-center justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight"> </div>
                      </div>
                                    <div className="self-stretch text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed"> </div>
                    </div>
                                )
                              }

                              const isSelected = isDateSelected(day, nextMonth.getMonth(), nextMonth.getFullYear())
                              const isInRange = isDateInRange(day, nextMonth.getMonth(), nextMonth.getFullYear())
                              const isDisabled = isDateDisabled(day, nextMonth.getMonth(), nextMonth.getFullYear())

                              if (isSelected) {
                                if (isInRange) {
                                  return (
                                    <div key={dayIndex} className="rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
                                      <div className="w-12 h-12 bg-[#D5EBC5] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
                                           onClick={() => !isDisabled && handleDateClick(day, nextMonth.getMonth(), nextMonth.getFullYear())}>
                                        <div className="text-center justify-center text-lime-600 text-sm font-medium font-['Poppins'] leading-tight">
                                          {day}
                      </div>
                                        <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
                                          150€
                    </div>
                      </div>
                    </div>
                                  )
                                } else {
                                  return (
                                    <div key={dayIndex} className="rounded outline outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden">
                                      <div className="w-12 h-12 bg-[#76C043] inline-flex flex-col justify-start items-center cursor-pointer pt-2" 
                                           onClick={() => !isDisabled && handleDateClick(day, nextMonth.getMonth(), nextMonth.getFullYear())}>
                                        <div className="text-center justify-center text-white text-sm font-medium font-['Poppins'] leading-tight">
                                          {day}
                      </div>
                                        <div className="text-center justify-center text-white text-sm font-normal font-['Poppins'] leading-relaxed">
                                          150€
                      </div>
                    </div>
                  </div>
                                  )
                                }
                              }

                              const textColor = isDisabled ? 'text-zinc-400' : 'text-zinc-950'
                              const cursorClass = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'

                              return (
                                <div key={dayIndex} className={`w-12 h-12 inline-flex flex-col justify-start items-center ${cursorClass} pt-2`} 
                                     onClick={() => !isDisabled && handleDateClick(day, nextMonth.getMonth(), nextMonth.getFullYear())}>
                                  <div className={`text-center justify-center ${textColor} text-sm font-medium font-['Poppins'] leading-tight`}>
                                    {day}
                      </div>
                                  <div className="text-center justify-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
                                    150€
                    </div>
                  </div>
                              )
                            })}
                      </div>
                        ))
                      })()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5">
          <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Next</div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
