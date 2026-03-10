import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Navigation, AlertCircle, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { createBooking } from '../services/api';
import toast from 'react-hot-toast';

const EMERGENCY_TYPES = [
  { value: 'general', label: 'General', icon: '🏥', desc: 'Standard transport' },
  { value: 'cardiac', label: 'Cardiac', icon: '❤️', desc: 'Heart emergency' },
  { value: 'trauma', label: 'Trauma', icon: '🤕', desc: 'Injury/accident' },
  { value: 'maternity', label: 'Maternity', icon: '🤱', desc: 'Child delivery' },
  { value: 'critical', label: 'Critical', icon: '🚨', desc: 'Life threatening' },
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
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, pickupLat: pos.coords.latitude, pickupLng: pos.coords.longitude, pickupAddress: 'Current Location' }));
        toast.success('Location detected!');
      },
      () => toast.error('Could not detect location')
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
      toast.success('Ambulance requested! Finding nearest driver...');
      navigate(`/track?bookingId=${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Book Ambulance</h1>
          <p className="text-gray-400">Fill in the details to request emergency transport</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-0.5 w-16 transition-all ${step > s ? 'bg-primary-600' : 'bg-dark-600'}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-400">
            {step === 1 ? 'Emergency Type' : step === 2 ? 'Locations' : 'Patient Details'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Emergency Type */}
          {step === 1 && (
            <div className="card animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-2">Select Emergency Type</h2>
              <p className="text-gray-400 text-sm mb-6">Choose the type that best describes the emergency</p>
              <div className="grid grid-cols-1 gap-3">
                {EMERGENCY_TYPES.map((type) => (
                  <button key={type.value} type="button"
                    onClick={() => setForm(f => ({ ...f, emergencyType: type.value }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                      ${form.emergencyType === type.value
                        ? 'bg-primary-600/15 border-primary-600/50 text-white'
                        : 'bg-dark-700/50 border-dark-600/50 text-gray-300 hover:border-dark-500'}`}>
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.desc}</div>
                    </div>
                    {form.emergencyType === type.value && (
                      <div className="ml-auto w-4 h-4 bg-primary-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-6">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Locations */}
          {step === 2 && (
            <div className="card animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-6">Pickup & Destination</h2>
              <div className="space-y-5">
                <div>
                  <label className="label flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Pickup Location
                  </label>
                  <div className="flex gap-2">
                    <input name="pickupAddress" value={form.pickupAddress} onChange={handleChange}
                      list="nepal-locations" placeholder="Enter pickup address..." className="input-field flex-1" required />
                    <button type="button" onClick={useCurrentLocation}
                      className="btn-secondary px-3" title="Use my location">
                      <Navigation size={16} />
                    </button>
                  </div>
                  <datalist id="nepal-locations">
                    {NEPAL_LOCATIONS.map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>

                <div className="relative flex items-center gap-3 py-2">
                  <div className="w-px h-8 bg-dark-500 mx-1.5 absolute left-1.5"></div>
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    Destination (Hospital)
                  </label>
                  <input name="destAddress" value={form.destAddress} onChange={handleChange}
                    list="nepal-locations" placeholder="Enter hospital or destination..." className="input-field" required />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <div className="card animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-6">Patient Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Patient Name</label>
                    <input name="patientName" value={form.patientName} onChange={handleChange}
                      placeholder="Full name" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Age</label>
                    <input name="patientAge" type="number" value={form.patientAge} onChange={handleChange}
                      placeholder="Age" className="input-field" min={0} max={120} />
                  </div>
                </div>
                <div>
                  <label className="label">Additional Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange}
                    placeholder="Describe the emergency, special conditions, medical history..."
                    className="input-field resize-none h-28" />
                </div>

                {/* Summary */}
                <div className="bg-dark-700/50 rounded-xl p-4 space-y-2 border border-dark-600/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Booking Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Emergency Type</span>
                    <span className="text-white capitalize">{form.emergencyType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pickup</span>
                    <span className="text-white text-right max-w-[60%] truncate">{form.pickupAddress || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Destination</span>
                    <span className="text-white text-right max-w-[60%] truncate">{form.destAddress || '—'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">For life-threatening emergencies, also call 102 (Ambulance) or 101 (Police).</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Truck size={18} />}
                  {loading ? 'Requesting...' : 'Request Ambulance'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
