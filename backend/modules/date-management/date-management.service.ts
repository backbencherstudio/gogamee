import { DateManagement, IDateManagement } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/backend";
import type {
  DateManagementFilters,
  InitDateManagementData,
} from "./date-management.types";
import StartingPriceService from "../starting-price/starting-price.service";

class DateManagementService {
  async initDate(data: InitDateManagementData): Promise<IDateManagement> {
    await connectToDatabase();

    const isExists = await this.getByDateDurationAndLeague(
      data.date,
      data.duration,
      data.league,
    );
    let saved: IDateManagement | null;

    const initialPrices = { standard: 0, premium: 0 };

    const sports: IDateManagement["sports"] = {
      football: { status: "disabled", standard: 0, premium: 0 },
      basketball: { status: "disabled", standard: 0, premium: 0 },
      combined: { status: "disabled", standard: 0, premium: 0 },
    };

    let sportToEnable = data.sportName;
    if (sportToEnable === "both") sportToEnable = "combined";

    if (sportToEnable === "football") {
      sports.football = { ...initialPrices, status: "enabled" };
    } else if (sportToEnable === "basketball") {
      sports.basketball = { ...initialPrices, status: "enabled" };
    } else if (sportToEnable === "combined") {
      sports.combined = { ...initialPrices, status: "enabled" };
    }

    if (isExists) {
      // Merge new sport status with existing ones
      const updatedSports = { ...isExists?.toObject().sports };
      if (sportToEnable === "football") {
        updatedSports.football = {
          ...updatedSports.football,
          ...initialPrices,
          status: "enabled",
        };
      }
      if (sportToEnable === "basketball") {
        updatedSports.basketball = {
          ...updatedSports.basketball,
          ...initialPrices,
          status: "enabled",
        };
      }
      if (sportToEnable === "combined") {
        updatedSports.combined = {
          ...updatedSports.combined,
          ...initialPrices,
          status: "enabled",
        };
      }
      saved = await this.updateById(isExists._id.toString(), {
        sports: updatedSports,
      } as any);
    } else {
      const dateEntry = new DateManagement({
        date: data.date,
        duration: data.duration ?? "1",
        league: data.league,
        sports: sports,
      });
      saved = await dateEntry.save();
    }

    await clearCachePattern("date-management:*");

    if (!saved) {
      throw new Error("Failed to initialize date");
    }

    return saved;
  }

