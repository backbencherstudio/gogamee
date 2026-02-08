"use client";
import { useState, useEffect } from "react";
import {
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaPlane,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";

import { format, parseISO } from "date-fns";
import BookingSummaryModal from "./booking-summery-modal";
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal";
import { Pagination } from "../../../../../components/ui/Pagination";
import {
  getAllBookings,
  deleteBooking,
  type BookingItem,
} from "../../../../../services/bookingService";
export default function EventReqTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("alltime");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Load bookings from API
  const loadBookings = async (page: number, status: string, days: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings(page, limit, status, days);

      if (response && response.success) {
        // Provide fallback if data is missing
        setBookings(response.data || []);
        if (response.meta_data) {
          setTotalPages(response.meta_data.total_pages);
          setTotalItems(response.meta_data.total);
          setCurrentPage(response.meta_data.page);
        }
      } else {
        setError(response.message || "Failed to load bookings");
        setBookings([]);
      }
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(currentPage, activeTab, timeFilter);
  }, [currentPage, activeTab, timeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 on tab change
  };

  const handleDateRangeChange = (value: string) => {
    setTimeFilter(value);
    setShowDateDropdown(false);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const dateRangeOptions = [
    { value: "alltime", label: "All Time" },
    { value: "7days", label: "Last 7 days" },
    { value: "15days", label: "Last 15 days" },
    { value: "30days", label: "Last 30 days" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "confirmed":
        return "bg-[#F1F9EC] text-[#6AAD3C] border border-[#6AAD3C]/20";
      case "rejected":
      case "cancelled":
        return "bg-red-50 text-red-600 border border-red-100";
      case "pending":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Confirmed";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const getPaymentStatusStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
      case "succeeded":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
      case "succeeded":
        return "Paid";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return paymentStatus || "Unknown";
    }
  };

  const getPackageBadgeColor = (packageType: string) => {
    switch (packageType) {
      case "luxury":
      case "vip":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "premium":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id);
      loadBookings(currentPage, activeTab, timeFilter);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("❌ Error deleting booking:", err);
      alert("Failed to delete booking");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="pt-4 pb-8 min-h-screen">
        {/* Error State */}
        {error && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading bookings</p>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={() => loadBookings(currentPage, activeTab, timeFilter)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!error && (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Sports Travel Bookings
                  </h1>
                  <p className="text-gray-600">
                    Manage and review all travel booking requests
                  </p>
                  <div className="text-xs text-gray-400 mt-1">
                    {loading ? (
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      `Total ${totalItems} bookings found`
                    )}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <FaCalendarAlt className="text-blue-600 w-4 h-4" />
                    <span className="text-gray-700 font-medium">
                      {
                        dateRangeOptions.find((opt) => opt.value === timeFilter)
                          ?.label
                      }
                    </span>
                    <MdKeyboardArrowDown className="text-gray-400 w-5 h-5" />
                  </button>

                  {showDateDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                      {dateRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDateRangeChange(option.value)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors
                      ${timeFilter === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 border-b border-gray-100">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-2 my-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTabChange("all")}
                    className={`py-2 px-2 border rounded-lg text-sm ${activeTab === "all" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleTabChange("pending")}
                    className={`py-2 px-2 border rounded-lg text-sm ${activeTab === "pending" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleTabChange("confirmed")}
                    className={`py-2 px-2 border rounded-lg text-sm ${activeTab === "confirmed" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"}`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => handleTabChange("completed")}
                    className={`py-2 px-2 border rounded-lg text-sm ${activeTab === "completed" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"}`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleTabChange("rejected")}
                    className={`py-2 px-2 border rounded-lg text-sm ${activeTab === "rejected" ? "bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-200"}`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex space-x-8">
                {[
                  { key: "all", label: "All Bookings" },
                  { key: "pending", label: "Pending" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "completed", label: "Completed" },
                  { key: "rejected", label: "Rejected" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    disabled={loading}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Date
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer & Sport
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Travel Details
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Status
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-48 mb-1"></div>
                            <div className="h-5 bg-gray-200 rounded w-20 mt-2"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-32 mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                            <div className="h-5 bg-gray-200 rounded w-16 mt-2"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    : bookings.map((booking) => (
                        <tr
                          key={booking._id || booking.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(booking.createdAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(booking.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {booking.travelers?.primaryContact?.name ||
                                  "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.travelers?.primaryContact?.email ||
                                  "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.travelers?.primaryContact?.phone ||
                                  "N/A"}
                              </div>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                  {booking.selection?.sport || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900 font-medium">
                                <FaMapMarkerAlt className="w-3 h-3 mr-2 text-gray-400" />
                                {(booking.selection?.city
                                  ?.charAt(0)
                                  .toUpperCase() ?? "") +
                                  (booking.selection?.city?.slice(1) ?? "")}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FaPlane className="w-3 h-3 mr-2 text-gray-400" />
                                {formatDate(booking.dates?.departure)} -{" "}
                                {formatDate(booking.dates?.return)}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FaUsers className="w-3 h-3 mr-2 text-gray-400" />
                                {booking.travelers?.totalCount || 0} travelers
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPackageBadgeColor(booking.selection?.package)} capitalize`}
                                >
                                  {booking.selection?.package || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900 font-bold">
                                <span className="text-gray-400 mr-2 text-xs">
                                  €
                                </span>
                                {booking.totalCost}
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                Total amount paid
                              </div>
                              <div className="text-xs text-gray-400">
                                {booking.dates?.durationDays} days travel
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusStyle(booking.payment?.status)}`}
                            >
                              {getPaymentStatusText(booking.payment?.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BookingSummaryModal
                                bookingData={{
                                  ...booking,
                                  id: booking.id || booking._id,
                                }}
                                onStatusUpdate={async () => {
                                  await loadBookings(
                                    currentPage,
                                    activeTab,
                                    timeFilter,
                                  );
                                }}
                              />

                              {/* Delete Button */}
                              <button
                                onClick={() =>
                                  setDeleteConfirm(
                                    booking.id || booking._id || "",
                                  )
                                }
                                className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {!loading && bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaCalendarAlt className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters to see more results.
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  Filter: {activeTab} | Date Range: {timeFilter}
                </div>
              </div>
            )}

            {/* Pagination Control */}
            <div className="p-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => deleteConfirm && handleDeleteBooking(deleteConfirm)}
          title="Delete Booking"
          message="Are you sure you want to delete this booking? This action cannot be undone."
        />
      </div>
    </div>
  );
}
