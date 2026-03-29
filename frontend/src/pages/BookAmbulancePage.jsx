import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Navigation, AlertCircle, ChevronRight, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { createBooking, estimateFare } from '../services/api';
import toast from 'react-hot-toast';
import { Card, Button, Input, Alert } from '../components/ui';

const EMERGENCY_TYPES = [
  { value: 'general', label: 'General', icon: '🏥', desc: 'Standard transport & routine', color: 'from-blue-600/20 to-blue-500/10' },
  { value: 'cardiac', label: 'Cardiac', icon: '❤️', desc: 'Heart & chest pain emergency', color: 'from-red-600/20 to-red-500/10' },
  { value: 'trauma', label: 'Trauma', icon: '🚑', desc: 'Injury or accident', color: 'from-orange-600/20 to-orange-500/10' },
  { value: 'maternity', label: 'Maternity', icon: '👶', desc: 'Pregnancy & delivery', color: 'from-pink-600/20 to-pink-500/10' },
  { value: 'critical', label: 'Critical', icon: '🚨', desc: 'Life-threatening situation', color: 'from-red-700/30 to-red-600/20' },
];

// Nepal locations for demo
const NEPAL_LOCATIONS = [
  'Kathmandu, Bagmati Province',
  'Patan, Lalitpur',
  'Bhaktapur, Bagmati',
  'Kirtipur, Kathmandu',
  'Thamel, Kathmandu',
  'Balaju, Kathmandu',
  'Pokhara, Gandaki Province',
  'Biratnagar, Province No. 1',
  'Birgunj, Madhesh Province',
  'Dharan, Koshi Province',
  'KIST Medical College, Imadol',
  'Bir Hospital, Kathmandu',
  'Teaching Hospital, Maharajgunj',
  'Patan Hospital, Patan',
  'Grande Hospital, Tokha Road',
];

