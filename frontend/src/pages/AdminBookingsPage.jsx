import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
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

  const filters = ['all', 'pending', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled'];

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.pickupLocation?.address?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">All Bookings</h1>
            <p className="text-gray-400">{bookings.length} total bookings</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or pickup..." className="input-field pl-11" />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-dark-700/50">
                <tr>
                  {['Patient', 'Pickup', 'Destination', 'Emergency', 'Driver', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/20">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{b.userId?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{b.pickupLocation?.address}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{b.destination?.address}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{b.emergencyType}</td>
                    <td className="px-4 py-3 text-gray-400">{b.driverId?.name || <span className="text-yellow-600/70 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">No bookings found</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
