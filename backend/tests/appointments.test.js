/**
 * Appointment Controller Tests
 * Tests for appointment booking system with customer management
 */

// Mock database singleton
const mockDb = {
  query: jest.fn()
};

jest.mock('../dbSingleton', () => ({
  getPromise: () => mockDb
}));

const appointmentController = require('../controllers/appointmentController');

describe('Appointment Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createAppointment', () => {
    const validAppointmentData = {
      businessId: 1,
      serviceId: 1,
      date: '2025-09-10',
      time: '10:00',
      serviceName: 'Test Service',
      servicePrice: 50,
      serviceDuration: 60,
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        email: 'john@test.com',
        notes: 'Test appointment'
      }
    };

    test('should create appointment with existing customer', async () => {
      req.body = validAppointmentData;

      // Mock existing customer lookup
      mockDb.query
        .mockResolvedValueOnce([{ user_id: 123 }]) // Customer exists
        .mockResolvedValueOnce([{ insertId: 456 }]); // Appointment created

      await appointmentController.createAppointment(req, res);

      // Should check for existing customer
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT user_id FROM users WHERE phone = ?',
        ['123-456-7890']
      );

      // Should create appointment with existing customer ID (second call)
      expect(mockDb.query).toHaveBeenNthCalledWith(
        2, // Second call should be appointment creation
        expect.stringContaining('INSERT INTO appointments'),
        expect.arrayContaining([123, 1, 1, '2025-09-10 10:00:00'])
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Appointment created successfully',
        appointmentId: 456
      });
    });

    test('should create appointment with new customer', async () => {
      req.body = validAppointmentData;

      // Mock no existing customer, then customer creation, then appointment creation
      mockDb.query
        .mockResolvedValueOnce([]) // No existing customer
        .mockResolvedValueOnce([{ insertId: 789 }]) // New customer created
        .mockResolvedValueOnce([{ insertId: 456 }]); // Appointment created

      await appointmentController.createAppointment(req, res);

      // Should create new customer (second call)
      expect(mockDb.query).toHaveBeenNthCalledWith(
        2, // Second call should be customer creation
        expect.stringContaining('INSERT INTO users'),
        ['John', 'Doe', '123-456-7890', 'john@test.com']
      );

      // Should create appointment with new customer ID (third call)
      expect(mockDb.query).toHaveBeenNthCalledWith(
        3, // Third call should be appointment creation
        expect.stringContaining('INSERT INTO appointments'),
        expect.arrayContaining([789, 1, 1, '2025-09-10 10:00:00'])
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle missing required fields', async () => {
      req.body = {
        businessId: 1,
        // Missing serviceId, date, time, customerInfo
      };

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessId', 'serviceId', 'date', 'time', 'customerInfo']
      });

      // Should not make database calls
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    test('should handle missing customer information', async () => {
      req.body = {
        ...validAppointmentData,
        customerInfo: {
          firstName: 'John',
          // Missing lastName and phone
          email: 'john@test.com'
        }
      };

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required customer information',
        required: ['firstName', 'lastName', 'phone']
      });
    });

    test('should handle database errors during customer lookup', async () => {
      req.body = validAppointmentData;

      // Mock database error
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to create appointment'
        })
      );
    });

    test('should handle database errors during customer creation', async () => {
      req.body = validAppointmentData;

      // Mock no existing customer, then error during customer creation
      mockDb.query
        .mockResolvedValueOnce([]) // No existing customer
        .mockRejectedValueOnce(new Error('Customer creation failed'));

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to create appointment'
        })
      );
    });

    test('should handle database errors during appointment creation', async () => {
      req.body = validAppointmentData;

      // Mock existing customer, then error during appointment creation
      mockDb.query
        .mockResolvedValueOnce([{ user_id: 123 }]) // Customer exists
        .mockRejectedValueOnce(new Error('Appointment creation failed'));

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to create appointment'
        })
      );
    });

    test('should format datetime correctly', async () => {
      req.body = {
        ...validAppointmentData,
        date: '2025-12-25',
        time: '14:30'
      };

      mockDb.query
        .mockResolvedValueOnce([{ user_id: 123 }]) // Customer exists
        .mockResolvedValueOnce([{ insertId: 456 }]); // Appointment created

      await appointmentController.createAppointment(req, res);

      // Should format datetime as MySQL datetime string - check the second call
      expect(mockDb.query).toHaveBeenNthCalledWith(
        2, // Second call should be the appointment insertion
        expect.stringContaining('INSERT INTO appointments'),
        expect.arrayContaining([123, 1, 1, '2025-12-25 14:30:00'])
      );
    });

    test('should handle customer without email', async () => {
      req.body = {
        ...validAppointmentData,
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '123-456-7890'
          // No email
        }
      };

      mockDb.query
        .mockResolvedValueOnce([]) // No existing customer
        .mockResolvedValueOnce([{ insertId: 789 }]) // New customer created
        .mockResolvedValueOnce([{ insertId: 456 }]); // Appointment created

      await appointmentController.createAppointment(req, res);

      // Should create customer with null email - check the second call
      expect(mockDb.query).toHaveBeenNthCalledWith(
        2, // Second call should be customer creation
        expect.stringContaining('INSERT INTO users'),
        ['John', 'Doe', '123-456-7890', null]
      );
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle empty request body', async () => {
      req.body = {};

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessId', 'serviceId', 'date', 'time', 'customerInfo']
      });
    });

    test('should handle null customerInfo', async () => {
      req.body = {
        businessId: 1,
        serviceId: 1,
        date: '2025-09-10',
        time: '10:00',
        customerInfo: null
      };

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        required: ['businessId', 'serviceId', 'date', 'time', 'customerInfo']
      });
    });

    test('should handle empty customer info object', async () => {
      req.body = {
        businessId: 1,
        serviceId: 1,
        date: '2025-09-10',
        time: '10:00',
        customerInfo: {}
      };

      await appointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required customer information',
        required: ['firstName', 'lastName', 'phone']
      });
    });
  });
});