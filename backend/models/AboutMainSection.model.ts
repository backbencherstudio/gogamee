import mongoose, { Schema, Document } from "mongoose";

export interface IAboutMainSection extends Document {
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AboutMainSectionSchema = new Schema<IAboutMainSection>(
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
    collection: "about_main_sections",
  }
);

// Indexes
AboutMainSectionSchema.index({ order: 1, createdAt: 1 });
AboutMainSectionSchema.index({ isActive: 1, deletedAt: 1 });

// Static method to get active sections sorted by order
AboutMainSectionSchema.statics.getActiveSections = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ order: 1, createdAt: 1 });
};

export default mongoose.models.AboutMainSection ||
  mongoose.model<IAboutMainSection>("AboutMainSection", AboutMainSectionSchema);
