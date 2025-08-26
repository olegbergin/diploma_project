const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  // For now, we'll check if the request includes an admin indicator
  // In production, this should verify JWT token and check user role
  
  // TODO: Implement proper JWT verification
  // const token = req.headers.authorization?.split(' ')[1];
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // const user = await getUserById(decoded.userId);
  // if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  // For development, we'll allow all requests but log a warning
  console.log('Admin endpoint accessed - proper authentication should be implemented');
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// P1 - Main Dashboard Routes
router.get('/stats', adminController.getAdminStats);
router.get('/activity', adminController.getRecentActivity);

// P2 - User Management Routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);

// P2 - Business Management Routes  
router.get('/businesses', adminController.getAllBusinesses);
router.put('/businesses/:id/approve', adminController.approveBusiness);
router.put('/businesses/:id/reject', adminController.rejectBusiness);
router.delete('/businesses/:id', adminController.deleteBusiness);

// P2 - Appointment Management Routes
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);

// P3 - Analytics Routes
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/businesses', adminController.getBusinessAnalytics);
router.get('/analytics/appointments', adminController.getAppointmentAnalytics);

module.exports = router;