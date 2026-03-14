"use client";
import React from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface Feature {
  category: string;
  standard: string;
  premium: string;
  sortOrder: number;
}

interface ComparisonFeatureManagerProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
}

export default function ComparisonFeatureManager({
  features,
  onChange,
}: ComparisonFeatureManagerProps) {
  const addFeature = () => {
    const newFeature: Feature = {
      category: "",
      standard: "",
      premium: "",
      sortOrder: features.length,
    };
    onChange([...features, newFeature]);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    // Update sort orders
    const reordered = newFeatures.map((f, i) => ({ ...f, sortOrder: i }));
    onChange(reordered);
  };

  const updateFeature = (index: number, field: keyof Feature, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange(newFeatures);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 font-['Poppins']">
          Comparison Rows (Features)
        </h4>
        <button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#76C043]/10 text-[#76C043] hover:bg-[#76C043]/20 rounded-md text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
          <p className="text-sm text-gray-400 font-['Poppins']">
            No comparison rows added yet. Click "Add Row" to start.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group"
            >
              <div className="flex flex-col md:flex-row items-end gap-3">
                {/* Feature Name / Category */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 font-['Poppins']">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    value={feature.category}
                    onChange={(e) =>
                      updateFeature(index, "category", e.target.value)
                    }
                    placeholder="e.g. Hotel"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#76C043] outline-none transition-colors"
                  />
                </div>

                {/* Standard Value */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-[#76C043] uppercase mb-1 font-['Poppins']">
                    Standard Pack Value
                  </label>
                  <input
                    type="text"
                    value={feature.standard}
                    onChange={(e) =>
                      updateFeature(index, "standard", e.target.value)
                    }
                    placeholder="e.g. Hotel 3*"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#76C043] outline-none transition-colors"
                  />
                </div>

                {/* Premium Value */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-bold text-blue-500 uppercase mb-1 font-['Poppins']">
                    Premium Pack Value
                  </label>
                  <input
                    type="text"
                    value={feature.premium}
                    onChange={(e) =>
                      updateFeature(index, "premium", e.target.value)
                    }
                    placeholder="e.g. Hotel 5*"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:border-[#76C043] outline-none transition-colors"
                  />
                </div>

                {/* Row Actions */}
                <div className="flex items-center pt-4 md:pt-0 mb-1">
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
