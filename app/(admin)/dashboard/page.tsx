"use client";
import React, { useEffect, useState } from 'react'
import { SalesOverview } from './components/overview/overview'
import AppData from '@/app/lib/appdata'

const Dashboard = () => {
  const [totalBookings, setTotalBookings] = useState(0);

  // Load real-time data
  useEffect(() => {
    const loadData = () => {
      const bookings = AppData.bookings.all;
      setTotalBookings(bookings.length);
    };

    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Quick Overview
        </h1>
        <div className="text-sm text-gray-600 mb-4">
          Real-time data from AppData • Total Bookings: {totalBookings}
        </div>
      </div>
      <SalesOverview />
    </div>
  )
}

export default Dashboard