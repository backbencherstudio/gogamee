import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta_data?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export function sendResponse<T>(
  data: T,
  message: string = "Success",
  meta_data?: ApiResponse["meta_data"],
  status: number = 200,
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta_data) {
    response.meta_data = meta_data;
  }

  return NextResponse.json(response, { status });
}

export function sendPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = "Success",
  status: number = 200,
) {
  const total_pages = Math.ceil(total / limit);

  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta_data: {
      page,
      limit,
      total,
      total_pages,
    },
  };

  return NextResponse.json(response, { status });
}

export function sendError(
  message: string = "Something went wrong",
  status: number = 500,
  data: any = null,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      data,
    },
    { status },
  );
}