  async getAll(
    filters: DateManagementFilters,
  ): Promise<{ data: IDateManagement[] }> {
    const CACHE_KEY = `date-management:list:${JSON.stringify(filters)}`;
    const cached = await getCache<{ data: IDateManagement[] }>(CACHE_KEY);
    if (cached) return cached;

    // Fetch base prices to use as fallback
    const startingPrices = await StartingPriceService.getAll();
    const basePrices: Record<string, any> = {};
    startingPrices.forEach((sp) => {
      basePrices[sp.type] = sp.pricesByDuration;
    });

    await connectToDatabase();

    const query: any = {};

    // Map sport names if needed
    let sportQueryName = filters.sportName;
    if (sportQueryName === "both") sportQueryName = "combined";

    if (sportQueryName) query[`sports.${sportQueryName}.status`] = "enabled";
    if (filters.league) query.league = filters.league;
    if (filters.duration) query.duration = filters.duration;
    // Filter by specific months if provided
    if (filters.months && filters.months.length > 0) {
      const year = filters.year;
      const monthMap: Record<string, string> = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      const dateRegexes = filters.months
        .map((m) => {
          const monthNum = monthMap[m];
          return monthNum ? new RegExp(`^${year}-${monthNum}-`) : null;
        })
        .filter(Boolean);

      if (dateRegexes.length > 0) {
        // Use $or at query level for multiple regex patterns
        if (dateRegexes.length === 1) {
          query.date = dateRegexes[0];
        } else {
          query.$or = dateRegexes.map((regex) => ({ date: regex }));
        }
      }
    }

    // Use lean() to get plain objects we can modify

    const data = await DateManagement.find(query).sort({ date: 1 }).lean();

    // Process data to fallback to base prices where custom price is 0/missing
    const processedData = data.map((doc: any) => {
      const item = { ...doc }; // Ensure we have a modifyable copy
      const duration = item.duration;

      (["football", "basketball", "combined"] as const).forEach((sport) => {
        if (item.sports && item.sports[sport]) {
          const base = basePrices[sport]?.[duration];
          if (base) {
            // Apply fallback if price is 0 or missing
            if (!item?.sports?.[sport]?.standard) {
              item.sports[sport].standard = base.standard;
            }
            if (!item?.sports?.[sport]?.premium) {
              item.sports[sport].premium = base.premium;
            }
          }
        }
      });
      return item;
    });

    const result = { data: processedData as IDateManagement[] };
    // Cache for 10 minutes (600 seconds)
    await setCache(CACHE_KEY, result, 600);

    return result;
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

  async getByDateDurationAndLeague(
    date: string,
    duration: string,
    league: string,
  ): Promise<IDateManagement | null> {
    const CACHE_KEY = `date-management:date:${date}:${duration}:${league}`;
    const cached = await getCache<IDateManagement>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const query: any = { date, deletedAt: { $exists: false } };

    if (duration) query.duration = duration;
    if (league) query.league = league;
    const result = await DateManagement.findOne(query);

    if (result) {
      await setCache(CACHE_KEY, result, 600);
    }

    return result;
  }

  async updateById(
    id: string,
    data: IDateManagement,
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

  async updateSportPrice(
    id: string,
    data: {
      sportName: "football" | "basketball" | "combined";
      prices: {
        standard: number;
        premium: number;
      };
    },
  ): Promise<IDateManagement | null> {
    await connectToDatabase();
    const { sportName, prices } = data;
    if (!sportName || !prices) {
      throw new Error("Invalid payload: sportName and prices required");
    }

    const isExists = await this.getById(id);
    if (!isExists) {
      throw new Error("Date not found");
    }

    const currentSport = isExists.sports[sportName] || {
      standard: 0,
      premium: 0,
      status: "disabled",
    };

    const updated = await DateManagement.findByIdAndUpdate(
      id,
      {
        $set: {
          [`sports.${sportName}.standard`]:
            prices.standard !== undefined
              ? prices.standard
              : currentSport.standard,
          [`sports.${sportName}.premium`]:
            prices.premium !== undefined
              ? prices.premium
              : currentSport.premium,
        },
      },
      { new: true },
    );

    if (updated) {
      await deleteCache(`date-management:${id}`);
      await clearCachePattern("date-management:date:*");
      await clearCachePattern("date-management:list:*");
      await clearCachePattern("date-management:range:*");
    }

    return updated;
  }

  async updateSportStatus(
    id: string,
    data: {
      sportName: "football" | "basketball" | "combined";
      status: "enabled" | "disabled";
    },
  ): Promise<IDateManagement | null> {
    await connectToDatabase();
    const { sportName, status } = data;
    if (!sportName || !status) {
      throw new Error("Invalid payload: sportName and status required");
    }

    const updated = await DateManagement.findByIdAndUpdate(
      id,
      {
        $set: {
          [`sports.${sportName}.status`]: status,
        },
      },
      { new: true },
    );

    if (updated) {
      await deleteCache(`date-management:${id}`);
      await clearCachePattern("date-management:date:*");
      await clearCachePattern("date-management:list:*");
      await clearCachePattern("date-management:range:*");
    }

    return updated;
  }

  async deleteWithIdAndSportName(
    id: string,
    sportName: "football" | "basketball" | "combined",
  ): Promise<boolean> {
    await connectToDatabase();

    // Instead of unsetting status (which is required), we set it to disabled.
    // We can reset prices to 0 if desired, but "disabled" is sufficient to hide it.
    const result = await DateManagement.findByIdAndUpdate(id, {
      $set: {
        [`sports.${sportName}.status`]: "disabled",
      },
    });

    if (result) {
      await deleteCache(`date-management:${id}`);
      await clearCachePattern("date-management:*");
    }

    return !!result;
  }

  async isDateAvailable(date: string, sportName?: string): Promise<boolean> {
    const CACHE_KEY = `date-management:available:${date}:${sportName || "all"}`;
    const cached = await getCache<boolean>(CACHE_KEY);
    if (cached !== null) return cached;

    await connectToDatabase();

    const query: any = {
      date,
      status: "enabled",
      deletedAt: { $exists: false },
    };

    if (sportName) query.sportName = sportName;

    const count = await DateManagement.countDocuments(query);
    const isAvailable = count > 0;

    await setCache(CACHE_KEY, isAvailable, 600);

    return isAvailable;
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
    filters?: { sportName?: string; status?: string },
  ): Promise<IDateManagement[]> {
    await connectToDatabase();

    const query: any = {
      date: { $gte: startDate, $lte: endDate },
      deletedAt: { $exists: false },
    };

    if (filters?.sportName) query.sportName = filters.sportName;
    if (filters?.status) query.status = filters.status;

    return await DateManagement.find(query).sort({ date: 1 });
  }

  async resetDateManagement(): Promise<boolean> {
    await connectToDatabase();
    await DateManagement.deleteMany({});
    await clearCachePattern("date-management:*");

    return true;
  }
}

export default new DateManagementService();
