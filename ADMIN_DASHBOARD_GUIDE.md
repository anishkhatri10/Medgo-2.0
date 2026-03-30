# 🗺️ MedGo Admin Dashboard - Complete Guide

## Overview
The Admin Dashboard for MedGo provides real-time monitoring and management of ambulance drivers across Nepal. It includes live GPS tracking, trip management, driver analytics, and comprehensive administrative controls.

---

## 📋 Admin Dashboard Components

### 1. **Live Ambulance Tracking** (`/admin/live`)
**Real-time GPS tracking of all active ambulance drivers**

#### Features:
- ✅ **Interactive Map** - Leaflet.js based live map
- ✅ **Driver Markers** - Color-coded indicators (Green: Available, Red: On Trip, Gray: Offline)
- ✅ **Trip Route Visualization** - Shows pickup → driver → destination route
- ✅ **Auto-refresh** - Updates every 15 seconds via WebSocket
- ✅ **Driver Selection** - Click any driver to view detailed information
- ✅ **Real-time Status Updates** - Instant driver status changes

#### Stats Dashboard:
- Total Drivers
- Available Drivers
- Drivers On Trip
- Offline Drivers
- Verified Drivers

#### Selected Driver Panel:
Shows comprehensive driver information:
- **Basic Info**: Name, vehicle number, vehicle type
- **Status**: Current status with visual indicator
- **Contact**: Phone number (clickable for calls)
- **Performance**: Rating and total rides
- **Current Trip**: (If active)
  - Emergency type
  - Pickup location
  - Destination location
  - Distance and estimated time
  - Current fare
  - Trip status

#### Driver List with Filtering:
- Search by name or ambulance number
- Filter by status: All, Available, On Trip, Offline
- Shows: Name, ambulance number, verification status, online indicator

---

### 2. **Driver Management** (`/admin/drivers`)
**Manage, verify, and control ambulance drivers**

#### Features:
- ✅ **Driver Verification** - Approve or reject pending drivers
- ✅ **Status Control** - Activate/deactivate drivers
- ✅ **Document Verification** - License and registration verification
- ✅ **Performance Metrics** - Rating, total rides, vehicle type
- ✅ **Bulk Actions** - Managing all drivers at once

#### Driver Status Indicators:
- 🟢 **Available** - Ready to accept rides
- 🔴 **On Duty** - Currently on a trip
- ⚫ **Offline** - Not currently available
- 🟡 **Pending** - Waiting for admin verification

#### Vehicle Types:
- 🏥 **Basic Ambulance** - Standard transport
- ⚡ **Advanced Life Support (ALS)** - Advanced equipment
- 🏥 **Mobile ICU** - Full ICU equipped

---

### 3. **Users Management** (`/admin/users`)
**Manage patient and user accounts**

#### Features:
- ✅ **User Listing** - View all registered users
- ✅ **Status Toggle** - Activate/deactivate users
- ✅ **User Info** - Name, email, phone, registration date
- ✅ **Search & Filter** - Quick user lookup

---

### 4. **Bookings Management** (`/admin/bookings`)
**Monitor all ambulance bookings and trips**

#### Features:
- ✅ **Booking List** - View all system bookings
- ✅ **Status Tracking** - Monitor booking lifecycle
- ✅ **User & Driver Info** - Linked user and driver details
- ✅ **Trip Details** - Distance, fare, emergency type
- ✅ **Date Filtering** - Sort by booking date

---

### 5. **Dashboard Analytics** (`/admin`)
**System-wide analytics and monitoring**

#### Key Metrics:
- **Ambulance Statistics**: Total ambulances, available, on duty
- **Driver Performance**: Verified drivers, pending verification
- **Booking Analytics**: Total bookings, completed, pending, cancelled
- **System Health**: Active bookings, average response time
- **7-Day Trends**: Recent booking activity graph

---

## 🔄 Real-time Updates via WebSocket

### Events Monitored:
```javascript
// Driver location updates
socket.on('driver_location', ({ driverId, lat, lng }) => {...})

// Driver status changes
socket.on('driver_status', ({ driverId, status }) => {...})

// New bookings
socket.on('booking_accepted', ({ booking }) => {...})

// Booking status updates
socket.on('status_updated', ({ booking }) => {...})
```

---

## 🗺️ Map Interface Details

### Map Interactions:
- **Click Driver Marker**: Select driver and view details
- **Hover Popup**: Quick info on driver (name, status, location)
- **Trip Route**: Red dashed line showing pickup → destination
- **Pickup Marker**: Blue indicator at pickup location
- **Destination Marker**: Green indicator at destination

