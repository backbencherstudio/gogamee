'use client'

import React, { useState } from 'react'
import Stepper from './components/stepper/stepper'

const BOOKING_STEPS = [
  { id: 1, title: 'What sport do you prefer' },
  { id: 2, title: 'Package type' },
  { id: 3, title: 'Departure city' },
  { id: 4, title: 'How many are you?' },
  { id: 5, title: 'Leagues' },
  { id: 6, title: 'Date Section' },
  { id: 7, title: 'Flight Schedule' },
  { id: 8, title: 'Extras' },
  { id: 9, title: 'Personal Information' },
  { id: 10, title: 'Payment Method' }
]

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNextStep = () => {
    if (currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Book Your Sports Experience</h1>
        
        <div className="flex gap-8">
          {/* Stepper */}
          <div className="flex-shrink-0">
            <Stepper 
              steps={BOOKING_STEPS} 
              currentStep={currentStep}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Step {currentStep + 1}: {BOOKING_STEPS[currentStep].title}
              </h2>
              
              <p className="text-gray-600 mb-8">
                This is where the content for &quot;{BOOKING_STEPS[currentStep].title}&quot; would go.
              </p>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
                >
                  Previous
                </button>

                <div className="text-sm text-gray-500 flex items-center">
                  {currentStep + 1} of {BOOKING_STEPS.length}
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={currentStep === BOOKING_STEPS.length - 1}
                  className="px-6 py-2 bg-lime-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lime-600 transition-colors"
                >
                  {currentStep === BOOKING_STEPS.length - 1 ? 'Complete' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Demo Controls</h3>
          <div className="flex gap-2 flex-wrap">
            {BOOKING_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`px-3 py-1 text-sm rounded ${
                  index === currentStep
                    ? 'bg-lime-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
