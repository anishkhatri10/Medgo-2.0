import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Activity, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getLiveLocations } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';

const makeAmbulanceIcon = (status) => new L.DivIcon({
  html: `<div style="width:44px;height:44px;background:${status === 'busy' ? '#e51d1d' : '#16a34a'};border:3px solid white;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 15px rgba(0,0,0,0.4)">🚑</div>`,
  className: '', iconAnchor: [22, 22],
});

export default function AdminLivePage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchLocations = async () => {
    try {
      const { data } = await getLiveLocations();
      setDrivers(data);
      setLastUpdate(new Date());
    } catch { toast.error('Failed to load locations'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    const socket = getSocket();
    if (socket) {
      socket.on('driver_location', ({ driverId, lat, lng }) => {
        setDrivers(prev => prev.map(d =>
          d._id === driverId
            ? { ...d, location: { ...d.location, coordinates: [lng, lat] } }
            : d
        ));
        setLastUpdate(new Date());
      });
      socket.on('driver_status', ({ driverId, status }) => {
        setDrivers(prev => prev.map(d => d._id === driverId ? { ...d, status } : d));
      });
    }
    return () => {
      clearInterval(interval);
      if (socket) { socket.off('driver_location'); socket.off('driver_status'); }
    };
  }, []);

  const available = drivers.filter(d => d.status === 'available').length;
  const busy = drivers.filter(d => d.status === 'busy').length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Live Ambulance Map</h1>
            <p className="text-gray-400">Real-time tracking of all active ambulances</p>
          </div>
          <button onClick={fetchLocations} className="btn-secondary text-sm gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-dark-800 rounded-2xl border border-dark-600/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white font-semibold">{available}</span>
            <span className="text-gray-400 text-sm">Available</span>
          </div>
          <div className="w-px h-4 bg-dark-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full emergency-dot"></div>
            <span className="text-white font-semibold">{busy}</span>
            <span className="text-gray-400 text-sm">On Duty</span>
          </div>
          <div className="w-px h-4 bg-dark-600"></div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-gray-400" />
            <span className="text-gray-400 text-sm">Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-dark-600/50" style={{ height: '500px' }}>
            {loading ? (
              <div className="h-full flex items-center justify-center bg-dark-800">
                <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <MapContainer center={[27.7172, 85.3240]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {drivers.map(d => {
                  if (!d.location?.coordinates || d.location.coordinates.length < 2) return null;
                  const [lng, lat] = d.location.coordinates;
                  return (
                    <Marker key={d._id} position={[lat, lng]} icon={makeAmbulanceIcon(d.status)}>
                      <Popup>
                        <div className="text-dark-900">
                          <p className="font-bold">{d.name}</p>
                          <p className="text-sm">{d.ambulanceNumber}</p>
                          <p className={`text-sm font-semibold mt-1 ${d.status === 'busy' ? 'text-red-600' : 'text-green-600'}`}>
                            {d.status.toUpperCase()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Driver list */}
          <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-hide">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Drivers</h3>
            {drivers.length === 0 ? (
              <div className="card text-center py-8 text-gray-500 text-sm">No active drivers</div>
            ) : (
              drivers.map(d => (
                <div key={d._id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${d.status === 'busy' ? 'bg-primary-500 emergency-dot' : 'bg-green-500'}`}></div>
                    <span className="text-white font-semibold text-sm">{d.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs font-mono">{d.ambulanceNumber}</p>
                  <p className={`text-xs font-semibold mt-1 capitalize ${d.status === 'busy' ? 'text-primary-400' : 'text-green-400'}`}>
                    {d.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
