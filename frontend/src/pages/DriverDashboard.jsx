import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, CheckCircle, XCircle, Navigation, Activity, Clock } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getDriverRequests, getDriverBookings, acceptBooking, rejectBooking, updateRideStatus, updateDriverLocation, toggleDriverStatus } from '../services/api';
import { getSocket, emitDriverLocation } from '../services/socket';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [online, setOnline] = useState(user?.status === 'available');
  const [loading, setLoading] = useState(true);
  const locationInterval = useRef(null);

  const fetchData = async () => {
    try {
      const [reqRes, bookRes] = await Promise.all([getDriverRequests(), getDriverBookings()]);
      setRequests(reqRes.data);
      setMyBookings(bookRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  // Start GPS tracking when online
  const startLocationTracking = () => {
    locationInterval.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          await updateDriverLocation(lat, lng);
          emitDriverLocation(user._id, lat, lng, null);
        },
        () => {} // silently fail
      );
    }, 5000);
  };

  const stopLocationTracking = () => {
    if (locationInterval.current) clearInterval(locationInterval.current);
  };

  useEffect(() => {
    fetchData();
    const socket = getSocket();
    if (socket) {
      socket.on('new_booking', fetchData);
      socket.on('booking_cancelled', fetchData);
    }
    return () => {
      stopLocationTracking();
      if (socket) { socket.off('new_booking'); socket.off('booking_cancelled'); }
    };
  }, []);

  const handleToggleOnline = async () => {
    try {
      await toggleDriverStatus();
      const newOnline = !online;
      setOnline(newOnline);
      if (newOnline) { startLocationTracking(); toast.success('You are now online'); }
      else { stopLocationTracking(); toast.success('You are now offline'); }
    } catch { toast.error('Failed to update status'); }
  };

  const handleAccept = async (bookingId) => {
    try {
      await acceptBooking(bookingId);
      toast.success('Booking accepted!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
      toast.success('Booking rejected');
      fetchData();
    } catch { toast.error('Failed to reject'); }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await updateRideStatus(bookingId, status);
      toast.success(`Status updated: ${status.replace('_', ' ')}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const activeBooking = myBookings.find(b => ['accepted', 'on_the_way', 'arrived'].includes(b.status));
  const stats = {
    completed: myBookings.filter(b => b.status === 'completed').length,
    today: myBookings.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length,
  };

  const statusActions = {
    accepted: { next: 'on_the_way', label: '🚗 Start Driving', color: 'btn-primary' },
    on_the_way: { next: 'arrived', label: '📍 Mark Arrived', color: 'btn-secondary' },
    arrived: { next: 'completed', label: '✅ Complete Ride', color: 'btn-primary' },
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-fade-in">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Driver Dashboard</h1>
            <p className="text-gray-400">{user?.ambulanceNumber} • {user?.vehicleType}</p>
          </div>
          {/* Online toggle */}
          <div className="flex flex-col items-end gap-2">
            <button onClick={handleToggleOnline}
              className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all
                ${online ? 'bg-green-600/20 border-green-600/40 text-green-400' : 'bg-dark-700 border-dark-600 text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500 emergency-dot' : 'bg-gray-600'}`}></div>
              {online ? 'Online' : 'Go Online'}
            </button>
            <p className="text-xs text-gray-600">{online ? 'Accepting rides' : 'Tap to start'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Today\'s Rides', value: stats.today, icon: Clock, color: 'text-blue-400' },
            { label: 'Total Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Rating', value: user?.rating || '5.0', icon: Activity, color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={color} />
                <span className="text-3xl font-bold text-white">{value}</span>
              </div>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Active ride controls */}
        {activeBooking && (
          <div className="card mb-6 border-primary-600/40 glow-red">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full emergency-dot"></div>
              <h2 className="text-lg font-bold text-white">Active Ride</h2>
              <StatusBadge status={activeBooking.status} />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Pickup</p>
                <p className="text-white font-medium">{activeBooking.pickupLocation?.address}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Destination</p>
                <p className="text-white font-medium">{activeBooking.destination?.address}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Patient</p>
                <p className="text-white">{activeBooking.userId?.name} • {activeBooking.userId?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Emergency</p>
                <p className="text-white capitalize">{activeBooking.emergencyType}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${activeBooking.userId?.phone}`} className="btn-secondary flex-1 text-sm">
                <Phone size={14} /> Call Patient
              </a>
              {statusActions[activeBooking.status] && (
                <button onClick={() => handleUpdateStatus(activeBooking._id, statusActions[activeBooking.status].next)}
                  className={`${statusActions[activeBooking.status].color} flex-1 text-sm`}>
                  {statusActions[activeBooking.status].label}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Incoming Requests</h2>
            <button onClick={fetchData} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <Navigation size={14} /> Refresh
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : !online ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Activity size={22} className="text-gray-600" />
              </div>
              <p className="text-gray-500">Go online to receive ride requests</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock size={22} className="text-gray-600" />
              </div>
              <p className="text-gray-500">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="p-4 bg-dark-700/50 rounded-xl border border-dark-600/50 hover:border-primary-600/30 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-white font-semibold capitalize">{req.emergencyType} Emergency</p>
                      <p className="text-gray-500 text-xs mt-0.5">{req.userId?.name} • {req.userId?.phone}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {req.pickupLocation?.address}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {req.destination?.address}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleReject(req._id)} className="btn-danger flex-1 text-sm py-2">
                      <XCircle size={14} /> Reject
                    </button>
                    <button onClick={() => handleAccept(req._id)} className="btn-primary flex-1 text-sm py-2">
                      <CheckCircle size={14} /> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ride History */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6">Recent Rides</h2>
          {myBookings.filter(b => b.status === 'completed').slice(0, 5).map(b => (
            <div key={b._id} className="flex items-center justify-between py-3 border-b border-dark-600/30 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{b.pickupLocation?.address}</p>
                <p className="text-gray-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {myBookings.filter(b => b.status === 'completed').length === 0 && (
            <p className="text-gray-500 text-center py-6">No completed rides yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
