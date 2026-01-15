"use client";
import React, { useState, useEffect } from "react";
import {
  getSocialContactLinks,
  updateSocialContactLinks,
  type SocialContactLinks,
} from "../../../../../../services/settingsService";
import { useToast } from "../../../../../../components/ui/toast";

export default function SocialContactManagement() {
  const [links, setLinks] = useState<SocialContactLinks>({
    whatsapp: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    email: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSocialContactLinks();
      if (response.success && response.links) {
        setLinks(response.links);
      } else {
        setError("Failed to fetch social contact links");
      }
    } catch (err) {
      console.error("Error fetching social contact links:", err);
      setError("Failed to load social contact links. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SocialContactLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const response = await updateSocialContactLinks(links);
      if (response.success) {
        addToast({
          type: "success",
          title: "Social media and contact links updated successfully",
        });
        await loadData();
      } else {
        setError("Failed to update links");
      }
    } catch (err) {
      console.error("Error updating social contact links:", err);
      setError("Failed to update links. Please try again later.");
      addToast({ type: "error", title: "Failed to update links" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 min-h-screen mb-4 p-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 text-lg font-medium">
            Loading social contact links...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Social Media & Contact Links
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8"
        >
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={links.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="example@gmail.com"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                WhatsApp
              </label>
              <input
                type="url"
                id="whatsapp"
                value={links.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="https://wa.me/..."
              />
            </div>

            {/* Instagram */}
            <div>
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                value={links.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="https://instagram.com/..."
              />
            </div>

            {/* TikTok */}
            <div>
              <label
                htmlFor="tiktok"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                TikTok
              </label>
              <input
                type="url"
                id="tiktok"
                value={links.tiktok}
                onChange={(e) => handleChange("tiktok", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="https://tiktok.com/@..."
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                value={links.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#76C043] text-white rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
