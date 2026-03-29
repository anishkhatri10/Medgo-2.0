import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, UserPlus, Mail, Phone, Lock, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser, registerDriver } from '../services/api';
import toast from 'react-hot-toast';
import { Button, Card, Input, Select, Alert } from '../components/ui';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const isDriver = searchParams.get('type') === 'driver' || window.location.pathname.includes('driver');
  const [role, setRole] = useState(isDriver ? 'driver' : 'user');
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: '', 
    ambulanceNumber: '', 
    licenseNumber: '', 
    vehicleType: 'basic' 
  });
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
      const fn = role === 'driver' ? registerDriver : registerUser;
      const { data } = await fn(form);
      login(data);
      toast.success(`Welcome to MedGo, ${data.name}!`);
      navigate(role === 'driver' ? '/driver' : '/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-dark-900 to-dark-800 p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="w-full max-w-md animate-scale-in relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-8 hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40">
              <Truck size={28} className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white">MedGo</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Nepal's emergency response network</p>
        </div>

        <Card gradient className="border-red-600/20">
          <div className="flex gap-2 mb-8 p-1 bg-dark-900/50 rounded-xl border border-dark-600/30">
            {[
              { id: 'user', label: 'Patient', icon: '👤' },
              { id: 'driver', label: 'Driver', icon: '🚑' }
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
            <Alert type="error" title="Registration Error" message={error} onClose={() => setError(null)} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Full Name"
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Ram Sharma"
              required 
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Phone"
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                placeholder="98XXXXXXXX"
                icon={Phone}
                required 
              />
              <Input 
                label="Email"
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="you@mail.com"
                icon={Mail}
                required 
              />
            </div>

            <Input 
              label="Password"
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Min. 8 characters"
              icon={Lock}
              required 
              minLength={6} 
            />

            {role === 'driver' && (
              <div className="border-t border-dark-600/50 pt-6">
                <p className="text-xs text-gray-400 mb-5 uppercase tracking-wider font-semibold flex items-center gap-2">
                  <Truck size={16} /> Driver Registration Details
                </p>
                <div className="space-y-4">
                  <Input 
                    label="Ambulance Number"
                    name="ambulanceNumber" 
                    value={form.ambulanceNumber} 
                    onChange={handleChange} 
                    placeholder="BA 1 PA 1234"
                    icon={FileText}
                    required 
                  />

                  <Input 
                    label="License Number"
                    name="licenseNumber" 
                    value={form.licenseNumber} 
                    onChange={handleChange} 
                    placeholder="DL-07-123456"
                    icon={FileText}
                    required 
                  />

                  <Select 
                    label="Vehicle Type"
                    name="vehicleType" 
                    value={form.vehicleType} 
                    onChange={handleChange}
                    options={[
                      { value: 'basic', label: 'Basic Ambulance' },
                      { value: 'advanced', label: 'Advanced Life Support (ALS)' },
                      { value: 'icu', label: 'Mobile ICU' }
                    ]}
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              full
              loading={loading}
              icon={UserPlus}
              className="mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-600/30 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 Your information is secure and encrypted
        </p>
      </div>
    </div>
  );
}
