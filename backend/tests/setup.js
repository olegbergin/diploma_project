/**
 * Jest Test Setup
 * Global configuration for all tests
 */

// Load environment variables from .env file
require('dotenv').config();

// Set test timeout to 30 seconds (for email tests)
jest.setTimeout(30000);

// Keep console output for email tests (useful for debugging)
// If you want to suppress console output, uncomment the lines below:
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn()
// };

// Global test helpers
global.testHelpers = {
  // Helper to create mock database response
  mockDbResponse: (data) => [data],
  
  // Helper to create mock user data
  mockUser: (overrides = {}) => ({
    user_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    phone: '123-456-7890',
    role: 'customer',
    password_hash: '$2a$10$mockhashedpassword',
    ...overrides
  }),
  
  // Helper to create mock appointment data
  mockAppointment: (overrides = {}) => ({
    appointment_id: 1,
    customer_id: 1,
    business_id: 1,
    service_id: 1,
    appointment_datetime: '2025-09-10 10:00:00',
    status: 'confirmed',
    notes: 'Test appointment',
    ...overrides
  }),
  
  // Helper to create mock business data
  mockBusiness: (overrides = {}) => ({
    business_id: 1,
    name: 'Test Business',
    category: 'test',
    description: 'Test business description',
    location: 'Test City',
    photos: '[]',
    schedule: '{}',
    ...overrides
  })
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});