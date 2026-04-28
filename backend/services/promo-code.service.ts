import { connectToDatabase } from "@/backend";
import { Code } from "@/backend/models";

type DiscountType = "fixed" | "percentage";
type UsageLimit = "single" | "multiple" | "unlimited";

interface PromoListParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  discountType?: "all" | DiscountType;
  usageLimit?: "all" | UsageLimit;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

const normalizeCode = (value: string) =>
  value.replace(/-/g, "").replace(/\s+/g, "").toUpperCase();

export class PromoCodeService {
  async list(params: PromoListParams) {
    await connectToDatabase();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { codeKind: "discount" };
    if (params.search?.trim()) {
      const searchRegex = new RegExp(params.search.trim(), "i");
      filter.$or = [{ code: searchRegex }, { name: searchRegex }];
    }
    if (params.status === "active") filter.isActive = true;
    if (params.status === "inactive") filter.isActive = false;
    if (params.discountType && params.discountType !== "all") {
      filter.discountType = params.discountType;
    }
    if (params.usageLimit && params.usageLimit !== "all") {
      filter.usageLimit = params.usageLimit;
    }
    if (params.dateFrom || params.dateTo) {
      filter.createdAt = {};
      if (params.dateFrom) filter.createdAt.$gte = new Date(`${params.dateFrom}T00:00:00`);
      if (params.dateTo) filter.createdAt.$lte = new Date(`${params.dateTo}T23:59:59`);
    }

    const [total, data] = await Promise.all([
      Code.countDocuments(filter),
      Code.find(filter)
        .select("name code discountType value usageLimit maxUses usedCount isActive expiresAt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    return { data, total, page, limit };
  }

  async create(payload: any) {
    await connectToDatabase();
    const created = await Code.create({
      name: payload.name,
      code: normalizeCode(payload.code),
      codeKind: "discount",
      discountType: payload.discountType,
      value: Number(payload.value || 0),
      usageLimit: payload.usageLimit || "single",
      maxUses:
        payload.usageLimit === "multiple" ? Number(payload.maxUses || 1) : undefined,
      isActive: payload.isActive !== false,
      expiresAt: payload.expiresAt || undefined,
      paymentStatus: "none",
    });
    return created.toObject();
  }

  async update(id: string, payload: any) {
    await connectToDatabase();
    const update: any = {
      ...payload,
      value: payload.value !== undefined ? Number(payload.value) : undefined,
      maxUses: payload.maxUses !== undefined ? Number(payload.maxUses) : undefined,
    };
    if (update.code) update.code = normalizeCode(update.code);
    return Code.findOneAndUpdate({ _id: id, codeKind: "discount" }, update, {
      new: true,
      runValidators: true,
    })
      .select("name code discountType value usageLimit maxUses usedCount isActive expiresAt createdAt")
      .lean();
  }

  async delete(id: string) {
    await connectToDatabase();
    return Code.findOneAndDelete({ _id: id, codeKind: "discount" }).lean();
  }
}

export const promoCodeService = new PromoCodeService();