### Color Coding:
- 🟢 **Green** - Driver available for rides
- 🔴 **Red** - Driver on active trip
- ⚫ **Gray** - Driver offline
- 🟡 **Gold** - Selected driver (highlighted)

---

## 📊 Emergency Types & Multipliers

| Emergency Type | Icon | Color | Multiplier |
|---|---|---|---|
| General | 🏥 | Blue | 1.0x |
| Cardiac | ❤️ | Red | 1.5x |
| Trauma | 🚗 | Orange | 1.4x |
| Maternity | 👶 | Pink | 1.3x |
| Critical | 🚨 | Purple | 2.0x |

---

## 🔐 Authentication & Access Control

### Admin Account Setup:
```bash
cd backend
npm run create-admin
```

### Default Credentials:
- **Email**: admin@medgo.np
- **Password**: admin123456

### Login:
1. Go to `/login`
2. Select "⚙️ Admin" role
3. Enter credentials
4. Redirects to `/admin` dashboard

---

## 📡 Backend API Endpoints

### Live Tracking:
```
GET /api/admin/live-locations
Returns: Array of active drivers with location
```

```
GET /api/admin/drivers/:driverId/trip
Returns: Driver info + current active booking
```

### Driver Management:
```
GET /api/admin/drivers
PUT /api/admin/drivers/:id/verify
PUT /api/admin/drivers/:id/reject
PUT /api/admin/drivers/:id/toggle (activate/deactivate)
DELETE /api/admin/drivers/:id
```

### Analytics:
```
GET /api/admin/analytics
Returns: System-wide statistics
```

---

## 🎯 Common Admin Tasks

### Task 1: Monitor Active Trips
1. Go to `/admin/live`
2. View the map - red markers = drivers on trips
3. Click a driver to see trip details

### Task 2: Verify New Drivers
1. Go to `/admin/drivers`
2. Filter by "⏳ Pending Approval"
3. Click "Approve Driver" button
4. Driver can now go online

### Task 3: Check System Health
1. Go to `/admin` (Dashboard)
2. Monitor key metrics
3. View 7-day booking trends

### Task 4: Manage User Accounts
1. Go to `/admin/users`
2. Search for specific user
3. Toggle active/inactive status

### Task 5: View All Bookings
1. Go to `/admin/bookings`
2. Filter by date
3. Check driver and user details

---

## ⚙️ Configuration

### Update Default Map Center:
Edit `AdminLivePage.jsx`:
```javascript
const mapCenter = [27.7172, 85.3240]; // Kathmandu coordinates
```

### Change Auto-refresh Interval:
```javascript
const interval = setInterval(fetchLocations, 15000); // milliseconds
```

### Modify Vehicle Types:
In `Driver.js` model:
```javascript
vehicleType: { 
  type: String, 
  enum: ['basic', 'advanced', 'icu'],
  default: 'basic' 
}
```

---

## 🐛 Troubleshooting

### Map Not Loading?
- Clear browser cache
- Check WebSocket connection
- Verify `getLiveLocations` API returns data

### Real-time Updates Not Working?
- Ensure Socket.io server is running
- Check console for WebSocket errors
- Verify driver has active location tracking

### Driver Not Showing on Map?
- Driver must have `isActive: true`
- Check if location coordinates are valid
- Driver status must not be 'offline'

### Admin Panel Won't Load?
- Verify JWT token is valid
- Check user role is 'admin'
- Clear localStorage and re-login

---

## 📱 Responsive Design

The admin dashboard is fully responsive:
- **Desktop**: 3-column layout (Map + Driver List + Details)
- **Tablet**: 2-column layout
- **Mobile**: Stacked layout with collapsible sections

---

## 🔒 Security Features

1. **JWT Authentication** - All admin endpoints protected
2. **Role-Based Access** - Only admin role can access
3. **Protected Routes** - ProtectedRoute component validates access
4. **API Rate Limiting** - Prevents abuse of endpoints
5. **Data Validation** - Input validation on all forms

---

## 📈 Performance Optimization

- **WebSocket Updates**: Real-time without page refresh
- **Map Clustering**: Efficient rendering of many markers
- **Lazy Loading**: Components load on demand
- **Optimized Queries**: Backend queries hit indexes
- **Caching**: Recent data cached locally

---

## 🎨 UI/UX Features

- Dark theme for 24/7 monitoring
- Color-coded status indicators
- Intuitive search and filters
- Real-time status badges
- Interactive map markers
- Responsive statistics dashboard

---

## 📞 Support

For issues or questions:
- Check error messages in browser console
- Review backend logs
- Verify MongoDB connection
- Check WebSocket server status

---

**Last Updated**: March 30, 2026
**MedGo Version**: 2.0
**Built with**: React, Leaflet.js, Express.js, MongoDB, Socket.io
