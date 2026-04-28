"use client";

import React, { useEffect, useState } from "react";
import {
  Ban,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type GiftState = "active" | "suspended" | "banned";
type PaymentStatus = "pending" | "paid" | "failed";

interface GiftUsageLog {
  usedAt: string;
  amount: number;
  source: "booking" | "manual";
  bookingId?: string;
  bookingReference?: string;
  note?: string;
}

interface GiftCode {
  _id: string;
  code: string;
  name: string;
  codeKind: "discount" | "gift";
  value: number;
  remainingAmount?: number;
  usedCount: number;
  isActive: boolean;
  state?: GiftState;
  paymentStatus?: "none" | "pending" | "paid" | "failed";
  recipientName?: string;
  recipientEmail?: string;
  buyerName?: string;
  buyerEmail?: string;
  dedication?: string;
  createdAt?: string;
  expiresAt?: string;
  usageLogs?: GiftUsageLog[];
}

interface GiftForm {
  name: string;
  code: string;
  value: number;
  recipientName: string;
  recipientEmail: string;
  buyerName: string;
  buyerEmail: string;
  dedication: string;
  state: GiftState;
  paymentStatus: PaymentStatus;
}

interface DropdownOption {
  label: string;
  value: string;
}

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS: DropdownOption[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Banned", value: "banned" },
];

const PAYMENT_OPTIONS: DropdownOption[] = [
  { label: "All payment", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
];

const EDITABLE_STATUS_OPTIONS: DropdownOption[] = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Banned", value: "banned" },
];

const EDITABLE_PAYMENT_OPTIONS: DropdownOption[] = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
];

