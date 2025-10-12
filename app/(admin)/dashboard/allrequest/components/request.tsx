"use client"
import { useState, useMemo, useEffect } from "react"
import { FaTrash, FaCalendarAlt, FaUsers, FaDollarSign, FaPlane, FaMapMarkerAlt } from "react-icons/fa"
import { MdKeyboardArrowDown } from "react-icons/md"
 
import { subDays, parseISO, isWithinInterval, format, startOfDay, endOfDay } from "date-fns"
import AppData from "@/app/lib/appdata"
import BookingSummaryModal from "./booking-summery-modal"
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal"
import { getAllBookings, deleteBooking, BookingItem } from "../../../../../services/bookingService"

export default function EventReqTable() {
  
  const [activeTab, setActiveTab] = useState("all")
  const [timeFilter, setTimeFilter] = useState("alltime")
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await getAllBookings()
        console.log('📥 Bookings fetched from API:', response)
        setBookings(response.all || [])
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching bookings:', err)
        setError('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const dateRangeOptions = [
    { value: "alltime", label: "All Time" },
    { value: "7days", label: "Last 7 days" },
    { value: "15days", label: "Last 15 days" },
    { value: "30days", label: "Last 30 days" },
  ]

  const getFilteredDateRange = (days: number) => {
    const today = new Date()
    const startDate = startOfDay(subDays(today, days))
    const endDate = endOfDay(today)
    return { startDate, endDate }
  }

  const filteredData = useMemo(() => {
    // First filter by status - use status field as primary filter
    let filtered = bookings.filter((item) => {
      if (activeTab === "all") return true
      if (activeTab === "approved") return item.status === "approved"
      if (activeTab === "pending") return item.status === "pending"
      if (activeTab === "rejected") return item.status === "rejected" || item.status === "cancelled"
      return true
    })

    // Then filter by date range (skip if "all time" is selected))
    if (timeFilter !== "alltime") {
      const days = Number.parseInt(timeFilter.replace("days", ""))
      const { startDate, endDate } = getFilteredDateRange(days)

      filtered = filtered.filter((item) => {
        try {
          const dateToCheck = item.bookingTimestamp || item.created_at
          if (!dateToCheck) return false
          const submittedDate = parseISO(dateToCheck)
          return isWithinInterval(submittedDate, { start: startDate, end: endDate })
        } catch (error) {
          console.error("Date parsing error for item:", item.id, error)
          return false
        }
      })
    }

    return filtered
  }, [activeTab, timeFilter, bookings])

  const handleDateRangeChange = (value: string) => {
    setTimeFilter(value)
    setShowDateDropdown(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Confirmed"
      case "completed":
        return "Confirmed"
      case "rejected":
        return "Rejected"
      case "cancelled":
        return "Cancelled"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  const getPaymentStatusStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200"
      case "unpaid":
        return "bg-orange-100 text-orange-800 border border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const getPaymentStatusText = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "Paid"
      case "unpaid":
        return "Unpaid"
      default:
        return "Unknown"
    }
  }

  

  const getPackageBadgeColor = (packageType: string) => {
    switch (packageType) {
      case "luxury":
      case "vip":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "premium":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }


  
  // Delete booking
  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id)
      console.log('✅ Booking deleted:', id)
      // Refresh bookings after delete
      const response = await getAllBookings()
      setBookings(response.all || [])
      setDeleteConfirm(null)
    } catch (err) {
      console.error('❌ Error deleting booking:', err)
      alert('Failed to delete booking')
    }
  };



  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      return format(parseISO(dateString), "h:mm a")
    } catch {
      return ""
    }
  }

  const debugInfo = useMemo(() => {
    let dateRange = "All Time"
    if (timeFilter !== "alltime") {
      const days = Number.parseInt(timeFilter.replace("days", ""))
      const { startDate, endDate } = getFilteredDateRange(days)
      dateRange = `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
    }
    return {
      totalData: bookings.length,
      filteredCount: filteredData.length,
      dateRange,
      activeTab,
      timeFilter,
    }
  }, [filteredData.length, activeTab, timeFilter, bookings.length])

  return (
    <div className="w-full px-4 py-4">
      <div className="pt-4 pb-8 min-h-screen">

    {/* Loading State */}
    {loading && (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading bookings...</p>
      </div>
    )}

    {/* Error State */}
    {error && (
      <div className="w-full bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading bookings</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )}
    
    {!loading && !error && (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sports Travel Bookings</h1>
            <p className="text-gray-600">Manage and review all travel booking requests</p>
            <div className="text-xs text-gray-400 mt-1">
              Showing {debugInfo.filteredCount} of {debugInfo.totalData} bookings | Range: {debugInfo.dateRange}
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm"
            >
              <FaCalendarAlt className="text-blue-600 w-4 h-4" />
              <span className="text-gray-700 font-medium">
                {dateRangeOptions.find((opt) => opt.value === timeFilter)?.label}
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
          {/* All Requests - Full Width */}
          <button
            onClick={() => setActiveTab("all")}
            className={`w-full py-3 px-4 border-2 rounded-lg font-medium text-sm transition-colors
              ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            All Bookings
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
              ${activeTab === "all" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
            >
              {bookings.length}
            </span>
          </button>
          
          {/* Other tabs - 3 buttons in row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "approved", label: "Confirmed", count: bookings.filter((d) => d.status === "approved").length },
              { key: "pending", label: "Pending", count: bookings.filter((d) => d.status === "pending").length },
              { key: "rejected", label: "Cancelled", count: bookings.filter((d) => d.status === "rejected" || d.status === "cancelled").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-2 border-2 rounded-lg font-medium text-xs transition-colors
                  ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium block mt-1
                  ${activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex space-x-8">
          {[
            { key: "all", label: "All Bookings", count: bookings.length },
            { key: "approved", label: "Confirmed", count: bookings.filter((d) => d.status === "approved").length },
            { key: "pending", label: "Pending", count: bookings.filter((d) => d.status === "pending").length },
            { key: "rejected", label: "Cancelled", count: bookings.filter((d) => d.status === "rejected" || d.status === "cancelled").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative
                ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                ${activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
              >
                {tab.count}
              </span>
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
            {filteredData.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{formatDate(booking.bookingTimestamp || booking.created_at)}</div>
                  <div className="text-xs text-gray-500">{formatTime(booking.bookingTimestamp || booking.created_at)}</div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{booking.fullName}</div>
                    <div className="text-sm text-gray-600">{booking.email}</div>
                    <div className="text-xs text-gray-500">{booking.phone}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                        {booking.selectedSport}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900 font-medium">
                      <FaMapMarkerAlt className="w-3 h-3 mr-2 text-gray-400" />
                      {booking.selectedCity.charAt(0).toUpperCase() + booking.selectedCity.slice(1)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPlane className="w-3 h-3 mr-2 text-gray-400" />
                      {booking.departureDateFormatted} - {booking.returnDateFormatted}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="w-3 h-3 mr-2 text-gray-400" />
                      {booking.totalPeople} travelers
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPackageBadgeColor(booking.selectedPackage)} capitalize`}
                      >
                        {booking.selectedPackage}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900 font-medium">
                      <FaDollarSign className="w-3 h-3 mr-2 text-gray-400" />€{booking.totalExtrasCost}
                    </div>
                    <div className="text-xs text-gray-500">Extras: €{booking.totalExtrasCost} ({booking.extrasCount})</div>
                    <div className="text-xs text-gray-500">{booking.travelDuration} days</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(booking.payment_status)}`}
                  >
                    {getPaymentStatusText(booking.payment_status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                                                                 <BookingSummaryModal 
                          bookingData={{
                            id: booking.id,
                            status: booking.status,
                            selectedSport: booking.selectedSport,
                            selectedPackage: booking.selectedPackage,
                            selectedCity: booking.selectedCity,
                            selectedLeague: booking.selectedLeague,
                            adults: booking.adults,
                            kids: booking.kids,
                            babies: booking.babies,
                            totalPeople: booking.totalPeople,
                            departureDate: booking.departureDate,
                            returnDate: booking.returnDate,
                            departureDateFormatted: booking.departureDateFormatted,
                            returnDateFormatted: booking.returnDateFormatted,
                            departureTimeStart: booking.departureTimeStart,
                            departureTimeEnd: booking.departureTimeEnd,
                            arrivalTimeStart: booking.arrivalTimeStart,
                            arrivalTimeEnd: booking.arrivalTimeEnd,
                            departureTimeRange: booking.departureTimeRange,
                            arrivalTimeRange: booking.arrivalTimeRange,
                            removedLeagues: (() => {
                              try {
                                const leagues = typeof booking.removedLeagues === 'string' 
                                  ? JSON.parse(booking.removedLeagues) 
                                  : booking.removedLeagues
                                return Array.isArray(leagues) ? leagues.map((league: string | { id?: string; name?: string }) => ({ 
                                  id: typeof league === 'string' ? league : league.id || '', 
                                  name: typeof league === 'string' ? league : league.name || '', 
                                  country: 'Spain' 
                                })) : []
                              } catch {
                                return []
                              }
                            })(),
                            removedLeaguesCount: booking.removedLeaguesCount,
                            hasRemovedLeagues: booking.hasRemovedLeagues,
                            allExtras: booking.bookingExtras || [],
                            selectedExtras: booking.bookingExtras || [],
                            selectedExtrasNames: Array.isArray(booking.selectedExtrasNames) 
                              ? booking.selectedExtrasNames 
                              : [],
                            totalExtrasCost: booking.totalExtrasCost,
                            extrasCount: booking.extrasCount,
                            firstName: booking.firstName,
                            lastName: booking.lastName,
                            fullName: booking.fullName,
                            email: booking.email,
                            phone: booking.phone,
                            previousTravelInfo: booking.previousTravelInfo,
                            paymentMethod: booking.paymentMethod,
                            cardNumber: booking.cardNumber,
                            expiryDate: booking.expiryDate,
                            cvv: booking.cvv,
                            cardholderName: booking.cardholderName,
                            bookingTimestamp: booking.bookingTimestamp || booking.created_at,
                            bookingDate: booking.bookingDate || formatDate(booking.created_at),
                            bookingTime: booking.bookingTime || formatTime(booking.created_at),
                            isBookingComplete: booking.isBookingComplete,
                            travelDuration: booking.travelDuration,
                            hasFlightPreferences: booking.hasFlightPreferences,
                            requiresEuropeanLeagueHandling: booking.requiresEuropeanLeagueHandling,
                            destinationCity: booking.destinationCity,
                            assignedMatch: booking.assignedMatch
                          }}
                       onStatusUpdate={async () => {
                         // Refresh the bookings data from API
                         try {
                           const response = await getAllBookings()
                           setBookings(response.all || [])
                         } catch (err) {
                           console.error('Error refreshing bookings:', err)
                         }
                       }}
                     />
                    
                     
                     {/* Delete Button */}
                     <button 
                       onClick={() => setDeleteConfirm(booking.id)}
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
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FaCalendarAlt className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          <div className="text-xs text-gray-400 mt-2">
            Filter: {debugInfo.activeTab} | Date Range: {debugInfo.dateRange}
          </div>
        </div>
      )}
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

  )
}
