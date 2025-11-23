/**
 * Utility functions for working with business schedule/working hours
 */

/**
 * Parse schedule from database format
 * Handles both old Hebrew format and new English format
 * @param {string|object} scheduleData - Schedule data from database
 * @returns {object} Normalized schedule object
 */
function parseSchedule(scheduleData) {
  if (!scheduleData) {
    return getDefaultSchedule();
  }

  let schedule;

  // If it's a string, parse it
  if (typeof scheduleData === 'string') {
    try {
      schedule = JSON.parse(scheduleData);
    } catch (e) {
      console.error('Error parsing schedule:', e);
      return getDefaultSchedule();
    }
  } else {
    schedule = scheduleData;
  }

  // Handle nested format: {opening_hours: {...}} or {working_hours: {...}}
  if (schedule.opening_hours) {
    schedule = schedule.opening_hours;
  } else if (schedule.working_hours) {
    schedule = schedule.working_hours;
  }

  // Check if it's the old Hebrew format
  if (schedule['ראשון'] || schedule['שני']) {
    return convertHebrewScheduleToEnglish(schedule);
  }

  // Already in English format
  return schedule;
}

/**
 * Convert Hebrew day names to English format
 */
function convertHebrewScheduleToEnglish(hebrewSchedule) {
  const dayMapping = {
    'ראשון': 'sunday',
    'שני': 'monday',
    'שלישי': 'tuesday',
    'רביעי': 'wednesday',
    'חמישי': 'thursday',
    'שישי': 'friday',
    'שבת': 'saturday'
  };

  const englishSchedule = {};

  Object.keys(dayMapping).forEach(hebrewDay => {
    const englishDay = dayMapping[hebrewDay];
    const hours = hebrewSchedule[hebrewDay];

    if (!hours || hours === 'סגור' || hours === 'closed') {
      englishSchedule[englishDay] = {
        isOpen: false,
        openTime: '09:00',
        closeTime: '17:00'
      };
    } else {
      // Parse format like "10:00-18:00"
      const [openTime, closeTime] = hours.split('-');
      englishSchedule[englishDay] = {
        isOpen: true,
        openTime: openTime.trim(),
        closeTime: closeTime.trim()
      };
    }
  });

  return englishSchedule;
}

/**
 * Get default schedule (Monday-Friday 9-17, Friday until 14, weekends closed)
 */
function getDefaultSchedule() {
  return {
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  };
}

/**
 * Get schedule for a specific day
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date object
 * @returns {object|null} Day schedule or null if closed
 */
function getScheduleForDate(schedule, date) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];

  const daySchedule = schedule[dayName];

  if (!daySchedule || !daySchedule.isOpen) {
    return null;
  }

  return daySchedule;
}

/**
 * Check if business is open on a specific date
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date object
 * @returns {boolean}
 */
function isBusinessOpen(schedule, date) {
  return getScheduleForDate(schedule, date) !== null;
}

/**
 * Generate time slots for a specific date based on business hours
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date to generate slots for
 * @param {number} intervalMinutes - Interval in minutes (default 30)
 * @returns {Array} Array of time strings in HH:MM format
 */
function generateTimeSlots(schedule, date, intervalMinutes = 30) {
  const daySchedule = getScheduleForDate(schedule, date);

  if (!daySchedule) {
    return []; // Business is closed
  }

  const slots = [];
  const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

  // Convert to minutes since midnight
  let currentMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  while (currentMinutes < closeMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/**
 * Check if a specific time is within business hours
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date object
 * @param {string} time - Time in HH:MM format
 * @returns {boolean}
 */
function isTimeWithinBusinessHours(schedule, date, time) {
  const daySchedule = getScheduleForDate(schedule, date);

  if (!daySchedule) {
    return false;
  }

  const [hour, minute] = time.split(':').map(Number);
  const timeMinutes = hour * 60 + minute;

  const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
}

/**
 * Check if business is currently open (based on current time)
 * @param {object} schedule - Normalized schedule object
 * @returns {object} { isOpen: boolean, nextOpenTime: string|null }
 */
function getCurrentStatus(schedule) {
  const now = new Date();
  const daySchedule = getScheduleForDate(schedule, now);

  if (!daySchedule) {
    // Find next open day
    const nextOpenTime = getNextOpenTime(schedule, now);
    return { isOpen: false, nextOpenTime };
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, nextOpenTime: null };
  } else {
    const nextOpenTime = getNextOpenTime(schedule, now);
    return { isOpen: false, nextOpenTime };
  }
}

/**
 * Get next opening time
 * @param {object} schedule - Normalized schedule object
 * @param {Date} fromDate - Starting date
 * @returns {string|null} Next opening time as formatted string
 */
function getNextOpenTime(schedule, fromDate) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hebrewDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);

    const dayName = dayNames[checkDate.getDay()];
    const daySchedule = schedule[dayName];

    if (daySchedule && daySchedule.isOpen) {
      const hebrewDay = hebrewDayNames[checkDate.getDay()];
      return `${hebrewDay} ב-${daySchedule.openTime}`;
    }
  }

  return null;
}