export default function BookAmbulancePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickupAddress: '',
    pickupLat: 27.7172,
    pickupLng: 85.3240,
    destAddress: '',
    destLat: 27.6588,
    destLng: 85.3247,
    emergencyType: 'general',
    patientName: '',
    patientAge: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [estimatingFare, setEstimatingFare] = useState(false);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [step, setStep] = useState(1);

  // Estimate fare when locations or emergency type changes
  useEffect(() => {
    const fetchFareEstimate = async () => {
      if (form.pickupAddress && form.destAddress) {
        setEstimatingFare(true);
        try {
          const { data } = await estimateFare({
            pickupLocation: { coordinates: { lat: form.pickupLat, lng: form.pickupLng } },
            destination: { coordinates: { lat: form.destLat, lng: form.destLng } },
            emergencyType: form.emergencyType,
          });
          setFareEstimate(data);
        } catch (err) {
          console.error('Error estimating fare:', err);
        } finally {
          setEstimatingFare(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchFareEstimate, 500);
    return () => clearTimeout(debounceTimer);
  }, [form.pickupLat, form.pickupLng, form.destLat, form.destLng, form.emergencyType]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, pickupLat: pos.coords.latitude, pickupLng: pos.coords.longitude, pickupAddress: 'Current Location' }));
        toast.success('📍 Location detected!');
      },
      () => toast.error('Could not detect location. Please enter manually.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickupAddress || !form.destAddress) {
      toast.error('Please fill in pickup and destination');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        pickupLocation: { address: form.pickupAddress, coordinates: { lat: form.pickupLat, lng: form.pickupLng } },
        destination: { address: form.destAddress, coordinates: { lat: form.destLat, lng: form.destLng } },
        emergencyType: form.emergencyType,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge) || 0,
        notes: form.notes,
      };
      const { data } = await createBooking(payload);
      toast.success('🚑 Ambulance requested! Finding nearest driver...');
      navigate(`/track?bookingId=${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const emergencyTypeObj = EMERGENCY_TYPES.find(t => t.value === form.emergencyType);

  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Book Ambulance</h1>
          <p className="text-gray-400 text-lg">Fast & Reliable Emergency Transport</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-1 mb-10 px-1">
          {[
            { num: 1, label: 'Emergency Type' },
            { num: 2, label: 'Locations' },
            { num: 3, label: 'Patient Info' }
          ].map(({ num, label }, idx) => (
            <div key={num} className="flex items-center gap-1 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= num 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-dark-700 text-gray-500'
              }`}>
                {step > num ? <CheckCircle size={20} /> : num}
              </div>
              <div className="text-xs font-semibold text-gray-400 hidden sm:block flex-shrink-0">{label}</div>
              {idx < 2 && (
                <div className={`h-1 flex-1 rounded-full transition-all mx-1 ${
                  step > num ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-dark-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Emergency Type */}
          {step === 1 && (
            <Card className="animate-slide-in-top">
              <h2 className="text-2xl font-bold text-white mb-2">Select Emergency Type</h2>
              <p className="text-gray-400 text-sm mb-8">This helps us dispatch the right assistance</p>
              <div className="space-y-3">
                {EMERGENCY_TYPES.map((type) => (
                  <button key={type.value} type="button"
                    onClick={() => setForm(f => ({ ...f, emergencyType: type.value }))}
                    className={`relative w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group
                      ${form.emergencyType === type.value
                        ? `bg-gradient-to-br ${type.color} border-red-600/50 ring-2 ring-red-600/30`
                        : 'bg-dark-700/50 border-dark-600/50 hover:border-dark-500 hover:bg-dark-700'}`}>
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white text-lg">{type.label}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400">{type.desc}</div>
                    </div>
                    {form.emergencyType === type.value && (
                      <div className="w-5 h-5 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {form.emergencyType === 'critical' && (
                <Alert type="error" title="Critical Emergency" message="For life-threatening situations, also call 102 (Ambulance) or 101 (Emergency)" className="mt-6" />
              )}

              <Button type="button" onClick={() => setStep(2)} full className="mt-8" icon={ChevronRight}>
                Continue to Locations
              </Button>
            </Card>
          )}

          {/* Step 2: Locations */}
          {step === 2 && (
            <Card className="animate-slide-in-top">
              <h2 className="text-2xl font-bold text-white mb-8">Pickup & Destination</h2>
              
              {/* Pickup Location */}
              <div className="mb-8">
                <label className="label">📍 Pickup Location (Where we pick you up)</label>
                <div className="flex gap-2">
                  <input name="pickupAddress" value={form.pickupAddress} onChange={handleChange}
                    list="nepal-locations" placeholder="Enter your current location..." 
                    className="input-field flex-1" required />
                  <Button type="button" onClick={useCurrentLocation}
                    variant="secondary" size="md" icon={Navigation} />
                </div>
                <datalist id="nepal-locations">
                  {NEPAL_LOCATIONS.map(l => <option key={l} value={l} />)}
                </datalist>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-dark-600 to-transparent"></div>
                <div className="relative flex justify-center">
                  <Truck size={20} className="text-red-400 bg-dark-800 px-3" />
                </div>
              </div>

              {/* Destination */}
              <div className="mb-8">
                <label className="label">🏥 Destination (Hospital/Clinic)</label>
                <input name="destAddress" value={form.destAddress} onChange={handleChange}
                  list="nepal-locations" placeholder="Enter hospital or destination..." 
                  className="input-field" required />
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" onClick={() => setStep(1)} variant="secondary" full>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)} full icon={ChevronRight}>
                  Continue to Patient Info
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <Card className="animate-slide-in-top">
              <h2 className="text-2xl font-bold text-white mb-8">Patient Information</h2>
              
              <div className="space-y-6">
                {/* Name and Age */}
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Patient Name"
                    name="patientName" 
                    value={form.patientName} 
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                  <Input 
                    label="Age (years)"
                    name="patientAge" 
                    type="number" 
                    value={form.patientAge} 
                    onChange={handleChange}
                    placeholder="Age"
                    min={0} 
                    max={120}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Additional Medical Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    placeholder="Describe symptoms, medical conditions, allergies, current medications..."
                    className="input-field resize-none h-28" />
                </div>

                {/* Summary Card */}
                <Card gradient className="border-red-600/30 bg-gradient-to-br from-dark-700/50 to-dark-800/50">
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">📋 Booking Summary</p>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-400">Emergency Type</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{emergencyTypeObj?.icon}</span>
                        <span className="text-white font-semibold capitalize">{emergencyTypeObj?.label}</span>
                      </div>
                    </div>
                    <div className="border-t border-dark-600/50 pt-3 flex justify-between items-start text-sm">
                      <span className="text-gray-400">📍 From</span>
                      <span className="text-white text-right max-w-xs truncate">{form.pickupAddress || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-400">🏥 To</span>
                      <span className="text-white text-right max-w-xs truncate">{form.destAddress || 'Not selected'}</span>
                    </div>

                    {/* Pricing Section */}
                    {fareEstimate && (
                      <>
                        <div className="border-t border-dark-600/50 pt-3 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">📏 Distance</span>
                            <span className="text-white font-semibold">{fareEstimate.distance} km</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">💰 Price per km</span>
                            <span className="text-white font-semibold">₹{fareEstimate.pricePerKm}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                            <span>Base fare: ₹{fareEstimate.breakdown.basePrice}</span>
                            <span>Distance: ₹{fareEstimate.breakdown.distancePrice}</span>
                          </div>
                        </div>
                        <div className="border-t border-dark-600/50 pt-3 flex justify-between items-center">
                          <span className="text-gray-400 text-sm">💵 Total Estimated Fare</span>
                          <div className="flex items-center gap-2">
                            {fareEstimate.emergencyMultiplier > 1 && (
                              <div className="flex items-center gap-1 bg-orange-600/30 px-2 py-1 rounded text-xs text-orange-400" title="Emergency multiplier">
                                <Zap size={12} />
                                x{fareEstimate.emergencyMultiplier}
                              </div>
                            )}
                            <span className="text-white font-bold text-lg">₹{fareEstimate.fare}</span>
                          </div>
                        </div>
                      </>
                    )}
                    {estimatingFare && (
                      <div className="border-t border-dark-600/50 pt-3 text-center text-xs text-gray-500">
                        Calculating fare...
                      </div>
                    )}
                  </div>
                </Card>

                {/* Safety Alert */}
                <Alert 
                  type="warning" 
                  title="⚠️ Life-Threatening Emergency?" 
                  message="For critical situations (cardiac arrest, severe trauma, etc.), also call 102 directly for immediate response." 
                />
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" onClick={() => setStep(2)} variant="secondary" full>
                  Back
                </Button>
                <Button type="submit" disabled={loading} full loading={loading} icon={Truck}>
                  {loading ? 'Requesting Ambulance...' : 'Request Ambulance Now'}
                </Button>
              </div>
            </Card>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
