import React from 'react'
import { SalesOverview } from './components/overview/overview'

const Dashboard = () => {
  return (
    <div className="pt-4 pl-10 min-h-screen mb-4">
                <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
              Quick Overview
            </h1>
          </div>
      <SalesOverview />
    </div>
  )
}

export default Dashboard