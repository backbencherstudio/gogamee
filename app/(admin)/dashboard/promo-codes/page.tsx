"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Shuffle,
  Trash2,
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

type DiscountType = "fixed" | "percentage";
type UsageLimit = "single" | "multiple" | "unlimited";

interface CodeItem {
  _id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  usageLimit: UsageLimit;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

interface PromoForm {
  name: string;
  code: string;
  discountType: DiscountType;
  value: number;
  usageLimit: UsageLimit;
  maxUses: number;
  expiresAt: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

const ITEMS_PER_PAGE = 10;
const DISCOUNT_TYPE_OPTIONS: DropdownOption[] = [
  { label: "Fixed amount", value: "fixed" },
  { label: "Percentage", value: "percentage" },
];
const LIMIT_OPTIONS: DropdownOption[] = [
  { label: "Single use", value: "single" },
  { label: "Multiple uses", value: "multiple" },
  { label: "Unlimited uses", value: "unlimited" },
];
const STATUS_OPTIONS: DropdownOption[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const randomCode = () =>
  `GO${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const normalizePromoCode = (value: string) =>
  value.replace(/-/g, "").replace(/\s+/g, "").toUpperCase();

const initialForm = (): PromoForm => ({
  name: "",
  code: randomCode(),
  discountType: "fixed",
  value: 10,
  usageLimit: "single",
  maxUses: 1,
  expiresAt: "",
});

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : "-");

function DropdownField({
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value)?.label || value;
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
              key={option.value}
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

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [form, setForm] = useState<PromoForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [openFormDropdown, setOpenFormDropdown] = useState<null | "discount" | "limit">(null);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<
    null | "status" | "discountType"
  >(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<"all" | DiscountType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const pageStart = totalItems ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const loadCodes = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search: query,
        status: statusFilter,
        discountType: discountTypeFilter,
      });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`/api/admin/promo-codes?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setCodes(result.data || []);
        setTotalItems(result.meta_data?.total || 0);
        setTotalPages(result.meta_data?.total_pages || 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, query, statusFilter, discountTypeFilter, dateFrom, dateTo]);

  const updateForm = <K extends keyof PromoForm>(key: K, value: PromoForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setOpenFormDropdown(null);
    setForm(initialForm());
    setMessage("");
  };

