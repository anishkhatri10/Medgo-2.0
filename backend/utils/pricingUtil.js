// Pricing configuration
const PRICING_CONFIG = {
  basePrice: 0, // Base fare in NPR (Nepalese Rupee)
  pricePerKm: 2000, // Price per km in NPR (Nepalese Rupee) - 1 km = 2000 NPR
  emergencyMultiplier: {
    general: 1.0,
    cardiac: 1.5,
    trauma: 1.4,
    maternity: 1.3,
    critical: 2.0,
  },
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} from - { lat, lng }
 * @param {Object} to - { lat, lng }
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (from, to) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {Number} degrees
 * @returns {Number} Radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate estimated fare based on distance and emergency type
 * @param {Number} distance - Distance in km
 * @param {String} emergencyType - Type of emergency
 * @returns {Object} { fare, pricePerKm, basePrice, distance }
 */
const calculateFare = (distance, emergencyType = 'general') => {
  const multiplier = PRICING_CONFIG.emergencyMultiplier[emergencyType] || 1.0;
  const baseFare = PRICING_CONFIG.basePrice;
  const distanceFare = Math.max(distance * PRICING_CONFIG.pricePerKm, 0);
  
  const subtotal = baseFare + distanceFare;
  const fare = Math.round(subtotal * multiplier * 100) / 100;
  
  return {
    fare,
    pricePerKm: PRICING_CONFIG.pricePerKm,
    basePrice: baseFare,
    distance: Math.round(distance * 100) / 100,
    emergencyMultiplier: multiplier,
    breakdown: {
      basePrice: Math.round(baseFare * multiplier * 100) / 100,
      distancePrice: Math.round(distanceFare * multiplier * 100) / 100,
      total: fare,
    },
  };
};

/**
 * Estimate fare between two locations
 * @param {Object} from - { lat, lng }
 * @param {Object} to - { lat, lng }
 * @param {String} emergencyType - Type of emergency
 * @returns {Object} Fare estimate with distance and pricing breakdown
 */
const estimateFare = (from, to, emergencyType = 'general') => {
  const distance = calculateDistance(from, to);
  return calculateFare(distance, emergencyType);
};

module.exports = {
  calculateDistance,
  calculateFare,
  estimateFare,
  PRICING_CONFIG,
};
