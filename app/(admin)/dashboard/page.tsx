"use client";
import React, { useEffect, useState } from 'react'
import { SalesOverview } from './components/overview/overview'
import { getAllBookings } from '../../../services/bookingService'

const Dashboard = () => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load real-time data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getAllBookings();
        const bookings = response.all || [];
        setTotalBookings(bookings.length);
      } catch (err) {
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Refresh data every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Quick Overview
        </h1>
        <div className="text-sm text-gray-600 mb-4">
          {loading ? (
            <span>Loading bookings data...</span>
          ) : (
            <span>Real-time data from API • Total Bookings: {totalBookings}</span>
          )}
        </div>
      </div>
      <SalesOverview />
    </div>
  )
}

export default Dashboard