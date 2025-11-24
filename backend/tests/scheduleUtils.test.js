const scheduleUtils = require('../utils/scheduleUtils');

describe('Schedule Utils', () => {
  describe('parseSchedule', () => {
    test('should parse English format schedule', () => {
      const schedule = {
        sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
      };

      const result = scheduleUtils.parseSchedule(schedule);
      expect(result).toEqual(schedule);
    });

    test('should parse JSON string schedule', () => {
      const scheduleString = JSON.stringify({
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
      });

      const result = scheduleUtils.parseSchedule(scheduleString);
      expect(result.monday).toBeDefined();
      expect(result.monday.isOpen).toBe(true);
    });

    test('should parse Hebrew format schedule', () => {
      const hebrewSchedule = {
        'ראשון': 'סגור',
        'שני': '09:00-17:00',
        'שלישי': '09:00-17:00',
        'רביעי': '09:00-17:00',
        'חמישי': '09:00-17:00',
        'שישי': '09:00-14:00',
        'שבת': 'סגור'
      };

      const result = scheduleUtils.parseSchedule(hebrewSchedule);
      expect(result.monday.isOpen).toBe(true);
      expect(result.monday.openTime).toBe('09:00');
      expect(result.monday.closeTime).toBe('17:00');
      expect(result.sunday.isOpen).toBe(false);
    });

    test('should handle nested opening_hours format', () => {
      const nested = {
        opening_hours: {
          monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
        }
      };

      const result = scheduleUtils.parseSchedule(nested);
      expect(result.monday).toBeDefined();
    });

    test('should return default schedule for invalid input', () => {
      const result = scheduleUtils.parseSchedule('invalid json');
      expect(result).toBeDefined();
      expect(result.monday).toBeDefined();
    });
  });

  describe('isBusinessOpen', () => {
    const schedule = {
      sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
    };

    test('should return true for open day (Monday)', () => {
      const monday = new Date('2024-01-01'); // This is a Monday
      expect(scheduleUtils.isBusinessOpen(schedule, monday)).toBe(true);
    });

    test('should return false for closed day (Sunday)', () => {
      const sunday = new Date('2024-01-07'); // This is a Sunday
      expect(scheduleUtils.isBusinessOpen(schedule, sunday)).toBe(false);
    });

    test('should return false for closed day (Saturday)', () => {
      const saturday = new Date('2024-01-06'); // This is a Saturday
      expect(scheduleUtils.isBusinessOpen(schedule, saturday)).toBe(false);
    });
  });

  describe('generateTimeSlots', () => {
    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '12:00' }
    };

    test('should generate 30-minute slots within business hours', () => {
      const monday = new Date('2024-01-01');
      const slots = scheduleUtils.generateTimeSlots(schedule, monday, 30);

      expect(slots).toContain('09:00');
      expect(slots).toContain('09:30');
      expect(slots).toContain('10:00');
      expect(slots).toContain('11:30');
      expect(slots).not.toContain('12:00'); // closeTime is exclusive
    });

    test('should generate 60-minute slots', () => {
      const monday = new Date('2024-01-01');
      const slots = scheduleUtils.generateTimeSlots(schedule, monday, 60);

      expect(slots).toContain('09:00');
      expect(slots).toContain('10:00');
      expect(slots).toContain('11:00');
      expect(slots).not.toContain('09:30');
    });

    test('should return empty array for closed days', () => {
      const scheduleWithClosedDay = {
        sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
      };
      const sunday = new Date('2024-01-07');
      const slots = scheduleUtils.generateTimeSlots(scheduleWithClosedDay, sunday, 30);

      expect(slots).toEqual([]);
    });
  });

  describe('isTimeWithinBusinessHours', () => {
    const schedule = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
    };

    test('should return true for time within hours', () => {
      const monday = new Date('2024-01-01');
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '10:00')).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '09:00')).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '16:59')).toBe(true);
    });

    test('should return false for time outside hours', () => {
      const monday = new Date('2024-01-01');
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '08:00')).toBe(false);
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '17:00')).toBe(false);
      expect(scheduleUtils.isTimeWithinBusinessHours(schedule, monday, '18:00')).toBe(false);
    });

    test('should return false for closed days', () => {
      const scheduleWithClosedDay = {
        sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
      };
      const sunday = new Date('2024-01-07');
      expect(scheduleUtils.isTimeWithinBusinessHours(scheduleWithClosedDay, sunday, '10:00')).toBe(false);
    });
  });

  describe('getCurrentStatus', () => {
    test('should return isOpen true during business hours', () => {
      // Mock current time to be Monday 10:00 AM
      const mockDate = new Date('2024-01-01T10:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const schedule = {
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
      };

      const status = scheduleUtils.getCurrentStatus(schedule);
      expect(status.isOpen).toBe(true);

      global.Date.mockRestore();
    });

    test('should return isOpen false outside business hours', () => {
      // Mock current time to be Monday 8:00 AM (before opening)
      const mockDate = new Date('2024-01-01T08:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const schedule = {
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
      };

      const status = scheduleUtils.getCurrentStatus(schedule);
      expect(status.isOpen).toBe(false);
      expect(status.nextOpenTime).toBeDefined();

      global.Date.mockRestore();
    });

    test('should return isOpen false on closed days', () => {
      // Mock current time to be Sunday 10:00 AM
      const mockDate = new Date('2024-01-07T10:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const schedule = {
        sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
      };

      const status = scheduleUtils.getCurrentStatus(schedule);
      expect(status.isOpen).toBe(false);

      global.Date.mockRestore();
    });
  });

  describe('getDefaultSchedule', () => {
    test('should return valid default schedule', () => {
      const schedule = scheduleUtils.getDefaultSchedule();

      expect(schedule.sunday).toBeDefined();
      expect(schedule.monday).toBeDefined();
      expect(schedule.monday.isOpen).toBe(true);
      expect(schedule.sunday.isOpen).toBe(false);
      expect(schedule.saturday.isOpen).toBe(false);
    });
  });
});
