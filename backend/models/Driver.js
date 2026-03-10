const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  ambulanceNumber: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true },
  vehicleType: { type: String, enum: ['basic', 'advanced', 'icu'], default: 'basic' },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  documents: {
    license: { type: String, default: '' },
    registration: { type: String, default: '' },
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [85.3240, 27.7172] }, // Kathmandu default
    address: { type: String, default: '' },
  },
  rating: { type: Number, default: 5.0 },
  totalRides: { type: Number, default: 0 },
  role: { type: String, default: 'driver' },
}, { timestamps: true });

driverSchema.index({ location: '2dsphere' });

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

driverSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Driver', driverSchema);
