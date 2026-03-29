import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, AlertCircle, ChevronRight, Activity, Navigation, Phone } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import { Card, Badge, Button, LoadingSpinner } from '../components/ui';

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
          <h1 className="text-4xl font-extrabold text-white mb-2">Good Day, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 text-lg">Your emergency dashboard — fast access to all services</p>
        </div>

        {/* Active Booking Alert */}
        {active && (
          <Card className="mb-6 bg-gradient-to-r from-red-600/20 to-red-500/10 border-red-600/40 animate-slide-in-top">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/30 rounded-xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full emergency-dot"></div>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">🚑 Active Booking</p>
                  <p className="text-red-300 text-sm mt-1 max-w-xs truncate">{active.pickupLocation?.address} → {active.destination?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={active.status} size="lg" />
                <Button as={Link} to={`/track?bookingId=${active._id}`} variant="primary" size="sm" icon={MapPin}>
                  Track Now
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Truck, color: 'from-red-600/20 to-red-500/10', iconColor: 'text-red-400' },
            { label: 'Completed', value: stats.completed, icon: Activity, color: 'from-green-600/20 to-green-500/10', iconColor: 'text-green-400' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-600/20 to-yellow-500/10', iconColor: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color, iconColor }) => (
            <Card key={label} gradient className={`bg-gradient-to-br ${color} border-opacity-50`}>
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} className={iconColor} />
                <span className="text-4xl font-extrabold text-white">{value}</span>
              </div>
              <p className="text-sm text-gray-400 font-medium">{label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card hover className="group border-red-600/20 hover:border-red-600/50 cursor-pointer">
            <Link to="/book" className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-600/15 rounded-2xl flex items-center justify-center group-hover:bg-red-600/25 transition-all">
                <Truck size={28} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Book Ambulance</h3>
                <p className="text-sm text-gray-400">Request emergency transport</p>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-red-400 transition-colors" />
            </Link>
          </Card>

          <Card hover className="group border-blue-600/20 hover:border-blue-600/50 cursor-pointer">
            <Link to="/track" className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600/15 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/25 transition-all">
                <MapPin size={28} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Live Tracking</h3>
                <p className="text-sm text-gray-400">Track your ambulance</p>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-600/30">
            <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
            <Link to="/history" className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" color="red" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-16">
              <Truck size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No bookings yet</p>
              <Button as={Link} to="/book">Book Your First Ambulance</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-4 bg-dark-700/30 border border-dark-600/30 rounded-xl hover:bg-dark-700/50 hover:border-red-600/30 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck size={18} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{b.pickupLocation?.address || 'Loading...'}</p>
                      <p className="text-gray-500 text-xs mt-1 truncate">→ {b.destination?.address || 'Loading...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <Badge status={b.status} size="sm" />
                    {['accepted', 'on_the_way', 'arrived'].includes(b.status) && (
                      <Button as={Link} to={`/track?bookingId=${b._id}`} variant="ghost" size="sm" icon={Navigation}>
                        Track
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Emergency Hotline */}
        <Card className="mt-8 bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-600/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone size={24} className="text-red-400" />
              <div>
                <p className="text-white font-bold">Emergency Support</p>
                <p className="text-red-300 text-sm">Call us for immediate assistance</p>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-red-400">1-800-900-0911</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
