import mongoose, { Schema, Document } from "mongoose";

export interface IAboutValue {
  title: string;
  description: string;
  order: number;
  _id?: string;
}

export interface IAboutSection extends Document {
  type: "headline" | "main_section" | "our_values" | "why_choose_us";
  title: string;
  description: string;
  values: IAboutValue[]; // For "our_values" or "why_choose_us"
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AboutValueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const AboutSectionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["headline", "main_section", "our_values", "why_choose_us"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" }, // Made optional as per previous fix
    values: [AboutValueSchema],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "about_page_sections",
  },
);

export const AboutPageSection =
  mongoose.models.AboutPageSection ||
  mongoose.model<IAboutSection>("AboutPageSection", AboutSectionSchema);
