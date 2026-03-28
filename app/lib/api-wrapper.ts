import { NextResponse } from "next/server";
import { sendError } from "./api-response";

/**
 * A standard wrapper for Next.js API route handlers.
 * Catches errors and sends a standard JSON error response.
 */
export const withErrorHandling = (handler: Function) => {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Route Error:", error);
      return sendError(
        error instanceof Error ? error.message : "Internal Server Error",
        500,
        error
      );
    }
  };
};
