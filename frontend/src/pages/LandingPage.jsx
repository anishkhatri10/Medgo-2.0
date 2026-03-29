import { Link } from 'react-router-dom';
import { Truck, Shield, MapPin, Clock, Phone, ChevronRight, Zap, Heart, Activity, Check, Users, Globe } from 'lucide-react';
import { Button, Card } from '../components/ui';
import MedgoLogo from '../components/common/MedgoLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between animate-slide-in-top">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <MedgoLogo size="md" showText={true} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary btn-sm text-sm">Login</Link>
            <Button as={Link} to="/register" size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/8 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-600/12 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-full px-4 py-2 mb-8 animate-slide-in-top">
            <div className="w-2 h-2 bg-red-500 rounded-full emergency-dot"></div>
            <span className="text-red-400 text-sm font-medium">Nepal's Premier Emergency Ambulance Service</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-in-top" style={{ animationDelay: '0.1s' }}>
            Get Emergency Healthcare<br />
            <span className="text-gradient">In Minutes</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-in-top" style={{ animationDelay: '0.2s' }}>
            MedGo connects you instantly with verified ambulances nearby. Real-time tracking, professional drivers, and 24/7 emergency response across Nepal.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-in-top" style={{ animationDelay: '0.3s' }}>
            <Button as={Link} to="/register" size="lg" icon={Truck}>
              Book Ambulance Now
            </Button>
            <button className="btn-secondary btn-lg">
              <span>Watch Demo</span>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Verified Drivers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">24/7 Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 border-y border-dark-600/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/50 via-red-600/5 to-dark-900/50 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '500+', label: 'Ambulances', icon: Truck, color: 'text-red-400' },
              { value: '50K+', label: 'Lives Saved', icon: Heart, color: 'text-pink-400' },
              { value: '77', label: 'Districts', icon: Globe, color: 'text-blue-400' },
              { value: '<25 min', label: 'Avg Response', icon: Zap, color: 'text-yellow-400' },
            ].map(({ value, label, icon: Icon, color }, idx) => (
              <div key={label} className="text-center animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={`w-14 h-14 bg-dark-700/50 border border-dark-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-red-600/40 transition-all`}>
                  <Icon size={24} className={color} />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-xs md:text-sm text-gray-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How MedGo Works</h2>
            <p className="text-gray-400 text-lg">Simple, fast, and reliable emergency response</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Phone, 
                title: 'Request', 
                desc: 'Book an ambulance in seconds. Specify pickup location, destination, and emergency type.' 
              },
              { 
                icon: MapPin, 
                title: 'Track', 
                desc: 'Watch your ambulance arrive on the map in real-time. Get instant ETA and driver updates.' 
              },
              { 
                icon: Activity, 
                title: 'Receive Care', 
                desc: 'Professional driver arrives with complete medical support. Full booking history saved.' 
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Card 
                key={title}
                hover
                className="group border-dark-600/50 hover:border-red-600/40 animate-slide-in-top"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-500/10 rounded-2xl flex items-center justify-center group-hover:from-red-600/30 group-hover:to-red-500/20 transition-all">
                    <Icon size={24} className="text-red-400" />
                  </div>
                  <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-xs font-mono text-red-400 font-bold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose MedGo */}
      <section className="py-24 px-6 bg-gradient-to-b from-dark-900 to-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose MedGo?</h2>
            <p className="text-gray-400 text-lg">Nepal's most trusted emergency ambulance service</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Check, title: 'Verified Drivers', desc: 'All drivers are background-checked and professionally trained' },
              { icon: Shield, title: 'Secure & Safe', desc: 'Your medical data is encrypted and never shared' },
              { icon: Clock, title: 'Always Available', desc: '24/7 availability across all districts in Nepal' },
              { icon: Users, title: 'Professional Team', desc: 'Expert drivers trained in emergency response' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div 
                key={title}
                className="flex gap-4 animate-slide-in-left"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <Icon size={22} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Card gradient className="border-red-600/30 relative overflow-hidden glow-intense">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none"></div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck size={32} className="text-red-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Save Lives, Save Time</h2>
              <p className="text-gray-300 mb-10 text-lg">Join thousands who trust MedGo for emergency care. Fast, reliable, professional.</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button as={Link} to="/register" size="lg">Create Account Now</Button>
                <Button as={Link} to="/driver/register" variant="outline" size="lg">Join as Driver</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600/30 py-12 px-6 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Truck size={20} className="text-red-500" />
                <span className="text-lg font-bold text-white">MedGo</span>
              </div>
              <p className="text-sm text-gray-400">Nepal's fastest and most reliable ambulance service.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link to="/login" className="block hover:text-red-400 transition-colors">Login</Link>
                <Link to="/register" className="block hover:text-red-400 transition-colors">Book Ambulance</Link>
                <Link to="/driver/register" className="block hover:text-red-400 transition-colors">Join as Driver</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📱 9843521109</p>
                <p>📧 contact@medgo.com</p>
                <p>📍 Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
          <div className="border-t border-dark-600/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2024 MedGo. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
