'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md'
import { Range } from 'react-range'
import { useBooking } from '../../context/BookingContext'

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

// ========================= CONSTANTS =========================
const MINUTES_IN_DAY = 1440 // 24 * 60
const EXTENDED_DAY_MINUTES = 2160 // 36 * 60 (1.5 days)
const TIME_STEP = 15 // 15-minute intervals
const HOURS_PER_DAY = 24

const TIME_MARKS = [
  { value: 0, label: '00:00' },
  { value: 360, label: '06:00' }, // 6 * 60
  { value: 720, label: '12:00' }, // 12 * 60
  { value: 1080, label: '18:00' }, // 18 * 60
  { value: 1440, label: '00:00(+1)' } // 24 * 60
] as const

const INITIAL_FLIGHT_DATA: FlightInfo[] = [
  {
    label: 'Departure from',
    city: 'Barcelona',
    price: '20€',
    icon: 'takeoff',
    timeRange: { start: 360, end: 720 } // 06:00 to 12:00
  },
  {
    label: 'Arrival',
    city: 'Barcelona',
    price: '20€',
    icon: 'landing',
    timeRange: { start: 1080, end: 1800 } // 18:00 to 06:00(+1)
  }
] as const

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
  const hours = Math.floor(minutes / 60) % HOURS_PER_DAY
  const mins = minutes % 60
  const nextDay = minutes >= MINUTES_IN_DAY ? '(+1)' : ''
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}${nextDay}`
}



const getTimeMarkPosition = (minutes: number): number => {
  return (minutes / EXTENDED_DAY_MINUTES) * 100
}

const calculateDuration = (start: number, end: number): string => {
  const durationMinutes = end - start
  const hours = Math.round((durationMinutes / 60) * 10) / 10
  return `${hours} hours`
}

// ========================= MEMOIZED COMPONENTS =========================
const FlightIcon = React.memo(({ type }: { type: 'takeoff' | 'landing' }) => (
  <div className="w-14 h-14 p-3.5 bg-[#F1F9EC] rounded flex justify-start items-center gap-2.5">
    {type === 'takeoff' ? (
      <MdFlightTakeoff className="w-6 h-6 text-lime-500" />
    ) : (
      <MdFlightLand className="w-6 h-6 text-lime-500" />
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
}) => (
  <div className="self-stretch inline-flex justify-start items-center gap-20">
    <div className="flex justify-start items-center gap-4">
      <FlightIcon type={icon} />
      <div className="w-32 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch justify-center text-zinc-500 text-base font-normal font-['Poppins'] leading-7">
          {label}
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
          Per person
        </div>
      </div>
    </div>
  </div>
))

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
        Your flight will {isDeparture ? 'depart' : 'land'} between {startTime} and {endTime}
      </div>
    </div>
  )
})

TimeDisplay.displayName = 'TimeDisplay'

const TimeRangeSlider = React.memo(({ 
  timeRange, 
  onChange 
}: { 
  timeRange: TimeRange
  onChange: (range: TimeRange) => void
}) => {
  const handleRangeChange = useCallback((values: number[]) => {
    onChange({
      start: values[0],
      end: values[1]
    })
  }, [onChange])

  const selectedRangeStyle = useMemo(() => ({
    left: `${getTimeMarkPosition(timeRange.start)}%`,
    width: `${getTimeMarkPosition(timeRange.end) - getTimeMarkPosition(timeRange.start)}%`,
    ...SLIDER_STYLES.selectedRange
  }), [timeRange.start, timeRange.end])

  return (
    <div className="w-80 flex flex-col justify-center items-center gap-1.5">
      <div className="w-full h-5 relative">
        <Range
          step={TIME_STEP}
          min={0}
          max={EXTENDED_DAY_MINUTES}
          values={[timeRange.start, timeRange.end]}
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
                className="absolute h-2 bg-lime-500 rounded-full"
                style={selectedRangeStyle}
              />
              {children}
            </div>
          )}
          renderThumb={({ props, isDragged }) => (
            <div
              {...props}
              style={{
                ...props.style,
                backgroundColor: isDragged ? '#65a30d' : 'white',
              }}
              className="w-5 h-5 border-2 border-lime-500 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
            />
          )}
        />
      </div>
      
      <div className="w-full flex justify-between items-center px-2">
        {TIME_MARKS.map((mark, index) => (
          <div key={mark.value} className="text-zinc-400 text-xs font-normal font-['Inter'] leading-tight">
            {index === TIME_MARKS.length - 1 ? (
              <div className="flex gap-1">
                <span>00:00</span>
                <span>(+1)</span>
              </div>
            ) : (
              mark.label
            )}
          </div>
        ))}
      </div>
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
}) => (
  <div className="flex-1 min-h-0 p-5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center gap-8">
    <div className="self-stretch flex flex-col justify-center items-center gap-8">
      <FlightInfoHeader 
        label={flightInfo.label}
        city={flightInfo.city}
        price={flightInfo.price}
        icon={flightInfo.icon}
      />
      <TimeRangeSlider 
        timeRange={flightInfo.timeRange}
        onChange={onTimeRangeChange}
      />
    </div>
    <TimeDisplay timeRange={flightInfo.timeRange} isDeparture={isDeparture} />
  </div>
))

FlightCard.displayName = 'FlightCard'

// ========================= MAIN COMPONENT =========================
export default function FlightSchedule() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Always start with default data for consistent server/client rendering
  const [flightData, setFlightData] = useState<FlightInfo[]>(INITIAL_FLIGHT_DATA)
  
  // Set hydration flag and load existing data after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Load existing flight data from BookingContext after hydration
    if (formData.flightSchedule) {
      setFlightData([
        {
          label: 'Departure from',
          city: 'Barcelona',
          price: '20€',
          icon: 'takeoff',
          timeRange: {
            start: formData.flightSchedule.departure.start,
            end: formData.flightSchedule.departure.end
          }
        },
        {
          label: 'Arrival',
          city: 'Barcelona',
          price: '20€',
          icon: 'landing',
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
          price: '20€',
          icon: 'takeoff',
          timeRange: {
            start: formData.flightSchedule.departure.start,
            end: formData.flightSchedule.departure.end
          }
        },
        {
          label: 'Arrival',
          city: 'Barcelona',
          price: '20€',
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
    setFlightData(prev => prev.map((flight, index) => 
      index === flightIndex 
        ? { ...flight, timeRange: newRange }
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
    <div className="w-[894px] h-[644px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
      <div className="self-stretch h-[587px] flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">
            Flight Schedule
          </div>
        </div>
        
        <div className="self-stretch flex-1 flex flex-col justify-between items-start">
          <div className="self-stretch flex justify-start items-stretch gap-5">
            {flightData.map((flight, index) => (
              <FlightCard 
                key={`flight-${index}-${flight.label}`}
                flightInfo={flight} 
                isDeparture={index === 0} 
                onTimeRangeChange={(range) => handleTimeRangeChange(index, range)}
              />
            ))}
          </div>
          
          <button 
            onClick={handleConfirm}
            className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
            type="button"
          >
            <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
              Confirm
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
