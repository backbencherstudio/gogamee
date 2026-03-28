import mongoose, { Schema, Document } from "mongoose";

export interface IAboutValue {
  id?: string;
  title: string;
  description: string;
  order: number;
}

export interface IAboutPageSection extends Document {
  type: "headline" | "main_section" | "our_value" | "why_choose_us";
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order: number;
  isActive: boolean;
  deletedAt?: Date;
  values?: IAboutValue[]; // Added for compatibility if referenced in types
}

const AboutPageSectionSchema = new Schema<IAboutPageSection>({
  type: { type: String, required: true, enum: ["headline", "main_section", "our_value", "why_choose_us"] },
  title: { type: String, required: true },
  title_es: String,
  description: { type: String, required: true },
  description_es: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  deletedAt: Date,
  values: [Schema.Types.Mixed], // Added for compatibility
}, { timestamps: true });

export default mongoose.models.AboutPageSection || mongoose.model<IAboutPageSection>("AboutPageSection", AboutPageSectionSchema);
