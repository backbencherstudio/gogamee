"use client";

// ============================================
// IMPORTS SECTION
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
import {
  getAllBookings,
  getBookingStats,
} from "../../../../../services/bookingService";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  lastMonth: string;
  icon: React.ElementType;
}

interface RecentRequest {
  id: string;
  customer: string;
  package: string;
  date: string;
  status: "pending" | "completed" | "rejected" | "approved" | "confirmed";
  payment_status: "paid" | "unpaid" | "pending" | "failed";
  amount: string;
}

// ============================================
// METRIC CARD COMPONENT
// ============================================
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  lastMonth,
  icon: Icon,
}) => {
  const isIncrease = changeType === "increase";
  const ChangeIcon = isIncrease ? ArrowUp : ArrowDown;

  return (
    <>
      <div className="flex-1 min-w-[200px] bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#76C043]/30 rounded-lg">
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm",
                title === "Total Request" && "bg-blue-500",
                title === "Completed" && "bg-green-500",
                title === "Confirmed" && "bg-indigo-500",
                title === "Pending" && "bg-yellow-500",
                title === "Rejected" && "bg-red-500",
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <div className="text-3xl font-bold mb-2 text-gray-900">{value}</div>
          <div className="flex items-center text-sm">
            <ChangeIcon
              className={cn(
                "w-4 h-4 mr-1",
                isIncrease ? "text-green-600" : "text-red-600",
              )}
            />
            <span
              className={cn(
                "font-medium",
                isIncrease ? "text-green-600" : "text-red-600",
              )}
            >
              {change}
            </span>
            <span className="text-gray-500 ml-2">
              vs {lastMonth} last month
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// PAGINATION COMPONENT
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
      <div className="text-sm text-gray-700">
        Showing page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
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
// RECENT REQUESTS TABLE
// ============================================
const RecentRequestsTable: React.FC = () => {
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real-time data from API
  useEffect(() => {
    const loadData = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);

        const response = await getAllBookings(1, 10);

        if (response && response.success && Array.isArray(response.data)) {
          const bookings = response.data;
          const requests: RecentRequest[] = bookings.map((booking) => ({
            id: `REQ-${String(booking.id || booking._id).slice(0, 8)}`,
            customer: booking.travelers?.primaryContact?.name || "Guest",
            package: `${booking.selection?.sport || "N/A"} - ${booking.selection?.package || "N/A"}`,
            date: booking.createdAt,
            status:
              booking.status === "rejected"
                ? "rejected"
                : booking.status === "completed"
                  ? "completed"
                  : booking.status === "confirmed"
                    ? "confirmed"
                    : "pending",
            payment_status: (booking.payment?.status || "pending") as any,
            amount: `€${(booking.totalCost || 0).toFixed(2)}`,
          }));
          // Take only first 10 for overview
          setRecentRequests(requests.slice(0, 10));
          setError(null);
        }
      } catch (err) {
        console.error("❌ Dashboard - Error fetching bookings:", err);
        if (!isPolling) setError("Failed to load bookings");
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    loadData();
    // Refresh data every 30 seconds (Standard Time)
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
      case "completed":
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
      case "unpaid":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="pb-0">
        <h2 className="text-lg font-semibold text-gray-900 m-6">
          Recent Requests (Latest 5)
        </h2>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 text-center text-red-600">
          <p className="font-semibold">Error loading bookings</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      )}

      {!error && (
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    Payment
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 animate-pulse"
                      >
                        <td className="py-3 px-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))
                  : recentRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {request.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {request.customer}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {request.package}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(request.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={getStatusBadge(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">
                              {request.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={getPaymentStatusBadge(
                              request.payment_status,
                            )}
                          >
                            <span className="capitalize">
                              {request.payment_status || "unknown"}
                            </span>
                          </span>
                        </td>
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
    </div>
  );
};

// ============================================
// MAIN SALES OVERVIEW COMPONENT
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
      title: "Confirmed",
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
        const response = await getBookingStats();

        if (response && response.success && response.data) {
          const stats = response.data;

          setMetrics([
            {
              title: "Total Request",
              value: stats.total.toString(),
              change: "0%",
              changeType: "increase" as const,
              lastMonth: stats.total.toString(),
              icon: Package,
            },
            {
              title: "Completed",
              value: stats.completed.toString(),
              change: "0%",
              changeType: "increase" as const,
              lastMonth: stats.completed.toString(),
              icon: CheckCircle,
            },
            {
              title: "Confirmed",
              value: (stats.confirmed || 0).toString(),
              change: "0%",
              changeType: "increase" as const,
              lastMonth: (stats.confirmed || 0).toString(),
              icon: CheckCircle,
            },
            {
              title: "Pending",
              value: stats.pending.toString(),
              change: "0%",
              changeType: "decrease" as const,
              lastMonth: stats.pending.toString(),
              icon: Clock,
            },
            {
              title: "Rejected",
              value: stats.rejected.toString(),
              change: "0%",
              changeType: "increase" as const,
              lastMonth: stats.rejected.toString(),
              icon: XCircle,
            },
          ]);
        }
      } catch (err) {
        console.error("❌ Dashboard - Error loading metrics:", err);
      }
    };

    loadMetrics();
    // Refresh metrics every 30 seconds for real-time updates
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <RecentRequestsTable />
    </div>
  );
}
