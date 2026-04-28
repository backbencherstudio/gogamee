import { connectToDatabase } from "@/backend";
import { Code } from "@/backend/models";

type GiftState = "active" | "suspended" | "banned";
type PaymentStatus = "pending" | "paid" | "failed";

interface GiftListParams {
  search?: string;
  status?: "all" | GiftState;
  paymentStatus?: "all" | PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

const normalizeGiftCode = (value: string) =>
  value.replace(/-/g, "").replace(/\s+/g, "").toUpperCase();

export class GiftCardService {
  async list(params: GiftListParams) {
    await connectToDatabase();
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = { codeKind: "gift" };
    if (params.search?.trim()) {
      const searchRegex = new RegExp(params.search.trim(), "i");
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { recipientName: searchRegex },
        { recipientEmail: searchRegex },
        { buyerName: searchRegex },
        { buyerEmail: searchRegex },
      ];
    }
    if (params.status && params.status !== "all") filter.state = params.status;
    if (params.paymentStatus && params.paymentStatus !== "all") {
      filter.paymentStatus = params.paymentStatus;
    }
    if (params.dateFrom || params.dateTo) {
      filter.createdAt = {};
      if (params.dateFrom) filter.createdAt.$gte = new Date(`${params.dateFrom}T00:00:00`);
      if (params.dateTo) filter.createdAt.$lte = new Date(`${params.dateTo}T23:59:59`);
    }

    const [total, data] = await Promise.all([
      Code.countDocuments(filter),
      Code.find(filter)
        .select(
          "code name value remainingAmount usedCount state paymentStatus recipientName recipientEmail buyerName buyerEmail createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);
    return { data, total, page, limit };
  }

  async getById(id: string) {
    await connectToDatabase();
    return Code.findOne({ _id: id, codeKind: "gift" })
      .select(
        "code name value remainingAmount usedCount state paymentStatus recipientName recipientEmail buyerName buyerEmail dedication createdAt usageLogs",
      )
      .lean();
  }

  async create(payload: any) {
    await connectToDatabase();
    const value = Number(payload.value || 0);
    const created = await Code.create({
      name: payload.name,
      code: normalizeGiftCode(payload.code),
      codeKind: "gift",
      discountType: "fixed",
      value,
      usageLimit: "multiple",
      isActive: payload.state === "active",
      state: payload.state || "active",
      paymentStatus: payload.paymentStatus || "paid",
      initialAmount: value,
      remainingAmount: Number(payload.remainingAmount ?? value),
      recipientName: payload.recipientName,
      recipientEmail: payload.recipientEmail,
      buyerName: payload.buyerName,
      buyerEmail: payload.buyerEmail,
      dedication: payload.dedication,
    });
    return created.toObject();
  }

  async update(id: string, payload: any) {
    await connectToDatabase();
    const update: any = { ...payload };
    if (update.code) update.code = normalizeGiftCode(update.code);
    if (update.value !== undefined) update.value = Number(update.value);
    if (update.remainingAmount !== undefined) update.remainingAmount = Number(update.remainingAmount);
    if (update.initialAmount !== undefined) update.initialAmount = Number(update.initialAmount);
    if (update.state) update.isActive = update.state === "active";

    return Code.findOneAndUpdate({ _id: id, codeKind: "gift" }, update, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id: string) {
    await connectToDatabase();
    return Code.findOneAndDelete({ _id: id, codeKind: "gift" }).lean();
  }
}

export const giftCardService = new GiftCardService();
