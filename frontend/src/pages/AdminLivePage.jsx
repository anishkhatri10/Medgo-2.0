import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Activity, RefreshCw, MapPin, Phone, Truck, Clock, AlertTriangle, CheckCircle, Home, Navigation } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getLiveLocations, getDriverTripDetails } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import { Card } from '../components/ui';

const makeAmbulanceIcon = (status, isSelected) => new L.DivIcon({
  html: `<div style="width:${isSelected ? 52 : 44}px;height:${isSelected ? 52 : 44}px;background:${status === 'busy' ? '#e51d1d' : status === 'available' ? '#16a34a' : '#6b7280'};border:${isSelected ? '4px' : '3px'} solid ${isSelected ? '#fbbf24' : 'white'};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:${isSelected ? 24 : 20}px;box-shadow:0 4px 15px rgba(0,0,0,0.4);transition:all;transform:${isSelected ? 'scale(1.2)' : 'scale(1)'}}">🚑</div>`,
  className: '', iconAnchor: [isSelected ? 26 : 22, isSelected ? 26 : 22],
});

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', bgLight: 'bg-green-500/20', textColor: 'text-green-400', icon: '🟢' },
  busy: { label: 'On Trip', color: 'bg-red-500', bgLight: 'bg-red-500/20', textColor: 'text-red-400', icon: '🔴' },
  offline: { label: 'Offline', color: 'bg-gray-500', bgLight: 'bg-gray-500/20', textColor: 'text-gray-400', icon: '⚫' },
};

const vehicleTypeConfig = {
  basic: { label: '🏥 Basic Ambulance', desc: 'Standard transport' },
  advanced: { label: '⚡ Advanced Life Support (ALS)', desc: 'Advanced equipment' },
  icu: { label: '🏥 Mobile ICU', desc: 'ICU equipped' },
};

const emergencyTypeConfig = {
  general: { label: 'General', color: 'bg-blue-500/20', textColor: 'text-blue-400' },
  cardiac: { label: 'Cardiac', color: 'bg-red-500/20', textColor: 'text-red-400' },
  trauma: { label: 'Trauma', color: 'bg-orange-500/20', textColor: 'text-orange-400' },
  maternity: { label: 'Maternity', color: 'bg-pink-500/20', textColor: 'text-pink-400' },
  critical: { label: 'Critical', color: 'bg-purple-500/20', textColor: 'text-purple-400' },
};

