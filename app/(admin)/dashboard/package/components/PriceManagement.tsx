"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, Save, RefreshCw, Edit, X } from "lucide-react";
import {
  getAllPackages,
  editPackage,
  addPackage,
} from "../../../../../services/packageService";
import { useToast } from "../../../../../components/ui/toast";

interface PriceData {
  id: string;
  sport: "football" | "basketball";
  standardPrice: number;
  premiumPrice: number;
  currency: string;
}

interface PriceManagementProps {
  onPriceUpdate?: (
    sport: "football" | "basketball",
    prices: { standardPrice: number; premiumPrice: number; currency: string },
  ) => void;
}

export default function PriceManagement({
  onPriceUpdate,
}: PriceManagementProps) {
  const { addToast } = useToast();
  const [priceData, setPriceData] = useState<{
    football: PriceData | null;
    basketball: PriceData | null;
  }>({
    football: null,
    basketball: null,
  });
  const [editingSport, setEditingSport] = useState<
    "football" | "basketball" | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPriceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllPackages();
      if (response && response.success && Array.isArray(response.data)) {
        const packages = response.data;
        // Price management should use StartingPrice model, not regular packages
        // This logic is kept for backward compatibility but should be refactored
        const footballPricePackage = packages.find(
          (pkg) =>
            pkg.sport === "football" && pkg.included === "Starting Price",
        );
        const basketballPricePackage = packages.find(
          (pkg) =>
            pkg.sport === "basketball" && pkg.included === "Starting Price",
        );

        // If Starting Price packages don't exist, create them with default values
        if (!footballPricePackage) {
          await createStartingPricePackage("football");
        }
        if (!basketballPricePackage) {
          await createStartingPricePackage("basketball");
        }

        // Reload packages to get the newly created ones
        const updatedResponse = await getAllPackages();
        if (
          updatedResponse &&
          updatedResponse.success &&
          Array.isArray(updatedResponse.data)
        ) {
          const updatedPackages = updatedResponse.data;
          const updatedFootballPackage = updatedPackages.find(
            (pkg) =>
              pkg.sport === "football" && pkg.included === "Starting Price",
          );
          const updatedBasketballPackage = updatedPackages.find(
            (pkg) =>
              pkg.sport === "basketball" && pkg.included === "Starting Price",
          );

          setPriceData({
            football: updatedFootballPackage
              ? {
                  id: updatedFootballPackage.id,
                  sport: "football",
                  standardPrice: updatedFootballPackage.standardPrice || 379,
                  premiumPrice: updatedFootballPackage.premiumPrice || 1499,
                  currency: updatedFootballPackage.currency || "EUR",
                }
              : null,
            basketball: updatedBasketballPackage
              ? {
                  id: updatedBasketballPackage.id,
                  sport: "basketball",
                  standardPrice: updatedBasketballPackage.standardPrice || 359,
                  premiumPrice: updatedBasketballPackage.premiumPrice || 1479,
                  currency: updatedBasketballPackage.currency || "EUR",
                }
              : null,
          });
        }
      } else {
        setError("Failed to load price data");
      }
    } catch (err) {
      console.error("Error loading price data:", err);
      setError("Failed to load price data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load price data from packages
  useEffect(() => {
    loadPriceData();
  }, [loadPriceData]);

  // Create Starting Price package for a sport
  const createStartingPricePackage = async (
    sport: "football" | "basketball",
  ) => {
    try {
      const defaultPrices = {
        football: { standardPrice: 379, premiumPrice: 1499 },
        basketball: { standardPrice: 359, premiumPrice: 1479 },
      };

      const packageData = {
        sport: sport,
        included: "Starting Price",
        plan: "combined" as const,
        duration: 1 as const,
        description: `Base pricing for ${sport} packages - includes standard and premium options with accommodation and amenities`,
        standardPrice: defaultPrices[sport].standardPrice,
        premiumPrice: defaultPrices[sport].premiumPrice,
        currency: "EUR",
      };

      const response = await addPackage(packageData);
      if (response.success) {
        console.log(`Created Starting Price package for ${sport}`);
      } else {
        console.error(
          `Failed to create Starting Price package for ${sport}:`,
          response.message,
        );
      }
    } catch (err) {
      console.error(`Error creating Starting Price package for ${sport}:`, err);
    }
  };

  const handleEditPrices = (sport: "football" | "basketball") => {
    setEditingSport(sport);
  };

  const handleSavePrices = async (
    sport: "football" | "basketball",
    newPrices: {
      standardPrice: number;
      premiumPrice: number;
      currency: string;
    },
  ) => {
    const currentData = priceData[sport];
    if (!currentData) {
      addToast({
        type: "error",
        title: "Error",
        description: `No price package found for ${sport}`,
        duration: 4000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await editPackage(currentData.id, {
        standardPrice: newPrices.standardPrice,
        premiumPrice: newPrices.premiumPrice,
        currency: newPrices.currency,
      });

      if (response.success) {
        // Update local state
        setPriceData((prev) => ({
          ...prev,
          [sport]: {
            ...prev[sport]!,
            standardPrice: newPrices.standardPrice,
            premiumPrice: newPrices.premiumPrice,
            currency: newPrices.currency,
          },
        }));

        setEditingSport(null);

        addToast({
          type: "success",
          title: "Success!",
          description: `${sport.charAt(0).toUpperCase() + sport.slice(1)} prices updated successfully!`,
          duration: 4000,
        });

        if (onPriceUpdate) {
          onPriceUpdate(sport, newPrices);
        }

        // Reload price data to ensure consistency
        loadPriceData();
      } else {
        addToast({
          type: "error",
          title: "Error",
          description: response.message || "Failed to update prices",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Error updating prices:", err);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to update prices. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSport(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600 text-lg font-medium">
            Loading price data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-6 h-6 text-[#76C043]" />
        <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
          Package Price Management
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800 font-medium">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Football Price Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚽</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">
                  Football
                </h3>
                <span className="text-sm text-green-600 font-medium">
                  Package Prices
                </span>
              </div>
            </div>

            {editingSport !== "football" && (
              <button
                onClick={() => handleEditPrices("football")}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                title="Edit Football Prices"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>

          {editingSport === "football" ? (
            <PriceEditForm
              sport="football"
              currentData={priceData.football}
              onSave={(prices) => handleSavePrices("football", prices)}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">
                    Standard Package
                  </span>
                  <span className="text-lg font-bold text-green-600 font-['Poppins']">
                    {priceData.football?.standardPrice || 379}
                    {priceData.football?.currency || "€"}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">
                    Premium Package
                  </span>
                  <span className="text-lg font-bold text-blue-600 font-['Poppins']">
                    {priceData.football?.premiumPrice || 1499}
                    {priceData.football?.currency || "€"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Basketball Price Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏀</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">
                  Basketball
                </h3>
                <span className="text-sm text-blue-600 font-medium">
                  Package Prices
                </span>
              </div>
            </div>

            {editingSport !== "basketball" && (
              <button
                onClick={() => handleEditPrices("basketball")}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                title="Edit Basketball Prices"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>

          {editingSport === "basketball" ? (
            <PriceEditForm
              sport="basketball"
              currentData={priceData.basketball}
              onSave={(prices) => handleSavePrices("basketball", prices)}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">
                    Standard Package
                  </span>
                  <span className="text-lg font-bold text-blue-600 font-['Poppins']">
                    {priceData.basketball?.standardPrice || 359}
                    {priceData.basketball?.currency || "€"}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">
                    Premium Package
                  </span>
                  <span className="text-lg font-bold text-blue-600 font-['Poppins']">
                    {priceData.basketball?.premiumPrice || 1479}
                    {priceData.basketball?.currency || "€"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 font-['Poppins']">
          <strong>Note:</strong> These prices control the base pricing for all
          packages in the application. Changes will affect the booking system
          immediately.
        </p>
      </div>
    </div>
  );
}

// Price Edit Form Component
interface PriceEditFormProps {
  sport: "football" | "basketball";
  currentData: PriceData | null;
  onSave: (prices: {
    standardPrice: number;
    premiumPrice: number;
    currency: string;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function PriceEditForm({
  sport,
  currentData,
  onSave,
  onCancel,
  isSaving,
}: PriceEditFormProps) {
  const defaultPrices = {
    football: { standardPrice: 379, premiumPrice: 1499 },
    basketball: { standardPrice: 359, premiumPrice: 1479 },
  };

  const [formData, setFormData] = useState({
    standardPrice:
      currentData?.standardPrice || defaultPrices[sport].standardPrice,
    premiumPrice:
      currentData?.premiumPrice || defaultPrices[sport].premiumPrice,
    currency: currentData?.currency || "EUR",
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

    if (formData.standardPrice <= 0) {
      newErrors.standardPrice = "Standard price must be greater than 0";
    }
    if (formData.premiumPrice <= 0) {
      newErrors.premiumPrice = "Premium price must be greater than 0";
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
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Currency *
        </label>
        <select
          value={formData.currency}
          onChange={(e) => handleInputChange("currency", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Standard Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Standard Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
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
            className={`w-full px-3 py-2 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Premium Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.premiumPrice}
            onChange={(e) =>
              handleInputChange("premiumPrice", parseFloat(e.target.value) || 0)
            }
            placeholder="Enter premium package price"
            className={`w-full px-3 py-2 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
            isSaving
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : sport === "football"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Prices
            </>
          )}
        </button>
      </div>
    </form>
  );
}
