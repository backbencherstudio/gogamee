'use client'

import React from 'react'
import SportsYouPreffer from './components/step1/sportsyoupreffer'
import PackageType from './components/step2/packagetype'
import DepartureCity from './components/step3/departurecity'
import HowManyTotal from './components/step4/howmanytotal'
import LeagueStep from './components/step5/leaguestep'
import RemoveLeague from './components/step5-5/removeleague'
import DateSection from './components/step6/datesection'
import FlightSchedule from './components/step7/flightschedule'
import Extras from './components/step8/extras'
import PersonalInfo from './components/step9/personalinfo'
import Payment from './components/step10/payment'
import Stepper from './components/stepper/stepper'
import { BookingProvider, useBooking } from './context/BookingContext'
import { TranslatedText } from '../_components/TranslatedText'

// Component that uses the context (needs to be inside provider)
function BookingContent() {
  const { currentStep, goToStep, isHydrated, formData } = useBooking()
const steps = [
    { id: 1, title: <TranslatedText text="Deporte" english="Sports Preference" /> },
    { id: 2, title: <TranslatedText text="Tipo de Paquete" english="Package Type" /> },
    { id: 3, title: <TranslatedText text="Ciudad de Salida" english="Departure City" /> },
    { id: 4, title: <TranslatedText text="Viajeros Totales" english="Total People" /> },
    { id: 5, title: <TranslatedText text="Ligas" english="Leagues" /> },
    { id: 6, title: <TranslatedText text="Selección de Fechas" english="Date Selection" /> },
    { id: 7, title: <TranslatedText text="Horario de Vuelos" english="Flight Schedule" /> },
    { id: 8, title: <TranslatedText text="Extras" english="Extras" /> },
    { id: 9, title: <TranslatedText text="Información Personal" english="Personal Info" /> },
    { id: 10, title: <TranslatedText text="Pago" english="Payment" /> }
  ]

  const renderCurrentStep = () => {
    // Don't render complex components until hydrated to prevent mismatches
    if (!isHydrated) {
      return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    switch (currentStep) {
      case 0:
        return <SportsYouPreffer />
      case 1:
        return <PackageType />
      case 2:
        return <DepartureCity />
      case 3:
        return <HowManyTotal />
      case 4:
        return <LeagueStep />
      case 4.5:
        return <RemoveLeague />
      case 5:
        return <DateSection />
      case 6:
        return <FlightSchedule />
      case 7:
        return <Extras />
      case 8:
        return <PersonalInfo />
      case 9:
        return <Payment />
      default:
        return <SportsYouPreffer />
    }
  }

  // Get display step for stepper (convert decimal steps to appropriate display)
  const getDisplayStep = () => {
    if (currentStep === 4.5) return 4 // Show step 5 for remove league
    return currentStep
  }

  // Handle stepper navigation
  const handleStepClick = (stepIndex: number) => {
    // If coming from hero, allow navigation to all steps (0-4) since data is pre-filled
    if (formData.fromHero && stepIndex <= 4) {
      goToStep(stepIndex);
    } else {
      // Normal flow: only allow navigation to completed or current steps
      if (stepIndex <= getDisplayStep()) {
        goToStep(stepIndex);
      }
    }
  }

  return (
    <div className='flex flex-col xl:flex-row'>
      {/* Mobile: Top Horizontal Stepper, Desktop: Fixed Sidebar */}
      <div className='xl:sticky xl:top-5 xl:h-full xl:w-[282px] xl:mr-6 mb-4 xl:mb-0'>
        <Stepper 
          steps={steps} 
          currentStep={getDisplayStep()} 
          onStepClick={handleStepClick}
        />
        {formData.fromHero && (
          <div className="mt-3 p-3 bg-lime-50 border border-lime-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lime-600 text-sm">🎯</span>
              <div className="flex flex-col">
                <span className="text-lime-700 text-xs font-medium">
                  <TranslatedText
                    text="Pasos del 1-4 rellenados desde la página de inicio."
                    english="Steps 1-4 pre-filled from home page"
                  />
                </span>
                <span className="text-lime-600 text-xs">
                  <TranslatedText
                    text="¡Puedes revisarlos/modificarlos clicando en los pasos anteriores!"
                    english="You can review/modify by clicking on previous steps"
                  />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className='flex-1'>
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  )
}