export default function AdminLivePage() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [centerOnDriver, setCenterOnDriver] = useState(null);

  const fetchLocations = async () => {
    try {
      const { data } = await getLiveLocations();
      setDrivers(data);
      setLastUpdate(new Date());
    } catch (err) {
      toast.error('Failed to load driver locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripDetails = async (driverId) => {
    try {
      const { data } = await getDriverTripDetails(driverId);
      setTripDetails(data);
    } catch (err) {
      toast.error('Failed to load trip details');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 15000); // Update every 15 seconds
    
    const socket = getSocket();
    if (socket) {
      socket.on('driver_location', ({ driverId, lat, lng }) => {
        setDrivers(prev => prev.map(d =>
          d._id === driverId
            ? { ...d, location: { ...d.location, coordinates: [lng, lat] } }
            : d
        ));
        if (selectedDriver?._id === driverId) {
          setSelectedDriver(prev => ({
            ...prev,
            location: { ...prev.location, coordinates: [lng, lat] }
          }));
        }
        setLastUpdate(new Date());
      });

      socket.on('driver_status', ({ driverId, status }) => {
        setDrivers(prev => prev.map(d => d._id === driverId ? { ...d, status } : d));
        if (selectedDriver?._id === driverId) {
          setSelectedDriver(prev => ({ ...prev, status }));
          fetchTripDetails(driverId);
        }
      });

      socket.on('booking_accepted', ({ booking }) => {
        if (selectedDriver?._id === booking.driverId) {
          fetchTripDetails(booking.driverId);
        }
      });

      socket.on('status_updated', ({ booking }) => {
        if (selectedDriver?._id === booking.driverId) {
          fetchTripDetails(booking.driverId);
        }
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('driver_location');
        socket.off('driver_status');
        socket.off('booking_accepted');
        socket.off('status_updated');
      }
    };
  }, [selectedDriver?._id]);

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    setCenterOnDriver(driver);
    fetchTripDetails(driver._id);
  };

  // Filter drivers
  const filtered = drivers.filter(d => {
    const matchSearch = !search || 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ambulanceNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchFilter;
  });

  // Count stats
  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    busy: drivers.filter(d => d.status === 'busy').length,
    offline: drivers.filter(d => d.status === 'offline').length,
    verified: drivers.filter(d => d.isVerified).length,
  };

  const mapCenter = centerOnDriver && centerOnDriver.location?.coordinates 
    ? [centerOnDriver.location.coordinates[1], centerOnDriver.location.coordinates[0]]
    : [27.7172, 85.3240];

  return (
    <DashboardLayout>
      <div className="max-w-full animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">🗺️ Live Ambulance Tracking</h1>
              <p className="text-gray-400">Real-time GPS tracking and driver management</p>
            </div>
            <button onClick={fetchLocations} className="btn-secondary text-sm gap-2 flex items-center">
              <RefreshCw size={14} /> Refresh Now
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Drivers', value: stats.total, icon: '🚑', color: 'from-primary-600/20 to-primary-500/10' },
              { label: 'Available', value: stats.available, icon: '🟢', color: 'from-green-600/20 to-green-500/10' },
              { label: 'On Trip', value: stats.busy, icon: '🔴', color: 'from-red-600/20 to-red-500/10' },
              { label: 'Offline', value: stats.offline, icon: '⚫', color: 'from-gray-600/20 to-gray-500/10' },
              { label: 'Verified', value: stats.verified, icon: '✅', color: 'from-blue-600/20 to-blue-500/10' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className={`card p-3 bg-gradient-to-br ${color} border-dark-600/30`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden border border-dark-600/50 bg-dark-800" style={{ height: '550px' }}>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm">Loading live map...</p>
                  </div>
                </div>
              ) : (
                <MapContainer center={mapCenter} zoom={selectedDriver ? 14 : 12} style={{ height: '100%', width: '100%' }} key={`${mapCenter[0]}-${mapCenter[1]}`}>
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  
                  {/* Current Trip Route */}
                  {tripDetails?.currentBooking && tripDetails.currentBooking.pickupLocation?.coordinates && tripDetails.currentBooking.destination?.coordinates && (
                    <>
                      <Polyline 
                        positions={[
                          [tripDetails.currentBooking.pickupLocation.coordinates.lat, tripDetails.currentBooking.pickupLocation.coordinates.lng],
                          selectedDriver?.location?.coordinates ? [selectedDriver.location.coordinates[1], selectedDriver.location.coordinates[0]] : [tripDetails.currentBooking.pickupLocation.coordinates.lat, tripDetails.currentBooking.pickupLocation.coordinates.lng],
                          [tripDetails.currentBooking.destination.coordinates.lat, tripDetails.currentBooking.destination.coordinates.lng]
                        ]}
                        pathOptions={{ color: '#e51d1d', weight: 3, dashArray: '5,5' }}
                      />
                    </>
                  )}

                  {/* All Drivers */}
                  {filtered.map(d => {
                    if (!d.location?.coordinates || d.location.coordinates.length < 2) return null;
                    const [lng, lat] = d.location.coordinates;
                    const isSelected = selectedDriver?._id === d._id;
                    
                    return (
                      <Marker 
                        key={d._id} 
                        position={[lat, lng]} 
                        icon={makeAmbulanceIcon(d.status, isSelected)}
                        eventHandlers={{ click: () => handleSelectDriver(d) }}
                      >
                        <Popup>
                          <div className="text-dark-900 min-w-max">
                            <p className="font-bold text-sm mb-1">{d.name}</p>
                            <p className="text-xs text-gray-600 mb-2">{d.ambulanceNumber}</p>
                            <div className="flex items-center gap-1 mb-1">
                              <div className={`w-2 h-2 rounded-full ${statusConfig[d.status].color}`}></div>
                              <p className={`text-xs font-semibold ${statusConfig[d.status].textColor}`}>
                                {statusConfig[d.status].label}
                              </p>
                            </div>
                            <p className="text-xs">{vehicleTypeConfig[d.vehicleType]?.label}</p>
                            <p className="text-xs font-mono mt-1">📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Trip Markers */}
                  {tripDetails?.currentBooking && tripDetails.currentBooking.pickupLocation?.coordinates && (
                    <Marker 
                      position={[tripDetails.currentBooking.pickupLocation.coordinates.lat, tripDetails.currentBooking.pickupLocation.coordinates.lng]}
                      icon={new L.DivIcon({
                        html: `<div style="width:36px;height:36px;background:#3b82f6;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(59,130,246,0.5)">📍</div>`,
                        iconAnchor: [18, 18],
                      })}
                    >
                      <Popup><p className="text-sm font-semibold">Pickup Location</p></Popup>
                    </Marker>
                  )}

                  {tripDetails?.currentBooking && tripDetails.currentBooking.destination?.coordinates && (
                    <Marker 
                      position={[tripDetails.currentBooking.destination.coordinates.lat, tripDetails.currentBooking.destination.coordinates.lng]}
                      icon={new L.DivIcon({
                        html: `<div style="width:36px;height:36px;background:#10b981;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(16,185,129,0.5)">🏥</div>`,
                        iconAnchor: [18, 18],
                      })}
                    >
                      <Popup><p className="text-sm font-semibold">Destination</p></Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Right Panel - Driver Details & List */}
          <div className="flex flex-col gap-6">
            {/* Selected Driver Details */}
            {selectedDriver && (
              <Card gradient className="border-primary-600/30 p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600/20 to-primary-500/10 p-4 border-b border-primary-600/30">
                  <h3 className="text-lg font-bold text-white">Driver Details</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Driver Basic Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center text-2xl">
                        🚑
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{selectedDriver.name}</p>
                        <p className="text-sm text-gray-400">{selectedDriver.ambulanceNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${statusConfig[selectedDriver.status].bgLight} border border-dark-600/30`}>
                      <p className="text-xs text-gray-400 mb-1">Status</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[selectedDriver.status].color}`}></div>
                        <p className={`font-semibold text-sm ${statusConfig[selectedDriver.status].textColor}`}>
                          {statusConfig[selectedDriver.status].label}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-dark-700/50 border border-dark-600/30">
                      <p className="text-xs text-gray-400 mb-1">Vehicle</p>
                      <p className="font-semibold text-sm text-white">{vehicleTypeConfig[selectedDriver.vehicleType]?.label.split(' ')[0]}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-dark-700/30 rounded-lg">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <a href={`tel:${selectedDriver.phone}`} className="text-sm text-primary-400 hover:text-primary-300">
                        {selectedDriver.phone}
                      </a>
                    </div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dark-600/30">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Rating</p>
                      <p className="text-lg font-bold text-yellow-400">⭐ {selectedDriver.rating?.toFixed(1) || '5.0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Rides</p>
                      <p className="text-lg font-bold text-primary-400">{selectedDriver.totalRides || 0}</p>
                    </div>
                  </div>

                  {/* Current Trip */}
                  {tripDetails?.currentBooking && (
                    <div className="pt-3 border-t border-dark-600/30">
                      <p className="text-sm font-bold text-white mb-3">Current Trip</p>
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg ${emergencyTypeConfig[tripDetails.currentBooking.emergencyType]?.color} border border-dark-600/30`}>
                          <p className="text-xs text-gray-400 mb-1">Emergency Type</p>
                          <p className={`font-semibold text-sm ${emergencyTypeConfig[tripDetails.currentBooking.emergencyType]?.textColor}`}>
                            {emergencyTypeConfig[tripDetails.currentBooking.emergencyType]?.label}
                          </p>
                        </div>

                        <div className="space-y-2 p-3 bg-dark-700/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-sm text-white truncate">{tripDetails.currentBooking.pickupLocation?.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Home size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Destination</p>
                              <p className="text-sm text-white truncate">{tripDetails.currentBooking.destination?.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center p-2 bg-dark-700/30 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="font-bold text-white">{tripDetails.currentBooking.distance} km</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Estimated</p>
                            <p className="font-bold text-white">{tripDetails.currentBooking.estimatedTime} min</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Fare</p>
                            <p className="font-bold text-green-400">Rs {tripDetails.currentBooking.fare}</p>
                          </div>
                        </div>

                        <div className={`p-2 rounded-lg flex items-center justify-center gap-2 ${tripDetails.currentBooking.status === 'on_the_way' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                          {tripDetails.currentBooking.status === 'on_the_way' ? (
                            <>
                              <AlertTriangle size={14} className="text-red-400" />
                              <span className="text-xs font-semibold text-red-400">EN ROUTE</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} className="text-green-400" />
                              <span className="text-xs font-semibold text-green-400">{tripDetails.currentBooking.status.toUpperCase()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!tripDetails?.currentBooking && (
                    <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                      <p className="text-sm text-gray-400">No active trip</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Driver List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Drivers List</h3>
                <span className="text-xs text-gray-500">{filtered.length} drivers</span>
              </div>

              {/* Search and Filter */}
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600/30 rounded-lg text-sm text-white placeholder-gray-500"
                />
                <div className="flex gap-1 flex-wrap">
                  {['all', 'available', 'busy', 'offline'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filterStatus === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                      }`}
                    >
                      {status === 'all' ? 'All' : statusConfig[status]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver List Items */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
                {filtered.length === 0 ? (
                  <div className="card text-center py-8 bg-dark-700/30">
                    <p className="text-gray-500 text-sm">No drivers found</p>
                  </div>
                ) : (
                  filtered.map(d => (
                    <div
                      key={d._id}
                      onClick={() => handleSelectDriver(d)}
                      className={`card p-3 cursor-pointer transition-all ${
                        selectedDriver?._id === d._id
                          ? 'border-primary-600/50 bg-primary-600/10 ring-2 ring-primary-600/30'
                          : 'hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${statusConfig[d.status].bgLight}`}>
                          🚑
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{d.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500 truncate">{d.ambulanceNumber}</p>
                            {d.isVerified && <span className="text-xs font-semibold text-green-400">✓</span>}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${statusConfig[d.status].color} flex-shrink-0`}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Last Update */}
            <div className="text-center p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Activity size={12} />
                Updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
