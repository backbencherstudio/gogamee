"use client";
import React, { useState, useEffect } from "react";
import {
  getLegalPages,
  updatePrivacyPolicy,
  updateCookiePolicy,
  updateTermsConditions,
  type LegalPageContent,
} from "../../../../../../services/settingsService";
import { useToast } from "../../../../../../components/ui/toast";
import RichTextEditor from "./RichTextEditor";
import { autoTranslateContent } from "../../../../../../services/translationService";

type PageType = "privacy" | "cookie" | "terms";

interface LegalPageManagementProps {
  pageType: PageType;
  pageTitle: string;
}

export default function LegalPageManagement({
  pageType,
  pageTitle,
}: LegalPageManagementProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLegalPages();
      if (response.success && response.content) {
        const pageContent = response.content[pageType];
        if (pageContent !== undefined) {
          setContent(pageContent);
        }
      } else {
        setError("Failed to fetch legal page content");
      }
    } catch (err) {
      console.error("Error fetching legal page content:", err);
      setError("Failed to load legal page content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let response;
      const payload = { content };

      switch (pageType) {
        case "privacy":
          response = await updatePrivacyPolicy(content);
          break;
        case "cookie":
          response = await updateCookiePolicy(content);
          break;
        case "terms":
          response = await updateTermsConditions(content);
          break;
      }

      if (response && response.success) {
        addToast({
          type: "success",
          title: `${pageTitle} updated successfully`,
        });
        await loadData();
      } else {
        setError("Failed to update content");
      }
    } catch (err) {
      console.error("Error updating legal page content:", err);
      setError("Failed to update content. Please try again later.");
      addToast({ type: "error", title: "Failed to update content" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 min-h-screen mb-4 p-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 text-lg font-medium">
            Loading {pageTitle.toLowerCase()} content...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          {pageTitle}
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
          <div className="mb-6 p-4 bg-lime-50 rounded-lg border border-lime-100 flex items-center justify-between">
            <p className="text-lime-800 text-sm font-['Poppins']">
              <strong>Info:</strong> Escribe el contenido en tu idioma
              preferido. El sistema lo traducirá automáticamente para los
              usuarios en el sitio web.
            </p>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder={`Write ${pageTitle.toLowerCase()} content here...`}
            />
            <p className="text-sm text-gray-500">
              Use the toolbar to format text (headings, lists, bold, italic,
              underline).
            </p>
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
