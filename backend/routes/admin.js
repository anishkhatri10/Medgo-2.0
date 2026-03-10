const express = require('express');
const router = express.Router();
const {
  getUsers, toggleUserStatus, getDrivers, verifyDriver,
  toggleDriverStatus, getBookings, getAnalytics, getLiveLocations
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);
router.get('/drivers', protect, adminOnly, getDrivers);
router.put('/drivers/:id/verify', protect, adminOnly, verifyDriver);
router.put('/drivers/:id/toggle', protect, adminOnly, toggleDriverStatus);
router.get('/bookings', protect, adminOnly, getBookings);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/live-locations', protect, adminOnly, getLiveLocations);

module.exports = router;
