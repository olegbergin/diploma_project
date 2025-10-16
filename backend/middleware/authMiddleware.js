/**
 * Authentication Middleware Module
 * Provides JWT token verification and role-based authorization
 *
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');

/**
 * JWT Secret key for token verification
 * @type {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || 'my_name_is_oleg';

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 * Adds decoded user data to req.user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user data to request object
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please log in again.'
      });
    }
    return res.status(403).json({
      error: 'Invalid token.'
    });
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user has business role
 * Must be used after authenticateToken middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireBusiness = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  if (req.user.role !== 'business' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Business owner privileges required.'
    });
  }

  next();
};

/**
 * Middleware to check if user has business role or is accessing their own resource
 * Must be used after authenticateToken middleware
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireBusinessOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  const businessId = req.params.id || req.params.businessId;

  // Admin can access all businesses
  if (req.user.role === 'admin') {
    return next();
  }

  // Business owner must own the business
  if (req.user.role === 'business' && req.user.businessId == businessId) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. You do not have permission to access this business.'
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireBusiness,
  requireBusinessOwner
};
