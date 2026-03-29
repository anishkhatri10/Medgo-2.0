import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser, loginDriver } from '../services/api';
import toast from 'react-hot-toast';
import { Button, Card, Input, Alert } from '../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('user');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = role === 'driver' ? loginDriver : loginUser;
      const { data } = await fn(form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-900 to-dark-800 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-8 hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40">
              <Truck size={28} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white">MedGo</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access emergency services</p>
        </div>

        <Card gradient className="border-red-600/20">
          {/* Role toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-dark-900/50 rounded-xl border border-dark-600/30">
            {[
              { id: 'user', label: 'Patient', icon: '👤' },
              { id: 'driver', label: 'Driver', icon: '🚑' },
              { id: 'admin', label: 'Admin', icon: '⚙️' }
            ].map((r) => (
              <button 
                key={r.id} 
                onClick={() => setRole(r.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  role === r.id 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <span className="mr-1">{r.icon}</span>{r.label}
              </button>
            ))}
          </div>

          {error && (
            <Alert type="error" title="Login Failed" message={error} onClose={() => setError(null)} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email Address"
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange}
              placeholder="example@mail.com"
              icon={AlertCircle}
              required 
            />

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPw ? 'text' : 'password'} 
                  value={form.password}
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="input-field pr-12" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              full
              loading={loading}
              icon={LogIn}
            >
              {loading ? 'Signing in...' : `Sign In as ${role === 'user' ? 'Patient' : role === 'driver' ? 'Driver' : 'Admin'}`}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-600/30 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Create one
            </Link>
          </div>

          {role === 'driver' && (
            <div className="mt-2 text-center text-sm text-gray-400">
              New driver?{' '}
              <Link to="/driver/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Register here
              </Link>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
