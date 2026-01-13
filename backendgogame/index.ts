/**
 * BackendGogame - Main Entry Point
 * Professional backend structure following 2026 best practices
 */

// Export all actions
export * from "./actions/about";
export * from "./actions/auth";
export * from "./actions/bookings";
export * from "./actions/dateManagement";
export * from "./actions/faq";
export * from "./actions/packages";
export * from "./actions/settings";
export * from "./actions/testimonials";

// Export all schemas
export * from "./schemas";

// Export utilities
export * from "./lib/errors";
export { readStore, writeStore, updateStore, JsonStoreError } from "./lib/jsonStore";
export { appendSession, removeSession, findSessionByToken } from "./lib/sessionStore";