/**
 * Parse exceptions from database format
 * @param {string|array} exceptionsData - Exceptions data from database
 * @returns {Array} Array of exception objects
 */
function parseExceptions(exceptionsData) {
  if (!exceptionsData) {
    return [];
  }

  let exceptions;

  if (typeof exceptionsData === 'string') {
    try {
      exceptions = JSON.parse(exceptionsData);
    } catch (e) {
      console.error('Error parsing exceptions:', e);
      return [];
    }
  } else {
    exceptions = exceptionsData;
  }

  if (!Array.isArray(exceptions)) {
    return [];
  }

  return exceptions;
}

/**
 * Get exception for a specific date
 * @param {Array} exceptions - Array of exception objects
 * @param {Date} date - Date to check
 * @returns {object|null} Exception object if found, null otherwise
 */
function getExceptionForDate(exceptions, date) {
  if (!exceptions || !Array.isArray(exceptions) || exceptions.length === 0) {
    return null;
  }

  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return exceptions.find(exception => {
    return dateString >= exception.startDate && dateString <= exception.endDate;
  }) || null;
}

/**
 * Check if business is open on a specific date (including exceptions)
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date object
 * @param {Array} exceptions - Array of exception objects
 * @returns {boolean}
 */
function isBusinessOpenWithExceptions(schedule, date, exceptions = []) {
  // Check for exception first
  const exception = getExceptionForDate(exceptions, date);

  if (exception) {
    // If it's a closure exception, business is closed
    if (exception.type === 'closure') {
      return false;
    }
    // If it's special_hours, business is open (but with different hours)
    // This will be handled in generateTimeSlotsWithExceptions
  }

  // Check regular weekly schedule
  return isBusinessOpen(schedule, date);
}

/**
 * Generate time slots for a specific date (including exceptions)
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date to generate slots for
 * @param {Array} exceptions - Array of exception objects
 * @param {number} intervalMinutes - Interval in minutes (default 30)
 * @returns {Array} Array of time strings in HH:MM format
 */
function generateTimeSlotsWithExceptions(schedule, date, exceptions = [], intervalMinutes = 30) {
  // Check for exception first
  const exception = getExceptionForDate(exceptions, date);

  if (exception) {
    // If it's a closure, return empty array
    if (exception.type === 'closure') {
      return [];
    }

    // If it's special_hours, use custom hours
    if (exception.type === 'special_hours' && exception.customHours) {
      return generateTimeSlotsFromHours(
        exception.customHours.openTime,
        exception.customHours.closeTime,
        intervalMinutes
      );
    }
  }

  // Use regular schedule
  return generateTimeSlots(schedule, date, intervalMinutes);
}

/**
 * Helper: Generate time slots from specific hours
 * @param {string} openTime - Opening time (HH:MM)
 * @param {string} closeTime - Closing time (HH:MM)
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {Array} Array of time strings
 */
function generateTimeSlotsFromHours(openTime, closeTime, intervalMinutes) {
  const slots = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  let currentMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  while (currentMinutes < closeMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

/**
 * Check if a specific time is within business hours (including exceptions)
 * @param {object} schedule - Normalized schedule object
 * @param {Date} date - Date object
 * @param {string} time - Time in HH:MM format
 * @param {Array} exceptions - Array of exception objects
 * @returns {boolean}
 */
function isTimeWithinBusinessHoursWithExceptions(schedule, date, time, exceptions = []) {
  // Check for exception first
  const exception = getExceptionForDate(exceptions, date);

  if (exception) {
    // If it's a closure, no times are valid
    if (exception.type === 'closure') {
      return false;
    }

    // If it's special_hours, check against custom hours
    if (exception.type === 'special_hours' && exception.customHours) {
      const [hour, minute] = time.split(':').map(Number);
      const timeMinutes = hour * 60 + minute;

      const [openHour, openMinute] = exception.customHours.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = exception.customHours.closeTime.split(':').map(Number);

      const openMinutes = openHour * 60 + openMinute;
      const closeMinutes = closeHour * 60 + closeMinute;

      return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
    }
  }

  // Check regular schedule
  return isTimeWithinBusinessHours(schedule, date, time);
}

module.exports = {
  parseSchedule,
  getDefaultSchedule,
  getScheduleForDate,
  isBusinessOpen,
  generateTimeSlots,
  isTimeWithinBusinessHours,
  getCurrentStatus,
  getNextOpenTime,
  // Exception handling functions
  parseExceptions,
  getExceptionForDate,
  isBusinessOpenWithExceptions,
  generateTimeSlotsWithExceptions,
  isTimeWithinBusinessHoursWithExceptions
};
