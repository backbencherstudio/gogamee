// Date utility functions to ensure consistent date handling across components

/**
 * Converts a date to YYYY-MM-DD format consistently
 * This function handles timezone issues by using local date components
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts an API date string to YYYY-MM-DD format consistently
 * This handles both ISO strings and other date formats from API
 */
export const formatApiDateForComparison = (apiDateString: string): string => {
  const date = new Date(apiDateString)
  return formatDateForAPI(date)
}

/**
 * Creates a date object for calendar display
 * This ensures consistent date creation without timezone issues
 */
export const createCalendarDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month, day)
}

/**
 * Checks if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateForAPI(date1) === formatDateForAPI(date2)
}
