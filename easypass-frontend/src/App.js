import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import your components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Landing from './components/Landing';
import Dashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0A2463',
      light: '#3E5C94',
      dark: '#071A46',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
  },
});

// Logout component to handle logout
function Logout() {
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);
  
  return null;
}

// Protected route component
function ProtectedRoute({ element, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (adminOnly) {
    try {
      const user = userStr ? JSON.parse(userStr) : {};
      console.log('User in protected route:', user);
      
      // Check if user is admin or staff
      const isAdmin = user.is_staff === true || user.is_superuser === true || user.role === 'admin';
      
      if (!isAdmin) {
        console.log('Non-admin trying to access admin route, redirecting to dashboard');
        return <Navigate to="/dashboard" />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" />;
    }
  }
  
  return element;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} adminOnly={true} />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;