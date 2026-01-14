import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username?: string; // For admin users
  email: string;
  password: string;
  name?: string; // For regular users
  phone?: string;
  role: "super_admin" | "admin" | "manager" | "user" | "guest";
  isActive: boolean;
  isEmailVerified?: boolean; // For regular users
  lastLogin?: Date;
  loginAttempts?: number; // For admin users
  lockUntil?: Date; // For admin users
  permissions?: string[]; // For admin users
  profile?: {
    // For admin users
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // Virtuals
  fullName: string;
  isLocked: boolean;
  // Methods
  getPublicProfile(): any;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "manager", "user", "guest"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_packages",
          "manage_bookings",
          "manage_testimonials",
          "manage_faqs",
          "manage_settings",
          "manage_admins",
          "view_analytics",
          "manage_content",
          "*",
        ],
      },
    ],
    profile: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ "profile.firstName": 1, "profile.lastName": 1 });

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name || this.username || this.email;
});

// Virtual for account lock status
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware for password hashing
UserSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return;

  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
UserSchema.methods.incLoginAttempts = async function (this: IUser) {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await (this.constructor as any).updateOne(
      { _id: this._id },
      {
        $unset: { lockUntil: 1 },
        $set: { loginAttempts: 1 },
      }
    );
    this.lockUntil = undefined;
    this.loginAttempts = 1;
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if ((this.loginAttempts || 0) + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    };
  }

  await (this.constructor as any).updateOne({ _id: this._id }, updates);
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  if (updates.$set?.lockUntil) {
    this.lockUntil = updates.$set.lockUntil;
  }
};

// Instance method to reset login attempts and update last login
UserSchema.methods.resetLoginAttempts = async function (this: IUser) {
  await (this.constructor as any).updateOne(
    { _id: this._id },
    {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      $set: { lastLogin: new Date() },
    }
  );
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
};

// Instance method to get public profile (without sensitive data)
UserSchema.methods.getPublicProfile = function (this: IUser) {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    profile: this.profile,
    permissions: this.permissions,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

// Static method to find admin by email or username
UserSchema.statics.findByEmailOrUsername = function (identifier: string) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    deletedAt: { $exists: false },
    isActive: true,
  });
};

// Static method to get admin statistics
UserSchema.statics.getStats = function () {
  return this.aggregate([
    { $match: { deletedAt: { $exists: false } } },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
      },
    },
  ]);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
