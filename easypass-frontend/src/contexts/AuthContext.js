import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create the context with a default value
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateProfile: () => {}
});

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Token ${token}`;
          const response = await api.get('/users/me/');
          setUser(response.data);
        } catch (err) {
          console.error("Error checking authentication:", err);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login/', { username, password });
      
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      
      const userResponse = await api.get('/users/me/');
      setUser(userResponse.data);
      
      return userResponse.data;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.non_field_errors?.[0] || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('queueStatus');
      localStorage.removeItem('queuePosition');
      localStorage.removeItem('peopleAhead');
      localStorage.removeItem('currentTag');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};