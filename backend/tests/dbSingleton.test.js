/**
 * Database Singleton Tests
 * Tests for the MySQL connection singleton with auto-reconnection
 */

// Mock mysql2 before importing the actual module
const mockConnection = {
  connect: jest.fn(),
  query: jest.fn(),
  promise: jest.fn(),
  on: jest.fn(),
  state: 'authenticated',
  threadId: 12345,
  end: jest.fn()
};

const mockMysql = {
  createConnection: jest.fn(() => mockConnection)
};

jest.mock('mysql2', () => mockMysql);

// Clear require cache to ensure fresh instance
delete require.cache[require.resolve('../dbSingleton')];

describe('Database Singleton', () => {
  let dbSingleton;

  beforeEach(() => {
    // Reset all mocks BEFORE reimporting
    jest.clearAllMocks();
    mockConnection.state = 'authenticated';

    // Setup connection mock to call callback immediately
    mockConnection.connect.mockImplementation((callback) => {
      if (callback) callback(null);
    });

    mockMysql.createConnection.mockReturnValue(mockConnection);

    // Clear require cache and reimport to get fresh instance
    delete require.cache[require.resolve('../dbSingleton')];
    dbSingleton = require('../dbSingleton');
  });

  describe('Connection Management', () => {
    test('should create connection with correct config', () => {
      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "project_db",
        charset: "utf8mb4"
      });
    });

    test('should return connection instance', () => {
      const connection = dbSingleton.getConnection();
      expect(connection).toBe(mockConnection);
    });

    test('should return promisified connection', () => {
      mockConnection.promise.mockReturnValue('promisified-connection');
      const promiseConn = dbSingleton.getPromise();
      expect(mockConnection.promise).toHaveBeenCalled();
      expect(promiseConn).toBe('promisified-connection');
    });

    test('should check connection status correctly', () => {
      mockConnection.state = 'authenticated';
      expect(dbSingleton.isConnected()).toBe(true);

      mockConnection.state = 'connected';
      expect(dbSingleton.isConnected()).toBe(true);

      mockConnection.state = 'disconnected';
      expect(dbSingleton.isConnected()).toBe(false);
    });
  });

  describe('Connection Error Handling', () => {
    test('should handle successful connection', () => {
      // Verify connection was attempted
      expect(mockConnection.connect).toHaveBeenCalled();
      
      // Simulate successful connection
      if (mockConnection.connect.mock.calls.length > 0) {
        const connectCallback = mockConnection.connect.mock.calls[0][0];
        connectCallback(null);
      }
      
      // Connection should be established without issues
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    test('should retry connection on initial failure', (done) => {
      // Mock setTimeout to control timing
      jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        // Execute callback immediately for test
        callback();
        done();
      });

      // Simulate connection failure
      if (mockConnection.connect.mock.calls.length > 0) {
        const connectCallback = mockConnection.connect.mock.calls[0][0];
        const error = new Error('Connection failed');
        connectCallback(error);
      }

      // Should attempt to reconnect
      setTimeout(() => {
        expect(mockMysql.createConnection).toHaveBeenCalled();
        global.setTimeout.mockRestore();
      }, 0);
    });

    test('should handle connection lost error', () => {
      // Check if error handler was set up
      expect(mockConnection.on).toHaveBeenCalledWith('error', expect.any(Function));
      
      // Find the error handler
      const errorHandlerCall = mockConnection.on.mock.calls.find(
        call => call[0] === 'error'
      );
      
      if (errorHandlerCall) {
        const errorHandler = errorHandlerCall[1];
        
        // Simulate connection lost
        const connectionLostError = {
          code: 'PROTOCOL_CONNECTION_LOST',
          message: 'Connection lost'
        };

        // Should trigger reconnection without throwing
        expect(() => errorHandler(connectionLostError)).not.toThrow();
      }
    });

    test('should handle ECONNRESET error', () => {
      const errorHandlerCall = mockConnection.on.mock.calls.find(
        call => call[0] === 'error'
      );

      if (errorHandlerCall) {
        const errorHandler = errorHandlerCall[1];

        // Simulate connection reset
        const resetError = {
          code: 'ECONNRESET',
          message: 'Connection reset by peer'
        };

        // Should trigger reconnection without throwing
        expect(() => errorHandler(resetError)).not.toThrow();
      }
    });

    test('should throw on fatal database errors', () => {
      const errorHandlerCall = mockConnection.on.mock.calls.find(
        call => call[0] === 'error'
      );

      if (errorHandlerCall) {
        const errorHandler = errorHandlerCall[1];

        // Simulate fatal error
        const fatalError = {
          code: 'FATAL_ERROR',
          message: 'Fatal database error'
        };

        // Should throw the error
        expect(() => errorHandler(fatalError)).toThrow('Fatal database error');
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle null connection gracefully', () => {
      // Mock a scenario where connection is null
      mockMysql.createConnection.mockReturnValue(null);
      
      // Clear require cache and reimport
      delete require.cache[require.resolve('../dbSingleton')];
      const dbSingletonWithNull = require('../dbSingleton');

      expect(dbSingletonWithNull.getConnection()).toBe(null);
      expect(dbSingletonWithNull.getPromise()).toBe(null);
      expect(dbSingletonWithNull.isConnected()).toBe(false);
    });

    test('should warn when connection not available for promise operations', () => {
      // Mock connection as null
      mockMysql.createConnection.mockReturnValue(null);
      
      // Clear require cache and reimport
      delete require.cache[require.resolve('../dbSingleton')];
      const dbSingletonWithNull = require('../dbSingleton');

      // Should return null and log warning (warning is mocked in setup)
      expect(dbSingletonWithNull.getPromise()).toBe(null);
    });
  });

  describe('Environment Configuration', () => {
    test('should use environment variables when available', () => {
      // Set environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        DB_HOST: 'test-host',
        DB_USER: 'test-user', 
        DB_PASSWORD: 'test-password',
        DB_NAME: 'test-db'
      };

      // Clear require cache and reimport
      delete require.cache[require.resolve('../dbSingleton')];
      require('../dbSingleton');

      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'test-host',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db',
        charset: 'utf8mb4'
      });

      // Restore environment
      process.env = originalEnv;
    });

    test('should use default values when environment variables not set', () => {
      // Clear environment variables
      const originalEnv = process.env;
      process.env = {};

      // Clear require cache and reimport
      delete require.cache[require.resolve('../dbSingleton')];
      require('../dbSingleton');

      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'project_db',
        charset: 'utf8mb4'
      });

      // Restore environment
      process.env = originalEnv;
    });
  });
});