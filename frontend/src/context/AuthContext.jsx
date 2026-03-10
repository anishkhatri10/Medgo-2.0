import { createContext, useContext, useState, useEffect } from 'react';
import { initSocket, joinRoom, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('medgo_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      const socket = initSocket();
      joinRoom(parsed._id, parsed.role);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('medgo_user', JSON.stringify(userData));
    setUser(userData);
    const socket = initSocket();
    joinRoom(userData._id, userData.role);
  };

  const logout = () => {
    localStorage.removeItem('medgo_user');
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};