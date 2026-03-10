import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, BookOpen, Activity, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getAnalytics, getAdminBookings } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, bRes] = await Promise.all([getAnalytics(), getAdminBookings()]);
        setAnalytics(aRes.data);
        setBookings(bRes.data.slice(0, 8));
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/10', link: '/admin/users' },
    { label: 'Total Drivers', value: analytics?.totalDrivers || 0, icon: Car, color: 'text-purple-400', bg: 'bg-purple-600/10', link: '/admin/drivers' },
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-600/10', link: '/admin/bookings' },
    { label: 'Active Drivers', value: analytics?.availableDrivers || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-600/10', link: '/admin/live' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-400">MedGo system overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, link }) => (
            <Link key={label} to={link} className="stat-card group">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <p className="text-sm text-gray-400">{label}</p>
            </Link>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Completed Rides', value: analytics?.completedBookings || 0, color: 'text-green-400' },
            { label: 'Pending Requests', value: analytics?.pendingBookings || 0, color: 'text-yellow-400' },
            { label: 'Verified Drivers', value: analytics?.verifiedDrivers || 0, color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
              </div>
              <TrendingUp size={20} className={color} />
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/admin/users', title: 'Manage Users', desc: 'View, activate or deactivate users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { to: '/admin/drivers', title: 'Verify Drivers', desc: 'Review and verify driver documents', icon: Car, color: 'text-purple-400', bg: 'bg-purple-600/10' },
            { to: '/admin/live', title: 'Live Map', desc: 'Monitor all ambulances in real-time', icon: Activity, color: 'text-green-400', bg: 'bg-green-600/10' },
          ].map(({ to, title, desc, icon: Icon, color, bg }) => (
            <Link key={to} to={to} className="card hover:border-dark-500/80 transition-all group">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm mb-4">{desc}</p>
              <div className={`flex items-center gap-1 text-sm ${color} group-hover:gap-2 transition-all`}>
                Go <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={36} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600/50">
                    <th className="pb-3 text-left text-gray-500 font-medium">Patient</th>
                    <th className="pb-3 text-left text-gray-500 font-medium">Pickup</th>
                    <th className="pb-3 text-left text-gray-500 font-medium">Driver</th>
                    <th className="pb-3 text-left text-gray-500 font-medium">Emergency</th>
                    <th className="pb-3 text-left text-gray-500 font-medium">Status</th>
                    <th className="pb-3 text-left text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600/30">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 text-white font-medium">{b.userId?.name || '—'}</td>
                      <td className="py-3 text-gray-400 max-w-[150px] truncate">{b.pickupLocation?.address}</td>
                      <td className="py-3 text-gray-400">{b.driverId?.name || <span className="text-yellow-500/70">Unassigned</span>}</td>
                      <td className="py-3 text-gray-400 capitalize">{b.emergencyType}</td>
                      <td className="py-3"><StatusBadge status={b.status} /></td>
                      <td className="py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
