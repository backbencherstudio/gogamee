import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "booking" | "gift_card";
export type TransactionStatus = "pending" | "paid" | "failed";

export interface ITransaction extends Document {
  transactionType: TransactionType;
  referenceId: string;
  referenceLabel?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider: "stripe";
  stripePaymentIntentId?: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionType: {
      type: String,
      enum: ["booking", "gift_card"],
      required: true,
      index: true,
    },
    referenceId: { type: String, required: true, index: true },
    referenceLabel: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "eur" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    provider: { type: String, enum: ["stripe"], default: "stripe" },
    stripePaymentIntentId: { type: String, index: true },
    customerName: String,
    customerEmail: String,
    description: String,
    metadata: Schema.Types.Mixed,
    paidAt: Date,
  },
  { timestamps: true, collection: "transactions" },
);

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
