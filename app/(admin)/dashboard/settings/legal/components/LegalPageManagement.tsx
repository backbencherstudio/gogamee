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
import { TranslatedText } from "@/app/(frontend)/_components/TranslatedText";
import { useLanguage } from "@/app/context/LanguageContext";

type PageType = "privacy" | "cookie" | "terms";

interface LegalPageManagementProps {
  pageType: PageType;
  pageTitle: string;
}

// Helper to get localized title
const getPageTitle = (type: PageType, lang: "en" | "es") => {
  const titles = {
    privacy: { en: "Privacy Policy", es: "Política de Privacidad" },
    cookie: { en: "Cookie Policy", es: "Política de Cookies" },
    terms: { en: "Terms & Conditions", es: "Términos y Condiciones" },
  };
  return titles[type][lang];
};

export default function LegalPageManagement({
  pageType,
  pageTitle: initialPageTitle, // Renamed to avoid confusion, though we might ignore it or use as fallback
}: LegalPageManagementProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { language } = useLanguage();

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
        setError(
          language === "es"
            ? "Error al obtener contenido de la página legal"
            : "Failed to fetch legal page content",
        );
      }
    } catch (err) {
      console.error("Error fetching legal page content:", err);
      setError(
        language === "es"
          ? "Error al cargar el contenido de la página legal. Por favor inténtelo más tarde."
          : "Failed to load legal page content. Please try again later.",
      );
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
          title:
            language === "es"
              ? `${getPageTitle(pageType, "es")} actualizado exitosamente`
              : `${getPageTitle(pageType, "en")} updated successfully`,
        });
        await loadData();
      } else {
        setError(
          language === "es"
            ? "Error al actualizar contenido"
            : "Failed to update content",
        );
      }
    } catch (err) {
      console.error("Error updating legal page content:", err);
      setError(
        language === "es"
          ? "Error al actualizar contenido. Por favor inténtelo más tarde."
          : "Failed to update content. Please try again later.",
      );
      addToast({
        type: "error",
        title:
          language === "es"
            ? "Error al actualizar contenido"
            : "Failed to update content",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 min-h-screen mb-4 p-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 text-lg font-medium">
            <TranslatedText
              english={`Loading ${getPageTitle(pageType, "en").toLowerCase()} content...`}
              text={`Cargando contenido de ${getPageTitle(pageType, "es").toLowerCase()}...`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          <TranslatedText
            english={getPageTitle(pageType, "en")}
            text={getPageTitle(pageType, "es")}
          />
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
              <strong>
                <TranslatedText english="Info:" text="Info:" />
              </strong>{" "}
              <TranslatedText
                english="Write content in your preferred language. The system will automatically translate it for users on the website."
                text="Escribe el contenido en tu idioma preferido. El sistema lo traducirá automáticamente para los usuarios en el sitio web."
              />
            </p>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TranslatedText english="Content" text="Contenido" />
            </label>
            <RichTextEditor
              value={content}
              onChange={handleContentChange}
              placeholder={
                language === "es"
                  ? `Escriba el contenido de ${getPageTitle(pageType, "es").toLowerCase()} aquí...`
                  : `Write ${getPageTitle(pageType, "en").toLowerCase()} content here...`
              }
            />
            <p className="text-sm text-gray-500">
              <TranslatedText
                english="Use the toolbar to format text (headings, lists, bold, italic, underline)."
                text="Use la barra de herramientas para formatear el texto (encabezados, listas, negrita, cursiva, subrayado)."
              />
            </p>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              <TranslatedText english="Cancel" text="Cancelar" />
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#76C043] text-white rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <TranslatedText english="Saving..." text="Guardando..." />
              ) : (
                <TranslatedText english="Save Changes" text="Guardar Cambios" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
