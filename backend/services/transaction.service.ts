import { connectToDatabase } from "@/backend";
import { Transaction } from "@/backend/models";

class TransactionService {
  async list(filters: { type?: string; status?: string } = {}) {
    await connectToDatabase();
    const query: any = {};
    if (filters.type) query.transactionType = filters.type;
    if (filters.status) query.status = filters.status;
    return Transaction.find(query).sort({ createdAt: -1 }).lean();
  }

  async create(data: any) {
    await connectToDatabase();
    const existing = data.stripePaymentIntentId
      ? await Transaction.findOne({
          stripePaymentIntentId: data.stripePaymentIntentId,
        })
      : null;

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return existing.toObject();
    }

    const created = await Transaction.create(data);
    return created.toObject();
  }

  async updateByPaymentIntent(paymentIntentId: string, data: any) {
    await connectToDatabase();
    return Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      data,
      { new: true },
    ).lean();
  }
}

export const transactionService = new TransactionService();
