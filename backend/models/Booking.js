const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
  },
  destination: {
    address: { type: String, required: true },
    coordinates: { lat: Number, lng: Number },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'],
    default: 'pending',
  },
  emergencyType: { type: String, enum: ['general', 'cardiac', 'trauma', 'maternity', 'critical'], default: 'general' },
  patientName: { type: String, default: '' },
  patientAge: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  estimatedTime: { type: Number, default: 0 }, // in minutes
  distance: { type: Number, default: 0 }, // in km
  fare: { type: Number, default: 0 },
  pricePerKm: { type: Number, default: 0 }, // Price per km for display
  emergencyMultiplier: { type: Number, default: 1.0 }, // Multiplier based on emergency type
  fareBreakdown: {
    basePrice: { type: Number, default: 0 },
    distancePrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  cancelledBy: { type: String, enum: ['user', 'driver', 'admin', ''], default: '' },
  cancelReason: { type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
