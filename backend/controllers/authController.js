const User = require('../models/User');
const Driver = require('../models/Driver');
const { generateToken } = require('../middleware/auth');

// @desc Register user
exports.registerUser = async (req, res) => {
  try {
    console.log('📝 Register request body:', req.body);
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required: name, phone, email, password' });
    }

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: 'User already exists with this email or phone' });

    const user = await User.create({ name, phone, email, password });
    const token = generateToken(user._id, user.role);
    console.log('✅ User created:', user.email);
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, token,
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
};

// @desc Login user or admin
exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? user.email : 'NOT FOUND');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id, user.role);
    console.log('✅ Login success:', user.email);
    res.json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role, token,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
};

// @desc Register driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, phone, email, password, ambulanceNumber, licenseNumber, vehicleType } = req.body;
    const exists = await Driver.findOne({ $or: [{ email }, { phone }, { ambulanceNumber }] });
    if (exists) return res.status(400).json({ message: 'Driver already exists' });

    const driver = await Driver.create({ name, phone, email, password, ambulanceNumber, licenseNumber, vehicleType });
    const token = generateToken(driver._id, 'driver');
    res.status(201).json({
      _id: driver._id, name: driver.name, email: driver.email, phone: driver.phone,
      ambulanceNumber: driver.ambulanceNumber, status: driver.status,
      isVerified: driver.isVerified, role: 'driver', token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login driver
exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if (!driver || !(await driver.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(driver._id, 'driver');
    res.json({
      _id: driver._id, name: driver.name, email: driver.email, phone: driver.phone,
      ambulanceNumber: driver.ambulanceNumber, status: driver.status,
      isVerified: driver.isVerified, role: 'driver', token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get current user profile
exports.getMe = async (req, res) => {
  res.json(req.user);
};
