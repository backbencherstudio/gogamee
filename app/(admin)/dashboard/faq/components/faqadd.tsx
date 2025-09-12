"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import AppData from "../../../../lib/appdata";
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FaqAdd() {
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [newFaqForm, setNewFaqForm] = useState({ question: "", answer: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Load FAQ data from AppData
  useEffect(() => {
    setFaqData(AppData.faqs.getAll());
  }, []);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleEdit = (item: FAQItem) => {
    setEditingItem(item.id);
    setEditForm({ question: item.question, answer: item.answer });
  };

  const handleSaveEdit = (id: number) => {
    const updatedFaq = AppData.faqs.update(id, {
      question: editForm.question,
      answer: editForm.answer
    });
    
    if (updatedFaq) {
      setFaqData(AppData.faqs.getAll());
    }
    
    setEditingItem(null);
    setEditForm({ question: "", answer: "" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({ question: "", answer: "" });
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = (id: number) => {
    const success = AppData.faqs.delete(id);
    if (success) {
      setFaqData(AppData.faqs.getAll());
    }
    setDeleteConfirm(null);
  };

  const handleAddNew = () => {
    if (newFaqForm.question.trim() && newFaqForm.answer.trim()) {
      const newFaq = AppData.faqs.add({
        question: newFaqForm.question.trim(),
        answer: newFaqForm.answer.trim(),
      });
      
      if (newFaq) {
        // Add the new FAQ to the beginning of the local state for immediate display
        setFaqData([newFaq, ...faqData]);
        setNewFaqForm({ question: "", answer: "" });
        setShowAddForm(false);
      }
    }
  };

  const handleCancelAdd = () => {
    setNewFaqForm({ question: "", answer: "" });
    setShowAddForm(false);
  };

  return (
    <div className="w-full px-4 ">
      <div className="pt-8 pb-8 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-24 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight">
              FAQ Management
            </h1>
            <p className="text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed">
              Manage frequently asked questions for your website. Add, edit, or remove FAQ items.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-[#76C043] hover:bg-lime-600 rounded-lg flex justify-center items-center gap-2 text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New FAQ
          </button>
        </div>

        {/* Add New FAQ Form */}
        {showAddForm && (
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-zinc-950 mb-4">Add New FAQ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={newFaqForm.question}
                  onChange={(e) =>
                    setNewFaqForm((prev) => ({ ...prev, question: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent outline-none"
                  placeholder="Enter your question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={newFaqForm.answer}
                  onChange={(e) =>
                    setNewFaqForm((prev) => ({ ...prev, answer: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent outline-none resize-none"
                  placeholder="Enter your answer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save FAQ
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Items List */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col gap-5 w-full">
              {faqData.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 md:gap-5 w-full p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                >
                  {editingItem === item.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question
                        </label>
                        <input
                          type="text"
                          value={editForm.question}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, question: e.target.value }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer
                        </label>
                        <textarea
                          value={editForm.answer}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, answer: e.target.value }))
                          }
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="w-full">
                        <div className="flex justify-between items-start gap-4 md:gap-6 w-full">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                              <Image
                                src="/homepage/icon/faq.svg"
                                alt="FAQ icon"
                                width={24}
                                height={24}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9 flex-1">
                              {item.question}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit FAQ"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleItem(index)}
                              className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 cursor-pointer"
                            >
                              {expandedItems.includes(index) ? (
                                <IoIosArrowUp className="w-full h-full text-lime-900" />
                              ) : (
                                <IoIosArrowDown className="w-full h-full text-lime-900" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedItems.includes(index) && (
                        <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                          {item.answer}
                        </div>
                      )}
                    </>
                  )}

                  {index < faqData.length - 1 && (
                    <div className="self-stretch h-0 border-t border-stone-500/10 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Total FAQ Items: <span className="font-semibold">{faqData.length}</span>
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleConfirmDelete(deleteConfirm)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ item?"
      />
    </div>
  );
}
