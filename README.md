# 🚑 MedGo – Smart Ambulance Service System for Nepal

A full-stack MERN application that digitizes Nepal's ambulance services with real-time GPS tracking, multi-role authentication, and live booking management.

---

## 🏗️ Architecture

```
Three-Tier Architecture
├── Frontend (React + Vite)     → Port 5173
├── Backend API (Node + Express) → Port 5000
└── Database (MongoDB)           → Port 27017
```

## 📁 Folder Structure

```
medgo/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── bookingController.js  # Booking CRUD
│   │   ├── driverController.js   # Driver operations
│   │   └── adminController.js    # Admin operations
│   ├── middleware/
│   │   └── auth.js               # JWT protect, role guards
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Driver.js             # Driver schema (2dsphere indexed)
│   │   └── Booking.js            # Booking schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── driver.js
│   │   └── admin.js
│   ├── server.js                 # Express + Socket.io server
│   ├── .env                      # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Sidebar.jsx
│   │   │       ├── DashboardLayout.jsx
│   │   │       ├── ProtectedRoute.jsx
│   │   │       └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state + socket init
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── BookAmbulancePage.jsx
│   │   │   ├── LiveTrackingPage.jsx
│   │   │   ├── BookingHistoryPage.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── AdminDriversPage.jsx
│   │   │   ├── AdminBookingsPage.jsx
│   │   │   └── AdminLivePage.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios API calls
│   │   │   └── socket.js         # Socket.io client
│   │   ├── App.jsx               # Routes
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and install

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medgo
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run development servers

```bash
# Run backend
npm run dev:backend

# Run frontend (new terminal)
npm run dev:frontend
```

Or run both simultaneously:
```bash
npm install -g concurrently
npm run dev
```

### 4. Seed admin user

Connect to MongoDB and create admin manually or add a seed script. Quick way via Mongo shell:

```js
// In MongoDB shell
use medgo
db.users.insertOne({
  name: "Admin",
  phone: "9800000000",
  email: "admin@medgo.np",
  password: "$2a$12$...",  // bcrypt hash of your password
  role: "admin",
  isActive: true,
  createdAt: new Date()
})
```

Or register a user at `/register` and manually set `role: "admin"` in MongoDB.

---

## 📡 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user/admin |
| POST | `/api/auth/driver/register` | Public | Register driver |
| POST | `/api/auth/driver/login` | Public | Login driver |
| GET | `/api/auth/me` | Protected | Get current user |

### Bookings (User)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/user` | User | Get my bookings |
| GET | `/api/bookings/:id` | Protected | Get single booking |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |

### Driver
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/driver/requests` | Driver | Get pending requests |
| GET | `/api/driver/bookings` | Driver | Get my rides |
| POST | `/api/driver/accept` | Driver | Accept booking |
| POST | `/api/driver/reject` | Driver | Reject booking |
| POST | `/api/driver/status` | Driver | Update ride status |
| POST | `/api/driver/location` | Driver | Update GPS location |
| PUT | `/api/driver/toggle-status` | Driver | Toggle online/offline |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/toggle` | Admin | Toggle user status |
| GET | `/api/admin/drivers` | Admin | List all drivers |
| PUT | `/api/admin/drivers/:id/verify` | Admin | Verify driver |
| PUT | `/api/admin/drivers/:id/toggle` | Admin | Toggle driver status |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/analytics` | Admin | System analytics |
| GET | `/api/admin/live-locations` | Admin | Live driver GPS |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ userId, role }` | Join room |
| `driver_location_update` | `{ driverId, lat, lng, bookingId }` | Send GPS |
| `driver_status_change` | `{ driverId, status }` | Status update |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_booking` | `{ booking }` | New request |
| `booking_accepted` | `{ booking }` | Driver accepted |
| `booking_cancelled` | `{ bookingId }` | Booking cancelled |
| `driver_location` | `{ driverId, lat, lng }` | GPS update |
| `status_updated` | `{ booking }` | Ride status change |
| `driver_status` | `{ driverId, status }` | Driver online/offline |

---

## 👤 User Roles

| Role | Default Route | Capabilities |
|------|-------------|--------------|
| `user` | `/dashboard` | Book ambulance, track, view history |
| `driver` | `/driver` | Accept/reject requests, update status, GPS |
| `admin` | `/admin` | Full system management |

---

## 🗺️ Map Features (Leaflet.js)

- **User pickup** — Green marker
- **Destination** — Blue marker  
- **Ambulance** — Red 🚑 marker (updates in real-time via Socket.io)
- **Route polyline** — Dashed red line pickup→ambulance, solid blue pickup→destination
- **Fly-to animation** — Map flies to ambulance position on GPS updates

---

## 🛡️ Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- Role-based middleware on all protected routes
- CORS configured for specific origin
- Request validation in controllers

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Maps | Leaflet.js + React Leaflet |
| Real-time | Socket.io (client + server) |
| HTTP | Axios with JWT interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Dev tools | nodemon, dotenv, cors |

---

## 📞 Emergency Numbers (Nepal)

- Ambulance: **102**
- Police: **100**  
- Fire: **101**

---

Built with ❤️ for Nepal's emergency healthcare infrastructure.
