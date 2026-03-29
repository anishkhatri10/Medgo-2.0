const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const { estimateFare } = require('../utils/pricingUtil');

// @desc Estimate fare for a route
exports.estimateFare = async (req, res) => {
  try {
    const { pickupLocation, destination, emergencyType = 'general' } = req.body;

    if (!pickupLocation?.coordinates || !destination?.coordinates) {
      return res.status(400).json({ message: 'Valid coordinates required' });
    }

    const fareEstimate = estimateFare(
      pickupLocation.coordinates,
      destination.coordinates,
      emergencyType
    );

    res.json(fareEstimate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create booking
exports.createBooking = async (req, res) => {
  try {
    const { pickupLocation, destination, emergencyType, patientName, patientAge, notes } = req.body;

    // Calculate fare and distance
    const fareEstimate = estimateFare(
      pickupLocation.coordinates,
      destination.coordinates,
      emergencyType || 'general'
    );

    const booking = await Booking.create({
      userId: req.user._id,
      pickupLocation,
      destination,
      emergencyType: emergencyType || 'general',
      patientName,
      patientAge,
      notes,
      distance: fareEstimate.distance,
      fare: fareEstimate.fare,
      pricePerKm: fareEstimate.pricePerKm,
      emergencyMultiplier: fareEstimate.emergencyMultiplier,
      fareBreakdown: fareEstimate.breakdown,
    });

    // Notify via socket (attached in server.js)
    const io = req.app.get('io');
    io.emit('new_booking', { booking });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('driverId', 'name phone ambulanceNumber vehicleType location')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('driverId', 'name phone ambulanceNumber vehicleType location rating');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancelReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    if (booking.driverId) {
      await Driver.findByIdAndUpdate(booking.driverId, { status: 'available' });
    }

    const io = req.app.get('io');
    io.emit('booking_cancelled', { bookingId: booking._id });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
