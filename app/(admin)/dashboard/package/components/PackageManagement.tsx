"use client";
import React, { useState } from "react";
import {
  Package as PackageIcon,
  RefreshCw,
} from "lucide-react";
import FixedPriceCard from "./FixedPriceCard";
import ComparisonFeatureCard from "./ComparisonFeatureCard";

export default function PackageManagement() {
  const [selectedDuration, setSelectedDuration] = useState<number | "all">(
    "all",
  );

  return (
    <div className="px-2 md:px md:pl-10 min-h-screen mb-4 md:pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Package Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">
              Manage travel packages and starting prices for sports events
            </p>
          </div>
        </div>

        {/* New Logic: Only use FixedPriceCard and ComparisonFeatureCard */}
        <FixedPriceCard onDurationChange={(duration: any) => setSelectedDuration(duration)} />
        
        <div className="mt-2">
          <ComparisonFeatureCard />
        </div>
      </div>
    </div>
  );
}