  const createCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: normalizePromoCode(form.code),
        isActive: true,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      setMessage(result.message || "Could not create promo code.");
      return;
    }
    closeModal();
    setCurrentPage(1);
    await loadCodes(1);
  };

  const toggleCode = async (item: CodeItem) => {
    await fetch(`/api/admin/promo-codes/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    await loadCodes();
  };

  const deleteCode = async (id: string) => {
    await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
    await loadCodes();
  };

  return (
    <div className="px-4 pb-8 md:pl-10 md:pr-8">
      <div className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-3xl font-semibold text-zinc-950 md:text-4xl">Promo Codes</h1>
            <p className="mt-2 font-['Poppins'] text-gray-600">
              Create, search, and manage promotional discount codes.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded bg-[#76C043] px-5 text-sm font-semibold text-white hover:bg-lime-600"
          >
            <Plus size={16} />
            Create Promo Code
          </button>
        </div>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => {
                  setCurrentPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Search campaign or code..."
                className="h-11 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#76C043]"
              />
            </div>
            <DropdownField
              value={statusFilter}
              options={STATUS_OPTIONS}
              isOpen={openFilterDropdown === "status"}
              onToggle={() => setOpenFilterDropdown((prev) => (prev === "status" ? null : "status"))}
              onSelect={(value) => {
                setCurrentPage(1);
                setStatusFilter(value as "all" | "active" | "inactive");
                setOpenFilterDropdown(null);
              }}
            />
            <DropdownField
              value={discountTypeFilter}
              options={[{ label: "All discount types", value: "all" }, ...DISCOUNT_TYPE_OPTIONS]}
              isOpen={openFilterDropdown === "discountType"}
              onToggle={() =>
                setOpenFilterDropdown((prev) => (prev === "discountType" ? null : "discountType"))
              }
              onSelect={(value) => {
                setCurrentPage(1);
                setDiscountTypeFilter(value as "all" | DiscountType);
                setOpenFilterDropdown(null);
              }}
            />
            <div className="relative">
              <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

        <section className="mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-0">
            <h2 className="m-6 text-lg font-semibold text-gray-900">Promotional Codes</h2>
            <button
              onClick={() => loadCodes()}
              className="mr-6 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="p-6 pt-0">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Campaign</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Code</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Discount</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Limit</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Usage</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Expiry</TableHead>
                  <TableHead className="px-4 py-3 text-left font-medium text-gray-600">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right font-medium text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse border-b border-gray-100">
                        {Array.from({ length: 8 }).map((__, col) => (
                          <TableCell key={col} className="px-4 py-3">
                            <div className="h-4 w-24 rounded bg-gray-200" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : codes.map((item) => (
                      <TableRow key={item._id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                        <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <span className="font-mono font-medium text-gray-900">{item.code}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {item.discountType === "percentage" ? `${item.value}%` : `${item.value} EUR`}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-700">
                          {item.usageLimit === "multiple" && item.maxUses
                            ? `max ${item.maxUses}`
                            : item.usageLimit === "single"
                              ? "single use"
                              : "unlimited"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">{item.usedCount}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500">{formatDate(item.expiresAt)}</TableCell>
                        <TableCell className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
                                title="Actions"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(item.code)}>
                                <Copy size={14} />
                                Copy code
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleCode(item)}>
                                {item.isActive ? (
                                  <>
                                    <PowerOff size={14} />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Power size={14} />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteCode(item._id)}
                                className="text-red-600 focus:text-red-700"
                              >
                                <Trash2 size={14} />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            {!isLoading && codes.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-500">No promotional codes found.</div>
            )}
          </div>

          {!isLoading && totalItems > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Showing {pageStart} to {pageEnd} of {totalItems} promo codes
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[780px] border-gray-200 bg-white p-0">
          <form onSubmit={createCode}>
            <DialogHeader className="border-b border-gray-100 px-6 py-5">
              <DialogTitle>Create Promo Code</DialogTitle>
              <DialogDescription>
                Configure campaign name, code, discount, and usage limits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">Campaign name</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Code</label>
                <div className="relative">
                  <input
                    required
                    value={form.code}
                    onChange={(event) => updateForm("code", normalizePromoCode(event.target.value))}
                    className="h-11 w-full rounded border border-gray-200 px-3 pr-28 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => updateForm("code", randomCode())}
                    className="absolute right-1 top-1 inline-flex h-9 items-center gap-1 rounded bg-gray-100 px-3 text-xs font-semibold text-zinc-700"
                  >
                    <Shuffle size={14} />
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Expiry date</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) => updateForm("expiresAt", event.target.value)}
                  className="h-11 w-full rounded border border-gray-200 px-3"
                />
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">Discount</label>
                <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-2">
                  <DropdownField
                    value={form.discountType}
                    options={DISCOUNT_TYPE_OPTIONS}
                    isOpen={openFormDropdown === "discount"}
                    onToggle={() => setOpenFormDropdown((prev) => (prev === "discount" ? null : "discount"))}
                    onSelect={(value) => {
                      updateForm("discountType", value as DiscountType);
                      setOpenFormDropdown(null);
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(event) => updateForm("value", Number(event.target.value))}
                    className="h-11 w-full min-w-0 rounded border border-gray-200 px-3"
                  />
                </div>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-zinc-700">Limit</label>
                <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-2">
                  <DropdownField
                    value={form.usageLimit}
                    options={LIMIT_OPTIONS}
                    isOpen={openFormDropdown === "limit"}
                    onToggle={() => setOpenFormDropdown((prev) => (prev === "limit" ? null : "limit"))}
                    onSelect={(value) => {
                      updateForm("usageLimit", value as UsageLimit);
                      if (value === "single") updateForm("maxUses", 1);
                      setOpenFormDropdown(null);
                    }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(event) => updateForm("maxUses", Number(event.target.value))}
                    disabled={form.usageLimit !== "multiple"}
                    className="h-11 w-full min-w-0 rounded border border-gray-200 px-3 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-100 px-6 py-4 sm:justify-between">
              <p className="min-h-5 text-sm text-red-600">{message}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
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
    </div>
  );
}
