import { Booking, IBooking } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/backend";
import type {
  CreateBookingData,
  UpdateBookingData,
  BookingQueryOptions,
} from "./booking.types";

class BookingService {
  async create(data: CreateBookingData): Promise<IBooking> {
    await connectToDatabase();

    // The data is now structured in the payload, so we can pass it mostly as-is
    // but we can add some server-side calculated fields if needed.
    const booking = new Booking({
      ...data,
      // Metadata/Internal fields
      status: data.status || "pending",
      payment: {
        ...data.payment,
        status: data.payment?.status || data.payment_status || "pending",
        stripePaymentIntentId:
          data.payment?.stripePaymentIntentId || data.stripe_payment_intent_id,
      },
    });

    const saved = await booking.save();

    // Invalidate list caches
    await clearCachePattern("booking:list:*");

    return saved;
  }

  async getAll(options: BookingQueryOptions = {}): Promise<{
    bookings: IBooking[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if (filters.status) {
      if (filters.status === "rejected") {
        query.status = { $in: ["rejected", "cancelled"] };
      } else {
        query.status = filters.status;
      }
    }
    if (filters.payment_status)
      query["payment.status"] = filters.payment_status;
    if (filters.selectedSport)
      query["selection.sport"] = new RegExp(`^${filters.selectedSport}$`, "i");
    if (filters.email)
      query["travelers.primaryContact.email"] = new RegExp(filters.email, "i");
    if (filters.isBookingComplete !== undefined) {
      if (filters.isBookingComplete) {
        query.status = "completed";
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      query["dates.departure"] = {};
      if (filters.dateFrom) query["dates.departure"].$gte = filters.dateFrom;
      if (filters.dateTo) query["dates.departure"].$lte = filters.dateTo;
    }

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = bookings.length > limit;
    const resultBookings = hasMore ? bookings.slice(0, limit) : bookings;
    const total = await Booking.countDocuments(query);

    return { bookings: resultBookings, total, hasMore };
  }

  async getById(id: string): Promise<IBooking | null> {
    const CACHE_KEY = `booking:${id}`;
    const cached = await getCache<IBooking>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const booking = await Booking.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (booking) {
      await setCache(CACHE_KEY, booking, 300); // 5 mins
    }

    return booking;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    // Permanent delete instead of soft delete
    const result = await Booking.findByIdAndDelete(id);

    if (result) {
      try {
        await deleteCache(`booking:${id}`);
        await clearCachePattern("booking:list:*");
      } catch (error) {
        console.error("Cache clear failed during delete (ignored):", error);
      }
    }

    return !!result;
  }

  async getByEmail(email: string): Promise<IBooking[]> {
    // Cache by email? Maybe unnecessary if frequent real-time check.
    // Let's add short cache.
    const CACHE_KEY = `booking:email:${email}`;
    const cached = await getCache<IBooking[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const bookings = await Booking.find({
      email: new RegExp(`^${email}$`, "i"),
      deletedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    await setCache(CACHE_KEY, bookings, 60); // 1 min short cache

    return bookings;
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<IBooking | null> {
    await connectToDatabase();
    // No cache for polling real-time status? or very short cache?
    // Since polling, direct DB is safer to get latest webhook update.
    const booking = await Booking.findOne({
      "payment.stripePaymentIntentId": paymentIntentId,
      deletedAt: { $exists: false },
    });
    return booking;
  }

  async updateStatus(
    id: string,
    status: string,
    destinationCity?: string,
    assignedMatch?: string,
  ): Promise<IBooking | null> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === "confirmed" && {
          destinationCity,
          assignedMatch,
        }),
      },
      { new: true },
    ).lean();

    if (updated) {
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
    }

    return updated;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
  ): Promise<IBooking | null> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(
      id,
      {
        "payment.status": paymentStatus,
      },
      { new: true },
    );

    if (updated) {
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
    }

    return updated;
  }

  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    rejected: number;
  }> {
    await connectToDatabase();

    const stats = await Booking.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "completed"] },
                    { $eq: ["$status", "approved"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          rejected: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "rejected"] },
                    { $eq: ["$status", "cancelled"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return { total: 0, completed: 0, pending: 0, rejected: 0 };
    }

    const { total, completed, pending, rejected } = stats[0];
    return { total, completed, pending, rejected };
  }
}

export default new BookingService();
