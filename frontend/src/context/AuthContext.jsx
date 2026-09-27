import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking persisted session

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('mb_token');
    const savedUser = localStorage.getItem('mb_user');
    if (token && savedUser) {
      try {
        // Optimistically restore user from cache
        setUser(JSON.parse(savedUser));
        // Re-validate token silently with server
        authApi.getMe()
          .then(({ data }) => {
            setUser(data.data);
            localStorage.setItem('mb_user', JSON.stringify(data.data));
          })
          .catch(() => {
            // Token is expired or invalid — clear session quietly
            localStorage.removeItem('mb_token');
            localStorage.removeItem('mb_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('mb_token');
        localStorage.removeItem('mb_user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (userData, token) => {
    localStorage.setItem('mb_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('mb_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    saveSession(data.data.user, data.data.token);
    toast.success('Welcome to MoodBoard! 🎉');
    return data;
  };

  const login = async (formData) => {
    const { data } = await authApi.login(formData);
    saveSession(data.data.user, data.data.token);
    // Single welcome toast — not duplicated with Login.jsx
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('mb_token');
    localStorage.removeItem('token');
    localStorage.removeItem('mb_user');
    setUser(null);
  }, []);

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('mb_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
