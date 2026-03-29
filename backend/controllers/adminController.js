const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('getUsers error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

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

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, isActive: true },
      { new: true }
    ).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified: false, isActive: false },
      { new: true }
    ).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name phone email')
      .populate('driverId', 'name phone ambulanceNumber vehicleType')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const unverifiedDrivers = await Driver.countDocuments({ isVerified: false });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['accepted', 'on_the_way', 'arrived'] } });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.find({ createdAt: { $gte: sevenDaysAgo } }).select('createdAt status');
    res.json({ totalUsers, totalDrivers, totalBookings, completedBookings, pendingBookings, cancelledBookings, availableDrivers, verifiedDrivers, unverifiedDrivers, activeBookings, recentBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLiveLocations = async (req, res) => {
  try {
    const drivers = await Driver.find({ isActive: true }).select('name ambulanceNumber status location vehicleType isVerified');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
