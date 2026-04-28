import mongoose, { Schema, Document } from "mongoose";

export type CodeKind = "discount" | "gift";
export type DiscountType = "fixed" | "percentage";
export type UsageLimit = "single" | "multiple" | "unlimited";
export type CodePaymentStatus = "none" | "pending" | "paid" | "failed";
export type CodeState = "active" | "suspended" | "banned";

export interface ICodeUsageLog {
  usedAt: Date;
  amount: number;
  source: "booking" | "manual";
  bookingId?: string;
  bookingReference?: string;
  note?: string;
}

export interface ICode extends Document {
  code: string;
  name: string;
  codeKind: CodeKind;
  discountType: DiscountType;
  value: number;
  initialAmount?: number;
  remainingAmount?: number;
  usageLimit: UsageLimit;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  state: CodeState;
  paymentStatus: CodePaymentStatus;
  stripePaymentIntentId?: string;
  recipientName?: string;
  recipientEmail?: string;
  buyerName?: string;
  buyerEmail?: string;
  dedication?: string;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageLogs?: ICodeUsageLog[];
  createdAt: Date;
  updatedAt: Date;
}

const CodeUsageLogSchema = new Schema<ICodeUsageLog>(
  {
    usedAt: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    source: { type: String, enum: ["booking", "manual"], default: "booking" },
    bookingId: String,
    bookingReference: String,
    note: String,
  },
  { _id: false },
);

const CodeSchema = new Schema<ICode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    codeKind: {
      type: String,
      enum: ["discount", "gift"],
      default: "discount",
      index: true,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    initialAmount: { type: Number, min: 0 },
    remainingAmount: { type: Number, min: 0 },
    usageLimit: {
      type: String,
      enum: ["single", "multiple", "unlimited"],
      default: "single",
    },
    maxUses: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    state: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "paid", "failed"],
      default: "none",
      index: true,
    },
    stripePaymentIntentId: String,
    recipientName: String,
    recipientEmail: String,
    buyerName: String,
    buyerEmail: String,
    dedication: String,
    expiresAt: Date,
    lastUsedAt: Date,
    usageLogs: { type: [CodeUsageLogSchema], default: [] },
  },
  { timestamps: true, collection: "codes" },
);

CodeSchema.pre("validate", function (this: ICode) {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }

  if (this.codeKind === "gift") {
    this.discountType = "fixed";
    this.initialAmount = this.initialAmount ?? this.value;
    this.remainingAmount = this.remainingAmount ?? this.value;
    this.usageLimit = this.usageLimit || "multiple";
  }

  if (this.usageLimit === "single") {
    this.maxUses = 1;
  }

  if (this.state === "active") {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
});

export default mongoose.models.Code ||
  mongoose.model<ICode>("Code", CodeSchema);
