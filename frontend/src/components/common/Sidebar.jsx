import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Truck, MapPin, Clock, LogOut, User,
  LayoutDashboard, Users, Car, BookOpen, Activity, ChevronRight
} from 'lucide-react';

const userNav = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/book', icon: Truck, label: 'Book Ambulance' },
  { to: '/track', icon: MapPin, label: 'Live Track' },
  { to: '/history', icon: Clock, label: 'My Bookings' },
];

const driverNav = [
  { to: '/driver', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/driver/requests', icon: BookOpen, label: 'Requests' },
  { to: '/driver/bookings', icon: Car, label: 'My Rides' },
];

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/drivers', icon: Car, label: 'Drivers' },
  { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/admin/live', icon: Activity, label: 'Live Map' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'driver' ? driverNav : userNav;

  const handleLogout = () => { logout(); navigate('/'); };

  const roleColor = user?.role === 'admin' ? 'text-purple-400' : user?.role === 'driver' ? 'text-blue-400' : 'text-primary-400';
  const roleBg = user?.role === 'admin' ? 'bg-purple-600/20 border-purple-600/30' : user?.role === 'driver' ? 'bg-blue-600/20 border-blue-600/30' : 'bg-primary-600/20 border-primary-600/30';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-dark-600/50 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-600/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Truck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MedGo</h1>
            <p className="text-xs text-gray-500">Nepal Ambulance</p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-dark-600/50">
        <div className={`flex items-center gap-3 p-3 rounded-xl ${roleBg} border`}>
          <div className="w-9 h-9 bg-dark-700 rounded-full flex items-center justify-center">
            <User size={16} className={roleColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className={`text-xs capitalize ${roleColor}`}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && to !== '/admin' && to !== '/driver' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-dark-600/50">
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:bg-red-900/20 hover:text-red-300">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
