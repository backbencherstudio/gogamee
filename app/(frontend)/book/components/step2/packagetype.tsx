"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useBooking } from "../../context/BookingContext";
import { packageTypeData } from "../../../../lib/appdata";
import { TranslatedText } from "../../../_components/TranslatedText";
import { SelectionCard } from "../shared/cards/SelectionCard";

// Types
interface PackageFormData {
  selectedPackage: string;
}

interface PackageOption {
  value: string;
  label: string;
  gradient: string;
  accent: string;
}

// Package card gradients
const PACKAGE_GRADIENTS: Record<string, { gradient: string; accent: string }> =
  {
    standard: {
      gradient: "from-blue-500",
      accent: "to-blue-600",
    },
    premium: {
      gradient: "from-amber-500",
      accent: "to-amber-600",
    },
  };

// Components

interface PackageCardProps {
  packageOption: PackageOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = React.memo(
  ({ packageOption, isSelected, onSelect }) => {
    const packageLabel = useMemo(() => {
      if (packageOption.value === "standard") {
        return { es: "Estándar", en: "Standard" };
      } else if (packageOption.value === "premium") {
        return { es: "Premium", en: "Premium" };
      }
      return { es: packageOption.label, en: packageOption.label };
    }, [packageOption.value, packageOption.label]);

    return (
      <SelectionCard
        value={packageOption.value}
        isSelected={isSelected}
        onSelect={onSelect}
        gradient={packageOption.gradient}
        accent={packageOption.accent}
        ariaLabel={`Select ${packageOption.label} package`}
      >
        <h3 className="text-white text-base xl:text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
          <TranslatedText
            text={packageLabel.es}
            english={packageLabel.en}
            as="span"
          />
        </h3>
      </SelectionCard>
    );
  },
);

PackageCard.displayName = "PackageCard";

const PackageType: React.FC = () => {
  // Context
  const { formData, updateFormData, nextStep } = useBooking();

  // React Hook Form
  const { control, handleSubmit, watch, setValue } = useForm<PackageFormData>({
    defaultValues: {
      selectedPackage: formData.selectedPackage || "",
    },
  });

  const selectedPackage = watch("selectedPackage");

  // Sync with context when context data changes (especially for hero data)
  useEffect(() => {
    if (
      formData.selectedPackage &&
      formData.selectedPackage !== selectedPackage
    ) {
      setValue("selectedPackage", formData.selectedPackage);
      console.log(
        "🎯 PackageType - synced with context:",
        formData.selectedPackage,
      );
    }
  }, [formData.selectedPackage, selectedPackage, setValue]);

  // Get package options with gradients
  const packageOptions = useMemo(() => {
    return packageTypeData.getAllPackages().map((pkg) => ({
      value: pkg.value,
      label: pkg.label,
      ...(PACKAGE_GRADIENTS[pkg.value] || {
        gradient: "from-gray-500",
        accent: "to-gray-600",
      }),
    }));
  }, []);

  // Event handlers
  const handlePackageSelect = useCallback(
    (value: string) => {
      setValue("selectedPackage", value);
      updateFormData({ selectedPackage: value });
    },
    [setValue, updateFormData],
  );

  const onSubmit = useCallback(
    (data: PackageFormData) => {
      updateFormData({ selectedPackage: data.selectedPackage });
      nextStep();
    },
    [updateFormData, nextStep],
  );

  const buttonClassName = useMemo(
    () => `
    w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
    ${
      selectedPackage
        ? "bg-[#76C043] hover:bg-lime-600 cursor-pointer"
        : "bg-gray-300 cursor-not-allowed"
    }
  `,
    [selectedPackage],
  );

  const buttonTextClassName = useMemo(
    () =>
      `text-base font-['Inter'] ${selectedPackage ? "text-white" : "text-gray-500"}`,
    [selectedPackage],
  );

  return (
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/20 mb-10 min-h-[500px] xl:min-h-0">
      {/* Header Section */}
      <header className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-8 xl:leading-10">
          <TranslatedText
            text="¿Cómo quieres que sea tu experiencia?"
            english="How do you want to experience it?"
          />
        </h1>
      </header>

      {/* Content Section */}
      <form
        id="package-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between xl:h-[calc(100%-80px)] h-auto gap-8 xl:gap-0"
      >
        {/* Package Cards Grid */}
        <div
          className="grid grid-cols-2 xl:grid-cols-2 gap-3 xl:gap-4 mb-6 xl:mb-8"
          role="group"
          aria-label="Package selection"
        >
          <Controller
            name="selectedPackage"
            control={control}
            render={({ field }) => (
              <>
                {packageOptions.map((pkg) => (
                  <PackageCard
                    key={pkg.value}
                    packageOption={pkg}
                    isSelected={field.value === pkg.value}
                    onSelect={(value) => {
                      field.onChange(value);
                      handlePackageSelect(value);
                    }}
                  />
                ))}
              </>
            )}
          />
        </div>

        {/* Next Button */}
        <button
          type="submit"
          form="package-form"
          disabled={!selectedPackage}
          className={buttonClassName}
          aria-label="Proceed to next step"
        >
          <span className={buttonTextClassName}>
            <TranslatedText text="Siguiente" english="Next" />
          </span>
        </button>
      </form>
    </div>
  );
};

export default PackageType;
