import mongoose, { Schema, Document } from "mongoose";

export interface ITraveler {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
  isPrimary?: boolean;
  travelerNumber?: number;
}

export interface IBookingExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  isSelected: boolean;
  quantity: number;
  maxQuantity?: number;
  isIncluded?: boolean;
  currency: string;
}

export interface IBooking extends Document {
  status: string;
  payment_status: string;
  stripe_payment_intent_id?: string;
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague: string;
  adults: number;
  kids: number;
  babies: number;
  totalPeople: number;
  departureDate: string;
  returnDate: string;
  departureDateFormatted: string;
  returnDateFormatted: string;
  departureTimeStart: number;
  departureTimeEnd: number;
  arrivalTimeStart: number;
  arrivalTimeEnd: number;
  departureTimeRange: string;
  arrivalTimeRange: string;
  removedLeagues: any; // Can be string or object
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  bookingTimestamp?: string;
  bookingDate: string;
  bookingTime: string;
  isBookingComplete: boolean;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
  destinationCity?: string;
  assignedMatch?: string;
  previousTravelInfo?: string;
  totalCost: number | string;
  approve_status?: string;
  bookingExtras?: IBookingExtra[];
  allTravelers?: ITraveler[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const TravelerSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    dateOfBirth: { type: String },
    documentType: { type: String },
    documentNumber: { type: String },
    isPrimary: { type: Boolean },
    travelerNumber: { type: Number },
  },
  { _id: false }
);

const BookingExtraSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    icon: { type: String, required: true },
    isSelected: { type: Boolean, required: true },
    quantity: { type: Number, required: true, min: 0 },
    maxQuantity: { type: Number },
    isIncluded: { type: Boolean },
    currency: { type: String, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    status: { type: String, required: true },
    payment_status: { type: String, required: true },
    stripe_payment_intent_id: { type: String },
    selectedSport: { type: String, required: true },
    selectedPackage: { type: String, required: true },
    selectedCity: { type: String, required: true },
    selectedLeague: { type: String, required: true },
    adults: { type: Number, required: true, min: 0 },
    kids: { type: Number, required: true, min: 0 },
    babies: { type: Number, required: true, min: 0 },
    totalPeople: { type: Number, required: true, min: 0 },
    departureDate: { type: String, required: true },
    returnDate: { type: String, required: true },
    departureDateFormatted: { type: String, required: true },
    returnDateFormatted: { type: String, required: true },
    departureTimeStart: { type: Number, required: true },
    departureTimeEnd: { type: Number, required: true },
    arrivalTimeStart: { type: Number, required: true },
    arrivalTimeEnd: { type: Number, required: true },
    departureTimeRange: { type: String, required: true },
    arrivalTimeRange: { type: String, required: true },
    removedLeagues: { type: Schema.Types.Mixed },
    removedLeaguesCount: { type: Number, required: true, min: 0 },
    hasRemovedLeagues: { type: Boolean, required: true },
    totalExtrasCost: { type: Number, required: true },
    extrasCount: { type: Number, required: true, min: 0 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String },
    cardNumber: { type: String },
    expiryDate: { type: String },
    cvv: { type: String },
    cardholderName: { type: String },
    bookingTimestamp: { type: String },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    isBookingComplete: { type: Boolean, required: true },
    travelDuration: { type: Number, required: true, min: 0 },
    hasFlightPreferences: { type: Boolean, required: true },
    requiresEuropeanLeagueHandling: { type: Boolean, required: true },
    destinationCity: { type: String },
    assignedMatch: { type: String },
    previousTravelInfo: { type: String },
    totalCost: { type: Schema.Types.Mixed, required: true }, // Can be number or string
    approve_status: { type: String },
    bookingExtras: [BookingExtraSchema],
    allTravelers: [TravelerSchema],
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

// Indexes for better query performance
BookingSchema.index({ email: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingDate: -1 });
BookingSchema.index({ selectedSport: 1 });
BookingSchema.index({ deletedAt: 1 });
BookingSchema.index({ stripe_payment_intent_id: 1 });
BookingSchema.index({ isBookingComplete: 1 });
BookingSchema.index({ payment_status: 1 });

// Virtual for total cost as number (if it's stored as string)
BookingSchema.virtual("totalCostNumeric").get(function () {
  return typeof this.totalCost === "string"
    ? parseFloat(this.totalCost)
    : this.totalCost;
});

// Virtual for booking duration in days
BookingSchema.virtual("bookingDurationDays").get(function () {
  const start = new Date(this.departureDate);
  const end = new Date(this.returnDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to calculate total revenue from extras
BookingSchema.methods.calculateExtrasRevenue = function (this: IBooking) {
  if (!this.bookingExtras) return 0;

  return this.bookingExtras
    .filter((extra) => extra.isSelected)
    .reduce((total, extra) => total + extra.price * extra.quantity, 0);
};

// Instance method to get booking summary
BookingSchema.methods.getSummary = function (this: IBooking) {
  return {
    id: this._id,
    customer: `${this.firstName} ${this.lastName}`,
    email: this.email,
    sport: this.selectedSport,
    package: this.selectedPackage,
    city: this.selectedCity,
    dates: `${this.departureDateFormatted} - ${this.returnDateFormatted}`,
    people: this.totalPeople,
    status: this.status,
    totalCost: this.totalCost,
    paymentStatus: this.payment_status,
    isComplete: this.isBookingComplete,
  };
};

// Static method to find bookings by date range
BookingSchema.statics.findByDateRange = function (
  startDate: string,
  endDate: string
) {
  return this.find({
    departureDate: { $gte: startDate, $lte: endDate },
    deletedAt: { $exists: false },
  }).sort({ departureDate: 1 });
};

// Static method to get booking statistics
BookingSchema.statics.getStats = function () {
  return this.aggregate([
    { $match: { deletedAt: { $exists: false } } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: ["$isBookingComplete", 1, 0] },
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$payment_status", "paid"] },
              { $toDouble: "$totalCost" },
              0,
            ],
          },
        },
        averageBookingValue: { $avg: { $toDouble: "$totalCost" } },
      },
    },
  ]);
};

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
