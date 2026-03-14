"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ListChecks, Save, X, RefreshCw } from "lucide-react";
import {
  getComparisonFeatures,
  updateComparisonFeatures,
  type Feature
} from "../../../../../services/packageService";
import ComparisonFeatureManager from "./ComparisonFeatureManager";
import { useToast } from "../../../../../components/ui/toast";

export default function ComparisonFeatureCard() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSport, setSavingSport] = useState<string | null>(null);

  const [featuresData, setFeaturesData] = useState<{
    football: Feature[];
    basketball: Feature[];
  }>({
    football: [],
    basketball: [],
  });



  const [initialFeaturesData, setInitialFeaturesData] = useState<{
    football: Feature[];
    basketball: Feature[];
  }>({
    football: [],
    basketball: [],
  });

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fbRes, bbRes] = await Promise.all([
        getComparisonFeatures("football"),
        getComparisonFeatures("basketball"),
      ]);

      const data = {
        football: Array.isArray(fbRes.data?.features) ? fbRes.data.features : [],
        basketball: Array.isArray(bbRes.data?.features) ? bbRes.data.features : [],
      };
      setFeaturesData(data);
      setInitialFeaturesData(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      console.error("Error loading features:", err);
      setError("Failed to load comparison features.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleSave = async (sport: "football" | "basketball") => {
    try {
      setSavingSport(sport);
      setError(null);
      const response = await updateComparisonFeatures(sport, featuresData[sport]);
      if (response.success) {
        setInitialFeaturesData(prev => ({
          ...prev,
          [sport]: JSON.parse(JSON.stringify(featuresData[sport]))
        }));
        
        addToast({
          type: "success",
          title: "Saved!",
          description: `${sport.charAt(0).toUpperCase() + sport.slice(1)} comparison features updated successfully.`,
          duration: 3000,
        });
      } else {
        setError(response.message || `Failed to save ${sport} features`);
        addToast({
          type: "error",
          title: "Error",
          description: response.message || `Failed to save ${sport} features`,
          duration: 4000,
        });
      }
    } catch (err) {
      console.error(`Error saving ${sport} features:`, err);
      setError(`Failed to save ${sport} features.`);
      addToast({
        type: "error",
        title: "Error",
        description: `An unexpected error occurred while saving ${sport} features.`,
        duration: 4000,
      });
    } finally {
      setSavingSport(null);
    }
  };

  const handleFeaturesChange = (sport: keyof typeof featuresData, features: Feature[]) => {
    setFeaturesData(prev => ({
      ...prev,
      [sport]: features
    }));
  };

  const isModified = (sport: "football" | "basketball") => {
    return JSON.stringify(featuresData[sport]) !== JSON.stringify(initialFeaturesData[sport]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-8">
          <div className="h-64 bg-gray-50 rounded-lg" />
          <div className="h-64 bg-gray-50 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-[#76C043]" />
          <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
            Comparison Table Rows
          </h2>
        </div>
        <button 
          onClick={loadFeatures}
          className="p-2 text-gray-400 hover:text-[#76C043] transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="text-red-800 font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-12">
        {/* Football Features */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl shadow-sm">
                ⚽
              </div>
              <h3 className="text-lg font-semibold text-gray-800 font-['Poppins']">Football Features</h3>
            </div>
            {isModified("football") && (
              <button
                onClick={() => handleSave("football")}
                disabled={savingSport === "football"}
                className="flex items-center gap-2 px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
              >
                {savingSport === "football" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Football
              </button>
            )}
          </div>
          <ComparisonFeatureManager
            features={featuresData.football}
            onChange={(features) => handleFeaturesChange("football", features)}
          />
        </div>

        {/* Basketball Features */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl shadow-sm">
                🏀
              </div>
              <h3 className="text-lg font-semibold text-gray-800 font-['Poppins']">Basketball Features</h3>
            </div>
            {isModified("basketball") && (
              <button
                onClick={() => handleSave("basketball")}
                disabled={savingSport === "basketball"}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
              >
                {savingSport === "basketball" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Basketball
              </button>
            )}
          </div>
          <ComparisonFeatureManager
            features={featuresData.basketball}
            onChange={(features) => handleFeaturesChange("basketball", features)}
          />
        </div>


      </div>

      <div className="mt-8 bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <p className="text-xs text-zinc-500 font-['Poppins'] leading-relaxed">
          <strong>Note:</strong> Comparison features are shared across all durations (nights). 
          Changes here will update the "Qué incluye" comparison table for the respective sport on the website.
        </p>
      </div>
    </div>
  );
}
