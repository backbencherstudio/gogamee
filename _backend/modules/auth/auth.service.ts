import jwt from "jsonwebtoken";
import type {
  CreateAdminData,
  UpdateAdminData,
  AdminLoginCredentials,
  AuthTokens,
  AdminFilters,
  AdminQueryOptions,
} from "./auth.types";
import {
  connectToDatabase,
  checkRateLimit,
  createSession,
  deleteSession,
  getSession,
  getCache,
  setCache,
  deleteCache,
} from "@/_backend";
import { IUser, User } from "@/_backend/models";

class AdminService {
  private jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

  async create(data: CreateAdminData): Promise<IUser> {
    await connectToDatabase();

    const admin = new User({
      ...data,
      role: data.role || "admin",
      permissions:
        data.permissions || this.getDefaultPermissions(data.role || "admin"),
    });

    const saved = await admin.save();

    // Invalidate stats cache
    await deleteCache("admin:stats");

    return saved;
  }

  async login(credentials: AdminLoginCredentials): Promise<AuthTokens | null> {
    // 1. Rate Limiting (5 attempts per minute)
    const rateLimit = await checkRateLimit(
      `login:${credentials.identifier}`,
      5,
      60
    );

    if (!rateLimit.success) {
      throw new Error(
        `Too many login attempts. Please try again in ${Math.ceil(
          (rateLimit.reset - Math.floor(Date.now() / 1000)) / 60
        )} minutes.`
      );
    }

    await connectToDatabase();

    const admin = await User.findOne({
      $or: [
        { email: credentials.identifier.toLowerCase() },
        { username: credentials.identifier },
      ],
      deletedAt: { $exists: false },
      isActive: true,
    });
    if (!admin) return null;

    if (admin.isLocked) {
      throw new Error(
        "Account is temporarily locked due to too many failed login attempts"
      );
    }

    const isValidPassword = await admin.comparePassword(credentials.password);
    if (!isValidPassword) {
      await admin.incLoginAttempts();
      return null;
    }

    await admin.resetLoginAttempts();

    // 2. Generate Tokens & Store Session in Redis
    const tokens = await this.generateTokens(admin);

    return {
      ...tokens,
      admin: admin.getPublicProfile(),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // 3. Remove session from Redis
    try {
      // Assuming refresh token often serves as session ID or is key
      // If generateTokens used createSession, it returned a token ID used for refresh
      // Here we decode it to get the ID if needed, or if we stored mapping
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as {
        sessionId?: string;
      };

      if (decoded.sessionId) {
        await deleteSession(decoded.sessionId);
      }
    } catch (e) {
      // Ignore invalid token errors during logout
    }
  }

  async getAll(options: AdminQueryOptions = {}): Promise<{
    admins: IUser[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [
        { username: new RegExp(filters.search, "i") },
        { email: new RegExp(filters.search, "i") },
        { "profile.firstName": new RegExp(filters.search, "i") },
        { "profile.lastName": new RegExp(filters.search, "i") },
      ];
    }

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { createdAt: -1 };

    const admins = await User.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = admins.length > limit;
    const resultAdmins = hasMore ? admins.slice(0, limit) : admins;
    const total = await User.countDocuments(query);

    return { admins: resultAdmins, total, hasMore };
  }

  async getById(id: string): Promise<IUser | null> {
    await connectToDatabase();
    return await User.findOne({ _id: id, deletedAt: { $exists: false } });
  }

  async updateById(id: string, data: UpdateAdminData): Promise<IUser | null> {
    await connectToDatabase();

    // Invalidate stats on update (e.g. role change)
    await deleteCache("admin:stats");

    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await User.findByIdAndUpdate(id, { deletedAt: new Date() });

    // Invalidate stats
    await deleteCache("admin:stats");

    return !!result;
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    await connectToDatabase();
    const result = await User.findByIdAndUpdate(id, { password: newPassword });
    return !!result;
  }

  async getStats(): Promise<{
    totalAdmins: number;
    activeAdmins: number;
    adminsByRole: { role: string; count: number }[];
  }> {
    // 4. Check Cache
    const CACHE_KEY = "admin:stats";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();

    const [totalStats, activeStats, roleStats] = await Promise.all([
      User.countDocuments({ deletedAt: { $exists: false } }),
      User.countDocuments({ deletedAt: { $exists: false }, isActive: true }),
      User.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stats = {
      totalAdmins: totalStats,
      activeAdmins: activeStats,
      adminsByRole: roleStats.map((item) => ({
        role: item._id,
        count: item.count,
      })),
    };

    // Store in cache for 10 minutes
    await setCache(CACHE_KEY, stats, 600);

    return stats;
  }

  async verifyToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string };
      // Optional: Add cache for user profile here if needed
      return await this.getById(decoded.id);
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as {
        id: string;
        sessionId?: string;
      };

      // Check if session is valid in Redis (revocation check)
      if (decoded.sessionId) {
        // We use refreshSession instead of just getSession to extend life
        // NOTE: getSession returns data, refreshSession updates TTL.
        // We should just check existence or get.
        // To be safe, let's just create a simple "exists" check via getSession
        const session = await getSession(decoded.sessionId);
        if (!session) {
          return null; // Session revoked or expired
        }
      }

      const admin = await this.getById(decoded.id);

      if (!admin || !admin.isActive) return null;

      // Reuse valid session or rotate?
      // For now, let's keep it simple: Issue new access token, reuse session ID logic
      const tokens = await this.generateTokens(admin, decoded.sessionId);

      return {
        ...tokens,
        admin: admin.getPublicProfile(),
      };
    } catch (error) {
      return null;
    }
  }

  hasPermission(admin: IUser, permission: string): boolean {
    if (admin.role === "super_admin") return true;
    return admin.permissions?.includes(permission) || false;
  }

  private async generateTokens(
    admin: IUser,
    existingSessionId?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Create new session in Redis if not providing existing one
    let sessionId = existingSessionId;

    if (!sessionId) {
      sessionId = await createSession(
        {
          userId: (admin._id as any).toString(),
          role: admin.role,
          email: admin.email,
          userAgent: "unknown", // In real app, pass this from controller
        },
        7 * 24 * 60 * 60
      ); // 7 days
    }

    const payload = { id: admin._id, sessionId };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  private getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      super_admin: ["*"],
      admin: [
        "manage_packages",
        "manage_bookings",
        "manage_testimonials",
        "manage_faqs",
        "manage_settings",
        "view_analytics",
      ],
      manager: ["manage_bookings", "manage_testimonials", "view_analytics"],
    };

    return rolePermissions[role] || [];
  }
}

export default new AdminService();
