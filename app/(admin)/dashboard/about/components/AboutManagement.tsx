"use client";
import React, { useState, useEffect } from "react";
import {
  getAboutManagement,
  addMainSection,
  editMainSection,
  addOurValue,
  editOurValue,
  addWhyChooseUs,
  editWhyChooseUs,
  type MainSection,
  type OurValue,
  type WhyChooseUs,
  type MainSectionPayload,
  type OurValuePayload,
  type WhyChooseUsPayload,
} from "../../../../../services/aboutService";

type TabId = "sections" | "values" | "whyChooseUs";

export default function AboutManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("sections");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sections, setSections] = useState<MainSection[]>([]);
  const [values, setValues] = useState<OurValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for editing
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
    text: "",
    buttonText: "",
    buttonLink: "",
    backgroundImage: "",
  });

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

    if (type === "headline") {
      setFormData({
        title: "",
        description: "",
        order: 1,
        text: headline,
        buttonText: "",
        buttonLink: "",
        backgroundImage: "",
      });
    } else {
      const data =
        type === "sections"
          ? sections
          : type === "values"
            ? values
            : whyChooseUs;
      const item = data.find((item) => item.id === id);
      if (item) {
        setFormData({
          title: item.title,
          description: item.description,
          order: item.order,
          text: "",
          buttonText: "",
          buttonLink: "",
          backgroundImage: "",
        });
      }
    }
  };

  const handleAddNew = (type: string) => {
    setIsAdding(true);
    setIsEditing(false);
    setEditingId(null);

    // Get the next order number
    const data =
      type === "sections" ? sections : type === "values" ? values : whyChooseUs;
    const nextOrder = Math.max(...data.map((item) => item.order), 0) + 1;

    setFormData({
      title: "",
      description: "",
      order: nextOrder,
      text: "",
      buttonText: "",
      buttonLink: "",
      backgroundImage: "",
    });
  };

  const handleSave = async () => {
    try {
      if (editingId === "headline") {
        // Update headline - for now, we'll just update local state
        // In a real implementation, you'd need an API endpoint for updating headline
        setHeadline(formData.text);
      } else if (isAdding) {
        // Adding new items
        if (activeTab === "sections") {
          const payload: MainSectionPayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addMainSection(payload);
          if (response.success) {
            await loadData(); // Reload data to get updated list
          }
        } else if (activeTab === "values") {
          const payload: OurValuePayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addOurValue(payload);
          if (response.success) {
            await loadData(); // Reload data to get updated list
          }
        } else if (activeTab === "whyChooseUs") {
          const payload: WhyChooseUsPayload = {
            title: formData.title,
            description: formData.description,
            order: formData.order,
          };
          const response = await addWhyChooseUs(payload);
          if (response.success) {
            await loadData(); // Reload data to get updated list
          }
        }
      } else if (activeTab === "sections" && editingId) {
        const payload: MainSectionPayload = {
          title: formData.title,
          description: formData.description,
          order: formData.order,
        };
        const response = await editMainSection(editingId, payload);
        if (response.success) {
          await loadData(); // Reload data to get updated list
        }
      } else if (activeTab === "values" && editingId) {
        const payload: OurValuePayload = {
          title: formData.title,
          description: formData.description,
          order: formData.order,
        };
        const response = await editOurValue(editingId, payload);
        if (response.success) {
          await loadData(); // Reload data to get updated list
        }
      } else if (activeTab === "whyChooseUs" && editingId) {
        const payload: WhyChooseUsPayload = {
          title: formData.title,
          description: formData.description,
          order: formData.order,
        };
        const response = await editWhyChooseUs(editingId, payload);
        if (response.success) {
          await loadData(); // Reload data to get updated list
        }
      }

      setIsEditing(false);
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        order: 1,
        text: "",
        buttonText: "",
        buttonLink: "",
        backgroundImage: "",
      });
    } catch (err) {
      console.error("Error saving data:", err);
      setError("Failed to save changes. Please try again.");
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
      text: "",
      buttonText: "",
      buttonLink: "",
      backgroundImage: "",
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 text-lg font-medium">
            Loading about management data...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center py-12 gap-4">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (isEditing || isAdding) {
      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 ">
          <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800 mb-6">
            {editingId === "headline" && "Edit Main Headline"}
            {isAdding && activeTab === "sections" && "Add New Section"}
            {isAdding && activeTab === "values" && "Add New Value"}
            {isAdding &&
              activeTab === "whyChooseUs" &&
              "Add New Why Choose Us Item"}
            {isEditing &&
              activeTab === "sections" &&
              editingId !== "headline" &&
              "Edit Section"}
            {isEditing && activeTab === "values" && "Edit Value"}
            {isEditing &&
              activeTab === "whyChooseUs" &&
              "Edit Why Choose Us Item"}
          </h3>

          <div className="space-y-6">
            {editingId === "headline" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Headline
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  placeholder="Enter main headline for the about page"
                />
              </div>
            )}

            {activeTab === "sections" &&
              (isAdding || (isEditing && editingId !== "headline")) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
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
                      placeholder="Enter section description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
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
                      placeholder="Enter display order"
                    />
                  </div>
                </>
              )}

            {(activeTab === "values" || activeTab === "whyChooseUs") &&
              (isAdding || isEditing) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                      placeholder="Enter item title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                      placeholder="Enter item description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
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
                      placeholder="Enter display order"
                    />
                  </div>
                </>
              )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                  Main Headline
                </h3>
                <button
                  onClick={() => handleEdit("headline")}
                  className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-600 font-['Poppins'] leading-relaxed">
                {headline}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                  Sections
                </h3>
                <button
                  onClick={() => handleAddNew("sections")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Add New Section
                </button>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500 text-lg font-medium">
                  No sections available. Add your first section!
                </div>
              </div>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                      {section.title}
                    </h3>
                    <button
                      onClick={() => handleEdit("sections", section.id)}
                      className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      Order: {section.order}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "values" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                  Our Values
                </h3>
                <button
                  onClick={() => handleAddNew("values")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Add New Value
                </button>
              </div>
            </div>

            {values.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500 text-lg font-medium">
                  No values available. Add your first value!
                </div>
              </div>
            ) : (
              values.map((value) => (
                <div
                  key={value.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                      {value.title}
                    </h3>
                    <button
                      onClick={() => handleEdit("values", value.id)}
                      className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">
                    {value.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      Order: {value.order}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "whyChooseUs" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                  Why Choose Us
                </h3>
                <button
                  onClick={() => handleAddNew("whyChooseUs")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Add New Item
                </button>
              </div>
            </div>

            {whyChooseUs.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500 text-lg font-medium">
                  No why choose us items available. Add your first item!
                </div>
              </div>
            ) : (
              whyChooseUs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                      {item.title}
                    </h3>
                    <button
                      onClick={() => handleEdit("whyChooseUs", item.id)}
                      className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-600 font-['Poppins'] leading-relaxed mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      Order: {item.order}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
              About Page Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">
              Manage the content of your about page dynamically
            </p>
          </div>
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
                  {tab.label}
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
