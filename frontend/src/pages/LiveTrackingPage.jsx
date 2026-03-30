import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Navigation, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import StatusBadge from '../components/common/StatusBadge';
import { getBooking, cancelBooking } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';

// Custom marker icons
const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(34,197,94,0.3)"></div>`,
  className: '', iconAnchor: [8, 8],
});
const ambulanceIcon = new L.DivIcon({
  html: `<div style="width:40px;height:40px;background:#e51d1d;border:3px solid white;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 15px rgba(229,29,29,0.5)">🚑</div>`,
  className: '', iconAnchor: [20, 20],
});

function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 14, { duration: 1 }); }, [position]);
  return null;
}

const STATUS_STEPS = ['pending', 'accepted', 'on_the_way', 'arrived', 'completed'];

export default function LiveTrackingPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    if (!bookingId) { setLoading(false); return; }
    try {
      const { data } = await getBooking(bookingId);
      setBooking(data);
      if (data.driverId?.location?.coordinates) {
        const [lng, lat] = data.driverId.location.coordinates;
        setDriverPos([lat, lng]);
      }
    } catch { toast.error('Failed to load booking'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBooking();
    const socket = getSocket();
    if (socket) {
      socket.on('driver_location', ({ driverId, lat, lng }) => {
        if (booking?.driverId?._id === driverId || booking?.driverId === driverId) {
          setDriverPos([lat, lng]);
        }
      });
      socket.on('status_updated', ({ booking: updatedBooking }) => {
        if (updatedBooking._id === bookingId) {
          setBooking(updatedBooking);
          toast.success(`Status: ${updatedBooking.status.replace('_', ' ')}`);
        }
      });
    }
    return () => {
      if (socket) { socket.off('driver_location'); socket.off('status_updated'); }
    };
  }, [bookingId, booking?.driverId?._id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await cancelBooking(bookingId, 'Cancelled by user');
      toast.success('Booking cancelled');
      fetchBooking();
    } catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const pickupPos = booking?.pickupLocation?.coordinates
    ? [booking.pickupLocation.coordinates.lat, booking.pickupLocation.coordinates.lng]
    : [27.7172, 85.3240];

  const destPos = booking?.destination?.coordinates
    ? [booking.destination.coordinates.lat, booking.destination.coordinates.lng]
    : [27.6588, 85.3247];

  const stepIndex = STATUS_STEPS.indexOf(booking?.status);
  const canCancel = booking && !['completed', 'cancelled', 'arrived'].includes(booking.status);

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Live Tracking</h1>
            <p className="text-gray-400">Real-time ambulance location and status</p>
          </div>
          {booking && <StatusBadge status={booking.status} />}
        </div>

        {!bookingId ? (
          <div className="card text-center py-16">
            <Navigation size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No active booking to track</p>
            <Link to="/book" className="btn-primary inline-flex">Book an Ambulance</Link>
          </div>
        ) : loading ? (
          <div className="card flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden border border-dark-600/50" style={{ height: '480px' }}>
                <MapContainer center={pickupPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {/* Pickup marker */}
                  <Marker position={pickupPos} icon={userIcon}>
                    <Popup><div className="text-dark-900 font-semibold">📍 Pickup<br/><span className="text-sm font-normal">{booking?.pickupLocation?.address}</span></div></Popup>
                  </Marker>
                  {/* Destination marker */}
                  <Marker position={destPos} icon={new L.DivIcon({ html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`, className: '', iconAnchor: [8,8] })}>
                    <Popup><div className="text-dark-900 font-semibold">🏥 Destination<br/><span className="text-sm font-normal">{booking?.destination?.address}</span></div></Popup>
                  </Marker>
                  {/* Ambulance marker */}
                  {driverPos && (
                    <>
                      <Marker position={driverPos} icon={ambulanceIcon}>
                        <Popup><div className="text-dark-900 font-semibold">🚑 {booking?.driverId?.name}<br/><span className="text-sm">{booking?.driverId?.ambulanceNumber}</span></div></Popup>
                      </Marker>
                      <FlyToMarker position={driverPos} />
                      <Polyline positions={[driverPos, pickupPos]} pathOptions={{ color: '#e51d1d', weight: 3, dashArray: '8,6' }} />
                    </>
                  )}
                  <Polyline positions={[pickupPos, destPos]} pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.5 }} />
                </MapContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Pickup</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Destination</div>
                {driverPos && <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary-600 rounded flex items-center justify-center text-[8px]">🚑</div> Ambulance</div>}
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              {/* Status Timeline */}
              <div className="card">
                <h3 className="font-bold text-white mb-4">Status Timeline</h3>
                <div className="space-y-3">
                  {STATUS_STEPS.slice(0, -1).map((s, i) => {
                    const done = stepIndex > i;
                    const current = stepIndex === i;
                    const labels = { pending: 'Searching Driver', accepted: 'Driver Assigned', on_the_way: 'En Route', arrived: 'Driver Arrived' };
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                          ${done ? 'bg-green-500' : current ? 'bg-primary-600 emergency-dot' : 'bg-dark-600'}`}>
                          {done ? <CheckCircle size={14} className="text-white" /> : <div className="w-2 h-2 bg-white/40 rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${done || current ? 'text-white' : 'text-gray-600'}`}>{labels[s]}</p>
                        </div>
                        {current && <div className="w-2 h-2 bg-primary-500 rounded-full emergency-dot"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Info */}
              {booking?.driverId && (
                <div className="card">
                  <h3 className="font-bold text-white mb-4">Driver</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center text-xl">🚑</div>
                    <div>
                      <p className="text-white font-semibold">{booking.driverId.name}</p>
                      <p className="text-gray-400 text-sm">{booking.driverId.ambulanceNumber}</p>
                    </div>
                  </div>
                  <a href={`tel:${booking.driverId.phone}`} className="btn-secondary w-full text-sm">
                    <Phone size={14} /> {booking.driverId.phone}
                  </a>
                </div>
              )}

              {/* Booking Details */}
              <div className="card">
                <h3 className="font-bold text-white mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div><p className="text-gray-500">Pickup</p><p className="text-white">{booking?.pickupLocation?.address}</p></div>
                  <div><p className="text-gray-500">Destination</p><p className="text-white">{booking?.destination?.address}</p></div>
                  <div><p className="text-gray-500">Emergency Type</p><p className="text-white capitalize">{booking?.emergencyType}</p></div>
                </div>
              </div>

              {/* Pricing Details */}
              {(booking?.distance || booking?.fare) && (
                <div className="card">
                  <h3 className="font-bold text-white mb-4">Fare Details</h3>
                  <div className="space-y-3 text-sm">
                    {booking?.distance > 0 && (
                      <div className="flex justify-between">
                        <p className="text-gray-500">Distance</p>
                        <p className="text-white font-semibold">{booking.distance} km</p>
                      </div>
                    )}
                    {booking?.pricePerKm > 0 && (
                      <div className="flex justify-between">
                        <p className="text-gray-500">Price/km</p>
                        <p className="text-white font-semibold">Rs {booking.pricePerKm}</p>
                      </div>
                    )}
                    {booking?.emergencyMultiplier > 1 && (
                      <div className="flex justify-between">
                        <p className="text-gray-500">Emergency Multiplier</p>
                        <p className="text-orange-400 font-semibold">x{booking.emergencyMultiplier}</p>
                      </div>
                    )}
                    {booking?.fare > 0 && (
                      <div className="border-t border-dark-600/50 pt-3 flex justify-between">
                        <p className="text-gray-400 font-medium">Total Fare</p>
                        <p className="text-green-400 font-bold text-base">Rs {booking.fare}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cancel */}
              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling} className="btn-danger w-full">
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}

              {booking?.status === 'cancelled' && (
                <div className="flex items-center gap-2 p-3 bg-gray-600/20 border border-gray-600/30 rounded-xl text-gray-400 text-sm">
                  <AlertCircle size={16} /> Booking was cancelled
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
