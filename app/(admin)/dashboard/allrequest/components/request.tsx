"use client"
import { useState, useMemo } from "react"
import { FaTrash, FaCalendarAlt, FaUsers, FaDollarSign, FaPlane, FaMapMarkerAlt } from "react-icons/fa"
import { MdKeyboardArrowDown } from "react-icons/md"
 
import { subDays, parseISO, isWithinInterval, format, startOfDay, endOfDay } from "date-fns"
import AppData from "@/app/lib/appdata"
import BookingSummaryModal from "./booking-summery-modal"
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal"

export default function EventReqTable() {
  
  const [activeTab, setActiveTab] = useState("all")
  const [timeFilter, setTimeFilter] = useState("alltime")
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [bookings, setBookings] = useState(AppData.bookings.all)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

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
    // First filter by status
    let filtered = bookings.filter((item) => {
      if (activeTab === "all") return true
      if (activeTab === "approved") return item.status === "completed"
      if (activeTab === "pending") return item.status === "pending"
      if (activeTab === "rejected") return item.status === "cancelled"
      return true
    })

    // Then filter by date range (skip if "all time" is selected))
    if (timeFilter !== "alltime") {
      const days = Number.parseInt(timeFilter.replace("days", ""))
      const { startDate, endDate } = getFilteredDateRange(days)

      filtered = filtered.filter((item) => {
        try {
          const submittedDate = parseISO(item.bookingTimestamp)
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
      case "completed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Confirmed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
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
  const handleDeleteBooking = (id: number) => {
    AppData.bookings.delete(id);
    setDeleteConfirm(null);
    // Update local state immediately
    setBookings([...AppData.bookings.all]);
  };



  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
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
              { key: "approved", label: "Confirmed", count: bookings.filter((d) => d.status === "completed").length },
              { key: "pending", label: "Pending", count: bookings.filter((d) => d.status === "pending").length },
              { key: "rejected", label: "Cancelled", count: bookings.filter((d) => d.status === "cancelled").length },
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
            { key: "approved", label: "Confirmed", count: bookings.filter((d) => d.status === "completed").length },
            { key: "pending", label: "Pending", count: bookings.filter((d) => d.status === "pending").length },
            { key: "rejected", label: "Cancelled", count: bookings.filter((d) => d.status === "cancelled").length },
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
                Status
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
                  <div className="text-sm font-medium text-gray-900">{formatDate(booking.bookingTimestamp)}</div>
                  <div className="text-xs text-gray-500">{formatTime(booking.bookingTimestamp)}</div>
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
                            removedLeagues: Array.isArray(booking.removedLeagues) ? 
                              booking.removedLeagues.map(league => ({ 
                                id: typeof league === 'string' ? league : (league as { id?: string; name?: string }).id || '', 
                                name: typeof league === 'string' ? league : (league as { id?: string; name?: string }).name || '', 
                                country: 'Spain' 
                              })) : [],
                            removedLeaguesCount: booking.removedLeaguesCount,
                            hasRemovedLeagues: booking.hasRemovedLeagues,
                            allExtras: booking.allExtras,
                            selectedExtras: booking.selectedExtras,
                            selectedExtrasNames: booking.selectedExtrasNames,
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
                            bookingTimestamp: booking.bookingTimestamp,
                            bookingDate: booking.bookingDate,
                            bookingTime: booking.bookingTime,
                            isBookingComplete: booking.isBookingComplete,
                            travelDuration: booking.travelDuration,
                            hasFlightPreferences: booking.hasFlightPreferences,
                            requiresEuropeanLeagueHandling: booking.requiresEuropeanLeagueHandling,
                            destinationCity: booking.destinationCity,
                            assignedMatch: booking.assignedMatch
                          }}
                       onStatusUpdate={() => {
                         // Refresh the bookings data to show updated status and internal management fields
                         setBookings([...AppData.bookings.all])
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
