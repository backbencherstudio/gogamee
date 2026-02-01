"use client";
import React, { useEffect, useState } from "react";
import { SalesOverview } from "./components/overview/overview";
import { getAllBookings } from "../../../services/bookingService";

const Dashboard = () => {
  // const [totalBookings, setTotalBookings] = useState(0);
  // const [loading, setLoading] = useState(true);

  // Load real-time data from API
  // useEffect(() => {
  //   const loadData = async (isPolling = false) => {
  //     try {
  //       if (!isPolling) setLoading(true);
  //       const response = await getAllBookings(1, 100); // Fetch more for overview stats if needed, or rely on meta

  //       // Handle ApiResponse structure
  //       if (response && response.success && Array.isArray(response.data)) {
  //         // If we have meta_data with total, prefer that
  //         const meta = (response as any).meta_data;
  //         if (typeof meta?.total === "number") {
  //           setTotalBookings(meta.total);
  //         } else {
  //           setTotalBookings(response.data.length);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error loading bookings:", err);
  //     } finally {
  //       if (!isPolling) setLoading(false);
  //     }
  //   };

  //   loadData();
  //   // Refresh data every 30 seconds
  //   const interval = setInterval(() => loadData(true), 30000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Quick Overview
        </h1>
        {/* <div className="text-sm text-gray-600 mb-4">
          {loading ? (
            <span>Loading bookings data...</span>
          ) : (
            <span>
              Real-time data from API • Total Bookings: {totalBookings}
            </span>
          )}
        </div> */}
      </div>
      <SalesOverview />
    </div>
  );
};

export default Dashboard;
