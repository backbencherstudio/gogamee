"use client";

// ============================================
// IMPORTS SECTION - সকল প্রয়োজনীয় imports
// ============================================
import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { getAllBookings } from "../../../../../services/bookingService";

// ============================================
// TYPE DEFINITIONS - ডেটা টাইপ সংজ্ঞা
// ============================================

// মেট্রিক কার্ডের জন্য interface
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  lastMonth: string;
  icon: React.ElementType;
}

// রিকুয়েস্ট ডেটার জন্য interface
interface RecentRequest {
  id: string;
  customer: string;
  package: string;
  date: string;
  status: "pending" | "completed" | "rejected" | "approved";
  amount: string;
}

// ============================================
// METRIC CARD COMPONENT - মেট্রিক কার্ড কম্পোনেন্ট
// ============================================
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  lastMonth,
  icon: Icon,
}) => {
  // বৃদ্ধি হয়েছে কিনা চেক করা
  const isIncrease = changeType === "increase";
  const ChangeIcon = isIncrease ? ArrowUp : ArrowDown;

  return (

    <>
        <div className="flex-1 min-w-[200px] bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#76C043]/30 rounded-lg">
        
      {/* কার্ডের হেডার সেকশন */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between">
          {/* কার্ডের টাইটেল */}
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          {/* কার্ডের আইকন - বিভিন্ন স্ট্যাটাসের জন্য বিভিন্ন রঙ */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
              title === "Total Request" && "bg-blue-500",
              title === "Completed" && "bg-green-500",
              title === "Pending" && "bg-yellow-500",
              title === "Rejected" && "bg-red-500"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* কার্ডের মূল ডেটা সেকশন */}
      <div className="p-6 pt-0">
        {/* মেইন ভ্যালু */}
        <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>
        
        {/* পরিবর্তনের তথ্য */}
        <div className="flex items-center text-sm">
          {/* বৃদ্ধি/হ্রাসের আইকন */}
          <ChangeIcon
            className={cn(
              "w-4 h-4 mr-1",
              isIncrease ? "text-green-600" : "text-red-600"
            )}
          />
          {/* পরিবর্তনের পার্সেন্টেজ */}
          <span
            className={cn(
              "font-medium",
              isIncrease ? "text-green-600" : "text-red-600"
            )}
          >
            {change}
          </span>
          {/* গত মাসের তুলনা */}
          <span className="text-gray-500 ml-2">vs {lastMonth} last month</span>
        </div>
      </div>
    </div>
    </>


  );
};

// ============================================
// PAGINATION COMPONENT - পেজিনেশন কম্পোনেন্ট
// ============================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      {/* পেজের তথ্য */}
      <div className="text-sm text-gray-700">
        Showing page {currentPage} of {totalPages}
      </div>
      
      {/* পেজিনেশন বাটন */}
      <div className="flex items-center space-x-2">
        {/* পূর্ববর্তী পেজ বাটন */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* পেজ নাম্বারস */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        ))}

        {/* পরবর্তী পেজ বাটন */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// RECENT REQUESTS TABLE - সাম্প্রতিক রিকুয়েস্ট টেবিল
// ============================================
const RecentRequestsTable: React.FC = () => {
  // পেজিনেশনের জন্য state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // প্রতি পেজে ২০টি আইটেম
  const [allRequests, setAllRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getAllBookings();
        console.log('📥 Dashboard - Bookings fetched from API:', response);
        
        const bookings = response.all || [];
        const requests: RecentRequest[] = bookings.map((booking) => ({
          id: `REQ-${String(booking.id).slice(0, 8)}`,
          customer: booking.fullName,
          package: `${booking.selectedSport} - ${booking.selectedPackage}`,
          date: booking.bookingDate || booking.created_at,
          status: booking.status === "approved" ? "approved" : 
                  booking.status === "rejected" || booking.status === "cancelled" ? "rejected" : 
                  booking.status === "completed" ? "completed" : "pending",
          amount: `€${booking.totalCost || booking.totalExtrasCost}`,
        }));
        setAllRequests(requests);
        setError(null);
      } catch (err) {
        console.error('❌ Dashboard - Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // পেজিনেশনের জন্য ডেটা গণনা
  const totalPages = Math.ceil(allRequests.length / itemsPerPage);
  
  // বর্তমান পেজের ডেটা ফিল্টার করা
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allRequests.slice(startIndex, endIndex);
  }, [currentPage, allRequests]);

  // স্ট্যাটাস অনুযায়ী আইকন রিটার্ন করা
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // স্ট্যাটাস অনুযায়ী ব্যাজ স্টাইল রিটার্ন করা
  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  // পেজ পরিবর্তন হ্যান্ডলার
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* টেবিলের হেডার */}
      <div className="pb-0">
        <h2 className="text-lg font-semibold text-gray-900 m-6">
          Recent Requests
        </h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 text-center text-red-600">
          <p className="font-semibold">Error loading bookings</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      )}

      {/* টেবিল সেকশন */}
      {!loading && !error && (
      <div className="p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* টেবিলের হেডার */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Request ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Package
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>

            {/* টেবিলের বডি - বর্তমান পেজের ডেটা */}
            <tbody>
              {currentData.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* রিকুয়েস্ট আইডি */}
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {request.id}
                  </td>
                  {/* কাস্টমার নাম */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {request.customer}
                  </td>
                  {/* প্যাকেজ নাম */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {request.package}
                  </td>
                  {/* তারিখ */}
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {request.date}
                  </td>
                  {/* স্ট্যাটাস ব্যাজ */}
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">
                        {request.status}
                      </span>
                    </span>
                  </td>
                  {/* পরিমাণ */}
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {request.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* পেজিনেশন কম্পোনেন্ট */}
      {!loading && !error && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// ============================================
// MAIN SALES OVERVIEW COMPONENT - মূল কম্পোনেন্ট
// ============================================
export function SalesOverview() {
  const [metrics, setMetrics] = useState<MetricCardProps[]>([
    {
      title: "Total Request",
      value: "0",
      change: "0%",
      changeType: "increase" as const,
      lastMonth: "0",
      icon: Package,
    },
    {
      title: "Completed",
      value: "0",
      change: "0%",
      changeType: "increase" as const,
      lastMonth: "0",
      icon: CheckCircle,
    },
    {
      title: "Pending",
      value: "0",
      change: "0%",
      changeType: "decrease" as const,
      lastMonth: "0",
      icon: Clock,
    },
    {
      title: "Rejected",
      value: "0",
      change: "0%",
      changeType: "increase" as const,
      lastMonth: "0",
      icon: XCircle,
    },
  ]);

  // Load real-time metrics from API
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await getAllBookings();
        const bookings = response.all || [];
        
        const total = bookings.length;
        const completed = bookings.filter(b => b.status === "approved" || b.status === "completed").length;
        const pending = bookings.filter(b => b.status === "pending").length;
        const rejected = bookings.filter(b => b.status === "rejected" || b.status === "cancelled").length;

        setMetrics([
          {
            title: "Total Request",
            value: total.toString(),
            change: "0%",
            changeType: "increase" as const,
            lastMonth: total.toString(),
            icon: Package,
          },
          {
            title: "Completed",
            value: completed.toString(),
            change: "0%",
            changeType: "increase" as const,
            lastMonth: completed.toString(),
            icon: CheckCircle,
          },
          {
            title: "Pending",
            value: pending.toString(),
            change: "0%",
            changeType: "decrease" as const,
            lastMonth: pending.toString(),
            icon: Clock,
          },
          {
            title: "Rejected",
            value: rejected.toString(),
            change: "0%",
            changeType: "increase" as const,
            lastMonth: rejected.toString(),
            icon: XCircle,
          },
        ]);
      } catch (err) {
        console.error('❌ Dashboard - Error loading metrics:', err);
      }
    };

    loadMetrics();
    // Refresh metrics every 10 seconds for real-time updates
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* মেট্রিক কার্ড গ্রিড - উপরের সেকশন */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* সাম্প্রতিক রিকুয়েস্ট টেবিল - নিচের সেকশন */}
      <RecentRequestsTable />
    </div>
  );
}
