"use client";
import React, { useState, useEffect } from "react";
import { Plus, Star, Edit, Trash2, Save, X, User } from "lucide-react";
import { AiFillStar } from "react-icons/ai";
import {
  getAllTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStats,
  type TestimonialItem,
} from "../../../../../services/testimonialService";
import DeleteConfirmationModal from "../../../../../components/ui/delete-confirmation-modal";
import { Pagination } from "../../../../../components/ui/Pagination";
import { autoTranslateContent } from "../../../../../services/translationService";
import { TranslatedText } from "../../../../(frontend)/_components/TranslatedText";

// Local interface matching the API response items
interface ReviewItem extends TestimonialItem {}

export default function TestimonialPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    fiveStarCount: 0,
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Unified form state
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    rating: number;
    review: string;
  }>({
    name: "",
    role: "",
    rating: 5,
    review: "",
  });

  // Load stats from API
  const loadStats = async () => {
    try {
      const response = await getTestimonialStats();
      if (response.success && response.data) {
        const { total, averageRating, ratingDistribution } = response.data;
        const fiveStar =
          ratingDistribution.find((r) => r.rating === 5)?.count || 0;
        setStats({
          total,
          averageRating: Number(averageRating.toFixed(1)),
          fiveStarCount: fiveStar,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  // Load review data from API
  const loadReviews = async (page: number) => {
    try {
      setLoading(true);
      const [response] = await Promise.all([
        getAllTestimonials(page, limit),
        // Load stats only on first page load or when explicit refresh needed,
        // but putting it here ensures it's fresh.
      ]);

      if (response.success && response.data) {
        setReviews(response.data);
        if (response.meta_data) {
          setTotalPages(response.meta_data.total_pages);
          setTotalItems(response.meta_data.total);
          setCurrentPage(response.meta_data.page);
        }
      }
    } catch (error) {
      console.error("Failed to load testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(currentPage);
    loadStats();
  }, [currentPage]);

  const handleImageError = (
    imagePath: string,
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    if (!failedImages.has(imagePath)) {
      setFailedImages((prev) => new Set(prev).add(imagePath));
      e.currentTarget.src = "/homepage/image/avatar1.png";
    }
  };

  const getImageSrc = (imagePath: string) => {
    if (
      !imagePath ||
      imagePath === "" ||
      imagePath === "/homepage/image/avatar1.png"
    ) {
      return null; // Will render User icon instead
    }
    return imagePath;
  };

  const handleAddReview = async () => {
    if (formData.name && formData.role && formData.review) {
      setSaving(true);
      try {
        const payload = {
          name: formData.name.trim(),
          role: formData.role.trim(),
          rating: formData.rating,
          review: formData.review.trim(),
        };

        const res = await addTestimonial(payload);
        if (res.success) {
          await loadReviews(currentPage);
          await loadStats(); // Refresh stats
          resetForm();
          setShowAddForm(false);
        } else {
          // Handle API error response
          console.error("Failed to add testimonial:", res.message);
        }
      } catch (error) {
        console.error("Error adding testimonial:", error);
        alert(
          error instanceof Error ? error.message : "Failed to add testimonial.",
        );
      } finally {
        setSaving(false);
      }
    } else {
      console.error("Missing required fields");
      alert(
        "Please fill in all required fields (name, role, review, and image).",
      );
    }
  };

  const handleDeleteReview = async (id: string) => {
    // Delete API call
    if (!id) return;
    try {
      await deleteTestimonial(id);
      await loadReviews(currentPage);
      await loadStats(); // Refresh stats
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const startEdit = (review: ReviewItem) => {
    setEditingId(review.id);
    setFormData({
      name: review.name,
      role: review.role,
      rating: review.rating,
      review: review.review,
    });
    setShowAddForm(true);
  };

  const saveEdit = async () => {
    if (editingId) {
      setSaving(true);
      try {
        const payload = {
          name: formData.name.trim(),
          role: formData.role.trim(),
          rating: formData.rating,
          review: formData.review.trim(),
        };

        const res = await updateTestimonial(editingId, payload);
        if (res.success) {
          await loadReviews(currentPage);
          await loadStats(); // Refresh stats
          resetForm();
          setEditingId(null);
          setShowAddForm(false);
        } else {
          // Handle API error response
          console.error("Failed to update testimonial:", res.message);
        }
      } catch (error) {
        console.error("Error updating testimonial:", error);
      } finally {
        setSaving(false);
      }
    } else {
      console.error("No editing ID set");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      rating: 5,
      review: "",
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    resetForm();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="py-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Testimonial Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">
              Manage customer reviews and testimonials displayed on the website
            </p>
          </div>

          {/* Add Review Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 py-3 px-2 whitespace-nowrap bg-[#76C043] hover:bg-lime-600 rounded-lg font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md text-white w-fit"
          >
            <Plus className="w-5 h-5 text-white" />
            Add Review
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#76C043]/20 rounded-lg">
                <Star className="w-6 h-6 text-[#76C043]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
                <p className="text-gray-600 font-['Poppins']">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <AiFillStar className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.averageRating}
                </p>
                <p className="text-gray-600 font-['Poppins']">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.fiveStarCount}
                </p>
                <p className="text-gray-600 font-['Poppins']">5-Star Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold font-['Poppins'] text-gray-800">
                {editingId ? "Edit Review" : "Add New Review"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role/Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  placeholder="Enter role or title"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Content
              </label>
              <textarea
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="Enter review content"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={editingId ? saveEdit : handleAddReview}
                disabled={saving}
                className="px-6 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {editingId ? "Update Review" : "Save Review"}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-gray-200 animate-pulse rounded-sm"
                        />
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg h-24 animate-pulse">
                      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))
            : reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold font-['Geist'] text-lime-900 truncate">
                            <TranslatedText text={review.name} />
                          </h3>
                          <p className="text-sm text-zinc-500 font-['Poppins'] truncate">
                            <TranslatedText text={review.role} />
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(review.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className="w-4 h-4 text-emerald-500"
                        />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <AiFillStar
                          key={i + review.rating}
                          className="w-4 h-4 text-gray-200"
                        />
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-neutral-600 font-['Poppins'] leading-6 line-clamp-4">
                        <TranslatedText text={review.review} />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* View More Button (instead of pagination) */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => loadReviews(currentPage + 1)}
              disabled={loading || currentPage >= totalPages}
              className="px-6 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "View More"}
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => deleteConfirm && handleDeleteReview(deleteConfirm)}
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
        />
      </div>
    </div>
  );
}
