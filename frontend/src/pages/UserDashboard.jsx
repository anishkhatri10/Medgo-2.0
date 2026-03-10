import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await getUserBookings();
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    const socket = getSocket();
    if (socket) {
      socket.on('booking_accepted', fetchBookings);
      socket.on('status_updated', fetchBookings);
      socket.on('booking_cancelled', fetchBookings);
    }
    return () => {
      if (socket) {
        socket.off('booking_accepted');
        socket.off('status_updated');
        socket.off('booking_cancelled');
      }
    };
  }, []);

  const active = bookings.find(b => !['completed', 'cancelled'].includes(b.status));
  const recent = bookings.slice(0, 5);
  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400">Your emergency dashboard — fast access to all services</p>
        </div>

        {/* Active Booking Alert */}
        {active && (
          <div className="mb-6 p-4 rounded-2xl bg-primary-600/10 border border-primary-600/30 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full emergency-dot"></div>
              </div>
              <div>
                <p className="text-white font-semibold">Active Booking</p>
                <p className="text-primary-400 text-sm">{active.pickupLocation?.address} → {active.destination?.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={active.status} />
              <Link to={`/track?bookingId=${active._id}`} className="btn-primary text-sm px-4 py-2">
                <MapPin size={14} /> Track
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Ambulance, color: 'text-primary-400' },
            { label: 'Completed', value: stats.completed, icon: Activity, color: 'text-green-400' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={color} />
                <span className="text-3xl font-bold text-white">{value}</span>
              </div>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/book" className="card hover:border-primary-600/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-600/15 rounded-2xl flex items-center justify-center group-hover:bg-primary-600/25 transition-all">
                <Truck size={26} className="text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Book Ambulance</h3>
                <p className="text-sm text-gray-400">Request emergency transport</p>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
            </div>
          </Link>
          <Link to="/track" className="card hover:border-blue-600/50 transition-all group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600/15 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/25 transition-all">
                <MapPin size={26} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Live Tracking</h3>
                <p className="text-sm text-gray-400">Track your ambulance</p>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <Link to="/history" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No bookings yet</p>
              <Link to="/book" className="btn-primary mt-4 inline-flex">Book your first ambulance</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-600 rounded-xl flex items-center justify-center">
                      <Truck size={16} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{b.pickupLocation?.address}</p>
                      <p className="text-gray-500 text-xs mt-0.5">→ {b.destination?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    {b.status === 'accepted' || b.status === 'on_the_way' ? (
                      <Link to={`/track?bookingId=${b._id}`} className="text-xs text-primary-400 hover:underline">Track</Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
