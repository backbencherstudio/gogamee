'use client'
import React, { useState } from 'react'
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md'
import { Range } from 'react-range'

// Types
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

// Constants
const MINUTES_IN_DAY = 24 * 60
const TIME_MARKS = [
  { value: 0, label: '00:00' },
  { value: 6 * 60, label: '06:00' },
  { value: 12 * 60, label: '12:00' },
  { value: 18 * 60, label: '18:00' },
  { value: 24 * 60, label: '00:00(+1)' }
]

// Helper functions
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  const nextDay = minutes >= MINUTES_IN_DAY ? '(+1)' : ''
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}${nextDay}`
}

const timeToMinutes = (timeStr: string): number => {
  const isNextDay = timeStr.includes('(+1)')
  const cleanTime = timeStr.replace('(+1)', '')
  const [hours, minutes] = cleanTime.split(':').map(Number)
  return (hours * 60 + minutes) + (isNextDay ? MINUTES_IN_DAY : 0)
}

const getTimeMarkPosition = (minutes: number): number => {
  return (minutes / (MINUTES_IN_DAY * 1.5)) * 100 // Extended to 36 hours for next day
}

// Initial flight data
const INITIAL_FLIGHT_DATA: FlightInfo[] = [
  {
    label: 'Departure from',
    city: 'Barcelona',
    price: '20€',
    icon: 'takeoff',
    timeRange: { start: 6 * 60, end: 12 * 60 } // 06:00 to 12:00
  },
  {
    label: 'Arrival',
    city: 'Barcelona',
    price: '20€',
    icon: 'landing',
    timeRange: { start: 18 * 60, end: 24 * 60 + 6 * 60 } // 18:00 to 06:00(+1)
  }
]

// Custom Time Range Slider Component
const TimeRangeSlider = ({ 
  timeRange, 
  onChange, 
  isDeparture 
}: { 
  timeRange: TimeRange
  onChange: (range: TimeRange) => void
  isDeparture: boolean
}) => {
  const maxTime = MINUTES_IN_DAY * 1.5 // 36 hours to allow next day selection
  
  const handleRangeChange = (values: number[]) => {
    onChange({
      start: values[0],
      end: values[1]
    })
  }

  return (
    <div className="w-80 flex flex-col justify-center items-center gap-1.5">
      {/* Custom Range Slider */}
      <div className="w-full h-5 relative">
        <Range
          step={15} // 15-minute intervals
          min={0}
          max={maxTime}
          values={[timeRange.start, timeRange.end]}
          onChange={handleRangeChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-2 bg-stone-300/30 rounded-full relative"
              style={{
                ...props.style,
                height: '8px',
                background: 'rgba(168, 162, 158, 0.3)',
                outline: '4px solid rgba(168, 162, 158, 0.3)',
                outlineOffset: '-4px'
              }}
            >
              {/* Selected range highlight */}
              <div
                className="absolute h-2 bg-lime-500 rounded-full"
                style={{
                  left: `${getTimeMarkPosition(timeRange.start)}%`,
                  width: `${getTimeMarkPosition(timeRange.end) - getTimeMarkPosition(timeRange.start)}%`,
                  outline: '4px solid rgb(132, 204, 22)',
                  outlineOffset: '-4px'
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => (
            <div
              {...props}
              className="w-5 h-5 bg-white border-2 border-lime-500 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
              style={{
                ...props.style
              }}
            />
          )}
        />
      </div>
      
      {/* Time labels */}
      <div className="w-full flex justify-between items-center px-2">
        {TIME_MARKS.map((mark, index) => (
          <div key={index} className="text-zinc-400 text-xs font-normal font-['Inter'] leading-tight">
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
}

// Flight icon component
const FlightIcon = ({ type }: { type: 'takeoff' | 'landing' }) => (
  <div className="w-14 h-14 p-3.5 bg-[#F1F9EC] rounded flex justify-start items-center gap-2.5">
    {type === 'takeoff' ? (
      <MdFlightTakeoff className="w-6 h-6 text-lime-500" />
    ) : (
      <MdFlightLand className="w-6 h-6 text-lime-500" />
    )}
  </div>
)

// Flight info header component
const FlightInfoHeader = ({ 
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
        <div className="self-stretch justify-center text-zinc-500 text-base font-normal font-['Poppins'] leading-7">{label}</div>
        <div className="justify-center text-neutral-800 text-xl font-medium font-['Poppins'] leading-normal">{city}</div>
      </div>
    </div>
    <div className="flex-1 flex justify-end items-center gap-4">
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch text-right justify-center text-neutral-800 text-xl font-medium font-['Poppins'] leading-normal">{price}</div>
        <div className="self-stretch text-right justify-center text-zinc-500 text-base font-normal font-['Poppins'] leading-7">Per person</div>
      </div>
    </div>
  </div>
)

// Time display component
const TimeDisplay = ({ timeRange, isDeparture }: { timeRange: TimeRange; isDeparture: boolean }) => {
  const startTime = minutesToTime(timeRange.start)
  const endTime = minutesToTime(timeRange.end)
  
  return (
    <div className="self-stretch px-4 py-2.5 bg-neutral-50 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-center items-center gap-2.5">
      <div className="justify-start text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
        Your flight will {isDeparture ? 'depart' : 'land'} between {startTime} and {endTime}
      </div>
    </div>
  )
}

// Flight card component
const FlightCard = ({ 
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
        isDeparture={isDeparture}
      />
    </div>
    <TimeDisplay timeRange={flightInfo.timeRange} isDeparture={isDeparture} />
  </div>
)

// Main component
export default function FlightSchedule() {
  const [flightData, setFlightData] = useState<FlightInfo[]>(INITIAL_FLIGHT_DATA)
  
  const handleTimeRangeChange = (flightIndex: number, newRange: TimeRange) => {
    setFlightData(prev => prev.map((flight, index) => 
      index === flightIndex 
        ? { ...flight, timeRange: newRange }
        : flight
    ))
  }
  
  const handleConfirm = () => {
    const selectedTimes = flightData.map(flight => ({
      type: flight.label,
      startTime: minutesToTime(flight.timeRange.start),
      endTime: minutesToTime(flight.timeRange.end),
      duration: `${Math.round((flight.timeRange.end - flight.timeRange.start) / 60 * 10) / 10} hours`
    }))
    
    console.log('Selected flight times:', selectedTimes)
    // Add your confirm logic here - integrate with booking context
  }
  
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
                key={index}
                flightInfo={flight} 
                isDeparture={index === 0} 
                onTimeRangeChange={(range) => handleTimeRangeChange(index, range)}
              />
            ))}
          </div>
          
          <button 
            onClick={handleConfirm}
            className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lime-300"
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
