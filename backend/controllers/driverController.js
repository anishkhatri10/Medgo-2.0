const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// @desc Get pending requests for driver
exports.getRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get driver's active/past bookings
exports.getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user._id })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Accept booking
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking not available' });
    }
    booking.driverId = req.user._id;
    booking.status = 'accepted';
    await booking.save();

    await Driver.findByIdAndUpdate(req.user._id, { status: 'busy' });

    const populated = await Booking.findById(bookingId)
      .populate('userId', 'name phone')
      .populate('driverId', 'name phone ambulanceNumber location');

    const io = req.app.get('io');
    io.emit('booking_accepted', { booking: populated });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Reject booking
exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const io = req.app.get('io');
    io.emit('booking_rejected', { bookingId });
    res.json({ message: 'Booking rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update ride status
exports.updateStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const validStatuses = ['on_the_way', 'arrived', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).populate('userId', 'name phone').populate('driverId', 'name phone ambulanceNumber');

    if (status === 'completed') {
      await Driver.findByIdAndUpdate(req.user._id, { status: 'available' });
      await Driver.findByIdAndUpdate(req.user._id, { $inc: { totalRides: 1 } });
    }

    const io = req.app.get('io');
    io.emit('status_updated', { booking });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update driver GPS location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      { location: { type: 'Point', coordinates: [lng, lat], address: address || '' } },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('driver_location', { driverId: req.user._id, lat, lng });
    res.json({ message: 'Location updated', location: driver.location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Toggle driver status (available/offline)
exports.toggleStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.user._id);
    const newStatus = driver.status === 'offline' ? 'available' : 'offline';
    driver.status = newStatus;
    await driver.save();
    res.json({ status: newStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
