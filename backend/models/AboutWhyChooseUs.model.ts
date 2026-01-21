import mongoose, { Schema, Document } from "mongoose";

export interface IAboutWhyChooseUs extends Document {
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AboutWhyChooseUsSchema = new Schema<IAboutWhyChooseUs>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "about_why_choose_us",
  }
);

// Indexes
AboutWhyChooseUsSchema.index({ order: 1, createdAt: 1 });
AboutWhyChooseUsSchema.index({ isActive: 1, deletedAt: 1 });

// Static method to get active items sorted by order
AboutWhyChooseUsSchema.statics.getActiveItems = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ order: 1, createdAt: 1 });
};

export default mongoose.models.AboutWhyChooseUs ||
  mongoose.model<IAboutWhyChooseUs>("AboutWhyChooseUs", AboutWhyChooseUsSchema);
