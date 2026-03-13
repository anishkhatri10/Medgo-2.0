import { Link } from 'react-router-dom';
import { Truck, Shield, MapPin, Clock, Phone, ChevronRight, Zap, Heart, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/40">
              <Truck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">MedGo</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-600/8 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-600/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-primary-500 rounded-full emergency-dot"></div>
            <span className="text-primary-400 text-sm font-medium">Nepal Smart Ambulance Platform</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Emergency Help<br />
            <span className="text-gradient">In Minutes</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MedGo connects you with the nearest ambulance instantly. Real-time tracking, 
            verified drivers, and 24/7 emergency response across Nepal.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              <Truck size={20} />
              Book Ambulance Now
              <ChevronRight size={16} />
            </Link>
            <Link to="/driver/register" className="btn-secondary text-base px-8 py-4">
              Register as Driver
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Shield size={16} className="text-green-500" /><span>Verified Drivers</span></div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-500" /><span>Real-time Tracking</span></div>
            <div className="flex items-center gap-2"><Clock size={16} className="text-yellow-500" /><span>24/7 Available</span></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-dark-600/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '500+', label: 'Ambulances', icon: Truck },
            { value: '50K+', label: 'Lives Saved', icon: Heart },
            { value: '77', label: 'Districts Covered', icon: MapPin },
            { value: '<5min', label: 'Avg Response', icon: Zap },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How MedGo Works</h2>
            <p className="text-gray-400">Fast, reliable, and transparent emergency care</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Request', desc: 'Book an ambulance with your pickup and destination in seconds. Choose emergency type.' },
              { icon: MapPin, title: 'Track', desc: 'See your ambulance\'s real-time location on the map. Get ETA updates.' },
              { icon: Activity, title: 'Arrive', desc: 'Verified driver arrives, updates status. Full ride history for your records.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="card hover:border-primary-600/40 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-600/15 rounded-2xl flex items-center justify-center group-hover:bg-primary-600/25 transition-all">
                    <Icon size={22} className="text-primary-400" />
                  </div>
                  <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-sm font-mono text-primary-400">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card glow-red border-primary-800/50">
            <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Truck size={30} className="text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready for an Emergency?</h2>
            <p className="text-gray-400 mb-8">Create your account and get access to Nepal's fastest ambulance network</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary px-8">Create Account</Link>
              <Link to="/driver/register" className="btn-secondary px-8">Join as Driver</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600/30 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-primary-500" />
            <span>MedGo © 2024. Built for Nepal's Emergency Services.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
