"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  _id: string;
  transactionType: "booking" | "gift_card";
  referenceId: string;
  referenceLabel?: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  provider: string;
  stripePaymentIntentId?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  createdAt?: string;
  paidAt?: string;
}

const ITEMS_PER_PAGE = 10;
const TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Bookings", value: "booking" },
  { label: "Gift cards", value: "gift_card" },
];
const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
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
}: {
  value: string;
  options: { label: string; value: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value)?.label || "Select";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-11 w-full items-center justify-between rounded border border-gray-200 bg-white px-3 text-sm text-zinc-800"
      >
        <span>{selected}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-12 z-30 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={`${option.label}-${option.value}`}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                option.value === value ? "bg-lime-50 font-medium text-lime-700" : "text-zinc-700"
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openFilterDropdown, setOpenFilterDropdown] = useState<null | "type" | "status">(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const serverQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    return params.toString();
  }, [type, status]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/transactions?${serverQuery}`);
      const result = await response.json();
      if (result.success) setTransactions(result.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverQuery]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const searchText =
        `${item.referenceLabel || item.referenceId} ${item.customerName || ""} ${
          item.customerEmail || ""
        } ${item.stripePaymentIntentId || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(query.trim().toLowerCase());

      const createdAt = item.createdAt ? new Date(item.createdAt) : null;
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;
      const matchesFrom = !fromDate || !createdAt || createdAt >= fromDate;
      const matchesTo = !toDate || !createdAt || createdAt <= toDate;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [transactions, query, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const pageStart = filteredTransactions.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, dateFrom, dateTo, type, status]);

  const totalPaid = filteredTransactions
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingCount = filteredTransactions.filter((item) => item.status === "pending").length;
  const failedCount = filteredTransactions.filter((item) => item.status === "failed").length;

  return (
    <div className="px-4 pb-8 md:pl-10 md:pr-8">
      <div className="flex flex-col gap-6 pt-8">
        <div>
          <h1 className="font-['Poppins'] text-3xl font-semibold text-zinc-950 md:text-4xl">
            Transactions
          </h1>
          <p className="mt-2 font-['Poppins'] text-gray-600">
            Track booking and gift card payment transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Transactions shown</div>
            <div className="mt-2 text-2xl font-semibold">{filteredTransactions.length}</div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Paid total</div>
            <div className="mt-2 text-2xl font-semibold text-lime-700">{totalPaid.toFixed(2)} EUR</div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="mt-2 text-2xl font-semibold text-yellow-700">{pendingCount}</div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Failed</div>
            <div className="mt-2 text-2xl font-semibold text-red-600">{failedCount}</div>
          </div>
        </div>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reference, customer, or payment intent..."
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>

            <DropdownField
              value={type}
              options={TYPE_OPTIONS}
              isOpen={openFilterDropdown === "type"}
              onToggle={() => setOpenFilterDropdown((prev) => (prev === "type" ? null : "type"))}
              onSelect={(value) => {
                setType(value);
                setOpenFilterDropdown(null);
              }}
            />

            <DropdownField
              value={status}
              options={STATUS_OPTIONS}
              isOpen={openFilterDropdown === "status"}
              onToggle={() => setOpenFilterDropdown((prev) => (prev === "status" ? null : "status"))}
              onSelect={(value) => {
                setStatus(value);
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
                onChange={(event) => setDateFrom(event.target.value)}
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
                onChange={(event) => setDateTo(event.target.value)}
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-0">
            <h2 className="m-6 text-lg font-semibold text-gray-900">Payment Transactions</h2>
            <button
              onClick={loadTransactions}
              className="mr-6 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="p-6 pt-0">
            <Table className="min-w-[1080px]">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Reference</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Type</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Customer</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Amount</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Status</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Provider</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse border-b border-gray-100">
                        {Array.from({ length: 7 }).map((__, col) => (
                          <TableCell key={col} className="px-4 py-3">
                            <div className="h-4 w-24 rounded bg-gray-200" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : paginatedTransactions.map((item) => (
                      <TableRow key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="px-4 py-3 text-sm">
                          <div className="text-sm font-semibold text-gray-900">
                            {item.referenceLabel || item.referenceId}
                          </div>
                          <div className="max-w-[260px] truncate text-xs text-gray-500">
                            {item.description || item.referenceId}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {item.transactionType === "gift_card" ? "Gift card" : "Booking"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          <div className="text-sm text-gray-800">{item.customerName || "-"}</div>
                          <div className="text-xs text-gray-500">{item.customerEmail || ""}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                          {Number(item.amount || 0).toFixed(2)} {item.currency || "EUR"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.status === "paid"
                                ? "bg-lime-100 text-lime-700"
                                : item.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          <div>{item.provider || "-"}</div>
                          <div className="max-w-[260px] truncate font-mono text-xs text-gray-500">
                            {item.stripePaymentIntentId || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            {!isLoading && paginatedTransactions.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                No transactions found for the selected filters.
              </div>
            )}
          </div>

          {!isLoading && filteredTransactions.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Showing {pageStart} to {pageEnd} of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    currentPage === 1
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#76C043] text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    currentPage === totalPages
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
