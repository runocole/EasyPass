import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import babcockLogo from "../assets/babcock-logo.png";
import easypassLogo from "../assets/easypass-logo.png";


const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Gradient background with animated particles
  const backgroundStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #05103a 0%, #0d1b45 50%, #162958 100%)',
    position: 'relative',
    overflow: 'hidden',
  };


 // Navigate to login page, not dashboard
const handleGetStarted = () => {
  // First clear any existing authentication
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Then navigate to login page
  navigate('/login');
};

  return (
    <Box sx={backgroundStyle}>
      {/* Animated background particles */}
      <Box
        className="particles"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 20 }).map((_, index) => (
          <Box
            key={index}
            className="particle"
            sx={{
              position: 'absolute',
              width: theme.spacing(Math.random() * 3 + 1),
              height: theme.spacing(Math.random() * 3 + 1),
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: 'float 15s infinite ease-in-out',
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </Box>

      {/* Header with logos */}
<Container maxWidth="lg">
  <Box
    sx={{
      py: 3,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* If logo doesn't load, show text instead */}
      {babcockLogo ? (
        <img
          src={babcockLogo}
          alt="Babcock University Logo"
          style={{
            
            // filter: 'brightness(0) invert(1)',
          }}
          onError={(e) => {
            console.error("Logo failed to load");
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: '#ffffff'
          }}
        >
          BABCOCK UNIVERSITY
        </Typography>
      )}
    </Box>
  </Box>
  

        {/* Main content */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h2"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 500, 
                    mb: 2,
                    fontSize: { xs: '2.2rem', md: '3rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px', 
                  }}
                >
                  Welcome to EasyPass
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 400, 
                    mb: 4,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                    lineHeight: 1.5,
                    maxWidth: '90%',
                  }}
                >
                  Streamline your exam attendance with our digital queue management system
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem', 
                    textTransform: 'none',
                    fontWeight: 500, 
                    background: 'linear-gradient(90deg, #3e92cc 0%, #2e77a4 100%)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #3e92cc 30%, #2e77a4 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started
                </Button>
              </Box>

              {/* Feature Points */}
              <Grid container spacing={2} sx={{ mt: 4 }}>
                {[
                  'Digital queue management',
                  'Real-time position updates',
                  'QR code check-in system',
                  'Reduced waiting times',
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#3e92cc',
                          mr: 2,
                        }}
                      />
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontWeight: 400, 
                          fontSize: '0.95rem',
                        }}
                      >
                        {feature}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    width: '100%',
                    maxWidth: 500,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Logo circle highlight */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(62,146,204,0.15) 0%, transparent 70%)',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 0,
                    }}
                  />

                  <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={easypassLogo}
                      alt="EasyPass Logo"
                      sx={{
                        height: { xs: 150, md: 200 },
                        mb: 3,
                        animation: 'pulse 3s infinite ease-in-out',
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 400, 
                        mb: 2,
                        fontSize: '1.1rem', 
                      }}
                    >
                      Babcock University's Official
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 500,
                        background: 'linear-gradient(90deg, #ffffff 0%, #d0d0d0 100%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Queue Management System
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 4,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 400, // Less bold
              fontSize: '0.85rem', // Smaller
            }}
          >
            © {new Date().getFullYear()} Babcock University - EasyPass System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;