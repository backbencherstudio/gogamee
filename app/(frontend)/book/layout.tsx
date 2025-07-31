import React from 'react'
import Stepper from './components/stepper/stepper'

export default function Layout({ children }: { children: React.ReactNode }) {
  const steps = [
    { id: 1, title: 'Sports Preference' },
    { id: 2, title: 'Package Type' },
    { id: 3, title: 'Departure City' },
    { id: 4, title: 'Total People' },
    { id: 5, title: 'Leagues' },
    { id: 6, title: 'Date Selection' },
    { id: 7, title: 'Flight Schedule' },
    { id: 8, title: 'Extras' },
    { id: 9, title: 'Personal Info' },
    { id: 10, title: 'Payment' }
  ]

  return (
    <html lang="en">

      <body className="antialiased ">

<div className='w-full max-w-[1200px] mx-auto'> 

        <div className='flex'>
            {/* Fixed Sidebar */}
            <div className='sticky top-5 h-full w-[282px] mr-6'>
                <Stepper steps={steps} currentStep={0} />
            </div>
            
            {/* Main Content */}
            <div className='flex-1'>
                {children}
            </div>
        </div>
        </div>


      </body>
 
    </html>
  )
}
