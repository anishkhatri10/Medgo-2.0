const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

// @desc Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Verify driver
exports.verifyDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Toggle driver active status
exports.toggleDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    driver.isActive = !driver.isActive;
    await driver.save();
    res.json({ isActive: driver.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name phone email')
      .populate('driverId', 'name phone ambulanceNumber')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await Driver.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const availableDrivers = await Driver.countDocuments({ status: 'available' });
    const verifiedDrivers = await Driver.countDocuments({ isVerified: true });

    // Last 7 days bookings
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.find({ createdAt: { $gte: sevenDaysAgo } })
      .select('createdAt status');

    res.json({
      totalUsers, totalDrivers, totalBookings,
      completedBookings, pendingBookings, cancelledBookings,
      availableDrivers, verifiedDrivers, recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get live driver locations
exports.getLiveLocations = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: { $in: ['available', 'busy'] } })
      .select('name ambulanceNumber status location');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
