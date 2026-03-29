import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Shield, ShieldOff, Trash2, Phone, Mail, Car } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getAdminDrivers, verifyDriver, toggleDriverActive,  } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      const { data } = await getAdminDrivers();
      setDrivers(data);
    } catch (err) {
      toast.error('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleVerify = async (id, name) => {
    try {
      await verifyDriver(id);
      toast.success(`✅ ${name} has been approved!`);
      fetchDrivers();
    } catch { toast.error('Failed to verify driver'); }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject driver ${name}?`)) return;
    try {
      await rejectDriverAdmin(id);
      toast.success(`❌ ${name} has been rejected`);
      fetchDrivers();
    } catch { toast.error('Failed to reject driver'); }
  };

  const handleToggle = async (id, name, isActive) => {
    try {
      await toggleDriverActive(id);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      fetchDrivers();
    } catch { toast.error('Failed to update driver'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete driver ${name}? This cannot be undone.`)) return;
    try {
      await deleteDriverAdmin(id);
      toast.success(`${name} deleted`);
      fetchDrivers();
    } catch { toast.error('Failed to delete driver'); }
  };

  const filters = [
    { key: 'all', label: 'All Drivers' },
    { key: 'pending', label: '⏳ Pending Approval' },
    { key: 'verified', label: '✅ Verified' },
    { key: 'available', label: '🟢 Available' },
    { key: 'busy', label: '🔴 On Duty' },
  ];

  const filtered = drivers.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ambulanceNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'pending' ? !d.isVerified :
      filter === 'verified' ? d.isVerified :
      d.status === filter;
    return matchSearch && matchFilter;
  });

  const vehicleColors = {
    basic: 'text-blue-400 bg-blue-600/20',
    advanced: 'text-purple-400 bg-purple-600/20',
    icu: 'text-red-400 bg-red-600/20'
  };

  const pendingCount = drivers.filter(d => !d.isVerified).length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Driver Management</h1>
            <p className="text-gray-400">{drivers.length} total drivers • {pendingCount} pending approval</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-yellow-400 rounded-full emergency-dot"></div>
              <span className="text-yellow-400 text-sm font-semibold">{pendingCount} need approval</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, ambulance number..."
            className="input-field pl-11" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
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
          <div className="card text-center py-16">
            <Car size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No drivers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d => (
              <div key={d._id} className={`card transition-all hover:border-dark-500/70
                ${!d.isVerified ? 'border-yellow-600/30 bg-yellow-500/5' : ''}`}>

                {/* Pending Badge */}
                {!d.isVerified && (
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-yellow-600/20">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full emergency-dot"></div>
                    <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Pending Admin Approval</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600/15 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      🚑
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-white font-bold text-lg">{d.name}</h3>
                        {d.isVerified
                          ? <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full"><Shield size={10} /> Verified</span>
                          : <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full"><ShieldOff size={10} /> Not Verified</span>
                        }
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${d.isActive ? 'text-green-400 bg-green-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-2 flex-wrap">
                        <span className="flex items-center gap-1"><Mail size={12} />{d.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12} />{d.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-white bg-dark-700 px-2 py-0.5 rounded border border-dark-600">
                          {d.ambulanceNumber}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${vehicleColors[d.vehicleType] || 'text-gray-400 bg-dark-700'}`}>
                          {d.vehicleType === 'basic' ? '🏥 Basic' : d.vehicleType === 'advanced' ? '⚡ Advanced' : '🏥 ICU'} Ambulance
                        </span>
                        <StatusBadge status={d.status} />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {!d.isVerified ? (
                      <>
                        <button onClick={() => handleVerify(d._id, d.name)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-600/20">
                          <CheckCircle size={15} /> Approve Driver
                        </button>
                        <button onClick={() => handleReject(d._id, d.name)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-sm font-semibold transition-all border border-red-800/50">
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleReject(d._id, d.name)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-900/30 hover:bg-orange-600/40 text-orange-400 rounded-xl text-sm font-medium transition-all border border-orange-800/30">
                        <ShieldOff size={14} /> Revoke Approval
                      </button>
                    )}
                    <button onClick={() => handleToggle(d._id, d.name, d.isActive)}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${d.isActive
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-blue-900/30 hover:bg-blue-600/40 text-blue-400 border border-blue-800/30'}`}>
                      {d.isActive ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
                    </button>
                    <button onClick={() => handleDelete(d._id, d.name)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-xl text-sm font-medium transition-all border border-red-900/30">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Driver Details Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-dark-600/30 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">License No.</p>
                    <p className="text-white font-mono">{d.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Rides</p>
                    <p className="text-white font-semibold">{d.totalRides}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rating</p>
                    <p className="text-white">⭐ {d.rating?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Registered</p>
                    <p className="text-white">{new Date(d.createdAt).toLocaleDateString()}</p>
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
