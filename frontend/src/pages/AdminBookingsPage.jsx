import { useState, useEffect } from 'react';
import { Search, BookOpen, Phone } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getAdminBookings } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getAdminBookings();
        setBookings(data);
      } catch { toast.error('Failed to load bookings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: '⏳ Pending' },
    { key: 'accepted', label: '✅ Accepted' },
    { key: 'on_the_way', label: '🚑 On the Way' },
    { key: 'arrived', label: '📍 Arrived' },
    { key: 'completed', label: '✔️ Completed' },
    { key: 'cancelled', label: '✖️ Cancelled' },
  ];

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.pickupLocation?.address?.toLowerCase().includes(search.toLowerCase()) ||
      b.driverId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const emergencyColors = {
    general: 'text-blue-400', cardiac: 'text-red-400',
    trauma: 'text-orange-400', maternity: 'text-pink-400', critical: 'text-red-500'
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">All Bookings</h1>
            <p className="text-gray-400">{bookings.length} total bookings</p>
          </div>
          <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-primary-400" />
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, pickup address, driver name..."
            className="input-field pl-11" />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${filter === f.key ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No bookings found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b._id} className="card hover:border-dark-500/70 transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`text-sm font-bold capitalize ${emergencyColors[b.emergencyType] || 'text-white'}`}>
                        {b.emergencyType === 'cardiac' ? '❤️' : b.emergencyType === 'trauma' ? '🤕' : b.emergencyType === 'maternity' ? '🤱' : b.emergencyType === 'critical' ? '🚨' : '🏥'} {b.emergencyType} Emergency
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Patient</p>
                        <p className="text-white font-medium">{b.userId?.name || '—'}</p>
                        {b.userId?.phone && (
                          <a href={`tel:${b.userId.phone}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-400 mt-0.5">
                            <Phone size={10} />{b.userId.phone}
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Driver</p>
                        <p className="text-white font-medium">{b.driverId?.name || <span className="text-yellow-500/70 italic">Unassigned</span>}</p>
                        {b.driverId?.ambulanceNumber && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{b.driverId.ambulanceNumber}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pickup</p>
                        <p className="text-white text-sm">{b.pickupLocation?.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                        <p className="text-white text-sm">{b.destination?.address}</p>
                      </div>
                    </div>
                    {b.notes && (
                      <div className="mt-3 p-2 bg-dark-700/50 rounded-lg">
                        <p className="text-xs text-gray-500">Notes: <span className="text-gray-300">{b.notes}</span></p>
                      </div>
                    )}
                    {(b.distance || b.fare) && (
                      <div className="mt-3 flex gap-3 flex-wrap p-2 bg-gradient-to-r from-dark-700/50 to-dark-800/30 rounded-lg border border-dark-600/50">
                        {b.distance > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="text-white font-semibold text-sm">{b.distance} km</p>
                          </div>
                        )}
                        {b.pricePerKm > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Rate</p>
                            <p className="text-white font-semibold text-sm">₹{b.pricePerKm}/km</p>
                          </div>
                        )}
                        {b.fare > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Total Fare</p>
                            <p className="text-green-400 font-bold text-sm">₹{b.fare}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
