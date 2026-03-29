const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBooking, cancelBooking, estimateFare } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/estimate-fare', protect, estimateFare);
router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
