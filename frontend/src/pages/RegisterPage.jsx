import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser, registerDriver } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const isDriver = searchParams.get('type') === 'driver' || window.location.pathname.includes('driver');
  const [role, setRole] = useState(isDriver ? 'driver' : 'user');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', ambulanceNumber: '', licenseNumber: '', vehicleType: 'basic' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = role === 'driver' ? registerDriver : registerUser;
      const { data } = await fn(form);
      login(data);
      toast.success(`Welcome to MedGo, ${data.name}!`);
      navigate(role === 'driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/40">
              <Truck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MedGo</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Nepal's emergency response network</p>
        </div>

        <div className="card">
          <div className="flex bg-dark-700 rounded-xl p-1 mb-6">
            {['user', 'driver'].map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${role === r ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {r === 'user' ? 'Patient / User' : 'Ambulance Driver'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Ram Sharma" className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" className="input-field" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="input-field" required minLength={6} />
            </div>

            {role === 'driver' && (
              <>
                <div className="border-t border-dark-600/50 pt-4">
                  <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">Driver Details</p>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Ambulance Number</label>
                      <input name="ambulanceNumber" value={form.ambulanceNumber} onChange={handleChange} placeholder="BA 1 PA 1234" className="input-field" required />
                    </div>
                    <div>
                      <label className="label">License Number</label>
                      <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="DL-07-123456" className="input-field" required />
                    </div>
                    <div>
                      <label className="label">Vehicle Type</label>
                      <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="input-field">
                        <option value="basic">Basic Ambulance</option>
                        <option value="advanced">Advanced Life Support</option>
                        <option value="icu">Mobile ICU</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
