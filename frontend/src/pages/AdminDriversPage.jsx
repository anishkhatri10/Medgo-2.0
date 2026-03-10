import { useState, useEffect } from 'react';
import { Car, Search, CheckCircle, XCircle, Shield } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getAdminDrivers, verifyDriver, toggleDriverActive } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const { data } = await getAdminDrivers();
      setDrivers(data);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleVerify = async (id) => {
    try {
      await verifyDriver(id);
      fetchDrivers();
      toast.success('Driver verified!');
    } catch { toast.error('Failed to verify'); }
  };

  const handleToggle = async (id) => {
    try {
      await toggleDriverActive(id);
      fetchDrivers();
      toast.success('Driver status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.ambulanceNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const vehicleColors = { basic: 'text-blue-400 bg-blue-600/20', advanced: 'text-purple-400 bg-purple-600/20', icu: 'text-red-400 bg-red-600/20' };

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Drivers</h1>
            <p className="text-gray-400">{drivers.length} registered drivers</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ambulance number..." className="input-field pl-11" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d => (
              <div key={d._id} className="card hover:border-dark-500/70 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-600/15 rounded-2xl flex items-center justify-center text-2xl">🚑</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{d.name}</h3>
                        {d.isVerified && <Shield size={14} className="text-green-400" />}
                      </div>
                      <p className="text-gray-400 text-sm">{d.email} • {d.phone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-sm text-white bg-dark-700 px-2 py-0.5 rounded">{d.ambulanceNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${vehicleColors[d.vehicleType] || 'text-gray-400 bg-dark-700'}`}>
                          {d.vehicleType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={d.status} />
                    <div className="flex gap-2">
                      {!d.isVerified && (
                        <button onClick={() => handleVerify(d._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30 transition-all">
                          <CheckCircle size={12} /> Verify
                        </button>
                      )}
                      <button onClick={() => handleToggle(d._id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${d.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-700/40' : 'bg-green-900/30 text-green-400 hover:bg-green-700/40'}`}>
                        {d.isActive ? <><XCircle size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-dark-600/30 text-sm">
                  <div><p className="text-gray-500">License</p><p className="text-white font-mono">{d.licenseNumber}</p></div>
                  <div><p className="text-gray-500">Total Rides</p><p className="text-white">{d.totalRides}</p></div>
                  <div><p className="text-gray-500">Rating</p><p className="text-white">⭐ {d.rating}</p></div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="card text-center py-12 text-gray-500">No drivers found</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
