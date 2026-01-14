import mongoose, { Schema, Document } from "mongoose";

export interface IAboutOurValues extends Document {
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AboutOurValuesSchema = new Schema<IAboutOurValues>(
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
    collection: "about_our_values",
  }
);

// Indexes
AboutOurValuesSchema.index({ order: 1, createdAt: 1 });
AboutOurValuesSchema.index({ isActive: 1, deletedAt: 1 });

// Static method to get active values sorted by order
AboutOurValuesSchema.statics.getActiveValues = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ order: 1, createdAt: 1 });
};

export default mongoose.models.AboutOurValues ||
  mongoose.model<IAboutOurValues>("AboutOurValues", AboutOurValuesSchema);
