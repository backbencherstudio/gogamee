import mongoose, { Schema, Document } from "mongoose";

// --- Sub-Schemas for Professional Structure ---

const TravelerSchema = new Schema(
  {
    id: { type: String }, // Frontend ID reference
    type: { type: String, enum: ["adult", "kid", "baby"], required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    dateOfBirth: { type: String },
    documentType: { type: String, enum: ["ID", "Passport"] },
    documentNumber: { type: String },
    isPrimary: { type: Boolean, default: false },
    travelerNumber: { type: Number },
  },
  { _id: false },
);

const LeagueSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    group: { type: String, enum: ["National", "European"], required: true },
    isSelected: { type: Boolean, default: true },
  },
  { _id: false },
);

const FlightSchema = new Schema(
  {
    schedule: {
      departureBetween: { type: String }, // e.g., "06:00 - 14:00"
      returnBetween: { type: String },
    },
    preferences: {
      departureTimeStart: { type: Number },
      departureTimeEnd: { type: Number },
      arrivalTimeStart: { type: Number },
      arrivalTimeEnd: { type: Number },
      hasPreferences: { type: Boolean, default: false },
    },
  },
  { _id: false },
);

const ExtraSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    isSelected: { type: Boolean, default: false },
    isIncluded: { type: Boolean, default: false },
    currency: { type: String, default: "EUR" },
    isGroupOption: { type: Boolean, default: false },
  },
  { _id: false },
);

const PaymentDetailsSchema = new Schema(
  {
    method: { type: String }, // credit, google, apple
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    timestamp: { type: Date },
  },
  { _id: false },
);

const PriceBreakdownItemSchema = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number },
    unitPrice: { type: Number },
  },
  { _id: false },
);

const PriceBreakdownSchema = new Schema(
  {
    packageCost: { type: Number, required: true },
    extrasCost: { type: Number, default: 0 },
    leagueRemovalCost: { type: Number, default: 0 },
    leagueSurcharge: { type: Number, default: 0 },
    flightPreferenceCost: { type: Number, default: 0 },
    singleTravelerSupplement: { type: Number, default: 0 },
    bookingFee: { type: Number, default: 0 },
    totalBaseCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    basePricePerPerson: { type: Number, required: true },
    items: [PriceBreakdownItemSchema],
  },
  { _id: false },
);

// --- Main Booking Interface ---

export interface IBooking extends Document {
  // 1. Selection Core
  selection: {
    sport: "football" | "basketball" | "both";
    package: "standard" | "premium" | "combined";
    city: string;
  };

  // 2. Dates
  dates: {
    departure: string; // ISO or YYYY-MM-DD
    return: string;
    durationDays: number;
    durationNights: number;
  };

  // 3. Travelers (The new requested array structure)
  travelers: {
    adults: any[];
    kids: any[];
    babies: any[];
    all: any[]; // Flat list for easy access
    totalCount: number;
    primaryContact: any; // Snapshot of primary contact
  };

  // 4. Leagues
  leagues: {
    list: any[]; // Full list with selection status
    removedCount: number;
    hasRemovedLeagues: boolean;
  };

  // 5. Flight
  flight: {
    schedule: { departureBetween: string; returnBetween: string };
    preferences: any;
  };

  // 6. Extras
  extras: {
    selected: any[];
    totalCost: number;
  };

  // 7. Payment & Status
  payment: {
    method: string;
    stripePaymentIntentId?: string;
    status: string;
    amount: number;
    currency: string;
    timestamp?: Date;
  };

  priceBreakdown: {
    packageCost: number;
    extrasCost: number;
    leagueRemovalCost: number;
    leagueSurcharge: number;
    flightPreferenceCost: number;
    singleTravelerSupplement: number;
    bookingFee: number;
    totalBaseCost: number;
    totalCost: number;
    currency: string;
    basePricePerPerson: number;
    items: {
      description: string;
      amount: number;
      quantity?: number;
      unitPrice?: number;
    }[];
  };

  status: "pending" | "confirmed" | "cancelled" | "completed";
  destinationCity?: string;
  assignedMatch?: string;
  bookingReference: string; // Short unique ID for users
  totalCost: number; // Storing total cost at root for easy query

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// --- Main Schema ---

const BookingSchema = new Schema<IBooking>(
  {
    // 1. Core Selection
    selection: {
      sport: { type: String, required: true },
      package: { type: String, required: true },
      city: { type: String, required: true },
    },

    // 2. Dates
    dates: {
      departure: { type: String, required: true },
      return: { type: String, required: true },
      durationDays: { type: Number, required: true },
      durationNights: { type: Number, required: true },
    },

    // 3. Travelers
    travelers: {
      adults: [TravelerSchema],
      kids: [TravelerSchema],
      babies: [TravelerSchema],
      all: [TravelerSchema], // Aggregated list populated pre-save
      totalCount: { type: Number, required: true },
      primaryContact: { type: Schema.Types.Mixed }, // Snapshot
    },

    // 4. Leagues
    leagues: {
      list: [LeagueSchema],
      removedCount: { type: Number, default: 0 },
      hasRemovedLeagues: { type: Boolean, default: false },
    },

    // 5. Flight
    flight: FlightSchema,

    // 6. Extras
    extras: {
      selected: [ExtraSchema],
      totalCost: { type: Number, default: 0 },
    },

    // 7. Payment
    payment: PaymentDetailsSchema,

    // 8. Price Breakdown
    priceBreakdown: PriceBreakdownSchema,

    // Meta
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    destinationCity: { type: String }, // For reveal
    assignedMatch: { type: String }, // For reveal
    bookingReference: { type: String, unique: true }, // generated pre-save
    totalCost: { type: Number, required: true },
    deletedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    collection: "bookings",
  },
);

// Indexes
BookingSchema.index({ "payment.stripePaymentIntentId": 1 });
BookingSchema.index({ "travelers.all.email": 1 });
BookingSchema.index({ createdAt: -1 });

// Generate Short Booking Reference (e.g., GG-123456)
BookingSchema.pre("save", async function (this: IBooking) {
  if (!this.bookingReference) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.bookingReference = `GG-${random}`;
  }
  // Populate 'all' travelers flat list for easy querying
  const all: any[] = [];
  if (this.travelers.adults) all.push(...this.travelers.adults);
  if (this.travelers.kids) all.push(...this.travelers.kids);
  if (this.travelers.babies) all.push(...this.travelers.babies);
  this.travelers.all = all;
});

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
