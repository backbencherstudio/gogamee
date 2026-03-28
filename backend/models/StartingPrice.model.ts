import mongoose, { Schema, Document } from "mongoose";

const DurationPriceSchema = new Schema({
  standard: { type: Number, required: true },
  premium: { type: Number, required: true },
}, { _id: false });

export interface IStartingPrice extends Document {
  type: "football" | "basketball";
  pricesByDuration: {
    "1": { standard: number; premium: number };
    "2": { standard: number; premium: number };
    "3": { standard: number; premium: number };
    "4": { standard: number; premium: number };
  };
  isActive: boolean;
}

const StartingPriceSchema = new Schema<IStartingPrice>({
  type: { type: String, enum: ["football", "basketball"], required: true, unique: true },
  pricesByDuration: {
    "1": { type: DurationPriceSchema, required: true },
    "2": { type: DurationPriceSchema, required: true },
    "3": { type: DurationPriceSchema, required: true },
    "4": { type: DurationPriceSchema, required: true },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.StartingPrice || mongoose.model<IStartingPrice>("StartingPrice", StartingPriceSchema);
