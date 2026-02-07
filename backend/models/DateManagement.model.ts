import mongoose, { Schema, Document } from "mongoose";

export type DateDuration = "1" | "2" | "3" | "4" | "5";

export interface IPriceStructure {
  status: "enabled" | "disabled";
  standard?: number;
  premium?: number;
}

export interface IDateManagement extends Document {
  date: string;
  duration: DateDuration;
  league: string;
  sports: {
    football: IPriceStructure;
    basketball: IPriceStructure;
    combined: IPriceStructure;
  };

  createdAt: Date;
  updatedAt: Date;
}

const PriceStructureSchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["enabled", "disabled"],
      default: "disabled",
      index: true,
    },
    standard: { type: Number, default: 0, min: 0, required: false },
    premium: { type: Number, default: 0, min: 0, required: false },
  },
  { _id: false },
);

const DateManagementSchema = new Schema<IDateManagement>(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    duration: {
      type: String,
      enum: ["1", "2", "3", "4", "5"],
      default: "1",
      required: true,
      index: true,
    },
    sports: {
      football: {
        type: PriceStructureSchema,
        default: () => ({ standard: 0, premium: 0 }),
      },
      basketball: {
        type: PriceStructureSchema,
        default: () => ({ standard: 0, premium: 0 }),
      },
      combined: {
        type: PriceStructureSchema,
        default: () => ({ standard: 0, premium: 0 }),
      },
    },

    league: {
      type: String,
      default: "national",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "date_management",
  },
);

// Indexes
DateManagementSchema.index({ date: 1, status: 1 });
DateManagementSchema.index({ deletedAt: 1 });

export default mongoose.models.DateManagement ||
  mongoose.model<IDateManagement>("DateManagement", DateManagementSchema);
