import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });
    socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
    socket.on('connect_error', (err) => console.error('Socket error:', err));
  }
  return socket;
};

export const getSocket = () => socket;

export const joinRoom = (userId, role) => {
  if (socket) socket.emit('join', { userId, role });
};

export const emitDriverLocation = (driverId, lat, lng, bookingId) => {
  if (socket) socket.emit('driver_location_update', { driverId, lat, lng, bookingId });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, joinRoom, emitDriverLocation, disconnectSocket };
