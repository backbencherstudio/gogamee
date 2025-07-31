import React from 'react'

interface Step {
  id: number
  title: string
  completed?: boolean
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-transparent border-transparent',
          circle: 'bg-[#D5EBC5] border-[#76C043]',
          dot: 'bg-lime-600 border-[#76C043]',
          text: 'text-lime-600'
        }
      case 'active':
        return {
          container: 'bg-[#F1F9EC] border-[#76C043] opacity-100',
          circle: 'bg-[#D5EBC5] border-[#76C043]',
          dot: 'bg-lime-600 border-[#76C043]',
          text: 'text-lime-600'
        }
      default:
        return {
          container: 'bg-transparent border-transparent',
          circle: 'bg-white border-neutral-300',
          dot: 'bg-transparent',
          text: 'text-neutral-800'
        }
    }
  }

  const getLineColor = (currentIndex: number) => {
    // Line color is green if current step is completed or active
    const currentStatus = getStepStatus(currentIndex)
    return currentStatus === 'completed' || currentStatus === 'active' ? 'bg-[#76C043]' : 'bg-neutral-300'
  }

  return (
    <div className="w-72 p-4 bg-gray-50 rounded-xl mb-5">
      <div className="relative">        
        <div className="space-y-0 relative z-10">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const styles = getStepStyles(status)

            return (
              <div key={step.id} className="relative mb-1">
                {/* Connecting line from previous step */}
                {index > 0 && (
                  <div className={`absolute w-px h-12 ${getLineColor(index)} left-[22.5px] top-[-22px] z-[-1]`} />
                )}
                
                <div className={`${status === 'active' ? 'w-full' : 'self-stretch'} p-3 rounded-lg ${status === 'active' ? 'outline-1 outline-offset-[-1px] outline-[#76C043] bg-[#F1F9EC] opacity-100' : 'border'} ${styles.container} inline-flex justify-start items-center gap-2 relative z-10`}>
                  <div className={`w-5 h-5 rounded-full border-[1.25px] relative flex items-center justify-center ${styles.circle}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status !== 'pending' ? 'border-[0.62px]' : ''} ${styles.dot}`} />
                  </div>
                  <div className={`text-center justify-start text-base font-medium font-['Poppins'] leading-7 ${styles.text}`}>
                    {step.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
