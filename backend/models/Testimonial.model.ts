import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  role: string;
  role_es?: string;
  image: string;
  rating: number;
  review: string;
  review_es?: string;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  verified: boolean;
  source?: string; // e.g., "booking", "manual", "import"
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role_es: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    review_es: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["booking", "manual", "import", "api"],
      default: "manual",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "testimonials",
  },
);

// Indexes for better query performance
TestimonialSchema.index({ deletedAt: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ createdAt: -1 });
TestimonialSchema.index({ isActive: 1, featured: -1, sortOrder: 1 });
TestimonialSchema.index({ verified: 1 });

// Virtual for display rating (formatted)
TestimonialSchema.virtual("displayRating").get(function () {
  return "⭐".repeat(this.rating);
});

// Virtual for truncated review
TestimonialSchema.virtual("shortReview").get(function () {
  return this.review.length > 150
    ? this.review.substring(0, 150) + "..."
    : this.review;
});

// Instance method to toggle featured status
TestimonialSchema.methods.toggleFeatured = function (this: ITestimonial) {
  this.featured = !this.featured;
  return this.save();
};

// Instance method to soft delete
TestimonialSchema.methods.softDelete = function (this: ITestimonial) {
  this.deletedAt = new Date();
  return this.save();
};

// Instance method to restore from soft delete
TestimonialSchema.methods.restore = function (this: ITestimonial) {
  this.deletedAt = undefined;
  return this.save();
};

// Static method to find active testimonials
TestimonialSchema.statics.findActive = function (
  options: {
    limit?: number;
    featured?: boolean;
    minRating?: number;
  } = {},
) {
  const query: any = { deletedAt: { $exists: false }, isActive: true };

  if (options.featured !== undefined) {
    query.featured = options.featured;
  }

  if (options.minRating) {
    query.rating = { $gte: options.minRating };
  }

  const q = this.find(query).sort({
    featured: -1,
    sortOrder: 1,
    createdAt: -1,
  });

  if (options.limit) {
    q.limit(options.limit);
  }

  return q;
};

// Static method to get rating statistics
TestimonialSchema.statics.getRatingStats = function () {
  return this.aggregate([
    { $match: { deletedAt: { $exists: false }, isActive: true } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// Pre-save middleware for validation
TestimonialSchema.pre("save", async function () {
  if (this.isModified("review") && this.review.length > 1000) {
    throw new Error("Review cannot exceed 1000 characters");
  }
});

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
