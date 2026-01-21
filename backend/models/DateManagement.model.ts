import mongoose, { Schema, Document } from "mongoose";

export type DateDuration = "1" | "2" | "3" | "4" | "5";

export interface IDateManagement extends Document {
  date: string;
  status: string;
  sportname: string;
  league: string;
  package?: string;
  football_standard_package_price: number;
  football_premium_package_price: number;
  baskatball_standard_package_price: number;
  baskatball_premium_package_price: number;
  updated_football_standard_package_price?: number;
  updated_football_premium_package_price?: number;
  updated_baskatball_standard_package_price?: number;
  updated_baskatball_premium_package_price?: number;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status: string;
  duration: DateDuration;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const DateManagementSchema = new Schema<IDateManagement>(
  {
    date: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["enabled", "disabled", "blocked"],
      default: "enabled",
      index: true,
    },
    sportname: {
      type: String,
      required: true,
      default: "football",
      index: true,
    },
    league: {
      type: String,
      required: true,
      default: "national",
    },
    package: {
      type: String,
    },
    football_standard_package_price: {
      type: Number,
      required: true,
      min: 0,
    },
    football_premium_package_price: {
      type: Number,
      required: true,
      min: 0,
    },
    baskatball_standard_package_price: {
      type: Number,
      required: true,
      min: 0,
    },
    baskatball_premium_package_price: {
      type: Number,
      required: true,
      min: 0,
    },
    updated_football_standard_package_price: {
      type: Number,
      min: 0,
    },
    updated_football_premium_package_price: {
      type: Number,
      min: 0,
    },
    updated_baskatball_standard_package_price: {
      type: Number,
      min: 0,
    },
    updated_baskatball_premium_package_price: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    destinationCity: {
      type: String,
      trim: true,
    },
    assignedMatch: {
      type: String,
      trim: true,
    },
    approve_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    duration: {
      type: String,
      enum: ["1", "2", "3", "4", "5"],
      default: "1",
      required: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "date_management",
  }
);

// Indexes
DateManagementSchema.index({ date: 1, sportname: 1 });
DateManagementSchema.index({ status: 1, date: 1 });
DateManagementSchema.index({ deletedAt: 1 });

// Static method to find dates by range
DateManagementSchema.statics.findByDateRange = function (
  startDate: string,
  endDate: string,
  filters?: { sportname?: string; status?: string }
) {
  const query: any = {
    date: { $gte: startDate, $lte: endDate },
    deletedAt: { $exists: false },
  };

  if (filters?.sportname) {
    query.sportname = filters.sportname;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  return this.find(query).sort({ date: 1 });
};

// Static method to check if date is available
DateManagementSchema.statics.isDateAvailable = async function (
  date: string,
  sportname?: string
) {
  const query: any = {
    date,
    status: "enabled",
    deletedAt: { $exists: false },
  };

  if (sportname) {
    query.sportname = sportname;
  }

  const count = await this.countDocuments(query);
  return count > 0;
};

export default mongoose.models.DateManagement ||
  mongoose.model<IDateManagement>("DateManagement", DateManagementSchema);
