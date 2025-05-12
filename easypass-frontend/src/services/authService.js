import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Login user
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      username,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup/`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Check if user is admin
const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && (user.is_staff === true || user.is_superuser === true);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Set auth header for axios
const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  isAdmin,
  setAuthHeader
};

export default authService;