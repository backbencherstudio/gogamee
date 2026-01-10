/**
 * BackendGogame - Constants
 * Centralized constants for better maintainability
 */

// File names
export const STORE_FILES = {
  ADMINS: "admins.json",
  BOOKINGS: "bookings.json",
  PACKAGES: "packages.json",
  STARTING_PRICES: "startingPrices.json",
  TESTIMONIALS: "testimonials.json",
  FAQS: "faqs.json",
  ABOUT: "about.json",
  DATES: "dates.json",
  SESSIONS: "sessions.json",
  SOCIAL_CONTACT: "socialContact.json",
  LEGAL_PAGES: "legalPages.json",
} as const;

// Session configuration
export const SESSION_CONFIG = {
  COOKIE_NAME: "gogame_admin_session",
  TTL_MS: 1000 * 60 * 60 * 24 * 7, // 7 days
} as const;

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

// Booking statuses
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

