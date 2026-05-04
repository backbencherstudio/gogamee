"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Plane,
  MapPin,
  Trash2,
  ChevronDown,
  Search,
  Eye,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import BookingSummaryModal from "./booking-summery-modal";
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal";
import {
  getAllBookings,
  deleteBooking,
  type BookingItem,
} from "../../../../../services/bookingService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DropdownOption {
  label: string;
  value: string;
}

const STATUS_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const LEAGUE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Competitions" },
  { value: "national", label: "National League" },
  { value: "european", label: "European Competition" },
  { value: "spain", label: "Pack España" },
];

const PAYMENT_OPTIONS: DropdownOption[] = [
  { label: "All payment", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
];

function DropdownField({
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  className = "",
}: {
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  className?: string;
}) {
  const selected =
    options.find((option) => option.value === value)?.label || value;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-11 w-full items-center justify-between rounded border border-gray-200 bg-white px-3 text-sm text-zinc-800"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-12 z-40 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                option.value === value
                  ? "bg-lime-50 font-medium text-lime-700"
                  : "text-zinc-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventReqTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [openFilterDropdown, setOpenFilterDropdown] = useState<
    null | "status" | "payment" | "league"
  >(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const pageStart = totalItems ? (currentPage - 1) * limit + 1 : 0;
  const pageEnd = Math.min(currentPage * limit, totalItems);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load bookings from API
  const loadBookings = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings(
        page,
        limit,
        activeTab,
        "alltime",
        debouncedSearch,
        dateFrom,
        dateTo,
        paymentFilter,
        leagueFilter,
      );

      if (response && response.success) {
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
    loadBookings(currentPage);
  }, [
    currentPage,
    activeTab,
    debouncedSearch,
    dateFrom,
    dateTo,
    paymentFilter,
    leagueFilter,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "confirmed":
        return "bg-green-100 text-green-800 border-0";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700 border-0";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-0";
      default:
        return "bg-gray-100 text-gray-800 border-0";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
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
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPaymentStatusStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
      case "succeeded":
        return "bg-green-100 text-green-800 border-0";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-0";
      case "failed":
        return "bg-red-100 text-red-700 border-0";
      default:
        return "bg-gray-100 text-gray-600 border-0";
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
        return (
          (paymentStatus || "Unknown").charAt(0).toUpperCase() +
          (paymentStatus || "Unknown").slice(1)
        );
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id);
      loadBookings(currentPage);
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

  const openDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="px-4 pb-8 md:pl-10 md:pr-8">
      {/* Page Header */}
      <div className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-3xl font-semibold text-zinc-950 md:text-4xl">
              Booking Requests
            </h1>
            <p className="mt-2 font-['Poppins'] text-gray-600">
              Manage and monitor all customer travel bookings with search,
              filters, and status controls.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Search reference, customer, city..."
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>

            <DropdownField
              value={activeTab}
              options={STATUS_OPTIONS}
              isOpen={openFilterDropdown === "status"}
              onToggle={() =>
                setOpenFilterDropdown((prev) =>
                  prev === "status" ? null : "status",
                )
              }
              onSelect={(value) => {
                setCurrentPage(1);
                handleTabChange(value);
                setOpenFilterDropdown(null);
              }}
            />

            <DropdownField
              value={paymentFilter}
              options={PAYMENT_OPTIONS}
              isOpen={openFilterDropdown === "payment"}
              onToggle={() =>
                setOpenFilterDropdown((prev) =>
                  prev === "payment" ? null : "payment",
                )
              }
              onSelect={(value) => {
                setCurrentPage(1);
                setPaymentFilter(value);
                setOpenFilterDropdown(null);
              }}
            />

            <DropdownField
              value={leagueFilter}
              options={LEAGUE_OPTIONS}
              isOpen={openFilterDropdown === "league"}
              onToggle={() =>
                setOpenFilterDropdown((prev) =>
                  prev === "league" ? null : "league",
                )
              }
              onSelect={(value) => {
                setCurrentPage(1);
                setLeagueFilter(value);
                setOpenFilterDropdown(null);
              }}
            />

            <div className="relative">
              <Calendar
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setCurrentPage(1);
                  setDateFrom(event.target.value);
                }}
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>

            <div className="relative">
              <Calendar
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setCurrentPage(1);
                  setDateTo(event.target.value);
                }}
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>
          </div>
        </section>

        {/* Table Content */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-lg font-semibold text-gray-900">
              All booking requests
            </h2>
            <button
              onClick={() => loadBookings()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="p-6 pt-2 overflow-x-auto">
            <Table className="min-w-[1180px]">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                    Booking & Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                    Customer
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                    Trip Details
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                    Financials
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center font-medium text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="py-3 text-right font-medium text-gray-600 px-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={6} className="py-8">
                        <div className="flex items-center space-x-4 animate-pulse">
                          <div className="h-10 w-10 bg-gray-100 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-100 rounded w-1/4" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <CalendarDays className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-semibold">
                          No bookings found
                        </h3>
                        <p className="text-slate-500 text-sm">
                          No results match your current search or filters.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow
                      key={booking.id || booking._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {booking.bookingReference ||
                              `REQ-${String(booking.id || booking._id)
                                .slice(-6)
                                .toUpperCase()}`}
                          </span>
                          <div className="flex items-center text-slate-400 text-[11px] mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(booking.createdAt)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {booking.travelers?.primaryContact?.name ||
                              "Anonymous Guest"}
                          </span>
                          <span className="text-slate-500 text-xs mt-0.5">
                            {booking.travelers?.primaryContact?.email ||
                              "No email provided"}
                          </span>
                          <div className="mt-2 flex gap-1.5">
                            <Badge
                              variant="outline"
                              className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px] py-0 px-2 h-5"
                            >
                              {booking.selection?.sport || "N/A"}
                            </Badge>
                            {booking.selection?.league === "Spain" && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] py-0 px-2 h-5"
                              >
                                Pack España
                              </Badge>
                            )}
                            {booking.selection?.league === "European" && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] py-0 px-2 h-5"
                              >
                                European
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center text-slate-700 text-xs font-medium">
                            <MapPin className="w-3 h-3 mr-1.5 text-[#6AAD3C]" />
                            {booking.selection?.city || "Unknown City"}
                          </div>
                          <div className="flex items-center text-slate-500 text-[11px]">
                            <Plane className="w-3 h-3 mr-1.5 text-slate-400" />
                            {formatDate(booking.dates?.departure)} -{" "}
                            {formatDate(booking.dates?.return)}
                          </div>
                          <div className="flex items-center text-slate-500 text-[11px]">
                            <Users className="w-3 h-3 mr-1.5 text-slate-400" />
                            {booking.travelers?.totalCount || 0} Travelers
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-base">
                            €{booking.totalCost}
                          </span>
                          <div className="flex items-center mt-1">
                            <Badge
                              className={`${getPaymentStatusStyle(booking.payment?.status)} text-[10px] py-0 px-2 h-5`}
                            >
                              {getPaymentStatusText(booking.payment?.status)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-center">
                        <Badge
                          className={`${getStatusStyle(booking.status)} font-semibold py-1 px-3`}
                        >
                          {getStatusText(booking.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetails(booking)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm(booking.id || booking._id || "")
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 shadow-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with Pagination */}
          {!loading && totalItems > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-6 py-4 md:flex-row">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-zinc-900">{pageStart}</span>{" "}
                to <span className="font-medium text-zinc-900">{pageEnd}</span>{" "}
                of{" "}
                <span className="font-medium text-zinc-900">{totalItems}</span>{" "}
                bookings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex h-9 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "text-zinc-700"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex h-9 w-9 items-center justify-center rounded text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-lime-50 text-lime-700"
                            : "text-zinc-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`inline-flex h-9 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "text-zinc-700"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Booking Summary Modal */}
      {selectedBooking && (
        <BookingSummaryModal
          bookingData={{
            ...selectedBooking,
            id: selectedBooking.id || selectedBooking._id,
          }}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
          onStatusUpdate={() => loadBookings()}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteBooking(deleteConfirm)}
        title="Delete Booking Request"
        message="Are you sure you want to delete this booking request? This action cannot be undone and will permanently remove all traveler details associated with it."
      />
    </div>
  );
}
