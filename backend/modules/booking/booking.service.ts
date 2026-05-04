import { Booking, IBooking } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";
import type { CreateBookingData, BookingQueryOptions } from "./booking.types";

class BookingService {
  private async clearBookingCache(id?: string) {
    if (id) await deleteCache(`booking:${id}`);
    await clearCachePattern("booking:list:*");
  }

  private mapToLean(booking: any) {
    if (!booking) return null;
    const obj = booking.toObject ? booking.toObject() : booking;
    const { __v, _id, ...rest } = obj;
    const idStr = _id.toString();
    return { id: idStr, _id: idStr, ...rest };
  }

  async create(data: CreateBookingData): Promise<any> {
    await connectToDatabase();
    const booking = new Booking({
      ...data,
      status: data.status || "pending",
      payment: {
        ...data.payment,
        status: data.payment?.status || "pending",
      }
    });
    const saved = await booking.save();
    await this.clearBookingCache();
    return this.mapToLean(saved);
  }

  async getAll(options: BookingQueryOptions = {}): Promise<any> {
    await connectToDatabase();
    const { filters = {}, sort, limit = 50, skip = 0 } = options;
    const query: any = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status === "rejected" ? { $in: ["rejected", "cancelled"] } : filters.status;
    if (filters.payment_status) query["payment.status"] = filters.payment_status;
    if (filters.selectedSport) query["selection.sport"] = new RegExp(`^${filters.selectedSport}$`, "i");
    if (filters.email) query["travelers.primaryContact.email"] = new RegExp(filters.email, "i");
    if (filters.league) {
      if (filters.league.toLowerCase() === "national") {
        query["selection.league"] = "National";
      } else if (filters.league.toLowerCase() === "european") {
        query["selection.league"] = "European";
      } else if (filters.league.toLowerCase() === "spain") {
        query["selection.league"] = "Spain";
      }
    }

    // Search functionality
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { bookingReference: searchRegex },
        { "travelers.primaryContact.name": searchRegex },
        { "travelers.primaryContact.email": searchRegex },
        { "travelers.list.name": searchRegex },
        { "travelers.list.email": searchRegex },
        { "selection.city": searchRegex },
        { "selection.league": searchRegex },
      ];
    }

    // Departure Date Filtering
    if (filters.dateFrom || filters.dateTo) {
      query["dates.departure"] = {};
      if (filters.dateFrom) query["dates.departure"].$gte = filters.dateFrom;
      if (filters.dateTo) query["dates.departure"].$lte = filters.dateTo;
    }

    // Creation Date Filtering (for '7days', '30days' logic)
    if (filters.createdAtFrom || filters.createdAtTo) {
      query.createdAt = {};
      if (filters.createdAtFrom) query.createdAt.$gte = new Date(filters.createdAtFrom);
      if (filters.createdAtTo) query.createdAt.$lte = new Date(filters.createdAtTo);
    }

    const sortOptions: any = sort ? { [sort.field]: sort.order === "desc" ? -1 : 1 } : { createdAt: -1 };
    const bookings = await Booking.find(query).sort(sortOptions).limit(limit).skip(skip).lean();
    const total = await Booking.countDocuments(query);

    return { 
      bookings: bookings.map(b => this.mapToLean(b)), 
      total, 
      hasMore: total > skip + limit 
    };
  }

  async getById(id: string): Promise<any> {
    const CACHE_KEY = `booking:${id}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const booking = await Booking.findOne({ _id: id, deletedAt: { $exists: false } }).lean();
    if (booking) {
      const lean = this.mapToLean(booking);
      await setCache(CACHE_KEY, lean, 300);
      return lean;
    }
    return null;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Booking.findByIdAndDelete(id);
    if (result) await this.clearBookingCache(id);
    return !!result;
  }

  async findByPaymentIntentId(id: string): Promise<any> {
    await connectToDatabase();
    const booking = await Booking.findOne({ "payment.stripePaymentIntentId": id, deletedAt: { $exists: false } }).lean();
    return this.mapToLean(booking);
  }

  async updateStatus(id: string, status: string, destinationCity?: string, assignedMatch?: string): Promise<any> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(
      id,
      { status, ...(destinationCity !== undefined && { destinationCity }), ...(assignedMatch !== undefined && { assignedMatch }) },
      { new: true, runValidators: true }
    );
    if (updated) await this.clearBookingCache(id);
    return this.mapToLean(updated);
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<any> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(id, { "payment.status": paymentStatus }, { new: true });
    if (updated) await this.clearBookingCache(id);
    return this.mapToLean(updated);
  }

  async updateById(id: string, updateData: any): Promise<any> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (updated) await this.clearBookingCache(id);
    return this.mapToLean(updated);
  }

  async getStats(): Promise<any> {
    await connectToDatabase();
    const stats = await Booking.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $or: [{ $eq: ["$status", "rejected"] }, { $eq: ["$status", "cancelled"] }] }, 1, 0] } },
          // League breakdown
          national: { $sum: { $cond: [{ $eq: ["$selection.league", "National"] }, 1, 0] } },
          european: { $sum: { $cond: [{ $eq: ["$selection.league", "European"] }, 1, 0] } },
          spain: { $sum: { $cond: [{ $eq: ["$selection.league", "Spain"] }, 1, 0] } },
      }}
    ]);
    return stats[0] || { total: 0, completed: 0, pending: 0, rejected: 0, confirmed: 0 };
  }
}

export default new BookingService();
