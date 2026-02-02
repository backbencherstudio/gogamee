"use client";
import React, { useState, useEffect } from "react";
import {
  getAboutManagement,
  addMainSection,
  editMainSection,
  deleteMainSection,
  addOurValue,
  editOurValue,
  deleteOurValue,
  addWhyChooseUs,
  editWhyChooseUs,
  deleteWhyChooseUs,
  updateAboutHeadline,
  type MainSection,
  type OurValue,
  type WhyChooseUs,
  type MainSectionPayload,
  type OurValuePayload,
  type WhyChooseUsPayload,
  type MainSectionUpdatePayload,
  type OurValueUpdatePayload,
  type WhyChooseUsUpdatePayload,
} from "../../../../../services/aboutService";
import { useToast } from "../../../../../components/ui/toast";
import {
  Loader2,
  Edit2,
  Trash2,
  Plus,
  LayoutGrid,
  Target,
  List,
  Type,
  AlignLeft,
  ListOrdered,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { TranslatedText } from "@/app/(frontend)/_components/TranslatedText";
import { useLanguage } from "@/app/context/LanguageContext";

type TabId = "sections" | "values" | "whyChooseUs";

export default function AboutManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("sections");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sections, setSections] = useState<MainSection[]>([]);
  const [values, setValues] = useState<OurValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  const [headlineText, setHeadlineText] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAboutManagement();
      if (response.success && response.data) {
        const content = response.data as any;
        setSections(content.sections || []);
        setValues(content.values?.items || []);
        setWhyChooseUs(content.whyChooseUs?.items || []);
        setHeadline(content.headline || "");
        setHeadlineText(content.headline || "");
      } else {
        setError("Failed to fetch about management data");
      }
    } catch (err) {
      console.error("Error fetching about management data:", err);
      setError("Failed to load about management data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: string, id?: string) => {
    setIsEditing(true);
    setIsAdding(false);
    setEditingId(id || null);

    const data =
      type === "sections" ? sections : type === "values" ? values : whyChooseUs;
    const item = data.find((item) => item.id === id);
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        order: item.order,
      });
    }
  };

  const handleAddNew = (type: string) => {
    setIsAdding(true);
    setIsEditing(false);
    setEditingId(null);

    const data =
      type === "sections" ? sections : type === "values" ? values : whyChooseUs;
    const nextOrder = Math.max(...data.map((item) => item.order), 0) + 1;

    setFormData({
      title: "",
      description: "",
      order: nextOrder,
    });
  };

  const handleDelete = async (id: string, type: TabId) => {
    const confirmMessage =
      language === "es"
        ? "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer."
        : "Are you sure you want to delete this item? This action cannot be undone.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setActionLoading(true);
      let response;

      if (type === "sections") {
        response = await deleteMainSection(id);
      } else if (type === "values") {
        response = await deleteOurValue(id);
      } else if (type === "whyChooseUs") {
        response = await deleteWhyChooseUs(id);
      }

      if (response && response.success) {
        await loadData();
      } else {
        alert("Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("An error occurred while deleting");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveHeadline = async () => {
    if (!headlineText.trim()) {
      alert("Headline cannot be empty");
      return;
    }
    try {
      setActionLoading(true);
      const response = await updateAboutHeadline(headlineText);
      if (response.success) {
        setHeadline(headlineText);
        setIsEditingHeadline(false);
      }
    } catch (err) {
      console.error("Error saving headline:", err);
      alert("Failed to save headline");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setActionLoading(true);
      if (isAdding) {
        if (activeTab === "sections") {
          const payload: MainSectionPayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addMainSection(payload);
          if (response.success) await loadData();
        } else if (activeTab === "values") {
          const payload: OurValuePayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addOurValue(payload);
          if (response.success) await loadData();
        } else if (activeTab === "whyChooseUs") {
          const payload: WhyChooseUsPayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addWhyChooseUs(payload);
          if (response.success) await loadData();
        }
      } else if (editingId) {
        if (activeTab === "sections") {
          const payload: MainSectionUpdatePayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await editMainSection(editingId, payload);
          if (response.success) await loadData();
        } else if (activeTab === "values") {
          const payload: OurValueUpdatePayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await editOurValue(editingId, payload);
          if (response.success) await loadData();
        } else if (activeTab === "whyChooseUs") {
          const payload: WhyChooseUsUpdatePayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await editWhyChooseUs(editingId, payload);
          if (response.success) await loadData();
        }
      }

      handleCancel();
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      order: 1,
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-lime-600 animate-spin mr-2" />
          <div className="text-gray-600 text-lg font-medium">
            <TranslatedText text="Loading about management data..." />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center py-12 gap-4">
          <div className="text-red-600 text-lg font-medium">
            <TranslatedText text={error} />
          </div>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            <TranslatedText text="Try Again" />
          </button>
        </div>
      );
    }

    if (isEditing || isAdding) {
      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 ">
          <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800 mb-6">
            {isAdding && activeTab === "sections" && (
              <TranslatedText text="Add New Section" />
            )}
            {isAdding && activeTab === "values" && (
              <TranslatedText text="Add New Value" />
            )}
            {isAdding && activeTab === "whyChooseUs" && (
              <TranslatedText text="Add New Why Choose Us Item" />
            )}
            {isEditing && activeTab === "sections" && (
              <TranslatedText text="Edit Section" />
            )}
            {isEditing && activeTab === "values" && (
              <TranslatedText text="Edit Value" />
            )}
            {isEditing && activeTab === "whyChooseUs" && (
              <TranslatedText text="Edit Why Choose Us Item" />
            )}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText text="Title" />
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese el título del elemento"
                    : "Enter item title"
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText text="Description" />
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese la descripción del elemento"
                    : "Enter item description"
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TranslatedText text="Order" />
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese orden de visualización"
                    : "Enter display order"
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSaveItem}
              disabled={actionLoading}
              className="px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {actionLoading ? (
                <TranslatedText text="Saving..." />
              ) : (
                <TranslatedText text="Save Changes" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium font-['Poppins'] transition-all duration-200 disabled:opacity-50"
            >
              <TranslatedText text="Cancel" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Helper to render list of items */}
        {(() => {
          let items: any[] = [];
          if (activeTab === "sections") items = sections;
          if (activeTab === "values") items = values;
          if (activeTab === "whyChooseUs") items = whyChooseUs;

          return (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                    {activeTab === "sections" && (
                      <TranslatedText text="Sections" />
                    )}
                    {activeTab === "values" && (
                      <TranslatedText text="Our Values" />
                    )}
                    {activeTab === "whyChooseUs" && (
                      <TranslatedText text="Why Choose Us" />
                    )}
                  </h3>
                  <button
                    onClick={() => handleAddNew(activeTab)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {activeTab === "sections" && (
                      <TranslatedText text="Add New Section" />
                    )}
                    {activeTab === "values" && (
                      <TranslatedText text="Add New Value" />
                    )}
                    {activeTab === "whyChooseUs" && (
                      <TranslatedText text="Add New Item" />
                    )}
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500 text-lg font-medium">
                    <TranslatedText text="No items available. Add your first one!" />
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                        <TranslatedText text={item.title} />
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(activeTab, item.id)}
                          className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <TranslatedText text="Edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, activeTab)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <TranslatedText text="Delete" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">
                      <TranslatedText text={item.description} />
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        <TranslatedText text="Order" />: {item.order}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="pt-4 pl-10 min-h-screen mb-4 pr-8 space-y-4 pb-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              <TranslatedText text="About Page Management" />
            </h1>
            <p className="text-gray-600 font-['Poppins']">
              <TranslatedText text="Manage the content of your about page dynamically" />
            </p>
          </div>
        </div>

        {/* Global Headline Section - Always Visible */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
              <TranslatedText text="Main Headline" />
            </h3>
            {!isEditingHeadline && (
              <button
                onClick={() => {
                  setHeadlineText(headline);
                  setIsEditingHeadline(true);
                }}
                className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <TranslatedText text="Edit" />
              </button>
            )}
          </div>
          {isEditingHeadline ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese el titular principal"
                    : "Enter main headline"
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveHeadline}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] disabled:opacity-50"
                  {...({} as any)}
                >
                  {actionLoading ? (
                    <TranslatedText text="Saving..." />
                  ) : (
                    <TranslatedText text="Save" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditingHeadline(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium font-['Poppins'] disabled:opacity-50"
                >
                  <TranslatedText text="Cancel" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 font-['Poppins'] leading-relaxed">
              <TranslatedText text={headline} />
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {(
                [
                  { id: "sections", label: "Main Sections" },
                  { id: "values", label: "Our Values" },
                  { id: "whyChooseUs", label: "Why Choose Us" },
                ] as { id: TabId; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm font-['Poppins'] transition-colors ${
                    activeTab === tab.id
                      ? "border-[#76C043] text-[#76C043]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <TranslatedText text={tab.label} />
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
