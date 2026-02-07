"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "../../../../../components/ui/toast";

interface Feature {
  category: string;
  category_es: string;
  standard: string;
  standard_es: string;
  premium: string;
  premium_es: string;
  sortOrder: number;
}

interface StartingPriceFeatures {
  type: "football" | "basketball" | "combined";
  features: Feature[];
}

export default function FeaturesManagement() {
  const { addToast } = useToast();
  const [selectedSport, setSelectedSport] = useState<
    "football" | "basketball" | "combined"
  >("football");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load features for selected sport
  useEffect(() => {
    loadFeatures();
  }, [selectedSport]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/starting-price/${selectedSport}`);
      const data = await response.json();

      if (data.success && data.data) {
        setFeatures(data.data.features || []);
      }
    } catch (error) {
      console.error("Error loading features:", error);
      addToast({
        type: "error",
        title: "Failed to load features",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeatures = async () => {
    try {
      const response = await fetch(
        `/api/starting-price/${selectedSport}/features`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ features }),
        },
      );

      const data = await response.json();

      if (data.success) {
        addToast({
          type: "success",
          title: "Features updated successfully!",
        });
        loadFeatures();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Failed to update features",
      });
    }
  };

  const handleAddFeature = () => {
    setIsAddingNew(true);
    setEditingFeature({
      category: "",
      category_es: "",
      standard: "",
      standard_es: "",
      premium: "",
      premium_es: "",
      sortOrder: features.length,
    });
  };

  const handleSaveNew = () => {
    if (editingFeature) {
      setFeatures([...features, editingFeature]);
      setIsAddingNew(false);
      setEditingFeature(null);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingFeature({ ...features[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingFeature) {
      const updated = [...features];
      updated[editingIndex] = editingFeature;
      setFeatures(updated);
      setEditingIndex(null);
      setEditingFeature(null);
    }
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      const updated = features.filter((_, i) => i !== index);
      setFeatures(updated);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...features];
      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];
      updated[index - 1].sortOrder = index - 1;
      updated[index].sortOrder = index;
      setFeatures(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < features.length - 1) {
      const updated = [...features];
      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];
      updated[index].sortOrder = index;
      updated[index + 1].sortOrder = index + 1;
      setFeatures(updated);
    }
  };

  const renderFeatureRow = (feature: Feature, index: number) => {
    const isEditing = editingIndex === index;

    if (isEditing && editingFeature) {
      return (
        <div key={index} className="border rounded-lg p-4 bg-blue-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category (EN)
              </label>
              <input
                type="text"
                value={editingFeature.category}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Category (ES)
              </label>
              <input
                type="text"
                value={editingFeature.category_es}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    category_es: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Standard (EN)
              </label>
              <textarea
                value={editingFeature.standard}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    standard: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Standard (ES)
              </label>
              <textarea
                value={editingFeature.standard_es}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    standard_es: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Premium (EN)
              </label>
              <textarea
                value={editingFeature.premium}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    premium: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Premium (ES)
              </label>
              <textarea
                value={editingFeature.premium_es}
                onChange={(e) =>
                  setEditingFeature({
                    ...editingFeature,
                    premium_es: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => {
                setEditingIndex(null);
                setEditingFeature(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{feature.category}</h3>
            <p className="text-sm text-gray-500">{feature.category_es}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => handleMoveDown(index)}
              disabled={index === features.length - 1}
              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => handleEdit(index)}
              className="p-1 hover:bg-blue-100 text-blue-600 rounded"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(index)}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Standard:</p>
            <p className="text-gray-600">{feature.standard}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Premium:</p>
            <p className="text-gray-600">{feature.premium}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Package Features Management</h2>
        <button
          onClick={handleSaveFeatures}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={18} /> Save All Changes
        </button>
      </div>

      {/* Sport Selector */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setSelectedSport("football")}
          className={`px-6 py-2 rounded ${
            selectedSport === "football"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ⚽ Football
        </button>
        <button
          onClick={() => setSelectedSport("basketball")}
          className={`px-6 py-2 rounded ${
            selectedSport === "basketball"
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🏀 Basketball
        </button>
        <button
          onClick={() => setSelectedSport("combined")}
          className={`px-6 py-2 rounded ${
            selectedSport === "combined"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🎯 Both
        </button>
      </div>

      {/* Features List */}
      {loading ? (
        <div className="text-center py-12">Loading features...</div>
      ) : (
        <div className="space-y-4">
          {features.map((feature, index) => renderFeatureRow(feature, index))}

          {/* Add New Feature */}
          {isAddingNew && editingFeature ? (
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-semibold mb-4">Add New Feature</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category (EN)
                  </label>
                  <input
                    type="text"
                    value={editingFeature.category}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., Match Ticket"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category (ES)
                  </label>
                  <input
                    type="text"
                    value={editingFeature.category_es}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        category_es: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., Entrada al Partido"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Standard (EN)
                  </label>
                  <textarea
                    value={editingFeature.standard}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        standard: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Standard tier description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Standard (ES)
                  </label>
                  <textarea
                    value={editingFeature.standard_es}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        standard_es: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Descripción estándar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Premium (EN)
                  </label>
                  <textarea
                    value={editingFeature.premium}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        premium: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Premium tier description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Premium (ES)
                  </label>
                  <textarea
                    value={editingFeature.premium_es}
                    onChange={(e) =>
                      setEditingFeature({
                        ...editingFeature,
                        premium_es: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Descripción premium"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveNew}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={16} /> Add Feature
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingFeature(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddFeature}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <Plus size={20} /> Add New Feature
            </button>
          )}
        </div>
      )}
    </div>
  );
}
