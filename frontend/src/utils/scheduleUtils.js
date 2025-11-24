/**
 * Utility functions for working with business schedule/working hours on the frontend
 */

/**
 * Parse schedule from various formats
 * @param {string|object} scheduleData - Schedule data from API
 * @returns {object} Normalized schedule object
 */
export function parseSchedule(scheduleData) {
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

  // Handle nested format
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
 * Get default schedule
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
 * Get Hebrew day names
 */
export const hebrewDayNames = {
  sunday: 'ראשון',
  monday: 'שני',
  tuesday: 'שלישי',
  wednesday: 'רביעי',
  thursday: 'חמישי',
  friday: 'שישי',
  saturday: 'שבת'
};

/**
 * Format schedule for display
 * @param {object} schedule - Normalized schedule object
 * @returns {Array} Array of formatted day objects
 */
export function formatScheduleForDisplay(schedule) {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return dayOrder.map(day => {
    const daySchedule = schedule[day];
    return {
      day: day,
      hebrewName: hebrewDayNames[day],
      isOpen: daySchedule?.isOpen || false,
      hours: daySchedule?.isOpen
        ? `${daySchedule.openTime} - ${daySchedule.closeTime}`
        : 'סגור'
    };
  });
}

/**
 * Get current status of business
 * @param {object} schedule - Normalized schedule object
 * @returns {object} { isOpen: boolean, nextOpenDay: string|null }
 */
export function getCurrentStatus(schedule) {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayName = dayNames[now.getDay()];
  const daySchedule = schedule[currentDayName];

  if (!daySchedule || !daySchedule.isOpen) {
    return {
      isOpen: false,
      currentDayHours: null,
      nextOpenDay: getNextOpenDay(schedule, now)
    };
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      currentDayHours: `${daySchedule.openTime} - ${daySchedule.closeTime}`,
      nextOpenDay: null
    };
  } else {
    return {
      isOpen: false,
      currentDayHours: `${daySchedule.openTime} - ${daySchedule.closeTime}`,
      nextOpenDay: getNextOpenDay(schedule, now)
    };
  }
}

/**
 * Get next open day
 */
function getNextOpenDay(schedule, fromDate) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);

    const dayName = dayNames[checkDate.getDay()];
    const daySchedule = schedule[dayName];

    if (daySchedule && daySchedule.isOpen) {
      const hebrewDay = hebrewDayNames[dayName];
      return `${hebrewDay} ב-${daySchedule.openTime}`;
    }
  }

  return null;
}

/**
 * Check if business is currently open
 * @param {object} schedule - Normalized schedule object
 * @returns {boolean}
 */
export function isCurrentlyOpen(schedule) {
  const status = getCurrentStatus(schedule);
  return status.isOpen;
}
