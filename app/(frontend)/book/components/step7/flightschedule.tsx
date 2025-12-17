'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md'
import { Range } from 'react-range'
import { useBooking } from '../../context/BookingContext'
import { flightScheduleData } from '../../../../lib/appdata'
import { TranslatedText } from '../../../_components/TranslatedText'

// ========================= TYPES =========================
interface TimeRange {
  start: number // minutes from 00:00
  end: number   // minutes from 00:00
}

interface FlightInfo {
  label: string
  city: string
  price: string
  icon: 'takeoff' | 'landing'
  timeRange: TimeRange
}

interface FlightSelectionData {
  type: string
  startTime: string
  endTime: string
  duration: string
}

// ========================= STYLES =========================
const SLIDER_STYLES = {
  track: {
    height: '8px',
    background: 'rgba(168, 162, 158, 0.3)',
    outline: '4px solid rgba(168, 162, 158, 0.3)',
    outlineOffset: '-4px'
  },
  selectedRange: {
    outline: '4px solid rgb(132, 204, 22)',
    outlineOffset: '-4px'
  }
} as const

// ========================= UTILITY FUNCTIONS =========================
const minutesToTime = (minutes: number): string => {
  const constants = flightScheduleData.getConstants()
  const hours = Math.floor(minutes / 60) % constants.hoursPerDay
  const mins = minutes % 60
  const nextDay = minutes >= constants.minutesInDay ? '(+1)' : ''
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}${nextDay}`
}

// Removed old getTimeMarkPosition helper since slider uses discrete indices now

const calculateDuration = (start: number, end: number): string => {
  const durationMinutes = end - start
  const hours = Math.round((durationMinutes / 60) * 10) / 10
  return `${hours} hours`
}

// Calculate price based on steps from default range
const calculatePriceFromDefault = (timeRange: TimeRange, isDeparture: boolean): number => {
  return flightScheduleData.calculatePriceFromDefault(timeRange, isDeparture)
}

// Get available time slots for a flight type
const getAvailableTimeSlots = (isDeparture: boolean) => {
  const type = isDeparture ? 'departure' : 'arrival'
  return flightScheduleData.getAvailableTimeSlots(type)
}

// ========================= MEMOIZED COMPONENTS =========================
const FlightIcon = React.memo(({ type }: { type: 'takeoff' | 'landing' }) => (
  <div className="w-14 h-14 p-3.5 bg-[#F1F9EC] rounded flex justify-start items-center gap-2.5">
    {type === 'takeoff' ? (
      <MdFlightTakeoff className="w-6 h-6 text-[#6AAD3C]" />
    ) : (
      <MdFlightLand className="w-6 h-6 text-[#6AAD3C]" />
    )}
  </div>
))

FlightIcon.displayName = 'FlightIcon'

const FlightInfoHeader = React.memo(({ 
  label, 
  city, 
  price, 
  icon 
}: { 
  label: string
  city: string
  price: string
  icon: 'takeoff' | 'landing'
}) => {
  // Translate label based on its value
  const translatedLabel = label === 'Departure from' 
    ? <TranslatedText text="Salida desde" english="Departure from" />
    : label === 'Arrival'
    ? <TranslatedText text="Llegada" english="Arrival" />
    : label
  
  return (
  <div className="self-stretch inline-flex justify-start items-center gap-20">
    <div className="flex justify-start items-center gap-4">
      <FlightIcon type={icon} />
      <div className="w-32 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch justify-center text-zinc-500 text-base font-normal font-['Poppins'] leading-7">
            {translatedLabel}
        </div>
        <div className="justify-center text-neutral-800 text-xl font-medium font-['Poppins'] leading-normal">
          {city}
        </div>
      </div>
    </div>
    <div className="flex-1 flex justify-end items-center gap-4">
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch text-right justify-center text-neutral-800 text-xl font-medium font-['Poppins'] leading-normal">
          {price}
        </div>
        <div className="self-stretch text-right justify-center text-zinc-500 text-base font-normal font-['Poppins'] leading-7">
          <TranslatedText text="Por persona" english="Per person" />
        </div>
      </div>
    </div>
  </div>
  )
})

FlightInfoHeader.displayName = 'FlightInfoHeader'

const TimeDisplay = React.memo(({ 
  timeRange, 
  isDeparture 
}: { 
  timeRange: TimeRange
  isDeparture: boolean 
}) => {
  const startTime = useMemo(() => minutesToTime(timeRange.start), [timeRange.start])
  const endTime = useMemo(() => minutesToTime(timeRange.end), [timeRange.end])
  
  return (
    <div className="self-stretch px-4 py-2.5 bg-neutral-50 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-center items-center gap-2.5">
      <div className="justify-start text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
        <TranslatedText
          text={
            isDeparture
              ? `Tu vuelo saldrá entre las ${startTime} y las ${endTime}`
              : `Tu vuelo llegará entre las ${startTime} y las ${endTime}`
          }
          english={`Your flight will ${isDeparture ? 'depart' : 'land'} between ${startTime} and ${endTime}`}
        />
      </div>
    </div>
  )
})

TimeDisplay.displayName = 'TimeDisplay'

const TimeRangeSlider = React.memo(({ 
  timeRange, 
  onChange,
  isDeparture
}: { 
  timeRange: TimeRange
  onChange: (range: TimeRange) => void
  isDeparture: boolean
}) => {
  const timeSlots = getAvailableTimeSlots(isDeparture)

  // Map current minutes to discrete slot indices
  const startIndex = useMemo(() => {
    const idx = timeSlots.findIndex(slot => slot.value === timeRange.start)
    return idx >= 0 ? idx : 0
  }, [timeRange.start, timeSlots])

  const endIndex = useMemo(() => {
    const idx = timeSlots.findIndex(slot => slot.value === timeRange.end)
    return idx >= 0 ? idx : timeSlots.length - 1
  }, [timeRange.end, timeSlots])

  const handleRangeChange = useCallback((indices: number[]) => {
    const normalized = [Math.min(indices[0], indices[1]), Math.max(indices[0], indices[1])]
    
    // Ensure minimum one step difference between start and end
    let adjustedStart = normalized[0]
    let adjustedEnd = normalized[1]
    
    if (adjustedStart === adjustedEnd) {
      // If both knobs are at the same position, move the end knob one step forward
      if (adjustedEnd < timeSlots.length - 1) {
        adjustedEnd = adjustedEnd + 1
      } else if (adjustedStart > 0) {
        // If at the end, move start knob one step backward
        adjustedStart = adjustedStart - 1
      }
    }
    
    const newStart = timeSlots[adjustedStart]?.value ?? timeSlots[0].value
    const newEnd = timeSlots[adjustedEnd]?.value ?? timeSlots[timeSlots.length - 1].value
    onChange({ start: newStart, end: newEnd })
  }, [onChange, timeSlots])

  const selectedRangeStyle = useMemo(() => {
    const lastIndex = Math.max(timeSlots.length - 1, 1)
    const left = (startIndex / lastIndex) * 100
    const width = ((endIndex - startIndex) / lastIndex) * 100
    return { left: `${left}%`, width: `${width}%`, ...SLIDER_STYLES.selectedRange }
  }, [startIndex, endIndex, timeSlots.length])

  return (
    <div className="w-full xl:w-80 flex flex-col justify-center items-center gap-1.5">
      <div className="w-full h-5 relative">
        <Range
          step={1}
          min={0}
          max={Math.max(timeSlots.length - 1, 1)}
          values={[startIndex, endIndex]}
          onChange={handleRangeChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-2 bg-stone-300/30 rounded-full relative"
              style={{
                ...props.style,
                ...SLIDER_STYLES.track
              }}
            >
              <div
                className="absolute h-2 bg-[#6AAD3C] rounded-full"
                style={selectedRangeStyle}
              />
              {children}
            </div>
          )}
          renderThumb={({ props, isDragged, index }) => (
            <div
              {...props}
              className="relative w-5 h-5 border-2 border-[#6AAD3C] rounded-full shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-lime-300 bg-white"
              style={{ 
                ...props.style, 
                backgroundColor: isDragged ? '#65a30d' : 'white',
                cursor: isDragged ? 'grabbing' : 'grab'
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 whitespace-nowrap shadow-sm">
                {timeSlots[index === 0 ? startIndex : endIndex]?.label}
              </div>
            </div>
          )}
        />
      </div>
      
             {/* <div className="w-full flex justify-between items-center px-2">
         {timeSlots.map((slot, index) => (
           <div 
             key={slot.value} 
             className="text-zinc-400 text-xs font-normal font-['Inter'] leading-tight"
             style={{
               transform: `translateX(${index === 0 ? '0' : index === timeSlots.length - 1 ? '0' : '-50%'})`,
               marginLeft: index === 0 ? '0' : index === timeSlots.length - 1 ? '0' : '50%'
             }}
           >
             {slot.label}
           </div>
         ))}
       </div> */}
    </div>
  )
})

TimeRangeSlider.displayName = 'TimeRangeSlider'

const FlightCard = React.memo(({ 
  flightInfo, 
  isDeparture, 
  onTimeRangeChange 
}: { 
  flightInfo: FlightInfo
  isDeparture: boolean
  onTimeRangeChange: (range: TimeRange) => void
}) => {
  // Calculate current price based on steps from default
  const currentPrice = calculatePriceFromDefault(flightInfo.timeRange, isDeparture)
  const priceDisplay = currentPrice === 0 ? '0€' : `+${currentPrice}€`
  
  return (
    <div className="flex-1 min-h-0 p-4 xl:p-5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center gap-6 xl:gap-8">
      <div className="self-stretch flex flex-col justify-center items-center gap-6 xl:gap-8">
        <FlightInfoHeader 
          label={flightInfo.label}
          city={flightInfo.city}
          price={priceDisplay}
          icon={flightInfo.icon}
        />
        <TimeRangeSlider 
          timeRange={flightInfo.timeRange}
          onChange={onTimeRangeChange}
          isDeparture={isDeparture}
        />
      </div>
      <TimeDisplay timeRange={flightInfo.timeRange} isDeparture={isDeparture} />
    </div>
  )
})

FlightCard.displayName = 'FlightCard'

// ========================= MAIN COMPONENT =========================
export default function FlightSchedule() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Always start with default data for consistent server/client rendering
  const [flightData, setFlightData] = useState<FlightInfo[]>(() => {
    const initialData = flightScheduleData.getInitialFlightData()
    return initialData.map(flight => ({
      ...flight,
      icon: flight.icon as 'takeoff' | 'landing'
    }))
  })
  
  // Set hydration flag and load existing data after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Load existing flight data from BookingContext after hydration
    if (formData.flightSchedule) {
      setFlightData([
        {
          label: 'Departure from',
          city: 'Barcelona',
          price: '0€', // Will be calculated dynamically
          icon: 'takeoff' as const,
          timeRange: {
            start: formData.flightSchedule.departure.start,
            end: formData.flightSchedule.departure.end
          }
        },
        {
          label: 'Arrival',
          city: 'Barcelona',
          price: '0€', // Will be calculated dynamically
          icon: 'landing' as const,
          timeRange: {
            start: formData.flightSchedule.arrival.start,
            end: formData.flightSchedule.arrival.end
          }
        }
      ])
    }
  }, [formData.flightSchedule])

  // Update flight data when BookingContext data changes (only after hydration)
  useEffect(() => {
    if (isHydrated && formData.flightSchedule) {
      setFlightData([
        {
          label: 'Departure from',
          city: 'Barcelona',
          price: '0€', // Will be calculated dynamically
          icon: 'takeoff',
          timeRange: {
            start: formData.flightSchedule.departure.start,
            end: formData.flightSchedule.departure.end
          }
        },
        {
          label: 'Arrival',
          city: 'Barcelona',
          price: '0€', // Will be calculated dynamically
          icon: 'landing',
          timeRange: {
            start: formData.flightSchedule.arrival.start,
            end: formData.flightSchedule.arrival.end
          }
        }
      ])
    }
  }, [formData.flightSchedule, isHydrated])
  
  const handleTimeRangeChange = useCallback((flightIndex: number, newRange: TimeRange) => {
    // Ensure minimum one step difference between start and end times
    const timeSlots = getAvailableTimeSlots(flightIndex === 0)
    const startSlotIndex = timeSlots.findIndex(slot => slot.value === newRange.start)
    const endSlotIndex = timeSlots.findIndex(slot => slot.value === newRange.end)
    
    let adjustedRange = { ...newRange }
    
    // If start and end are the same, adjust to maintain minimum range
    if (startSlotIndex === endSlotIndex) {
      if (endSlotIndex < timeSlots.length - 1) {
        // Move end time one step forward
        adjustedRange = { ...adjustedRange, end: timeSlots[endSlotIndex + 1].value }
      } else if (startSlotIndex > 0) {
        // Move start time one step backward
        adjustedRange = { ...adjustedRange, start: timeSlots[startSlotIndex - 1].value }
      }
    }
    
    setFlightData(prev => prev.map((flight, index) => 
      index === flightIndex 
        ? { ...flight, timeRange: adjustedRange }
        : flight
    ))
  }, [])
  
  const selectedTimes = useMemo((): FlightSelectionData[] => {
    return flightData.map(flight => ({
      type: flight.label,
      startTime: minutesToTime(flight.timeRange.start),
      endTime: minutesToTime(flight.timeRange.end),
      duration: calculateDuration(flight.timeRange.start, flight.timeRange.end)
    }))
  }, [flightData])

  // Calculate total additional cost
  const totalAdditionalCost = useMemo(() => {
    const departureCost = calculatePriceFromDefault(flightData[0].timeRange, true)
    const arrivalCost = calculatePriceFromDefault(flightData[1].timeRange, false)
    return departureCost + arrivalCost
  }, [flightData])
  
  const handleConfirm = useCallback(() => {
    console.log('Selected flight times:', selectedTimes)
    
    // Save flight schedule data in structured format to booking context
    const flightScheduleData = {
      departure: {
        start: flightData[0].timeRange.start,
        end: flightData[0].timeRange.end
      },
      arrival: {
        start: flightData[1].timeRange.start,
        end: flightData[1].timeRange.end
      }
    }
    
    updateFormData({ flightSchedule: flightScheduleData })
    
    // Move to next step
    nextStep()
  }, [flightData, updateFormData, nextStep, selectedTimes])
  
  return (
    <div className="w-full xl:w-[894px] xl:h-[644px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-6 min-h-[600px] xl:min-h-0">
      <div className="self-stretch xl:h-[587px] flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
            <TranslatedText text="Horarios de vuelo" english="Flight Schedule" />
          </div>
        </div>
        
        <div className="self-stretch flex-1 flex flex-col justify-between items-start gap-8 xl:gap-0">
          <div className="self-stretch flex flex-col xl:flex-row justify-start items-stretch gap-4 xl:gap-5">
            {flightData.map((flight, index) => (
              <FlightCard 
                key={`flight-${index}-${flight.label}`}
                flightInfo={flight} 
                isDeparture={index === 0} 
                onTimeRangeChange={(range) => handleTimeRangeChange(index, range)}
              />
            ))}
          </div>
          
          {/* Total Additional Cost Display */}
          {totalAdditionalCost > 0 && (
            <div className="w-full p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-yellow-800 font-medium">
                  <TranslatedText text="Coste Extra de Horarios:" english="Total Additional Cost:" />
                </div>
                <div className="text-lg font-bold text-yellow-700">
                  +{totalAdditionalCost}€
                </div>
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                <TranslatedText
                  text={`Basado en ${Math.floor(totalAdditionalCost / flightScheduleData.getPricePerStep())} paso(s) desde los horarios por defecto`}
                  english={`Based on ${Math.floor(totalAdditionalCost / flightScheduleData.getPricePerStep())} step(s) from default times`}
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={handleConfirm}
            className="w-44 h-11 px-3.5 py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
            type="button"
          >
            <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
              <TranslatedText text="Confirmar" english="Confirm" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
