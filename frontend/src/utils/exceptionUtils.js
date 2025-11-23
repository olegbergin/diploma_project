/**
 * Utility functions for managing business schedule exceptions
 */

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Exception types
 */
export const EXCEPTION_TYPES = {
  CLOSURE: 'closure',
  SPECIAL_HOURS: 'special_hours'
};

/**
 * Exception reasons
 */
export const EXCEPTION_REASONS = {
  VACATION: { value: 'vacation', label: 'חופשה' },
  HOLIDAY: { value: 'holiday', label: 'חג' },
  EVENT: { value: 'event', label: 'אירוע מיוחד' },
  MAINTENANCE: { value: 'maintenance', label: 'תחזוקה' },
  OTHER: { value: 'other', label: 'אחר' }
};

/**
 * Create a new exception object
 * @param {object} params - Exception parameters
 * @returns {object} New exception object
 */
export function createException({
  type = EXCEPTION_TYPES.CLOSURE,
  title = '',
  startDate = null,
  endDate = null,
  reason = 'other',
  customHours = null,
  description = ''
}) {
  return {
    id: generateId(),
    type,
    title,
    startDate: startDate || formatDate(new Date()),
    endDate: endDate || formatDate(new Date()),
    reason,
    customHours,
    description
  };
}

/**
 * Validate exception object
 * @param {object} exception - Exception to validate
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateException(exception) {
  const errors = [];

  if (!exception.title || exception.title.trim() === '') {
    errors.push('נא להזין כותרת');
  }

  if (!exception.startDate) {
    errors.push('נא לבחור תאריך התחלה');
  }

  if (!exception.endDate) {
    errors.push('נא לבחור תאריך סיום');
  }

  if (exception.startDate && exception.endDate && exception.startDate > exception.endDate) {
    errors.push('תאריך הסיום חייב להיות אחרי תאריך ההתחלה');
  }

  if (exception.type === EXCEPTION_TYPES.SPECIAL_HOURS) {
    if (!exception.customHours || !exception.customHours.openTime || !exception.customHours.closeTime) {
      errors.push('נא להזין שעות פתיחה וסגירה לשעות מיוחדות');
    } else if (exception.customHours.openTime >= exception.customHours.closeTime) {
      errors.push('שעת הסגירה חייבת להיות אחרי שעת הפתיחה');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a date falls within an exception range
 * @param {object} exception - Exception object
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export function isDateInException(exception, date) {
  const dateStr = formatDate(date);
  return dateStr >= exception.startDate && dateStr <= exception.endDate;
}

/**
 * Get exception for a specific date
 * @param {Array} exceptions - Array of exceptions
 * @param {Date|string} date - Date to check
 * @returns {object|null} Exception if found, null otherwise
 */
export function getExceptionForDate(exceptions, date) {
  if (!exceptions || !Array.isArray(exceptions)) {
    return null;
  }

  return exceptions.find(ex => isDateInException(ex, date)) || null;
}

/**
 * Get all exceptions within a date range
 * @param {Array} exceptions - Array of exceptions
 * @param {Date|string} startDate - Range start
 * @param {Date|string} endDate - Range end
 * @returns {Array} Exceptions within range
 */
export function getExceptionsInRange(exceptions, startDate, endDate) {
  if (!exceptions || !Array.isArray(exceptions)) {
    return [];
  }

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  return exceptions.filter(ex => {
    // Check if exception overlaps with range
    return ex.startDate <= end && ex.endDate >= start;
  });
}

/**
 * Sort exceptions by start date
 * @param {Array} exceptions - Array of exceptions
 * @returns {Array} Sorted exceptions
 */
export function sortExceptions(exceptions) {
  return [...exceptions].sort((a, b) => {
    if (a.startDate === b.startDate) {
      return a.endDate.localeCompare(b.endDate);
    }
    return a.startDate.localeCompare(b.startDate);
  });
}

/**
 * Get upcoming exceptions (starting from today)
 * @param {Array} exceptions - Array of exceptions
 * @param {number} limit - Maximum number to return
 * @returns {Array} Upcoming exceptions
 */
export function getUpcomingExceptions(exceptions, limit = null) {
  const today = formatDate(new Date());

  const upcoming = exceptions
    .filter(ex => ex.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Check if exception is active (current date falls within it)
 * @param {object} exception - Exception object
 * @returns {boolean}
 */
export function isExceptionActive(exception) {
  const today = formatDate(new Date());
  return today >= exception.startDate && today <= exception.endDate;
}

/**
 * Format date to YYYY-MM-DD string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (typeof date === 'string') {
    // Already formatted
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format date range for display
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {string} Formatted range
 */
export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatOptions = { day: 'numeric', month: 'short' };

  if (startDate === endDate) {
    return start.toLocaleDateString('he-IL', { ...formatOptions, year: 'numeric' });
  }

  if (start.getFullYear() === end.getFullYear()) {
    const startStr = start.toLocaleDateString('he-IL', formatOptions);
    const endStr = end.toLocaleDateString('he-IL', { ...formatOptions, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  return `${start.toLocaleDateString('he-IL', { ...formatOptions, year: 'numeric' })} - ${end.toLocaleDateString('he-IL', { ...formatOptions, year: 'numeric' })}`;
}

/**
 * Get exception type label
 * @param {string} type - Exception type
 * @returns {string} Hebrew label
 */
export function getExceptionTypeLabel(type) {
  switch (type) {
    case EXCEPTION_TYPES.CLOSURE:
      return 'סגירה מלאה';
    case EXCEPTION_TYPES.SPECIAL_HOURS:
      return 'שעות מיוחדות';
    default:
      return type;
  }
}

/**
 * Get exception reason label
 * @param {string} reason - Exception reason
 * @returns {string} Hebrew label
 */
export function getExceptionReasonLabel(reason) {
  return Object.values(EXCEPTION_REASONS).find(r => r.value === reason)?.label || reason;
}

/**
 * Calculate total days in exception
 * @param {object} exception - Exception object
 * @returns {number} Number of days
 */
export function getExceptionDuration(exception) {
  const start = new Date(exception.startDate);
  const end = new Date(exception.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}
