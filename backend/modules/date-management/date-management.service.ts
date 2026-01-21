import { DateManagement, IDateManagement } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/backend";
import type {
  CreateDateManagementData,
  UpdateDateManagementData,
  DateManagementFilters,
} from "./date-management.types";

class DateManagementService {
  async create(data: CreateDateManagementData): Promise<IDateManagement> {
    await connectToDatabase();
    const dateEntry = new DateManagement(data);
    const saved = await dateEntry.save();

    await clearCachePattern("date-management:*");

    return saved;
  }

  async getAll(
    filters: DateManagementFilters = {},
  ): Promise<IDateManagement[]> {
    await connectToDatabase();

    const query: any = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.sportname) query.sportname = filters.sportname;
    if (filters.approve_status) query.approve_status = filters.approve_status;

    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) query.date.$gte = filters.dateFrom;
      if (filters.dateTo) query.date.$lte = filters.dateTo;
    }

    return await DateManagement.find(query).sort({ date: 1 });
  }

  async getById(id: string): Promise<IDateManagement | null> {
    const CACHE_KEY = `date-management:${id}`;
    const cached = await getCache<IDateManagement>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const dateEntry = await DateManagement.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (dateEntry) {
      await setCache(CACHE_KEY, dateEntry, 600);
    }

    return dateEntry;
  }

  async getByDate(
    date: string,
    sportname?: string,
  ): Promise<IDateManagement | null> {
    const CACHE_KEY = `date-management:date:${date}:${sportname || "all"}`;
    const cached = await getCache<IDateManagement>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const query: any = { date, deletedAt: { $exists: false } };

    if (sportname) query.sportname = sportname;

    const result = await DateManagement.findOne(query);

    if (result) {
      await setCache(CACHE_KEY, result, 600);
    }

    return result;
  }

  async updateById(
    id: string,
    data: UpdateDateManagementData,
  ): Promise<IDateManagement | null> {
    await connectToDatabase();
    const updated = await DateManagement.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`date-management:${id}`);
      await clearCachePattern("date-management:date:*");
      await clearCachePattern("date-management:list:*");
      await clearCachePattern("date-management:range:*");
    }

    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await DateManagement.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`date-management:${id}`);
      await clearCachePattern("date-management:*");
    }

    return !!result;
  }

  async isDateAvailable(date: string, sportname?: string): Promise<boolean> {
    const CACHE_KEY = `date-management:available:${date}:${sportname || "all"}`;
    const cached = await getCache<boolean>(CACHE_KEY);
    if (cached !== null) return cached;

    await connectToDatabase();

    const query: any = {
      date,
      status: "enabled",
      deletedAt: { $exists: false },
    };

    if (sportname) query.sportname = sportname;

    const count = await DateManagement.countDocuments(query);
    const isAvailable = count > 0;

    await setCache(CACHE_KEY, isAvailable, 600);

    return isAvailable;
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
    filters?: { sportname?: string; status?: string },
  ): Promise<IDateManagement[]> {
    await connectToDatabase();

    const query: any = {
      date: { $gte: startDate, $lte: endDate },
      deletedAt: { $exists: false },
    };

    if (filters?.sportname) query.sportname = filters.sportname;
    if (filters?.status) query.status = filters.status;

    return await DateManagement.find(query).sort({ date: 1 });
  }
}

export default new DateManagementService();
