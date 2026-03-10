import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import BookAmbulancePage from './pages/BookAmbulancePage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDriversPage from './pages/AdminDriversPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminLivePage from './pages/AdminLivePage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a27', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a27' } },
            error: { iconTheme: { primary: '#e51d1d', secondary: '#1a1a27' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/driver/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute roles={['user']}><BookAmbulancePage /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute roles={['user']}><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute roles={['user']}><BookingHistoryPage /></ProtectedRoute>} />

          {/* Driver Routes */}
          <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/requests" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/bookings" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/drivers" element={<ProtectedRoute roles={['admin']}><AdminDriversPage /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookingsPage /></ProtectedRoute>} />
          <Route path="/admin/live" element={<ProtectedRoute roles={['admin']}><AdminLivePage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
