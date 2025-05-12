import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import logo from "../../assets/babcock-logo.png";
import easypassLogo from "../../assets/easypass-logo.png";
import api from '../../services/api';
import authService from '../../services/authService';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User from localStorage:', user);
      
      // Check if user is admin or superuser
      if (user && (user.is_staff === true || user.is_superuser === true || user.role === 'admin')) {
        console.log('Redirecting to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Redirecting to student dashboard');
        navigate('/dashboard');
      }
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.username || !formData.password) {
      setError('Please enter both student ID and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/login/', {
        username: formData.username,
        password: formData.password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        
        // Process user data
        const userData = response.data.user || {};
        
        // Check if role is provided in the response
        if (response.data.role === 'admin') {
          userData.is_staff = true;
        }
        
        // Convert string "true"/"false" to actual boolean if needed
        if (typeof userData.is_staff === 'string') {
          userData.is_staff = userData.is_staff.toLowerCase() === 'true';
        }
        
        if (typeof userData.is_superuser === 'string') {
          userData.is_superuser = userData.is_superuser.toLowerCase() === 'true';
        }
        
        // Store the user data with proper boolean values
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Stored user data:', userData);
        console.log('Is admin?', userData.is_staff === true || userData.is_superuser === true || response.data.role === 'admin');
        
        // Set remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        // Redirect based on user role with a slight delay to ensure storage is complete
        setTimeout(() => {
          if (userData.is_staff === true || userData.is_superuser === true || response.data.role === 'admin') {
            console.log('Redirecting admin to admin dashboard');
            navigate('/admin-dashboard');
          } else {
            console.log('Redirecting student to dashboard');
            navigate('/dashboard');
          }
        }, 300);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors[0]);
        } else if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Invalid credentials. Please try again.');
        }
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        background: 'linear-gradient(135deg, #0A2463 0%, #3E5C94 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `
            radial-gradient(circle at 20% 30%, white 0%, transparent 10%),
            radial-gradient(circle at 80% 70%, white 0%, transparent 10%),
            radial-gradient(circle at 40% 80%, white 0%, transparent 10%),
            radial-gradient(circle at 70% 20%, white 0%, transparent 10%)
          `,
          backgroundSize: '50px 50px',
          zIndex: 0
        }}
      />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Left Side - Branding (Hidden on Mobile) */}
        {!isMobile && (
          <Fade in={true} timeout={1000}>
            <Box 
              sx={{ 
                width: '50%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                pr: 8,
                textAlign: 'center'
              }}
            >
              <Box sx={{ mb: 4 }}>
                <img 
                  src={logo} 
                  alt="Babcock University Logo" 
                  style={{ 
                    height: '120px', 
                  width:"130px",
                    filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
                  }} 
                />
                <img 
                  src={easypassLogo} 
                  alt="EasyPass Logo" 
                  style={{ 
                    height: '120px',
                    filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
                  }} 
                />
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3,
                  textShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Welcome Back!
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '80%',
                  lineHeight: 1.6
                }}
              >
                Sign in to access your EasyPass account and manage your exam queue efficiently.
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  maxWidth: '80%'
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Key Features
                </Typography>
                <Box sx={{ textAlign: 'left', width: '100%' }}>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    ✓ Real-time queue management
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    ✓ Digital check-in with QR codes
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    ✓ Exam schedule notifications
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    ✓ Seamless exam day experience
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        )}
        
        {/* Right Side - Login Form */}
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={24} 
            sx={{ 
              width: isMobile ? '100%' : '50%',
              maxWidth: isMobile ? '450px' : '500px',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Decorative Top Bar */}
            <Box 
              sx={{ 
                height: '8px', 
                background: 'linear-gradient(90deg, #0A2463, #3E5C94)'
              }}
            />
            
            {/* Form Content */}
            <Box sx={{ p: isMobile ? 3 : 5 }}>
              {/* Mobile Logo */}
              {isMobile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <img 
                    src={logo} 
                    alt="Babcock University Logo" 
                    style={{ height: '60px', marginRight: '15px' }} 
                  />
                  <img 
                    src={easypassLogo} 
                    alt="EasyPass Logo" 
                    style={{ height: '70px' }} 
                  />
                </Box>
              )}
              
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                color="primary" 
                sx={{ mb: 1, color: '#0A2463' }}
              >
                Sign In
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Enter your student ID and password to continue
              </Typography>
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    '& .MuiAlert-icon': { alignItems: 'center' }
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Student ID"
                  name="username"
                  variant="outlined"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#0A2463',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: '#0A2463' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#0A2463',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#0A2463' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        size="small"
                        sx={{ 
                          color: '#0A2463',
                          '&.Mui-checked': {
                            color: '#0A2463',
                          },
                        }}
                      />
                    }
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      color: '#0A2463',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <LoginIcon />}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    bgcolor: '#0A2463',
                    boxShadow: '0 4px 10px rgba(10, 36, 99, 0.3)',
                    '&:hover': {
                      bgcolor: '#0A2463',
                      boxShadow: '0 6px 15px rgba(10, 36, 99, 0.4)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                      <Typography component="span" variant="body1" sx={{ color: '#0A2463', fontWeight: 'bold' }}>
                        Create Account
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Footer */}
            <Box 
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.02)', 
                p: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Babcock University. All rights reserved.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;