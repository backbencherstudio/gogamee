"use client";
import React, { useState } from "react";
import { Save, X } from "lucide-react";
import { checkDuplicatePackage } from "../../../../../services/packageService";
import { autoTranslateContent } from "../../../../../services/translationService";

interface PackageData {
  sport: "football" | "basketball";
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  included: string;
  included_es?: string;
  description: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

interface AddPackageProps {
  onSubmit: (packageData: any) => void;
  onCancel: () => void;
  initialData?: Partial<PackageData>;
  submitLabel?: string;
  showSport?: boolean;
  showPrices?: boolean;
  currentPackageId?: string;
}

export default function AddPackage({
  onSubmit,
  onCancel,
  initialData,
  submitLabel,
  showSport = true,
  showPrices = false,
  currentPackageId,
}: AddPackageProps) {
  const [formData, setFormData] = useState<Partial<PackageData>>(
    initialData || {
      sport: undefined,
      plan: undefined,
      duration: undefined,
      included: "",
      description: "",
      currency: "EUR",
    },
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof PackageData, string>>
  >({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PackageData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (duplicateError) {
      setDuplicateError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PackageData, string>> = {};

    if (!formData.sport) {
      newErrors.sport = "Please select a sport";
    }
    if (!formData.plan) {
      newErrors.plan = "Please select a plan";
    }
    if (!formData.duration) {
      newErrors.duration = "Please select duration";
    }
    if (!formData.included?.trim()) {
      newErrors.included = "Please specify what's included";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsTranslating(true);
    setDuplicateError(null);

    try {
      // 1. Auto-translate content before saving
      const [translatedIncluded, translatedDescription] = await Promise.all([
        autoTranslateContent(formData.included!),
        autoTranslateContent(formData.description!),
      ]);

      // 2. Duplicate check
      const duplicateCheck = await checkDuplicatePackage({
        sport: formData.sport!,
        included: formData.included!,
        plan: formData.plan!,
        duration: formData.duration!,
        excludeId: currentPackageId,
      });

      if (duplicateCheck.exists) {
        setDuplicateError(
          `A package already exists for ${formData.sport} - ${formData.plan} plan - ${formData.duration} night(s) - ${formData.included}. Please update or delete it first.`,
        );
        setIsTranslating(false);
        return;
      }

      const dataToSubmit = {
        sport: formData.sport,
        plan: formData.plan,
        duration: formData.duration,
        included: translatedIncluded.es || formData.included, // Always save ES version
        included_es: translatedIncluded.es,
        description: translatedDescription.es || formData.description, // Always save ES version
        description_es: translatedDescription.es,
        // Also save English versions if we want to be explicit, but model uses included/description as primary (likely ES based on previous code)
        // Wait, let's look at the model again.
        // In Package.model.ts: included is required, included_es is optional.
        // Usually 'included' is the primary (Spanish) and '_es' is redundant, or 'included' is English.
        // Given the previous code, 'included' was the English input.
        // So I should save English in 'included' and Spanish in 'included_es'.
        included_en: translatedIncluded.en,
        description_en: translatedDescription.en,
      };

      // Correction: Package.model.ts doesn't have _en fields. It has 'included' and 'included_es'.
      // If the user inputs English, 'included' should store English and 'included_es' should store Spanish.
      const finalPayload = {
        ...dataToSubmit,
        included: formData.included, // Keep original input in primary field
        included_es: translatedIncluded.es,
        description: formData.description, // Keep original input in primary field
        description_es: translatedDescription.es,
      };

      setIsTranslating(false);
      onSubmit(finalPayload);
    } catch (error: any) {
      console.error("Error during submission:", error);
      setDuplicateError(
        error.message || "An error occurred. Please try again.",
      );
      setIsTranslating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSport && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-['Poppins']">
            Sport *
          </label>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "football", label: "⚽ Football" },
              { value: "basketball", label: "🏀 Basketball" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="sport"
                  value={option.value}
                  checked={formData.sport === option.value}
                  onChange={(e) =>
                    handleInputChange(
                      "sport",
                      e.target.value as "football" | "basketball",
                    )
                  }
                  className="w-4 h-4 text-[#76C043] focus:ring-[#76C043]"
                />
                <span className="font-medium font-['Poppins']">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.sport && (
            <p className="mt-2 text-sm text-red-600 font-['Poppins']">
              {errors.sport}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 font-['Poppins']">
          Plan *
        </label>
        <div className="flex gap-3 flex-wrap">
          {[
            { value: "standard", label: "📦 Standard" },
            { value: "premium", label: "⭐ Premium" },
            { value: "combined", label: "🎯 Combined" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="plan"
                value={option.value}
                checked={formData.plan === option.value}
                onChange={(e) => handleInputChange("plan", e.target.value)}
                className="w-4 h-4 text-[#76C043] focus:ring-[#76C043]"
              />
              <span className="font-medium font-['Poppins']">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {errors.plan && (
          <p className="mt-2 text-sm text-red-600 font-['Poppins']">
            {errors.plan}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 font-['Poppins']">
          Duration (Nights) *
        </label>
        <div className="flex gap-3 flex-wrap">
          {([1, 2, 3, 4] as const).map((nights) => (
            <label
              key={nights}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="duration"
                value={nights}
                checked={formData.duration === nights}
                onChange={(e) =>
                  handleInputChange(
                    "duration",
                    Number(e.target.value) as 1 | 2 | 3 | 4,
                  )
                }
                className="w-4 h-4 text-[#76C043] focus:ring-[#76C043]"
              />
              <span className="font-medium font-['Poppins']">
                🌙 {nights} Night{nights > 1 ? "s" : ""}
              </span>
            </label>
          ))}
        </div>
        {errors.duration && (
          <p className="mt-2 text-sm text-red-600 font-['Poppins']">
            {errors.duration}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="included"
          className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']"
        >
          What's Included? (English) *
        </label>
        <div className="text-xs text-gray-500 mb-2 font-['Poppins']">
          e.g., "Match Ticket", "Hotel Accommodation", "VIP Access"
        </div>
        <input
          type="text"
          id="included"
          value={formData.included || ""}
          onChange={(e) => handleInputChange("included", e.target.value)}
          placeholder="What's included in this package..."
          className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
            errors.included ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.included && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">
            {errors.included}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']"
        >
          Package Description (English) *
        </label>
        <textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe the package details..."
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors resize-vertical ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">
            {errors.description}
          </p>
        )}
      </div>

      {duplicateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium font-['Poppins'] text-sm">
            {duplicateError}
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isTranslating}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isTranslating}
          className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isTranslating
            ? "Translating & Saving..."
            : submitLabel || "Create Package"}
        </button>
      </div>
    </form>
  );
}
