"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Star, Edit, Trash2, Save, X, User } from "lucide-react";
import { AiFillStar } from "react-icons/ai";
import AppData from "../../../../lib/appdata";
import { uploadImage } from "../../../../lib/utils";

interface ReviewItem {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  review: string;
}

export default function TestimonialPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [newReviewForm, setNewReviewForm] = useState({
    name: "",
    role: "",
    image: "/homepage/image/avatar1.png",
    rating: 5,
    review: ""
  });
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    image: "",
    rating: 5,
    review: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Load review data from AppData
  useEffect(() => {
    setReviews(AppData.reviews.getAll());
  }, []);

  const handleImageError = (imagePath: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Only set fallback if we haven't already tried for this image
    if (!failedImages.has(imagePath)) {
      setFailedImages(prev => new Set(prev).add(imagePath));
      e.currentTarget.src = "/homepage/image/avatar1.png";
    }
  };

  // Handle image upload for new review
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await uploadImage(file, 'reviews');

        if (result.success && result.imagePath) {
          // Store only the path
          setNewReviewForm({
            ...newReviewForm,
            image: result.imagePath
          });
          setImagePreview(result.imagePath);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    }
  };

  // Handle image upload for edit form
  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await uploadImage(file, 'reviews');

        if (result.success && result.imagePath) {
          // Store only the path
          setEditForm({
            ...editForm,
            image: result.imagePath
          });
          setEditImagePreview(result.imagePath);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    }
  };

  // Add new review
  const handleAddReview = () => {
    if (newReviewForm.name && newReviewForm.role && newReviewForm.review) {
      const newReview = AppData.reviews.add({
        name: newReviewForm.name.trim(),
        role: newReviewForm.role.trim(),
        image: newReviewForm.image,
        rating: newReviewForm.rating,
        review: newReviewForm.review.trim()
      });
      
      if (newReview) {
        // Add the new review to the beginning of the local state for immediate display
        setReviews([newReview, ...reviews]);
        setNewReviewForm({
          name: "",
          role: "",
          image: "/homepage/image/avatar1.png",
          rating: 5,
          review: ""
        });
        setImagePreview(null);
        setShowAddForm(false);
      }
    }
  };

  // Delete review
  const handleDeleteReview = (id: number) => {
    const success = AppData.reviews.delete(id);
    if (success) {
      setReviews(AppData.reviews.getAll());
    }
    setDeleteConfirm(null);
  };

  // Start editing
  const startEdit = (review: ReviewItem) => {
    setEditForm({
      name: review.name,
      role: review.role,
      image: review.image,
      rating: review.rating,
      review: review.review
    });
    setEditImagePreview(review.image);
    setEditingReview(review.id);
  };

  // Save edit
  const saveEdit = () => {
    if (editingReview) {
      const updatedReview = AppData.reviews.update(editingReview, editForm);
      if (updatedReview) {
        setReviews(AppData.reviews.getAll());
      }
      setEditingReview(null);
      setEditImagePreview(null);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingReview(null);
    setEditImagePreview(null);
    setEditForm({ name: "", role: "", image: "", rating: 5, review: "" });
  };

  return (
    <div className="pt-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Testimonial Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">Manage customer reviews and testimonials displayed on the website</p>
          </div>
          
          {/* Add Review Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
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
                <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
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
                  {(reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)}
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
                  {reviews.filter(rev => rev.rating === 5).length}
                </p>
                <p className="text-gray-600 font-['Poppins']">5-Star Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Review Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold font-['Poppins'] text-gray-800">Add New Review</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setImagePreview(null);
                  setNewReviewForm({
                    name: "",
                    role: "",
                    image: "/homepage/image/avatar1.png",
                    rating: 5,
                    review: ""
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newReviewForm.name}
                  onChange={(e) => setNewReviewForm({...newReviewForm, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
                <input
                  type="text"
                  value={newReviewForm.role}
                  onChange={(e) => setNewReviewForm({...newReviewForm, role: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                  placeholder="Enter role or title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <div className="flex flex-col gap-3 h-[52px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#76C043] file:text-white hover:file:bg-lime-600"
                  />
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mt-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={newReviewForm.rating}
                  onChange={(e) => setNewReviewForm({...newReviewForm, rating: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent appearance-none bg-white bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
              <textarea
                value={newReviewForm.review}
                onChange={(e) => setNewReviewForm({...newReviewForm, review: e.target.value})}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#76C043] focus:border-transparent"
                placeholder="Enter review content"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddReview}
                className="px-6 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Review
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setImagePreview(null);
                  setNewReviewForm({
                    name: "",
                    role: "",
                    image: "/homepage/image/avatar1.png",
                    rating: 5,
                    review: ""
                  });
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {editingReview === review.id ? (
                /* Edit Form */
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-['Poppins']">Edit Review</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="p-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm"
                      placeholder="Role"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#76C043] file:text-white hover:file:bg-lime-600"
                      />
                      {editImagePreview && (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 mt-2">
                          <Image
                            src={editImagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <select
                      value={editForm.rating}
                      onChange={(e) => setEditForm({...editForm, rating: parseInt(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm appearance-none bg-white bg-no-repeat bg-right pr-8"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25em 1.25em'
                      }}
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                    <textarea
                      value={editForm.review}
                      onChange={(e) => setEditForm({...editForm, review: e.target.value})}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#76C043] focus:border-transparent text-sm"
                      placeholder="Review content"
                    />
                  </div>
                </div>
              ) : (
                /* Review Display */
                <>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={review.image}
                            alt={review.name}
                            fill
                            className="object-cover"
                            onError={(e) => handleImageError(review.image, e)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold font-['Geist'] text-lime-900 truncate">
                            {review.name}
                          </h3>
                          <p className="text-sm text-zinc-500 font-['Poppins'] truncate">
                            {review.role}
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
                        <AiFillStar key={i} className="w-4 h-4 text-emerald-500" />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <AiFillStar key={i + review.rating} className="w-4 h-4 text-gray-200" />
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-neutral-600 font-['Poppins'] leading-6">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold font-['Poppins'] mb-2">Delete Review</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to delete this review? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteReview(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  </div>
  );
}