const randomGiftCode = () =>
  `GIFT${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const normalizeGiftCode = (value: string) =>
  value.replace(/-/g, "").replace(/\s+/g, "").toUpperCase();

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const getState = (item: GiftCode): GiftState => {
  if (item.state) return item.state;
  return item.isActive ? "active" : "suspended";
};

const getStateBadgeClass = (state: GiftState) => {
  if (state === "active") return "bg-green-100 text-green-800";
  if (state === "banned") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-800";
};

const getPaymentBadgeClass = (status?: string) => {
  if (status === "paid") return "bg-green-100 text-green-800";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-800";
};

const createInitialGiftForm = (): GiftForm => ({
  name: "",
  code: randomGiftCode(),
  value: 200,
  recipientName: "",
  recipientEmail: "",
  buyerName: "",
  buyerEmail: "",
  dedication: "",
  state: "active",
  paymentStatus: "paid",
});

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
        <span>{selected}</span>
        <ChevronDown size={16} className="text-gray-500" />
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

export default function GiftCardsDashboardPage() {
  const [giftCards, setGiftCards] = useState<GiftCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | GiftState>("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "pending" | "paid" | "failed"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<GiftCode | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GiftCode | null>(null);
  const [giftForm, setGiftForm] = useState<GiftForm>(createInitialGiftForm);
  const [formMessage, setFormMessage] = useState("");

  const [openFilterDropdown, setOpenFilterDropdown] = useState<
    null | "status" | "payment"
  >(null);
  const [openFormDropdown, setOpenFormDropdown] = useState<
    null | "state" | "paymentStatus"
  >(null);

  const loadGiftCards = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search: query,
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const response = await fetch(`/api/admin/gift-cards?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setGiftCards(result.data || []);
        setTotalItems(result.meta_data?.total || 0);
        setTotalPages(result.meta_data?.total_pages || 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGiftCards(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, query, statusFilter, paymentFilter, dateFrom, dateTo]);

  const pageStart = totalItems ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const updateState = async (item: GiftCode, state: GiftState) => {
    await fetch(`/api/admin/gift-cards/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state,
        isActive: state === "active",
      }),
    });
    await loadGiftCards();
  };

  const updateForm = <K extends keyof GiftForm>(key: K, value: GiftForm[K]) => {
    setGiftForm((prev) => ({ ...prev, [key]: value }));
  };

  const openDetails = async (id: string) => {
    const response = await fetch(`/api/admin/gift-cards/${id}`);
    const result = await response.json();
    if (result.success) setSelectedCard(result.data);
  };

  const resetGiftForm = () => {
    setGiftForm(createInitialGiftForm());
    setFormMessage("");
    setOpenFormDropdown(null);
  };

  const openCreateModal = () => {
    resetGiftForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (item: GiftCode) => {
    setEditTarget(item);
    setGiftForm({
      name: item.name || "",
      code: item.code || randomGiftCode(),
      value: Number(item.value || 0),
      recipientName: item.recipientName || "",
      recipientEmail: item.recipientEmail || "",
      buyerName: item.buyerName || "",
      buyerEmail: item.buyerEmail || "",
      dedication: item.dedication || "",
      state: getState(item),
      paymentStatus:
        item.paymentStatus === "paid" || item.paymentStatus === "failed"
          ? item.paymentStatus
          : "pending",
    });
    setFormMessage("");
    setOpenFormDropdown(null);
    setIsEditModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetGiftForm();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTarget(null);
    resetGiftForm();
  };

  const submitCreateGiftCard = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage("");
    const payload = {
      name: giftForm.name,
      code: normalizeGiftCode(giftForm.code),
      codeKind: "gift",
      discountType: "fixed",
      value: Number(giftForm.value),
      usageLimit: "multiple",
      isActive: giftForm.state === "active",
      state: giftForm.state,
      paymentStatus: giftForm.paymentStatus,
      initialAmount: Number(giftForm.value),
      remainingAmount: Number(giftForm.value),
      recipientName: giftForm.recipientName,
      recipientEmail: giftForm.recipientEmail,
      buyerName: giftForm.buyerName,
      buyerEmail: giftForm.buyerEmail,
      dedication: giftForm.dedication,
    };

    const response = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setFormMessage(result.message || "Could not create gift card.");
      return;
    }

    closeCreateModal();
    await loadGiftCards();
  };

  const submitEditGiftCard = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editTarget) return;
    setFormMessage("");

    const payload = {
      name: giftForm.name,
      code: normalizeGiftCode(giftForm.code),
      value: Number(giftForm.value),
      state: giftForm.state,
      isActive: giftForm.state === "active",
      paymentStatus: giftForm.paymentStatus,
      recipientName: giftForm.recipientName,
      recipientEmail: giftForm.recipientEmail,
      buyerName: giftForm.buyerName,
      buyerEmail: giftForm.buyerEmail,
      dedication: giftForm.dedication,
      initialAmount: Number(giftForm.value),
      remainingAmount: Number(giftForm.value),
    };

    const response = await fetch(`/api/admin/gift-cards/${editTarget._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setFormMessage(result.message || "Could not update gift card.");
      return;
    }

    closeEditModal();
    await loadGiftCards();
  };

  return (
    <div className="px-4 pb-8 md:pl-10 md:pr-8">
      <div className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-3xl font-semibold text-zinc-950 md:text-4xl">
              Gift Cards
            </h1>
            <p className="mt-2 font-['Poppins'] text-gray-600">
              Manage gift cards with search, filters, usage logs, and status
              controls.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded bg-[#76C043] px-5 text-sm font-semibold text-white hover:bg-lime-600"
          >
            <Plus size={16} />
            Create Gift Card
          </button>
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
                onChange={(event) => {
                  setCurrentPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Search code, recipient, buyer..."
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>

            <DropdownField
              value={statusFilter}
              options={STATUS_OPTIONS}
              isOpen={openFilterDropdown === "status"}
              onToggle={() =>
                setOpenFilterDropdown((prev) =>
                  prev === "status" ? null : "status",
                )
              }
              onSelect={(value) => {
                setCurrentPage(1);
                setStatusFilter(value as "all" | GiftState);
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
                setPaymentFilter(
                  value as "all" | "pending" | "paid" | "failed",
                );
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

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-0">
            <h2 className="m-6 text-lg font-semibold text-gray-900">
              Purchased gift cards
            </h2>
            <button
              onClick={() => loadGiftCards()}
              className="mr-6 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="p-6 pt-0">
            <div className="overflow-y-visible">
              <Table className="min-w-[1180px]">
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Code
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Recipient
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Buyer
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Amount
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Usage
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Payment
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right font-medium text-gray-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <TableRow
                          key={index}
                          className="animate-pulse border-b border-gray-100"
                        >
                          {Array.from({ length: 8 }).map((__, col) => (
                            <TableCell key={col} className="px-4 py-3">
                              <div className="h-4 w-24 rounded bg-gray-200" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : giftCards.map((item) => {
                        const state = getState(item);
                        return (
                          <TableRow
                            key={item._id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <TableCell className="px-4 py-3 text-sm">
                              <div className="font-mono font-medium text-gray-900">
                                {item.code}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(item.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-700">
                              <div>{item.recipientName || "-"}</div>
                              <div className="text-xs text-gray-500">
                                {item.recipientEmail || ""}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-700">
                              <div>{item.buyerName || "-"}</div>
                              <div className="text-xs text-gray-500">
                                {item.buyerEmail || ""}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-700">
                              <div>
                                {Number(item.value || 0).toFixed(2)} EUR
                              </div>
                              <div className="text-xs text-gray-500">
                                Remaining{" "}
                                {Number(
                                  item.remainingAmount ?? item.value ?? 0,
                                ).toFixed(2)}{" "}
                                EUR
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-700">
                              <div>{item.usedCount}</div>
                              <div className="text-xs text-gray-500">redeemed count</div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentBadgeClass(
                                  item.paymentStatus,
                                )}`}
                              >
                                {item.paymentStatus || "pending"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStateBadgeClass(
                                  state,
                                )}`}
                              >
                                {state}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-700 hover:bg-gray-50"
                                    title="Actions"
                                  >
                                    <MoreVertical size={14} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-44 bg-white border-gray-100"
                                >
                                  <DropdownMenuItem onClick={() => openDetails(item._id)}>
                                    <Eye size={14} />
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openEditModal(item)}
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </DropdownMenuItem>
                                  {state === "active" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateState(item, "suspended")
                                        }
                                        className="text-yellow-800 focus:text-yellow-900"
                                      >
                                        <PauseCircle size={14} />
                                        Suspend
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateState(item, "banned")
                                        }
                                        className="text-red-700 focus:text-red-800"
                                      >
                                        <Ban size={14} />
                                        Ban
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {state === "suspended" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateState(item, "active")
                                        }
                                        className="text-green-700 focus:text-green-800"
                                      >
                                        <PlayCircle size={14} />
                                        Activate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateState(item, "banned")
                                        }
                                        className="text-red-700 focus:text-red-800"
                                      >
                                        <Ban size={14} />
                                        Ban
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {state === "banned" && (
                                    <DropdownMenuItem
                                      onClick={() => updateState(item, "active")}
                                      className="text-green-700 focus:text-green-800"
                                    >
                                      <PlayCircle size={14} />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
              {!isLoading && giftCards.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-gray-500">
                  No gift cards found with the current filters.
                </div>
              )}
            </div>
          </div>

          {!isLoading && totalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Showing {pageStart} to {pageEnd} of {totalItems} gift
                cards
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
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
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
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
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
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

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-950">
                Gift Card Details
              </h3>
              <button
                onClick={() => setSelectedCard(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Basic Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Code:</span>{" "}
                    <span className="font-mono font-medium">
                      {selectedCard.code}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedCard.name}
                  </p>
                  <p>
                    <span className="text-gray-500">Recipient:</span>{" "}
                    {selectedCard.recipientName || "-"} (
                    {selectedCard.recipientEmail || "-"})
                  </p>
                  <p>
                    <span className="text-gray-500">Buyer:</span>{" "}
                    {selectedCard.buyerName || "-"} (
                    {selectedCard.buyerEmail || "-"})
                  </p>
                  <p>
                    <span className="text-gray-500">Amount:</span>{" "}
                    {Number(selectedCard.value || 0).toFixed(2)} EUR
                  </p>
                  <p>
                    <span className="text-gray-500">Remaining:</span>{" "}
                    {Number(
                      selectedCard.remainingAmount ?? selectedCard.value ?? 0,
                    ).toFixed(2)}{" "}
                    EUR
                  </p>
                  <p>
                    <span className="text-gray-500">Created:</span>{" "}
                    {formatDateTime(selectedCard.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-500">Status:</span>{" "}
                    {getState(selectedCard)} /{" "}
                    {selectedCard.paymentStatus || "pending"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Usage Logs
                </h4>
                <div className="max-h-72 overflow-auto">
                  {selectedCard.usageLogs &&
                  selectedCard.usageLogs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCard.usageLogs.map((log, index) => (
                        <div
                          key={`${log.usedAt}-${index}`}
                          className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm"
                        >
                          <p className="font-medium text-gray-900">
                            Used {Number(log.amount || 0).toFixed(2)} EUR
                          </p>
                          <p className="text-gray-600">
                            Time: {formatDateTime(log.usedAt)}
                          </p>
                          <p className="text-gray-600">Source: {log.source}</p>
                          <p className="text-gray-600">
                            Booking:{" "}
                            {log.bookingReference || log.bookingId || "-"}
                          </p>
                          {log.note && (
                            <p className="text-gray-600">Note: {log.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No usage logs yet for this gift card.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[820px] border-gray-200 bg-white p-0">
          <form onSubmit={submitCreateGiftCard}>
            <DialogHeader className="border-b border-gray-100 px-6 py-5">
              <DialogTitle>Create Gift Card</DialogTitle>
              <DialogDescription>
                Create a gift card directly from admin and set initial status.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Name
                </label>
                <input
                  required
                  value={giftForm.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Code
                </label>
                <div className="relative">
                  <input
                    required
                    value={giftForm.code}
                    onChange={(event) =>
                      updateForm("code", normalizeGiftCode(event.target.value))
                    }
                    className="h-11 w-full rounded border border-gray-200 px-3 pr-28 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => updateForm("code", randomGiftCode())}
                    className="absolute right-1 top-1 inline-flex h-9 items-center gap-1 rounded bg-gray-100 px-3 text-xs font-semibold text-zinc-700"
                  >
                    <Shuffle size={14} />
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Amount
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={giftForm.value}
                  onChange={(event) =>
                    updateForm("value", Number(event.target.value))
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Recipient name
                </label>
                <input
                  value={giftForm.recipientName}
                  onChange={(event) =>
                    updateForm("recipientName", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Recipient email
                </label>
                <input
                  type="email"
                  value={giftForm.recipientEmail}
                  onChange={(event) =>
                    updateForm("recipientEmail", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Buyer name
                </label>
                <input
                  value={giftForm.buyerName}
                  onChange={(event) =>
                    updateForm("buyerName", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Buyer email
                </label>
                <input
                  type="email"
                  value={giftForm.buyerEmail}
                  onChange={(event) =>
                    updateForm("buyerEmail", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  State
                </label>
                <DropdownField
                  value={giftForm.state}
                  options={EDITABLE_STATUS_OPTIONS}
                  isOpen={openFormDropdown === "state"}
                  onToggle={() =>
                    setOpenFormDropdown((prev) =>
                      prev === "state" ? null : "state",
                    )
                  }
                  onSelect={(value) => {
                    updateForm("state", value as GiftState);
                    setOpenFormDropdown(null);
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Payment status
                </label>
                <DropdownField
                  value={giftForm.paymentStatus}
                  options={EDITABLE_PAYMENT_OPTIONS}
                  isOpen={openFormDropdown === "paymentStatus"}
                  onToggle={() =>
                    setOpenFormDropdown((prev) =>
                      prev === "paymentStatus" ? null : "paymentStatus",
                    )
                  }
                  onSelect={(value) => {
                    updateForm("paymentStatus", value as PaymentStatus);
                    setOpenFormDropdown(null);
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Dedication
                </label>
                <textarea
                  value={giftForm.dedication}
                  onChange={(event) =>
                    updateForm("dedication", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded border border-gray-200 px-3 py-2"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 px-6 py-4 sm:justify-between">
              <p className="min-h-5 text-sm text-red-600">{formMessage}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="h-10 rounded border border-gray-200 px-4 text-sm font-medium text-zinc-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded bg-[#76C043] px-4 text-sm font-semibold text-white hover:bg-lime-600"
                >
                  Create
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[820px] border-gray-200 bg-white p-0">
          <form onSubmit={submitEditGiftCard}>
            <DialogHeader className="border-b border-gray-100 px-6 py-5">
              <DialogTitle>Edit Gift Card</DialogTitle>
              <DialogDescription>
                Update gift card details and status from admin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Name
                </label>
                <input
                  required
                  value={giftForm.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Code
                </label>
                <input
                  required
                  value={giftForm.code}
                  onChange={(event) =>
                    updateForm("code", normalizeGiftCode(event.target.value))
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3 font-mono"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Amount
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={giftForm.value}
                  onChange={(event) =>
                    updateForm("value", Number(event.target.value))
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Recipient name
                </label>
                <input
                  value={giftForm.recipientName}
                  onChange={(event) =>
                    updateForm("recipientName", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Recipient email
                </label>
                <input
                  type="email"
                  value={giftForm.recipientEmail}
                  onChange={(event) =>
                    updateForm("recipientEmail", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Buyer name
                </label>
                <input
                  value={giftForm.buyerName}
                  onChange={(event) =>
                    updateForm("buyerName", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Buyer email
                </label>
                <input
                  type="email"
                  value={giftForm.buyerEmail}
                  onChange={(event) =>
                    updateForm("buyerEmail", event.target.value)
                  }
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  State
                </label>
                <DropdownField
                  value={giftForm.state}
                  options={EDITABLE_STATUS_OPTIONS}
                  isOpen={openFormDropdown === "state"}
                  onToggle={() =>
                    setOpenFormDropdown((prev) =>
                      prev === "state" ? null : "state",
                    )
                  }
                  onSelect={(value) => {
                    updateForm("state", value as GiftState);
                    setOpenFormDropdown(null);
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Payment status
                </label>
                <DropdownField
                  value={giftForm.paymentStatus}
                  options={EDITABLE_PAYMENT_OPTIONS}
                  isOpen={openFormDropdown === "paymentStatus"}
                  onToggle={() =>
                    setOpenFormDropdown((prev) =>
                      prev === "paymentStatus" ? null : "paymentStatus",
                    )
                  }
                  onSelect={(value) => {
                    updateForm("paymentStatus", value as PaymentStatus);
                    setOpenFormDropdown(null);
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Dedication
                </label>
                <textarea
                  value={giftForm.dedication}
                  onChange={(event) =>
                    updateForm("dedication", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded border border-gray-200 px-3 py-2"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 px-6 py-4 sm:justify-between">
              <p className="min-h-5 text-sm text-red-600">{formMessage}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-10 rounded border border-gray-200 px-4 text-sm font-medium text-zinc-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded bg-[#76C043] px-4 text-sm font-semibold text-white hover:bg-lime-600"
                >
                  Save changes
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
