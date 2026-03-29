import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, BookOpen, Activity, TrendingUp, AlertCircle, ChevronRight, Shield, Clock } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getAnalytics, getAdminBookings, getAdminDrivers } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, bRes, dRes] = await Promise.all([
          getAnalytics(),
          getAdminBookings(),
          getAdminDrivers(),
        ]);
        setAnalytics(aRes.data);
        setBookings(bRes.data.slice(0, 6));
        setPendingDrivers(dRes.data.filter(d => !d.isVerified).slice(0, 3));
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'hover:border-blue-600/40', link: '/admin/users' },
    { label: 'Total Drivers', value: analytics?.totalDrivers || 0, icon: Car, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'hover:border-purple-600/40', link: '/admin/drivers' },
    { label: 'Total Bookings', value: analytics?.totalBookings || 0, icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-600/10', border: 'hover:border-primary-600/40', link: '/admin/bookings' },
    { label: 'Active Drivers', value: analytics?.availableDrivers || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-600/10', border: 'hover:border-green-600/40', link: '/admin/live' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-400">MedGo system overview and management</p>
        </div>

        {/* Pending Driver Approval Alert */}
        {pendingDrivers.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{pendingDrivers.length} Driver{pendingDrivers.length > 1 ? 's' : ''} Waiting for Approval</p>
                <p className="text-yellow-400/70 text-sm">Review and verify driver documents</p>
              </div>
            </div>
            <Link to="/admin/drivers" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
              Review Now →
            </Link>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color, bg, border, link }) => (
            <Link key={label} to={link} className={`stat-card group ${border} transition-all`}>
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <p className="text-sm text-gray-400">{label}</p>
            </Link>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Completed Rides', value: analytics?.completedBookings || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Pending Requests', value: analytics?.pendingBookings || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Active Rides', value: analytics?.activeBookings || 0, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Unverified Drivers', value: analytics?.unverifiedDrivers || 0, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`card flex items-center justify-between ${bg} border-transparent`}>
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
              </div>
              <TrendingUp size={20} className={color} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/admin/users', title: 'Manage Users', desc: `${analytics?.totalUsers || 0} registered users`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { to: '/admin/drivers', title: 'Verify Drivers', desc: `${analytics?.unverifiedDrivers || 0} pending approval`, icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-600/10' },
            { to: '/admin/bookings', title: 'All Bookings', desc: `${analytics?.totalBookings || 0} total bookings`, icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-600/10' },
          ].map(({ to, title, desc, icon: Icon, color, bg }) => (
            <Link key={to} to={to} className="card hover:border-dark-500/80 transition-all group">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm mb-4">{desc}</p>
              <div className={`flex items-center gap-1 text-sm ${color} font-medium`}>
                Go to page <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600/50">
                    {['Patient', 'Pickup', 'Destination', 'Driver', 'Emergency', 'Status', 'Date'].map(h => (
                      <th key={h} className="pb-3 text-left text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600/20">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 text-white font-medium">{b.userId?.name || '—'}</td>
                      <td className="py-3 text-gray-400 max-w-[120px] truncate">{b.pickupLocation?.address}</td>
                      <td className="py-3 text-gray-400 max-w-[120px] truncate">{b.destination?.address}</td>
                      <td className="py-3 text-gray-400">{b.driverId?.name || <span className="text-yellow-500/70 italic">Unassigned</span>}</td>
                      <td className="py-3 text-gray-400 capitalize">{b.emergencyType}</td>
                      <td className="py-3"><StatusBadge status={b.status} /></td>
                      <td className="py-3 text-gray-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
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
