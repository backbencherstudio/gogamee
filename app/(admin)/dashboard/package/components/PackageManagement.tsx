"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Package as PackageIcon,
  Trash2,
  X,
  Edit,
  DollarSign,
} from "lucide-react";
import AddPackage from "./addpackage";
import FixedPriceCard from "./FixedPriceCard";
import {
  getAllPackages,
  addPackage,
  editPackage,
  deletePackage,
  type PackageItem,
} from "../../../../../services/packageService";
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal";
import { Pagination } from "../../../../../components/ui/Pagination";
import { TranslatedText } from "../../../../(frontend)/_components/TranslatedText";

interface PackageManagementProps {
  onPackageAdd?: (packageData: PackageItem) => void;
  onPackageDelete?: (id: string) => void;
}

export default function PackageManagement({
  onPackageAdd,
  onPackageDelete,
}: PackageManagementProps) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | "all">(
    "all",
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Refresh packages from API
  const refreshPackages = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all packages without sport filter
      const response = await getAllPackages(undefined, page, limit);

      if (response && response.success && Array.isArray(response.data)) {
        setPackages(response.data);
        if (response.meta_data) {
          setTotalPages(response.meta_data.total_pages);
          setTotalItems(response.meta_data.total);
          setCurrentPage(response.meta_data.page);
        }
      } else {
        // Fallback for empty or error
        setPackages([]);
        if (!response.success) {
          setError(response.message || "Failed to fetch packages");
        }
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError("Failed to load packages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load package data from API
  useEffect(() => {
    refreshPackages(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Delete package function
  const handleDeletePackage = async (id: string) => {
    try {
      const response = await deletePackage(id);
      if (response.success) {
        await refreshPackages(currentPage);
        if (onPackageDelete) {
          onPackageDelete(id);
        }
      } else {
        setError(response.message || "Failed to delete package");
      }
    } catch (err) {
      console.error("Error deleting package:", err);
      setError("Failed to delete package.");
    }
    setDeleteConfirm(null);
  };

  // Add new package function
  // We accept 'any' here effectively to match the form data, then cast/validate
  const handleAddPackage = async (newPackage: any) => {
    try {
      // Logic from previous file:
      const response = await addPackage(newPackage);

      if (response.success) {
        await refreshPackages(currentPage);
        setShowAddForm(false);
        if (response.data && onPackageAdd) {
          onPackageAdd(response.data);
        }
      } else {
        setError(response.message || "Failed to add package");
      }
    } catch (err) {
      console.error("Error adding package:", err);
      setError("Failed to add package.");
    }
  };

  // Update existing package
  const handleUpdatePackage = async (updated: any) => {
    if (!editingPackageId) return;
    try {
      const response = await editPackage(editingPackageId, updated);

      if (response.success) {
        await refreshPackages(currentPage);
        setEditingPackageId(null);
      } else {
        setError(response.message || "Failed to update package");
      }
    } catch (err) {
      console.error("Error updating package:", err);
      setError("Failed to update package.");
    }
  };

  // Update package prices
  const handleUpdatePrices = async (priceData: {
    standardPrice: number;
    premiumPrice: number;
    currency: string;
  }) => {
    if (!editingPriceId) return;
    try {
      const response = await editPackage(editingPriceId, {
        standardPrice: priceData.standardPrice,
        premiumPrice: priceData.premiumPrice,
        currency: priceData.currency,
      });

      if (response.success) {
        await refreshPackages(currentPage);
        setEditingPriceId(null);
      } else {
        setError(response.message || "Failed to update prices");
      }
    } catch (err) {
      console.error("Error updating prices:", err);
      setError("Failed to update prices.");
    }
  };

  // Handle price updates from FixedPriceCard
  const handlePriceUpdate = async (
    sport: "football" | "basketball",
    prices: { standardPrice: number; premiumPrice: number; currency: string },
  ) => {
    try {
      // Refresh to ensure consistency
      await refreshPackages(currentPage);
    } catch (err) {
      console.error("Error refreshing packages after price update:", err);
    }
  };

  return (
    <div className="py-4 pl-10 min-h-screen mb-4 pr-8 ">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Package Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">
              Manage travel packages for football and basketball events
            </p>
          </div>

          {/* Add Package Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Package
          </button>
        </div>

        {/* Fixed Price Card - Always Visible */}
        <FixedPriceCard
          onPriceUpdate={handlePriceUpdate}
          onDurationChange={(duration) => setSelectedDuration(duration)}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">{error}</div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                    <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="h-12 w-full bg-gray-100 animate-pulse rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="h-12 w-full bg-gray-100 animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Packages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {packages
                .filter((pkg) => {
                  if (
                    selectedDuration !== "all" &&
                    pkg.duration !== selectedDuration
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-[#76C043]/30 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                    onClick={() => setEditingPackageId(pkg.id)}
                  >
                    {/* Package Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 font-['Poppins'] text-lg capitalize">
                            <TranslatedText
                              text={`${pkg.sport} - ${pkg.plan} Plan`}
                            />
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            <TranslatedText
                              text={`${pkg.duration} Night${pkg.duration > 1 ? "s" : ""} Package`}
                            />
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPackageId(pkg.id);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="Edit Package"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(pkg.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            pkg.sport === "football"
                              ? "bg-green-100 text-green-700"
                              : pkg.sport === "basketball"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {pkg.sport === "football"
                            ? "⚽ Football"
                            : pkg.sport === "basketball"
                              ? "🏀 Basketball"
                              : "🎯 Combined"}
                        </span>
                        {pkg.plan && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              pkg.plan === "standard"
                                ? "bg-purple-100 text-purple-700"
                                : pkg.plan === "premium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            {pkg.plan === "standard"
                              ? "📦 Standard"
                              : pkg.plan === "premium"
                                ? "⭐ Premium"
                                : "🎯 Combined"}
                          </span>
                        )}
                        {pkg.duration && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
                            🌙 {pkg.duration} Night
                            {pkg.duration > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Package Content */}
                    <div className="p-6 space-y-4">
                      {/* What's Included */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 font-['Poppins']">
                          What's Included:
                        </h4>
                        <p className="text-gray-600 text-sm font-['Poppins'] bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <TranslatedText
                            text={pkg.included || "Not specified"}
                          />
                        </p>
                      </div>

                      {/* Package Description */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2 font-['Poppins']">
                          Description:
                        </h4>
                        <p className="text-gray-600 text-sm font-['Poppins'] bg-gray-50 p-3 rounded-lg">
                          <TranslatedText
                            text={pkg.description || "No description available"}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {packages.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 font-['Poppins']">
                  No packages found
                </h3>
                <p className="text-gray-400 font-['Poppins']">
                  Try adjusting your filter or add a new package
                </p>
              </div>
            )}

            {/* Pagination Control */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </div>
          </>
        )}
      </div>

      {/* Add Package Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                Add New Package
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <AddPackage
                onSubmit={handleAddPackage}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackageId && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingPackageId(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                Edit Package
              </h2>
              <button
                onClick={() => setEditingPackageId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const pkg = packages.find((p) => p.id === editingPackageId);
                if (!pkg) return null;
                const initial = {
                  ...pkg,
                  sport: (pkg.plan === "combined" ? "combined" : pkg.sport) as
                    | "football"
                    | "basketball"
                    | "combined",
                  plan: (pkg.plan === "combined" ? "standard" : pkg.plan) as
                    | "standard"
                    | "premium",
                };
                return (
                  <AddPackage
                    initialData={initial}
                    submitLabel="Save Changes"
                    showPrices={false}
                    currentPackageId={pkg.id}
                    onSubmit={handleUpdatePackage}
                    onCancel={() => setEditingPackageId(null)}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Price Edit Modal */}
      {editingPriceId && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingPriceId(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                Update Package Prices
              </h2>
              <button
                onClick={() => setEditingPriceId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const pkg = packages.find((p) => p.id === editingPriceId);
                if (!pkg) return null;

                return (
                  <PriceEditForm
                    packageData={pkg}
                    onSubmit={handleUpdatePrices}
                    onCancel={() => setEditingPriceId(null)}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeletePackage(deleteConfirm)}
        title="Delete Package"
        message="Are you sure you want to delete this package?"
      />
    </div>
  );
}

// Price Edit Form Component
interface PriceEditFormProps {
  packageData: PackageItem;
  onSubmit: (priceData: {
    standardPrice: number;
    premiumPrice: number;
    currency: string;
  }) => void;
  onCancel: () => void;
}

function PriceEditForm({
  packageData,
  onSubmit,
  onCancel,
}: PriceEditFormProps) {
  const [formData, setFormData] = useState({
    standardPrice: packageData.standardPrice || 0,
    premiumPrice: packageData.premiumPrice || 0,
    currency: packageData.currency || "EUR",
  });

  const [errors, setErrors] = useState<{
    standardPrice?: string;
    premiumPrice?: string;
  }>({});

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { standardPrice?: string; premiumPrice?: string } = {};

    if (formData.standardPrice < 0) {
      newErrors.standardPrice = "Standard price must be positive";
    }
    if (formData.premiumPrice < 0) {
      newErrors.premiumPrice = "Premium price must be positive";
    }
    if (formData.premiumPrice <= formData.standardPrice) {
      newErrors.premiumPrice =
        "Premium price must be higher than standard price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 font-['Poppins'] mb-2">
          {packageData.included}
        </h3>
        <span
          className={`text-sm px-2 py-1 rounded-full font-medium ${
            packageData.sport === "football"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {packageData.sport === "football" ? "Football" : "Basketball"}
        </span>
      </div>

      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Currency *
        </label>
        <select
          value={formData.currency}
          onChange={(e) => handleInputChange("currency", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Standard Price */}
      <div>
        <label
          htmlFor="standardPrice"
          className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']"
        >
          Standard Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
            id="standardPrice"
            min="0"
            step="0.01"
            value={formData.standardPrice}
            onChange={(e) =>
              handleInputChange(
                "standardPrice",
                parseFloat(e.target.value) || 0,
              )
            }
            placeholder="Enter standard package price"
            className={`w-full px-4 py-3 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
              errors.standardPrice ? "border-red-500" : "border-gray-300"
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {formData.currency === "EUR"
              ? "€"
              : formData.currency === "USD"
                ? "$"
                : "£"}
          </span>
        </div>
        {errors.standardPrice && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">
            {errors.standardPrice}
          </p>
        )}
      </div>

      {/* Premium Price */}
      <div>
        <label
          htmlFor="premiumPrice"
          className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']"
        >
          Premium Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
            id="premiumPrice"
            min="0"
            step="0.01"
            value={formData.premiumPrice}
            onChange={(e) =>
              handleInputChange("premiumPrice", parseFloat(e.target.value) || 0)
            }
            placeholder="Enter premium package price"
            className={`w-full px-4 py-3 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
              errors.premiumPrice ? "border-red-500" : "border-gray-300"
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {formData.currency === "EUR"
              ? "€"
              : formData.currency === "USD"
                ? "$"
                : "£"}
          </span>
        </div>
        {errors.premiumPrice && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">
            {errors.premiumPrice}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <DollarSign className="w-4 h-4" />
          Update Prices
        </button>
      </div>
    </form>
  );
}
