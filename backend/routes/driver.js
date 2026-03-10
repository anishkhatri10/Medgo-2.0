const express = require('express');
const router = express.Router();
const {
  getRequests, getDriverBookings, acceptBooking, rejectBooking,
  updateStatus, updateLocation, toggleStatus
} = require('../controllers/driverController');
const { protect, driverOnly } = require('../middleware/auth');

router.get('/requests', protect, driverOnly, getRequests);
router.get('/bookings', protect, driverOnly, getDriverBookings);
router.post('/accept', protect, driverOnly, acceptBooking);
router.post('/reject', protect, driverOnly, rejectBooking);
router.post('/status', protect, driverOnly, updateStatus);
router.post('/location', protect, driverOnly, updateLocation);
router.put('/toggle-status', protect, driverOnly, toggleStatus);

module.exports = router;
