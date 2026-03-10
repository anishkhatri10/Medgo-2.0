import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('medgo_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Handle auth errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medgo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const registerDriver = (data) => API.post('/auth/driver/register', data);
export const loginDriver = (data) => API.post('/auth/driver/login', data);
export const getMe = () => API.get('/auth/me');

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getUserBookings = () => API.get('/bookings/user');
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id, reason) => API.put(`/bookings/${id}/cancel`, { reason });

// Driver
export const getDriverRequests = () => API.get('/driver/requests');
export const getDriverBookings = () => API.get('/driver/bookings');
export const acceptBooking = (bookingId) => API.post('/driver/accept', { bookingId });
export const rejectBooking = (bookingId) => API.post('/driver/reject', { bookingId });
export const updateRideStatus = (bookingId, status) => API.post('/driver/status', { bookingId, status });
export const updateDriverLocation = (lat, lng, address) => API.post('/driver/location', { lat, lng, address });
export const toggleDriverStatus = () => API.put('/driver/toggle-status');

// Admin
export const getAdminUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getAdminDrivers = () => API.get('/admin/drivers');
export const verifyDriver = (id) => API.put(`/admin/drivers/${id}/verify`);
export const toggleDriverActive = (id) => API.put(`/admin/drivers/${id}/toggle`);
export const getAdminBookings = () => API.get('/admin/bookings');
export const getAnalytics = () => API.get('/admin/analytics');
export const getLiveLocations = () => API.get('/admin/live-locations');

export default API;
