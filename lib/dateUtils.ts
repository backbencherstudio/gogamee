// Date utility functions to ensure consistent date handling across components

/**
 * Converts a date to YYYY-MM-DD format consistently
 * This function handles timezone issues by using local date components
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converts an API date string to YYYY-MM-DD format consistently
 * This handles both ISO strings and other date formats from API
 * For ISO strings, extracts the date part directly to avoid timezone shifts
 */
export const formatApiDateForComparison = (apiDateString: string): string => {
  // If it's an ISO string (contains 'T'), extract the date part directly
  if (apiDateString.includes("T")) {
    const datePart = apiDateString.split("T")[0];
    // Validate it's in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
  }
  // For other formats, parse as Date and format
  const date = new Date(apiDateString);
  return formatDateForAPI(date);
};

/**
 * Creates a date object for calendar display
 * This ensures consistent date creation without timezone issues
 */
export const createCalendarDate = (
  year: number,
  month: number,
  day: number,
): Date => {
  return new Date(year, month, day);
};

/**
 * Checks if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateForAPI(date1) === formatDateForAPI(date2);
};

/**
 * Formats a date string or Date object for display based on language
 * @param date - Date object or ISO date string
 * @param language - 'en' or 'es'
 * @returns Formatted date string
 */
export const formatDateByLanguage = (
  date: Date | string,
  language: string,
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  if (language === "es") {
    // Format: 29 de enero de 2026 or 29/01/2026
    // User requested: "29/01/2026 or 29 de enero de 2026"
    // Let's go with "29 de enero de 2026" for a more premium feel,
    // or provide both if needed. The screenshot shows "January 29, 2026"
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
