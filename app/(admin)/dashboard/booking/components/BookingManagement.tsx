"use client";
import React, { useState, useEffect } from "react";
import { Eye, Trash2, CheckCircle, XCircle, Clock, Calendar, Users, MapPin, CreditCard } from "lucide-react";
import AppData from "../../../../lib/appdata";

interface BookingData {
  id: number;
  status: "pending" | "completed" | "cancelled";
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague: string;
  adults: number;
  kids: number;
  babies: number;
  totalPeople: number;
  departureDate: string;
  returnDate: string;
  departureDateFormatted: string;
  returnDateFormatted: string;
  departureTimeStart: number;
  departureTimeEnd: number;
  arrivalTimeStart: number;
  arrivalTimeEnd: number;
  departureTimeRange: string;
  arrivalTimeRange: string;
  removedLeagues: string[];
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  allExtras: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    currency: string;
  }>;
  selectedExtras: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    currency: string;
  }>;
  selectedExtrasNames: string[];
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  cardNumber: string | null;
  expiryDate: string | null;
  cvv: string | null;
  cardholderName: string | null;
  bookingTimestamp: string;
  bookingDate: string;
  bookingTime: string;
  isBookingComplete: boolean;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "cancelled">("all");

  // Load booking data from AppData
  useEffect(() => {
    setBookings(AppData.bookings.all);
  }, []);

  // Filter bookings based on status
  const filteredBookings = filterStatus === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  // Update booking status
  const updateBookingStatus = (id: number, status: "pending" | "completed" | "cancelled") => {
    AppData.bookings.update(id, { status });
    setBookings(AppData.bookings.all);
  };

  // Delete booking
  const handleDeleteBooking = (id: number) => {
    const success = AppData.bookings.delete(id);
    if (success) {
      setBookings(AppData.bookings.all);
    }
    setDeleteConfirm(null);
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" };
      case "pending":
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" };
      case "cancelled":
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" };
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  // Format time from minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Booking Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">Manage all customer bookings and reservations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                <p className="text-gray-600 font-['Poppins']">Total Bookings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.status === "pending").length}
                </p>
                <p className="text-gray-600 font-['Poppins']">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.status === "completed").length}
                </p>
                <p className="text-gray-600 font-['Poppins']">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {bookings.filter(b => b.status === "cancelled").length}
                </p>
                <p className="text-gray-600 font-['Poppins']">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-[#76C043] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = getStatusInfo(booking.status).icon;
            const statusColor = getStatusInfo(booking.status).color;
            const statusBgColor = getStatusInfo(booking.status).bgColor;

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${statusBgColor}`}>
                        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold font-['Poppins'] text-gray-800">
                          Booking #{booking.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.bookingDate} at {booking.bookingTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(booking.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Main Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="font-medium">{booking.selectedCity}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Travelers</p>
                        <p className="font-medium">{booking.totalPeople} people</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{booking.travelDuration} days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Payment</p>
                        <p className="font-medium capitalize">{booking.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium">{booking.fullName}</p>
                        <p className="text-sm text-gray-600">{booking.email}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusColor}`}>
                          <StatusIcon className="w-3 h-3" />
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === "completed" && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, "pending")}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                      >
                        Mark Pending
                      </button>
                    )}
                    {booking.status === "cancelled" && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, "pending")}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Bookings Message */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No bookings found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold font-['Poppins']">Booking Details #{selectedBooking.id}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedBooking.fullName}</p>
                      <p><span className="font-medium">Email:</span> {selectedBooking.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedBooking.phone}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Trip Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Sport:</span> {selectedBooking.selectedSport}</p>
                      <p><span className="font-medium">Package:</span> {selectedBooking.selectedPackage}</p>
                      <p><span className="font-medium">City:</span> {selectedBooking.selectedCity}</p>
                      <p><span className="font-medium">League:</span> {selectedBooking.selectedLeague}</p>
                      <p><span className="font-medium">Duration:</span> {selectedBooking.travelDuration} days</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Travelers</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Adults:</span> {selectedBooking.adults}</p>
                      <p><span className="font-medium">Kids:</span> {selectedBooking.kids}</p>
                      <p><span className="font-medium">Babies:</span> {selectedBooking.babies}</p>
                      <p><span className="font-medium">Total:</span> {selectedBooking.totalPeople}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Flight Schedule</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Departure:</span> {selectedBooking.departureDateFormatted}</p>
                      <p><span className="font-medium">Return:</span> {selectedBooking.returnDateFormatted}</p>
                      <p><span className="font-medium">Departure Time:</span> {selectedBooking.departureTimeRange}</p>
                      <p><span className="font-medium">Arrival Time:</span> {selectedBooking.arrivalTimeRange}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Selected Extras</h3>
                    {selectedBooking.selectedExtras.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBooking.selectedExtras.map((extra) => (
                          <div key={extra.id} className="flex justify-between">
                            <span>{extra.name} (x{extra.quantity})</span>
                            <span className="font-medium">
                              {extra.isIncluded ? "Included" : `€${extra.price * extra.quantity}`}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <p className="font-medium">Total Extras: €{selectedBooking.totalExtrasCost}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No extras selected</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Payment Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Method:</span> {selectedBooking.paymentMethod}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedBooking.status).bgColor} ${getStatusInfo(selectedBooking.status).color}`}>
                          {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                        </span>
                      </p>
                      <p><span className="font-medium">Booking Date:</span> {selectedBooking.bookingDate}</p>
                      <p><span className="font-medium">Booking Time:</span> {selectedBooking.bookingTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold font-['Poppins'] mb-2">Delete Booking</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteBooking(deleteConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 