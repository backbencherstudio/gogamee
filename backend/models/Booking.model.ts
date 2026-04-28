import mongoose, { Schema, Document } from "mongoose";

// --- Sub-Schemas ---

const TravelerSchema = new Schema({
  id: String,
  type: { type: String, enum: ["adult", "kid", "baby"], required: true },
  name: String, email: String, phone: String, dateOfBirth: String,
  documentType: { type: String, enum: ["ID", "Passport"] },
  documentNumber: String,
  isPrimary: { type: Boolean, default: false },
  travelerNumber: Number,
}, { _id: false });

const LeagueSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  group: { type: String, enum: ["National", "European"], required: true },
  isSelected: { type: Boolean, default: true },
}, { _id: false });

const FlightSchema = new Schema({
  schedule: { departureBetween: String, returnBetween: String },
  preferences: {
    departureTimeStart: Number, departureTimeEnd: Number,
    arrivalTimeStart: Number, arrivalTimeEnd: Number,
    hasPreferences: { type: Boolean, default: false },
  },
}, { _id: false });

const ExtraSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  isSelected: { type: Boolean, default: false },
  isIncluded: { type: Boolean, default: false },
  currency: { type: String, default: "EUR" },
}, { _id: false });

const PriceBreakdownItemSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: Number, unitPrice: Number,
}, { _id: false });

const PriceBreakdownSchema = new Schema({
  packageCost: { type: Number, required: true },
  extrasCost: { type: Number, default: 0 },
  leagueRemovalCost: { type: Number, default: 0 },
  leagueSurcharge: { type: Number, default: 0 },
  flightPreferenceCost: { type: Number, default: 0 },
  singleTravelerSupplement: { type: Number, default: 0 },
  bookingFee: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  currency: { type: String, default: "EUR" },
  basePricePerPerson: { type: Number, required: true },
  items: [PriceBreakdownItemSchema],
}, { _id: false });

const AppliedCodeSchema = new Schema({
  codeId: String,
  code: String,
  codeKind: { type: String, enum: ["discount", "gift"] },
  discountType: { type: String, enum: ["fixed", "percentage"] },
  value: Number,
  discountAmount: Number,
}, { _id: false });

// --- Interface ---

export interface IBooking extends Document {
  selection: {
    sport: string; package: string; city: string;
    league: "National" | "European";
  };
  dates: { departure: string; return: string; durationDays: number; durationNights: number; };
  travelers: { list: any[]; totalCount: number; primaryContact: any; };
  leagues: { list: any[]; removedCount: number; hasRemovedLeagues: boolean; };
  flight: any;
  extras: { selected: any[]; totalCost: number; };
  payment: {
    method: string; stripePaymentIntentId?: string;
    status: "pending" | "paid" | "failed";
    amount: number; currency: string; timestamp?: Date;
  };
  priceBreakdown: any;
  appliedCode?: any;
  status: "pending" | "confirmed" | "rejected" | "completed";
  destinationCity?: string; assignedMatch?: string;
  previousTravelInfo?: string;
  bookingReference: string;
  totalCost: number;
  createdAt: Date; updatedAt: Date;
}

// --- Main Schema ---

const BookingSchema = new Schema<IBooking>({
  selection: {
    sport: { type: String, required: true },
    package: { type: String, required: true },
    city: { type: String, required: true },
    league: { type: String, enum: ["National", "European"] },
  },
  dates: {
    departure: { type: String, required: true },
    return: { type: String, required: true },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
  },
  travelers: {
    list: [TravelerSchema],
    totalCount: { type: Number, required: true },
    primaryContact: Schema.Types.Mixed,
  },
  leagues: {
    list: [LeagueSchema],
    removedCount: { type: Number, default: 0 },
    hasRemovedLeagues: { type: Boolean, default: false },
  },
  flight: FlightSchema,
  extras: {
    selected: [ExtraSchema],
    totalCost: { type: Number, default: 0 },
  },
  payment: {
    method: String, stripePaymentIntentId: String,
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    timestamp: Date,
  },
  priceBreakdown: PriceBreakdownSchema,
  appliedCode: AppliedCodeSchema,
  status: { type: String, enum: ["pending", "confirmed", "rejected", "completed"], default: "pending", index: true },
  destinationCity: String, assignedMatch: String,
  previousTravelInfo: String,
  bookingReference: { type: String, unique: true },
  totalCost: { type: Number, required: true },
}, { timestamps: true, collection: "bookings" });

// Auto-generate Booking Reference
BookingSchema.pre("save", async function (this: IBooking) {
  if (this.bookingReference) return;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `GG-${dateStr}-`;
  const last = await (this.constructor as any).findOne({ bookingReference: { $regex: `^${prefix}` } }).sort({ bookingReference: -1 });
  const seq = last ? parseInt(last.bookingReference.split("-")[2]) + 1 : 1;
  this.bookingReference = `${prefix}${String(seq).padStart(3, "0")}`;
});

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
