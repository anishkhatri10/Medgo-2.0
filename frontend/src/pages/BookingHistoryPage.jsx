import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Truck, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getUserBookings, cancelBooking } from '../services/api';
import toast from 'react-hot-toast';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await getUserBookings();
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id, 'User cancelled');
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel'); }
  };

  const filters = ['all', 'pending', 'accepted', 'on_the_way', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Booking History</h1>
          <p className="text-gray-400">All your ambulance bookings</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No bookings found</p>
            <Link to="/book" className="btn-primary inline-flex">Book Ambulance</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div key={b._id} className="card hover:border-dark-500/70 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center">
                      <Truck size={20} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold capitalize">{b.emergencyType} Emergency</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {new Date(b.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-400">Pickup:</span>
                    <span className="text-white truncate">{b.pickupLocation?.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-white truncate">{b.destination?.address}</span>
                  </div>
                </div>

                {b.driverId && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 p-3 bg-dark-700/50 rounded-xl">
                    <span>Driver:</span>
                    <span className="text-white font-medium">{b.driverId.name}</span>
                    <span className="text-gray-600">•</span>
                    <span>{b.driverId.ambulanceNumber}</span>
                  </div>
                )}

                {/* Pricing Information */}
                {(b.distance || b.fare) && (
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-dark-700/50 to-dark-800/50 rounded-xl">
                    {b.distance > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Distance</p>
                        <p className="text-white font-semibold">{b.distance} km</p>
                      </div>
                    )}
                    {b.pricePerKm > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Rate</p>
                        <p className="text-white font-semibold">Rs {b.pricePerKm}/km</p>
                      </div>
                    )}
                    {b.fare > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Total Fare</p>
                        <p className="text-green-400 font-bold">Rs {b.fare}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  {(b.status === 'accepted' || b.status === 'on_the_way') && (
                    <Link to={`/track?bookingId=${b._id}`} className="btn-primary text-sm px-4 py-2">
                      <MapPin size={14} /> Track
                    </Link>
                  )}
                  {!['completed', 'cancelled', 'arrived'].includes(b.status) && (
                    <button onClick={() => handleCancel(b._id)} className="btn-danger text-sm px-4 py-2">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
