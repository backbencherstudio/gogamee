import { Booking, IBooking } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreateBookingData,
  UpdateBookingData,
  BookingFilters,
  BookingQueryOptions,
} from "./booking.types";

class BookingService {
  async create(data: CreateBookingData): Promise<IBooking> {
    await connectToDatabase();

    const totalPeople = data.adults + data.kids + data.babies;

    const bookingData = {
      ...data,
      totalPeople,
      fullName: `${data.firstName} ${data.lastName}`,
      bookingDate: new Date().toISOString().split("T")[0],
      bookingTime: new Date().toTimeString().split(" ")[0],
      travelDuration: this.calculateTravelDuration(
        data.departureDate,
        data.returnDate
      ),
      hasFlightPreferences: false,
      requiresEuropeanLeagueHandling: false,
    };

    const booking = new Booking(bookingData);
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

    if (filters.status) query.status = filters.status;
    if (filters.payment_status) query.payment_status = filters.payment_status;
    if (filters.selectedSport)
      query.selectedSport = new RegExp(`^${filters.selectedSport}$`, "i");
    if (filters.email) query.email = new RegExp(filters.email, "i");
    if (filters.isBookingComplete !== undefined)
      query.isBookingComplete = filters.isBookingComplete;
    if (filters.dateFrom || filters.dateTo) {
      query.departureDate = {};
      if (filters.dateFrom) query.departureDate.$gte = filters.dateFrom;
      if (filters.dateTo) query.departureDate.$lte = filters.dateTo;
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

  async updateById(
    id: string,
    data: UpdateBookingData
  ): Promise<IBooking | null> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      // Invalidate specific cache and list caches
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
    }

    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Booking.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
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

  async updateStatus(id: string, status: string): Promise<IBooking | null> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (updated) {
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
    }

    return updated;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string
  ): Promise<IBooking | null> {
    await connectToDatabase();
    const updated = await Booking.findByIdAndUpdate(
      id,
      {
        payment_status: paymentStatus,
        isBookingComplete: paymentStatus === "paid",
      },
      { new: true }
    );

    if (updated) {
      await deleteCache(`booking:${id}`);
      await clearCachePattern("booking:list:*");
    }

    return updated;
  }

  private calculateTravelDuration(
    departureDate: string,
    returnDate: string
  ): number {
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default new BookingService();
