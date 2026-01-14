/**
 * Centralized constants for Mongoose-based backend
 * Application-level constants only (no JSON store/Redis configs)
 */

// Stripe configuration
export const STRIPE_CONFIG = {
  API_VERSION: "2025-12-15.clover",
  SESSION_EXPIRY_MINUTES: 30,
} as const;

// Date management
export const DATE_DURATIONS = ["1", "2", "3", "4"] as const;
export type DateDuration = (typeof DATE_DURATIONS)[number];

// Package types
export const PACKAGE_TYPES = {
  STANDARD: "standard",
  PREMIUM: "premium",
} as const;

export const SPORT_TYPES = {
  FOOTBALL: "football",
  BASKETBALL: "basketball",
  COMBINED: "combined",
} as const;

// Booking statuses (Mongoose-based)
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

// League removal pricing
export const LEAGUE_REMOVAL_CONFIG = {
  FREE_REMOVALS: 1,
  COST_PER_REMOVAL: 20, // €20 per paid removal
} as const;
