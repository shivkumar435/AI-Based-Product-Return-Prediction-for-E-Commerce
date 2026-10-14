import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token, user]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    // Backend returns { _id, name, email, role, token } at top level
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    return data;
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, register, logout, updateUser
    }}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};