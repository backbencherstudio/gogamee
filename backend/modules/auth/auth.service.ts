import jwt from "jsonwebtoken";
import { connectToDatabase, checkRateLimit, createSession, deleteSession, getSession, getCache, setCache, deleteCache } from "@/backend";
import { User, IUser } from "@/backend/models";
import type { CreateAdminData, UpdateAdminData, AdminLoginCredentials, AuthTokens, AdminQueryOptions } from "./auth.types";

class AdminService {
  private secret = process.env.JWT_SECRET || "secret";
  private refreshSecret = process.env.JWT_REFRESH_SECRET || "refresh-secret";

  private mapToLean(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : user;
    const { password, __v, ...rest } = obj;
    return { id: obj._id.toString(), ...rest };
  }

  async create(data: CreateAdminData): Promise<any> {
    await connectToDatabase();
    const admin = new User({ ...data, role: data.role || "admin", permissions: data.permissions || this.getDefaultPermissions(data.role || "admin") });
    const saved = await admin.save();
    await deleteCache("admin:stats");
    return this.mapToLean(saved);
  }

  async login(credentials: AdminLoginCredentials): Promise<any> {
    const rate = await checkRateLimit(`login:${credentials.identifier}`, 5, 60);
    if (!rate.success) throw new Error("Too many attempts. Try again later.");

    await connectToDatabase();
    const admin = await User.findOne({ $or: [{ email: credentials.identifier.toLowerCase() }, { username: credentials.identifier }], deletedAt: { $exists: false }, isActive: true });
    if (!admin || admin.isLocked || !(await admin.comparePassword(credentials.password))) {
      if (admin) await admin.incLoginAttempts();
      return null;
    }

    await admin.resetLoginAttempts();
    const tokens = await this.generateTokens(admin);
    return { ...tokens, admin: admin.getPublicProfile() };
  }

  async logout(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as any;
      if (decoded.sessionId) await deleteSession(decoded.sessionId);
    } catch {}
  }

  async getAll(options: AdminQueryOptions = {}): Promise<any> {
    await connectToDatabase();
    const { filters = {}, sort, limit = 50, skip = 0 } = options;
    const query: any = { deletedAt: { $exists: false } };

    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      const regex = new RegExp(filters.search, "i");
      query.$or = [{ username: regex }, { email: regex }, { "profile.firstName": regex }, { "profile.lastName": regex }];
    }

    const sortOptions: any = sort ? { [sort.field]: sort.order === "desc" ? -1 : 1 } : { createdAt: -1 };
    const admins = await User.find(query).sort(sortOptions).limit(limit).skip(skip).lean();
    return { admins: admins.map(a => this.mapToLean(a)), total: await User.countDocuments(query), hasMore: (await User.countDocuments(query)) > skip + limit };
  }

  async getById(id: string): Promise<any> {
    await connectToDatabase();
    return this.mapToLean(await User.findOne({ _id: id, deletedAt: { $exists: false } }));
  }

  async updateById(id: string, data: UpdateAdminData): Promise<any> {
    await connectToDatabase();
    await deleteCache("admin:stats");
    return this.mapToLean(await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }));
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await User.findByIdAndUpdate(id, { deletedAt: new Date() });
    await deleteCache("admin:stats");
    return !!result;
  }

  async getStats(): Promise<any> {
    const cached = await getCache("admin:stats");
    if (cached) return cached;

    await connectToDatabase();
    const [total, active, roles] = await Promise.all([
      User.countDocuments({ deletedAt: { $exists: false } }),
      User.countDocuments({ deletedAt: { $exists: false }, isActive: true }),
      User.aggregate([{ $match: { deletedAt: { $exists: false } } }, { $group: { _id: "$role", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);

    const stats = { totalAdmins: total, activeAdmins: active, adminsByRole: roles.map(r => ({ role: r._id, count: r.count })) };
    await setCache("admin:stats", stats, 600);
    return stats;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return await this.getById(decoded.id);
    } catch { return null; }
  }

  async refreshToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as any;
      if (decoded.sessionId && !(await getSession(decoded.sessionId))) return null;
      const admin = await User.findById(decoded.id);
      if (!admin || !admin.isActive) return null;
      const tokens = await this.generateTokens(admin, decoded.sessionId);
      return { ...tokens, admin: admin.getPublicProfile() };
    } catch { return null; }
  }

  private async generateTokens(admin: any, sid?: string): Promise<any> {
    const sessionId = sid || await createSession({ userId: admin._id.toString(), role: admin.role, email: admin.email, userAgent: "unknown" }, 7 * 24 * 60 * 60);
    const payload = { id: admin._id, sessionId };
    return {
      accessToken: jwt.sign(payload, this.secret, { expiresIn: "1h" }),
      refreshToken: jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" })
    };
  }

  private getDefaultPermissions(role: string): string[] {
    const perms: any = {
      super_admin: ["*"],
      admin: ["manage_packages", "manage_bookings", "manage_testimonials", "manage_faqs", "manage_settings", "view_analytics"],
      manager: ["manage_bookings", "manage_testimonials", "view_analytics"]
    };
    return perms[role] || [];
  }
}

export default new AdminService();
