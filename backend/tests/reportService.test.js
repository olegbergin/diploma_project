/**
 * Report Service Tests
 * Tests for business analytics and report generation
 */

// Mock database singleton
const mockDb = {
  query: jest.fn()
};

jest.mock('../dbSingleton', () => ({
  getPromise: () => mockDb
}));

const reportService = require('../services/reportService');

describe('Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyReport', () => {
    const mockBusiness = {
      business_id: 1,
      name: 'Test Business',
      category: 'test',
      description: 'Test business'
    };

    const mockAppointments = [
      {
        appointment_id: 1,
        customer_id: 1,
        business_id: 1,
        service_id: 1,
        appointment_datetime: '2025-09-10 10:00:00',
        status: 'completed',
        first_name: 'John',
        last_name: 'Doe',
        phone: '123-456-7890',
        service_name: 'Haircut',
        price: 30,
        duration_minutes: 30
      },
      {
        appointment_id: 2,
        customer_id: 2,
        business_id: 1,
        service_id: 2,
        appointment_datetime: '2025-09-10 14:00:00',
        status: 'completed',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '987-654-3210',
        service_name: 'Color',
        price: 80,
        duration_minutes: 90
      },
      {
        appointment_id: 3,
        customer_id: 3,
        business_id: 1,
        service_id: 1,
        appointment_datetime: '2025-09-10 16:00:00',
        status: 'cancelled_by_user',
        first_name: 'Bob',
        last_name: 'Johnson',
        phone: '555-123-4567',
        service_name: 'Haircut',
        price: 30,
        duration_minutes: 30
      }
    ];

    test('should generate daily report with correct metrics', async () => {
      // Mock database calls
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]]) // Business info
        .mockResolvedValueOnce([mockAppointments]) // Appointments
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]); // New customers (mocked)

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.business).toEqual(mockBusiness);
      expect(result.reportDate).toBe('2025-09-10');
      expect(result.reportType).toBe('daily');

      // Check summary calculations
      expect(result.summary).toEqual({
        totalAppointments: 3,
        completedAppointments: 2,
        cancelledAppointments: 1,
        noShowAppointments: 0,
        pendingAppointments: 0,
        dailyRevenue: 110, // 30 + 80 (only completed appointments)
        uniqueCustomers: 3, // 3 different customer IDs
        newCustomers: 1,
        completionRate: '66.7' // 2/3 * 100
      });

      expect(result.appointments).toEqual(mockAppointments);
    });

    test('should calculate service breakdown correctly', async () => {
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([mockAppointments])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.serviceBreakdown).toEqual([
        { serviceName: 'Haircut', count: 2, revenue: 30 }, // 1 completed, 1 cancelled
        { serviceName: 'Color', count: 1, revenue: 80 }
      ]);
    });

    test('should calculate hourly distribution correctly', async () => {
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([mockAppointments])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.hourlyDistribution).toEqual([
        { hour: '10:00', appointments: 1 },
        { hour: '14:00', appointments: 1 },
        { hour: '16:00', appointments: 1 }
      ]);
    });

    test('should handle business not found', async () => {
      mockDb.query.mockResolvedValueOnce([[]]); // No business found

      await expect(reportService.generateDailyReport(999, '2025-09-10'))
        .rejects.toThrow('Business not found');
    });

    test('should handle empty appointments', async () => {
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([[]]) // No appointments
        .mockResolvedValueOnce([[{ new_customers_count: 0 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary).toEqual({
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        pendingAppointments: 0,
        dailyRevenue: 0,
        uniqueCustomers: 0,
        newCustomers: 0,
        completionRate: 0
      });

      expect(result.serviceBreakdown).toEqual([]);
      expect(result.hourlyDistribution).toEqual([]);
    });

    test('should handle appointments with missing service names', async () => {
      const appointmentsWithMissingService = [
        {
          ...mockAppointments[0],
          service_name: null,
          price: 50
        }
      ];

      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([appointmentsWithMissingService])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.serviceBreakdown).toEqual([
        { serviceName: 'Unknown Service', count: 1, revenue: 50 }
      ]);
    });

    test('should handle appointments with null prices', async () => {
      const appointmentsWithNullPrice = [
        {
          ...mockAppointments[0],
          price: null,
          status: 'completed'
        }
      ];

      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([appointmentsWithNullPrice])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary.dailyRevenue).toBe(0);
      expect(result.serviceBreakdown[0].revenue).toBe(0);
    });

    test('should calculate completion rate as 0 when no appointments', async () => {
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ new_customers_count: 0 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary.completionRate).toBe(0);
    });

    test('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(reportService.generateDailyReport(1, '2025-09-10'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('getNewCustomersCount (helper method)', () => {
    test('should be called during daily report generation', async () => {
      const mockBusiness = { business_id: 1, name: 'Test Business' };
      
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[{ new_customers_count: 5 }]]); // New customers count

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary.newCustomers).toBe(5);
      expect(mockDb.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('SELECT COUNT(*) as new_customers_count'),
        [1, '2025-09-10']
      );
    });
  });

  describe('Status Filtering', () => {
    const appointmentsWithDifferentStatuses = [
      { 
        appointment_id: 1,
        customer_id: 1,
        business_id: 1,
        service_id: 1,
        appointment_datetime: '2025-09-10 10:00:00',
        status: 'completed',
        service_name: 'Test Service',
        price: 30
      },
      {
        appointment_id: 2,
        customer_id: 2,
        business_id: 1,
        service_id: 2,
        appointment_datetime: '2025-09-10 11:00:00',
        status: 'cancelled_by_user',
        service_name: 'Test Service',
        price: 50
      },
      {
        appointment_id: 3,
        customer_id: 3,
        business_id: 1,
        service_id: 3,
        appointment_datetime: '2025-09-10 13:00:00',
        status: 'cancelled_by_business',
        service_name: 'Test Service',
        price: 40
      },
      { 
        appointment_id: 4,
        customer_id: 4,
        status: 'not_arrived',
        service_name: 'Test Service',
        price: 25,
        appointment_datetime: '2025-09-10 12:00:00'
      },
      {
        appointment_id: 5,
        customer_id: 5,
        status: 'pending',
        service_name: 'Test Service',
        price: 35,
        appointment_datetime: '2025-09-10 15:00:00'
      }
    ];

    test('should categorize appointments by status correctly', async () => {
      const mockBusiness = { business_id: 1, name: 'Test Business' };
      
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([appointmentsWithDifferentStatuses])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary).toEqual(expect.objectContaining({
        totalAppointments: 5,
        completedAppointments: 1,
        cancelledAppointments: 2, // cancelled_by_user + cancelled_by_business
        noShowAppointments: 1, // not_arrived
        pendingAppointments: 1,
        dailyRevenue: 30 // Only completed appointment
      }));
    });

    test('should only include completed appointments in revenue calculation', async () => {
      const mixedStatusAppointments = [
        { status: 'completed', price: 100, service_name: 'Service A', customer_id: 1, appointment_datetime: '2025-09-10 10:00:00' },
        { status: 'cancelled_by_user', price: 50, service_name: 'Service B', customer_id: 2, appointment_datetime: '2025-09-10 11:00:00' },
        { status: 'pending', price: 75, service_name: 'Service C', customer_id: 3, appointment_datetime: '2025-09-10 12:00:00' }
      ];

      const mockBusiness = { business_id: 1, name: 'Test Business' };
      
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([mixedStatusAppointments])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      const result = await reportService.generateDailyReport(1, '2025-09-10');

      expect(result.summary.dailyRevenue).toBe(100); // Only the completed appointment
      
      // Check service breakdown revenue (only completed appointments contribute)
      const serviceA = result.serviceBreakdown.find(s => s.serviceName === 'Service A');
      const serviceB = result.serviceBreakdown.find(s => s.serviceName === 'Service B');
      const serviceC = result.serviceBreakdown.find(s => s.serviceName === 'Service C');

      expect(serviceA.revenue).toBe(100);
      expect(serviceB.revenue).toBe(0); // Cancelled, no revenue
      expect(serviceC.revenue).toBe(0); // Pending, no revenue
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('should handle malformed date strings in appointments', async () => {
      const appointmentWithBadDate = [
        {
          appointment_id: 1,
          customer_id: 1,
          status: 'completed',
          service_name: 'Test',
          price: 50,
          appointment_datetime: 'invalid-date-string'
        }
      ];

      const mockBusiness = { business_id: 1, name: 'Test Business' };
      
      mockDb.query
        .mockResolvedValueOnce([[mockBusiness]])
        .mockResolvedValueOnce([appointmentWithBadDate])
        .mockResolvedValueOnce([[{ new_customers_count: 1 }]]);

      // Should not throw error, but hour might be NaN
      const result = await reportService.generateDailyReport(1, '2025-09-10');
      
      expect(result.summary.totalAppointments).toBe(1);
      // Hourly distribution might have NaN hour, which is acceptable for this edge case
    });
  });
});