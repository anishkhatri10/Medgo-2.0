require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
// addd some code

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'MedGo API is running', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User/Driver joins room
  socket.on('join', ({ userId, role }) => {
    socket.join(role);
    socket.join(userId);
    connectedUsers.set(socket.id, { userId, role });
    console.log(`👤 ${role} ${userId} joined`);
  });

  // Driver sends live location
  socket.on('driver_location_update', ({ driverId, lat, lng, bookingId }) => {
    // Broadcast to all users tracking this booking
    io.emit('driver_location', { driverId, lat, lng, bookingId });
  });

  // Driver status change
  socket.on('driver_status_change', ({ driverId, status }) => {
    io.emit('driver_status', { driverId, status });
  });

  // Booking events
  socket.on('new_booking_request', (data) => {
    io.to('driver').emit('new_booking', data);
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`🔴 ${user.role} ${user.userId} disconnected`);
      connectedUsers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MedGo Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});