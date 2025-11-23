const scheduleUtils = require('../utils/scheduleUtils');

describe('Exception Handling', () => {
  const schedule = {
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  };

  describe('parseExceptions', () => {
    test('should parse JSON string exceptions', () => {
      const exceptionsString = JSON.stringify([
        {
          id: '1',
          type: 'closure',
          title: 'חופשת קיץ',
          startDate: '2025-08-01',
          endDate: '2025-08-15',
          reason: 'vacation'
        }
      ]);

      const result = scheduleUtils.parseExceptions(exceptionsString);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('חופשת קיץ');
    });

    test('should return empty array for invalid input', () => {
      expect(scheduleUtils.parseExceptions(null)).toEqual([]);
      expect(scheduleUtils.parseExceptions('invalid json')).toEqual([]);
      expect(scheduleUtils.parseExceptions({})).toEqual([]);
    });
  });

  describe('getExceptionForDate', () => {
    const exceptions = [
      {
        id: '1',
        type: 'closure',
        title: 'חופשת קיץ',
        startDate: '2025-08-01',
        endDate: '2025-08-15',
        reason: 'vacation'
      },
      {
        id: '2',
        type: 'special_hours',
        title: 'פסח',
        startDate: '2025-04-13',
        endDate: '2025-04-20',
        reason: 'holiday',
        customHours: { openTime: '08:00', closeTime: '14:00' }
      }
    ];

    test('should find exception for date within range', () => {
      const date = new Date('2025-08-10');
      const exception = scheduleUtils.getExceptionForDate(exceptions, date);

      expect(exception).not.toBeNull();
      expect(exception.title).toBe('חופשת קיץ');
    });

    test('should find exception on start date', () => {
      const date = new Date('2025-08-01');
      const exception = scheduleUtils.getExceptionForDate(exceptions, date);

      expect(exception).not.toBeNull();
      expect(exception.title).toBe('חופשת קיץ');
    });

    test('should find exception on end date', () => {
      const date = new Date('2025-08-15');
      const exception = scheduleUtils.getExceptionForDate(exceptions, date);

      expect(exception).not.toBeNull();
      expect(exception.title).toBe('חופשת קיץ');
    });

    test('should return null for date outside exception ranges', () => {
      const date = new Date('2025-09-01');
      const exception = scheduleUtils.getExceptionForDate(exceptions, date);

      expect(exception).toBeNull();
    });
  });

  describe('isBusinessOpenWithExceptions', () => {
    test('should return false for closure exception', () => {
      const exceptions = [
        {
          type: 'closure',
          startDate: '2025-08-01',
          endDate: '2025-08-15'
        }
      ];

      const date = new Date('2025-08-10'); // Monday
      const isOpen = scheduleUtils.isBusinessOpenWithExceptions(schedule, date, exceptions);

      expect(isOpen).toBe(false);
    });

    test('should return true for special_hours exception on normally open day', () => {
      const exceptions = [
        {
          type: 'special_hours',
          startDate: '2025-08-01',
          endDate: '2025-08-15',
          customHours: { openTime: '08:00', closeTime: '14:00' }
        }
      ];

      const date = new Date('2025-08-04'); // Monday
      const isOpen = scheduleUtils.isBusinessOpenWithExceptions(schedule, date, exceptions);

      expect(isOpen).toBe(true);
    });

    test('should use regular schedule when no exception', () => {
      const exceptions = [];
      const monday = new Date('2025-08-04'); // Monday
      const sunday = new Date('2025-08-03'); // Sunday

      expect(scheduleUtils.isBusinessOpenWithExceptions(schedule, monday, exceptions)).toBe(true);
      expect(scheduleUtils.isBusinessOpenWithExceptions(schedule, sunday, exceptions)).toBe(false);
    });
  });

  describe('generateTimeSlotsWithExceptions', () => {
    test('should return empty array for closure exception', () => {
      const exceptions = [
        {
          type: 'closure',
          startDate: '2025-08-01',
          endDate: '2025-08-15'
        }
      ];

      const date = new Date('2025-08-10');
      const slots = scheduleUtils.generateTimeSlotsWithExceptions(schedule, date, exceptions, 30);

      expect(slots).toEqual([]);
    });

    test('should generate slots with custom hours for special_hours exception', () => {
      const exceptions = [
        {
          type: 'special_hours',
          startDate: '2025-08-01',
          endDate: '2025-08-15',
          customHours: { openTime: '08:00', closeTime: '10:00' }
        }
      ];

      const date = new Date('2025-08-04'); // Monday
      const slots = scheduleUtils.generateTimeSlotsWithExceptions(schedule, date, exceptions, 30);

      expect(slots).toContain('08:00');
      expect(slots).toContain('08:30');
      expect(slots).toContain('09:00');
      expect(slots).toContain('09:30');
      expect(slots).not.toContain('10:00'); // closeTime is exclusive
      expect(slots).not.toContain('10:30'); // Beyond custom hours
    });

    test('should use regular schedule when no exception', () => {
      const exceptions = [];
      const monday = new Date('2025-08-04'); // Monday

      const slots = scheduleUtils.generateTimeSlotsWithExceptions(schedule, monday, exceptions, 60);

      expect(slots).toContain('09:00');
      expect(slots).toContain('10:00');
      expect(slots).not.toContain('08:00');
    });
  });

  describe('isTimeWithinBusinessHoursWithExceptions', () => {
    test('should return false for any time during closure exception', () => {
      const exceptions = [
        {
          type: 'closure',
          startDate: '2025-08-01',
          endDate: '2025-08-15'
        }
      ];

      const date = new Date('2025-08-10'); // Monday
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '10:00', exceptions)).toBe(false);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '14:00', exceptions)).toBe(false);
    });

    test('should validate against custom hours for special_hours exception', () => {
      const exceptions = [
        {
          type: 'special_hours',
          startDate: '2025-08-01',
          endDate: '2025-08-15',
          customHours: { openTime: '08:00', closeTime: '12:00' }
        }
      ];

      const date = new Date('2025-08-04'); // Monday

      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '08:00', exceptions)).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '10:00', exceptions)).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '11:59', exceptions)).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '12:00', exceptions)).toBe(false);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, date, '14:00', exceptions)).toBe(false);
    });

    test('should use regular hours when no exception', () => {
      const exceptions = [];
      const monday = new Date('2025-08-04'); // Monday (09:00-17:00)

      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, monday, '09:00', exceptions)).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, monday, '16:00', exceptions)).toBe(true);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, monday, '17:00', exceptions)).toBe(false);
      expect(scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, monday, '08:00', exceptions)).toBe(false);
    });
  });
});
