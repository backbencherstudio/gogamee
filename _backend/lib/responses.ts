import { NextResponse } from "next/server";

/**
 * Standard API response interface
 */
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
  hasMore?: boolean;
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  data?: T,
  message?: string,
  meta?: { total?: number; hasMore?: boolean }
): APIResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
    ...meta,
  };
}

/**
 * Create an error response
 */
export function errorResponse(message: string, error?: string): APIResponse {
  return {
    success: false,
    message,
    ...(error && { error }),
  };
}

/**
Create a NextResponse with success data
 */
export function jsonSuccess<T = any>(
  data?: T,
  message?: string,
  meta?: { total?: number; hasMore?: boolean },
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(successResponse(data, message, meta), {
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

/**
 * Create a NextResponse with error data
 */
export function jsonError(
  message: string,
  statusCode: number = 500,
  error?: string,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(errorResponse(message, error), {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}
