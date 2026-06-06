"use client";

import React, { useEffect, useState } from "react";
import {
  getHomepageContent,
  updateHomepageContent,
  type HomepageContent,
} from "../../../../../../services/settingsService";
import { useToast } from "../../../../../../components/ui/toast";

const defaultContent: HomepageContent = {
  heroTitle: "¿Listo para vivir el deporte como nunca antes?",
  heroSubtitle:
    "Deja que tu pasión por el fútbol o el baloncesto te lleve a un destino inesperado. El lugar final es una sorpresa.",
  howItWorksTitle: "Cómo funciona GoGame",
  howItWorksIntro:
    "Sigue unos pasos muy sencillos y nosotros te sorprenderemos con el viaje deportivo perfecto, totalmente organizado.",
  steps: [
    {
      title: "Personaliza tu aventura",
      description:
        "Cuéntanos tu deporte favorito (fútbol o basket), desde qué ciudad sales y cuántas personas sois.",
    },
    {
      title: "Nosotros preparamos la sorpresa",
      description:
        "Nos encargamos de reservar tus vuelos, el hotel y las entradas al partido. Tú solo tienes que esperar al gran momento sorpresa.",
    },
    {
      title: "Prepárate para irte",
      description:
        "Recibirás tu plan de viaje secreto. Haz la maleta y empieza a emocionarte: sabrás tu destino unos días antes.",
    },
    {
      title: "Vive la experiencia",
      description:
        "Disfruta del partido, explora una nueva ciudad y crea recuerdos inolvidables.",
    },
  ],
};

export default function HomepageContentManagement() {
  const [content, setContent] = useState<HomepageContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHomepageContent();

      if (response.success && response.content) {
        setContent({
          ...defaultContent,
          ...response.content,
          steps:
            response.content.steps?.length === 4
              ? response.content.steps
              : defaultContent.steps,
        });
      }
    } catch (err) {
      console.error("Error loading homepage content:", err);
      setError("Failed to load homepage content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof Omit<HomepageContent, "steps" | "id">,
    value: string,
  ) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setContent((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step,
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      const response = await updateHomepageContent(content);

      if (response.success && response.content) {
        setContent(response.content);
        addToast({
          type: "success",
          title: "Homepage content updated successfully",
        });
      } else {
        setError("Failed to update homepage content.");
      }
    } catch (err) {
      console.error("Error saving homepage content:", err);
      setError("Failed to save homepage content. Please try again later.");
      addToast({
        type: "error",
        title: "Failed to save homepage content",
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
            Loading homepage content...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 min-h-screen mb-4 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight mb-6 pt-8">
          Homepage Text Content
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
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hero Section
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="heroTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Main headline
                  </label>
                  <textarea
                    id="heroTitle"
                    value={content.heroTitle}
                    onChange={(event) =>
                      handleFieldChange("heroTitle", event.target.value)
                    }
                    rows={2}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="heroSubtitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Supporting text
                  </label>
                  <textarea
                    id="heroSubtitle"
                    value={content.heroSubtitle}
                    onChange={(event) =>
                      handleFieldChange("heroSubtitle", event.target.value)
                    }
                    rows={3}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How It Works Section
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="howItWorksTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Section title
                  </label>
                  <input
                    id="howItWorksTitle"
                    type="text"
                    value={content.howItWorksTitle}
                    onChange={(event) =>
                      handleFieldChange("howItWorksTitle", event.target.value)
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="howItWorksIntro"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Intro text
                  </label>
                  <textarea
                    id="howItWorksIntro"
                    value={content.howItWorksIntro}
                    onChange={(event) =>
                      handleFieldChange("howItWorksIntro", event.target.value)
                    }
                    rows={3}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {content.steps.map((step, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Step {index + 1}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`step-${index}-title`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Title
                          </label>
                          <input
                            id={`step-${index}-title`}
                            type="text"
                            value={step.title}
                            onChange={(event) =>
                              handleStepChange(
                                index,
                                "title",
                                event.target.value,
                              )
                            }
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`step-${index}-description`}
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Description
                          </label>
                          <textarea
                            id={`step-${index}-description`}
                            value={step.description}
                            onChange={(event) =>
                              handleStepChange(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            rows={4}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={loadContent}
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
