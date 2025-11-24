/**
 * Date utility functions to avoid timezone conversion issues
 *
 * IMPORTANT: Always use these functions instead of toISOString() to prevent
 * date shifting when converting between timezones.
 */

/**
 * Get date string in YYYY-MM-DD format using local timezone
 * Avoids UTC conversion issues from toISOString()
 *
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 *
 * @example
 * const date = new Date(2025, 10, 23); // Nov 23, 2025
 * getLocalDateString(date); // "2025-11-23" (correct!)
 * // vs date.toISOString().split('T')[0] // might return "2025-11-22" if timezone is ahead of UTC
 */
export function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string as local date (not UTC)
 * Ensures date doesn't shift when creating Date object
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object in local timezone
 *
 * @example
 * parseLocalDate('2025-11-23'); // Nov 23, 2025 at 00:00 local time
 * // vs new Date('2025-11-23') // Nov 23, 2025 at 00:00 UTC (might shift to Nov 22 in local time)
 */
export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date for Hebrew display with correct weekday
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in Hebrew
 *
 * @example
 * formatHebrewDate('2025-11-23'); // "יום שני, 23 בנובמבר 2025"
 * formatHebrewDate('2025-11-23', { weekday: 'short' }); // "ב׳, 23 בנוב׳ 2025"
 */
export function formatHebrewDate(dateString, options = {}) {
  const date = parseLocalDate(dateString);
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString('he-IL', { ...defaultOptions, ...options });
}

/**
 * Format date for short Hebrew display
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Short formatted date
 *
 * @example
 * formatHebrewDateShort('2025-11-23'); // "23 בנוב׳"
 */
export function formatHebrewDateShort(dateString) {
  return formatHebrewDate(dateString, {
    weekday: undefined,
    year: undefined,
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get day of week for a date string
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {number} Day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(dateString) {
  const date = parseLocalDate(dateString);
  return date.getDay();
}

/**
 * Check if a date string is today
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
export function isToday(dateString) {
  const today = new Date();
  return dateString === getLocalDateString(today);
}

/**
 * Check if a date string is in the past
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is before today
 */
export function isPastDate(dateString) {
  const today = new Date();
  const todayString = getLocalDateString(today);
  return dateString < todayString;
}

/**
 * Check if a date string is in the future
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is after today
 */
export function isFutureDate(dateString) {
  const today = new Date();
  const todayString = getLocalDateString(today);
  return dateString > todayString;
}

/**
 * Get month string for API calls
 *
 * @param {Date} date - Date object
 * @returns {string} Month string in YYYY-MM format
 *
 * @example
 * getMonthString(new Date(2025, 10, 23)); // "2025-11"
 */
export function getMonthString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Add days to a date string
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} New date string
 *
 * @example
 * addDays('2025-11-23', 1); // "2025-11-24"
 * addDays('2025-11-23', -1); // "2025-11-22"
 */
export function addDays(dateString, days) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Get first day of month
 *
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {string} Date string for first day of month
 */
export function getFirstDayOfMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/**
 * Get last day of month
 *
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {string} Date string for last day of month
 */
export function getLastDayOfMonth(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

/**
 * Format time for display
 *
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time
 */
export function formatTime(time) {
  return time; // Already in HH:MM format
}

/**
 * Combine date and time for display
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Combined formatted string
 *
 * @example
 * formatDateTime('2025-11-23', '14:30'); // "יום שני, 23 בנובמבר 2025 בשעה 14:30"
 */
export function formatDateTime(dateString, time) {
  const dateFormatted = formatHebrewDate(dateString);
  return `${dateFormatted} בשעה ${time}`;
}

/**
 * Get today's date string
 *
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayString() {
  return getLocalDateString(new Date());
}

/**
 * Compare two date strings
 *
 * @param {string} date1 - First date string
 * @param {string} date2 - Second date string
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1, date2) {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}
