import mongoose, { Schema, Document } from "mongoose";

const SportConfigSchema = new Schema({
  status: { type: String, enum: ["enabled", "disabled"], default: "enabled" },
  standard: { type: Number, default: 0 },
  premium: { type: Number, default: 0 },
}, { _id: false });

export interface IDateManagement extends Document {
  date: string;
  duration: "1" | "2" | "3" | "4";
  league: "national" | "european" | "spain";
  sports: {
    football: { status: string; standard: number; premium: number };
    basketball: { status: string; standard: number; premium: number };
    combined: { status: string; standard: number; premium: number };
  };
  isActive: boolean;
  deletedAt?: Date;
}

const DateManagementSchema = new Schema<IDateManagement>({
  date: { type: String, required: true, index: true },
  duration: { type: String, enum: ["1", "2", "3", "4"], required: true },
  league: { type: String, enum: ["national", "european", "spain"], required: true },
  sports: {
    football: { type: SportConfigSchema, default: () => ({}) },
    basketball: { type: SportConfigSchema, default: () => ({}) },
    combined: { type: SportConfigSchema, default: () => ({}) },
  },
  isActive: { type: Boolean, default: true },
  deletedAt: Date,
}, { timestamps: true });

DateManagementSchema.index({ date: 1, duration: 1, league: 1 }, { unique: true });

export default mongoose.models.DateManagement || mongoose.model<IDateManagement>("DateManagement", DateManagementSchema);
