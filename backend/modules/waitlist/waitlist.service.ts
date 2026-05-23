import { Waitlist } from "../../models";
import { connectToDatabase } from "@/backend";

class WaitlistService {
  private mapToLean(doc: any) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const { __v, _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  }

  async addEmail(data: {
    email: string;
    name?: string;
    source?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    await connectToDatabase();

    try {
      const existing = await Waitlist.findOne({
        email: data.email.toLowerCase().trim(),
      });

      if (existing) {
        return {
          success: false,
          message: "This email is already on the waitlist.",
        };
      }

      const entry = await new Waitlist({
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim(),
        source: data.source || "coming-soon-page",
        subscribedAt: new Date(),
      }).save();

      return {
        success: true,
        message: "You have been added to the waitlist!",
        data: this.mapToLean(entry),
      };
    } catch (error: any) {
      // Handle MongoDB unique constraint error
      if (error.code === 11000) {
        return {
          success: false,
          message: "This email is already on the waitlist.",
        };
      }
      throw error;
    }
  }

  async getAllEmails(
    options: { page?: number; limit?: number } = {},
  ): Promise<{ entries: any[]; total: number; page: number; limit: number }> {
    await connectToDatabase();

    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Waitlist.find().sort({ subscribedAt: -1 }).skip(skip).limit(limit).lean(),
      Waitlist.countDocuments(),
    ]);

    return {
      entries: entries.map((e) => this.mapToLean(e)),
      total,
      page,
      limit,
    };
  }

  async getCount(): Promise<number> {
    await connectToDatabase();
    return Waitlist.countDocuments();
  }

  async deleteEmail(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Waitlist.findByIdAndDelete(id);
    return !!result;
  }
}

export default new WaitlistService();
