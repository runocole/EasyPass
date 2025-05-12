import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Grid, Paper, Card, CardContent,
  Chip, Avatar, Divider, List, ListItem, ListItemText, ListItemIcon,
  CircularProgress, Tabs, Tab, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, useMediaQuery, useTheme,
  alpha
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Event as EventIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  QrCode as QrCodeIcon,
  ExitToApp,
  Dashboard as DashboardIcon,
  ViewList as QueueIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import ClassIcon from '@mui/icons-material/Class';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { QRCodeSVG } from 'qrcode.react';
import babcockLogo  from "../../assets/babcock-logo.png";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State variables
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [joiningQueue, setJoiningQueue] = useState(false);
  const [leavingQueue, setLeavingQueue] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [currentTag, setCurrentTag] = useState(null);
  
  // Fetch user data
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Load saved queue status from localStorage using user-specific key
    const storageKey = `queueStatus_${currentUser.id}`;
    const savedQueueStatus = localStorage.getItem(storageKey);
    if (savedQueueStatus) {
      try {
        const parsedStatus = JSON.parse(savedQueueStatus);
        setQueueStatus(parsedStatus);
        
        // Also restore other queue-related state
        setQueuePosition(localStorage.getItem(`queuePosition_${currentUser.id}`) ? 
          parseInt(localStorage.getItem(`queuePosition_${currentUser.id}`)) : null);
        setCurrentTag(localStorage.getItem(`currentTag_${currentUser.id}`) || null);
        
        // If in queue, set active tab to queue status
        setActiveTab(1);
      } catch (e) {
        console.error("Error parsing saved queue status:", e);
        localStorage.removeItem(storageKey);
      }
    }
    
    fetchData();
  }, [navigate]);
  
  // Calculate estimated wait time whenever peopleAhead changes
  useEffect(() => {
    if (queueStatus && selectedExam) {
      const HALL_CAPACITY = 250;
    
      if (queuePosition <= HALL_CAPACITY) {
        // For positions 1-250, show spaces left in current batch
        const spacesLeft = HALL_CAPACITY - queuePosition;
        setPeopleAhead(spacesLeft);
        
        // If exam hasn't started, wait time is until exam starts
        const examStartTime = new Date(`${selectedExam.exam_date}T${selectedExam.start_time}`);
        const currentTime = new Date();
        const hoursUntilExam = Math.max(0, (examStartTime - currentTime) / (1000 * 60 * 60));
        setEstimatedWaitTime(hoursUntilExam);
        
      } else {
        // For positions > 250, calculate people ahead
        const peopleAheadCount = queuePosition - HALL_CAPACITY;
        setPeopleAhead(peopleAheadCount);
        
        // Calculate wait time based on first check-in
        if (queueStatus.first_check_in_time) {
          const firstCheckInTime = new Date(queueStatus.first_check_in_time);
          const currentTime = new Date();
          const hoursElapsed = (currentTime - firstCheckInTime) / (1000 * 60 * 60);
          
          // Each person takes 1 hour, so wait time is (people ahead * 1 hour) - time elapsed
          const totalWaitHours = peopleAheadCount;
          const remainingWaitHours = Math.max(0, totalWaitHours - hoursElapsed);
          setEstimatedWaitTime(remainingWaitHours);
        } else {
          // If no one has checked in yet, wait time is based on exam start
          const examStartTime = new Date(`${selectedExam.exam_date}T${selectedExam.start_time}`);
          const currentTime = new Date();
          const hoursUntilExam = Math.max(0, (examStartTime - currentTime) / (1000 * 60 * 60));
          setEstimatedWaitTime(hoursUntilExam + peopleAheadCount);
        }
      }
    } else {
      setPeopleAhead(null);
      setEstimatedWaitTime(null);
    }
  }, [queuePosition, selectedExam, queueStatus]);

  // Auto-refresh queue status every 30 seconds if in queue
  useEffect(() => {
    if (queueStatus) {
      const intervalId = setInterval(() => {
        fetchQueueStatus();
      }, 30000); // 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [queueStatus]);

  // Add this useEffect to periodically verify queue status
useEffect(() => {
  if (queueStatus) {
    const verifyInterval = setInterval(async () => {
      try {
        const response = await api.get(`/queues/verify-status/?queue_id=${queueStatus.id}`);
        if (!response.data.valid) {
          console.log('Queue status is no longer valid, clearing...');
          clearQueueStatus();
          setSnackbar({
            open: true,
            message: 'Your queue status was invalid and has been cleared.',
            severity: 'warning'
          });
          setActiveTab(0);
        }
      } catch (err) {
        console.error('Error verifying queue status:', err);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(verifyInterval);
  }
}, [queueStatus]);
  
  // Fetch exams and queue status
  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchExams();
      await fetchQueueStatus();
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available exams
  const fetchExams = async () => {
    try {
      const response = await api.get('/exams/');
      
      // Filter active exams and sort by date
      const activeExams = response.data
        .filter(exam => exam.is_active)
        .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
      
      setExams(activeExams);
      
      // If no exam is selected and there are exams available, select the first one
      if (activeExams.length > 0 && !selectedExam) {
        setSelectedExam(activeExams[0]);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to load exams. Please try again.");
    }
  };
  
  // Fetch queue status for the current user
 // Fetch queue status for the current user
const fetchQueueStatus = async () => {
  try {
    if (!user) return;
    
    const queueResponse = await api.get(`/queues/status/?student=${user.id}`);
    
    if (queueResponse.data && queueResponse.data.id) {
      // User is in queue
      const queueData = queueResponse.data;
      console.log('Queue Data:', queueData);
      
      // Find the exam details
      const examDetails = exams.find(e => e.id === queueData.exam);
      if (examDetails) {
        setSelectedExam(examDetails);
        
        // Get capacity information for this exam
        try {
          const capacityResponse = await api.get(`/exam-capacity/${examDetails.id}/`);
          const capacityData = capacityResponse.data;
          
          // Calculate people ahead based on position and hall capacity
          const HALL_CAPACITY = capacityData.hall_capacity || 250;
          
          if (queueData.position <= HALL_CAPACITY) {
            // For positions within current batch, show available seats
            setPeopleAhead(capacityData.available_seats);
          } else {
            // For positions beyond current batch, calculate people ahead
            setPeopleAhead(queueData.position - HALL_CAPACITY);
          }
        } catch (capacityErr) {
          console.error("Error fetching capacity data:", capacityErr);
          
          // Fallback to client-side calculation
          const HALL_CAPACITY = 250;
          if (queueData.position <= HALL_CAPACITY) {
            setPeopleAhead(HALL_CAPACITY - queueData.position);
          } else {
            setPeopleAhead(queueData.position - HALL_CAPACITY);
          }
        }
      }
    
      setQueueStatus(queueData);
      setQueuePosition(queueData.position || queueData.tag_number);
      setCurrentTag(queueData.tag_number);
      
      // Store in localStorage with user ID
      const storageKey = `queueStatus_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(queueData));
      localStorage.setItem(`queuePosition_${user.id}`, queueData.position || queueData.tag_number);
      localStorage.setItem(`currentTag_${user.id}`, queueData.tag_number);
      
      // If in queue, switch to queue status tab
      if (activeTab === 0) {
        setActiveTab(1);
      }
    } else {
      // Clear queue status if not in queue
      clearQueueStatus();
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Not in queue - clear status
      clearQueueStatus();
    } else {
      console.error("Error fetching queue status:", err);
    }
  }
};
  
  const clearQueueStatus = () => {
    setQueueStatus(null);
    setQueuePosition(null);
    setPeopleAhead(0);
    setCurrentTag(null);
    
    // Clear user-specific localStorage items
    const userId = user?.id;
    if (userId) {
      localStorage.removeItem(`queueStatus_${userId}`);
      localStorage.removeItem(`queuePosition_${userId}`);
      localStorage.removeItem(`currentTag_${userId}`);
    }
  };
    
  // Join the queue for the selected exam
  const handleJoinQueue = async () => {
    if (!selectedExam) {
      setSnackbar({
        open: true,
        message: 'Please select an exam first',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setJoiningQueue(true);
      console.log('Attempting to join queue for exam:', selectedExam.id);
      
      // First, check if student is already in any queue
      const checkResponse = await api.get(`/queues/check-status/?student=${user.id}`);
      console.log('Check response:', checkResponse.data);
      
      if (checkResponse.data.in_queue) {
        // If they're in a queue but it's stale, offer to clear it
        const clearResponse = await api.post('/queues/clear-status/', {
          student_id: user.id,
          exam_id: selectedExam.id,
          force: true
        });
        console.log('Clear response:', clearResponse.data);
      }
      
      // Now try to join the queue
      const response = await api.post('/queues/', {
        exam: selectedExam.id,
        student: user.id
      });
      
      console.log('Join queue response:', response.data);
      
      // Update queue status immediately after joining
      await fetchQueueStatus();
      
      setSnackbar({
        open: true,
        message: `Successfully joined the queue for ${selectedExam.course_code}`,
        severity: 'success'
      });
      
      // Switch to queue status tab
      setActiveTab(1);
    } catch (err) {
      console.error("Error joining queue:", err);
      console.error("Error details:", err.response?.data);
      
      let errorMessage = 'Failed to join queue. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // If the error indicates they're already in queue, offer to reset
        if (errorMessage.includes('already in queue')) {
          setSnackbar({
            open: true,
            message: "Detected a stuck queue status. Attempting to clear...",
            severity: 'warning'
          });
          
          try {
            await api.post('/queues/clear-status/', {
              student_id: user.id,
              exam_id: selectedExam.id,
              force: true
            });
            
            // Wait a moment and try joining again
            setTimeout(() => handleJoinQueue(), 1000);
            return;
          } catch (clearErr) {
            console.error("Error clearing queue status:", clearErr);
            errorMessage = "Could not clear existing queue status. Please contact support.";
          }
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setJoiningQueue(false);
    }
  };
  
  // Leave the queue
  const handleLeaveQueue = async () => {
    if (!queueStatus) {
      setSnackbar({
        open: true,
        message: 'You are not in any queue',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLeavingQueue(true);
      console.log('Attempting to leave queue with ID:', queueStatus.id);
      
      // First, try to remove from the queue
      await api.delete(`/queues/${queueStatus.id}/`);
      
      // Then, explicitly clear the student's queue status
      try {
        await api.post('/queues/clear-status/', {
          student_id: user.id,
          exam_id: selectedExam?.id
        });
      } catch (clearErr) {
        console.error('Error clearing queue status:', clearErr);
      }
      
      // Clear all local storage data related to queues
      localStorage.removeItem(`queueStatus_${user.id}`);
      localStorage.removeItem(`queuePosition_${user.id}`);
      localStorage.removeItem(`currentTag_${user.id}`);
      Object.keys(localStorage).forEach(key => {
        if (key.includes('queue') || key.includes('Queue')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset all queue-related state
      setQueueStatus(null);
      setQueuePosition(null);
      setPeopleAhead(0);
      setCurrentTag(null);
      setSelectedExam(null);
      
      // Force refresh the exams list
      await fetchExams();
      
      setSnackbar({
        open: true,
        message: 'Successfully left the queue',
        severity: 'success'
      });
      
      // Switch back to dashboard tab
      setActiveTab(0);
    } catch (err) {
      console.error("Error leaving queue:", err);
      console.error("Error details:", err.response?.data);
      
      // If we get a 404, the queue entry doesn't exist anymore
      if (err.response?.status === 404) {
        clearQueueStatus();
        setSnackbar({
          open: true,
          message: 'Queue entry not found. Your status has been cleared.',
          severity: 'info'
        });
        setActiveTab(0);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to leave queue. Please try again.',
          severity: 'error'
        });
      }
    } finally {
      setLeavingQueue(false);
    }
  };
  
  // Generate QR code for check-in
  const generateQRCode = () => {
    if (!queueStatus) {
      setSnackbar({
        open: true,
        message: 'You are not in any queue',
        severity: 'warning'
      });
      return;
    }
    
    const qrData = JSON.stringify({
      studentName: `${user.first_name || ''} ${user.last_name || ''}`,
      exam: selectedExam?.course_code,
      matricNumber: user?.username || '',
      position: queuePosition,
    });
    
    setQrCodeData(qrData);
    setQrDialogOpen(true);
    
    // Switch to QR code tab
    setActiveTab(2);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle closing snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  // Format time in hours and minutes
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min${mins > 1 ? 's' : ''}` : ''}`;
    }
    
    return `${mins} min${mins > 1 ? 's' : ''}`;
  };
  
  // QR Code Dialog component
  const QRCodeDialog = () => (
    <Dialog 
      open={qrDialogOpen} 
      onClose={() => setQrDialogOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
  bgcolor: '#05103a', 
  color: '#ffffff',
  pb: 2
}}>
  Your Queue QR Code
  <IconButton
    aria-label="close"
    onClick={() => setQrDialogOpen(false)}
    sx={{ position: 'absolute', right: 8, top: 8, color: '#ffffff' }}
  >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        {qrCodeData && (
          <>
            <Box sx={{ 
              mb: 3,
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              display: 'inline-block',
              bgcolor: '#ffffff'
            }}>
              <QRCodeSVG 
                value={qrCodeData} 
                size={250}
                level="H"
                includeMargin={true}
              />
            </Box>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Typography variant="body1" gutterBottom>
                  Tag Number: <Chip label={currentTag} color="primary" sx={{ ml: 1, fontWeight: 'bold' }} />
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1" gutterBottom>
                  Position: <Chip label={queuePosition} color="secondary" sx={{ ml: 1, fontWeight: 'bold' }} />
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, bgcolor: alpha('#0A2463', 0.05), p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Show this QR code to the exam administrator when it's your turn.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          startIcon={<DownloadIcon />}
          onClick={() => {
            // Create a temporary link to download the QR code
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const url = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = url;
              link.download = `queue-qr-${currentTag}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          variant="outlined"
          sx={{ borderRadius: 2, mr: 1 }}
        >
          Download QR Code
        </Button>
        <Button 
          onClick={() => setQrDialogOpen(false)}
          variant="contained"
          sx={{ borderRadius: 2, bgcolor: '#0A2463' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render welcome dashboard
  const renderWelcomeDashboard = () => (
    <Grid container spacing={3}>
      {/* Welcome Card */}
      <Grid item xs={12}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #05103a 0%, #0A2463 50%, #1e3a8a 100%)',
            color: '#ffffff',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '-50%', 
              right: '-10%', 
              width: '300px', 
              height: '300px', 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, rgba(62,146,204,0.3) 0%, transparent 70%)',
              zIndex: 0
            }} 
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome back, {user?.first_name || 'Student'}!
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '600px', opacity: 0.9, mb: 3 }}>
              Select an upcoming exam to join the queue or check your current queue status.
              Your digital journey to a seamless exam experience starts here.
            </Typography>
            {queueStatus ? (
             <Button
             variant="contained"
             color="primary"
             size="large"
             onClick={() => setActiveTab(1)}
             endIcon={<NavigateNextIcon />}
             sx={{ 
               bgcolor: '#ffffff', 
               color: '#05103a',
               borderRadius: 2,
               boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
               '&:hover': {
                 bgcolor: alpha('#ffffff', 0.9)
               }
             }}
           >
             View Your Queue Status
           </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => window.scrollTo({ top: document.getElementById('exams-section').offsetTop - 100, behavior: 'smooth' })}
                endIcon={<NavigateNextIcon />}
                sx={{ 
                  bgcolor: '#ffffff', 
                  color: '#05103a',
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9)
                  }
                }}
              >
                Browse Available Exams
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
      
      {/* Quick Stats */}
      {queueStatus && (
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 4,
            mb: 3,
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: alpha('#0A2463', 0.05), 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="overline" sx={{ color: '#0A2463', fontWeight: 'bold' }}>
                    Your Position
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={queuePosition} 
                      color="primary"
                      sx={{ 
                        mr: 1, 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        bgcolor: '#0A2463'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {queuePosition <= 250 ? "In the current batch" : "In line for the next batch"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: alpha('#0A2463', 0.05), 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="overline" sx={{ color: '#0A2463', fontWeight: 'bold' }}>
                    {queuePosition <= 250 ? 'Available Spaces' : 'People Ahead of You'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={peopleAhead} 
                      color="secondary"
                      sx={{ 
                        mr: 1, 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {queuePosition <= 250 ? 
                        `${peopleAhead} space${peopleAhead === 1 ? '' : 's'} remaining` : 
                        `${peopleAhead} person${peopleAhead === 1 ? '' : 's'} ahead of you`
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: alpha('#0A2463', 0.05), 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="overline" sx={{ color: '#0A2463', fontWeight: 'bold' }}>
                    Estimated Wait Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: '#1e3a8a' }} />
                    <Typography fontWeight="medium">
                      {formatTime(Math.round(estimatedWaitTime * 60))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
      
      {/* Upcoming Exams */}
      <Grid item xs={12} md={8} id="exams-section">
        <Paper sx={{ 
          p: 3, 
          borderRadius: 4, 
          height: '100%',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="#05103a">
            Upcoming Exams
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#0A2463' }} />
            </Box>
          ) : exams.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              bgcolor: alpha('#0A2463', 0.03),
              borderRadius: 2
            }}>
              <Typography variant="body1" color="text.secondary">
                No upcoming exams available
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {exams.map((exam) => (
                <Grid item xs={12} sm={6} key={exam.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 3,
                      borderColor: selectedExam?.id === exam.id ? '#0A2463' : 'divider',
                      boxShadow: selectedExam?.id === exam.id ? '0 0 0 2px #0A2463' : '0 4px 12px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transform: 'translateY(-3px)'
                      },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => setSelectedExam(exam)}
                  >
                    <Box sx={{ 
                      p: 0.5, 
                      bgcolor: selectedExam?.id === exam.id ? '#0A2463' : alpha('#0A2463', 0.1),
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }} />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom color="#0A2463" fontWeight="bold">
                        {exam.course_code}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" gutterBottom fontWeight="medium">
                        {exam.course_name}
                      </Typography>
                      
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1.5,
                          color: alpha('#0A2463', 0.7)
                        }}>
                          <EventIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(exam.exam_date).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1.5,
                          color: alpha('#0A2463', 0.7)
                        }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {exam.start_time}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: alpha('#0A2463', 0.7)
                        }}>
                          <RoomIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {exam.location || 'TBA'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    {selectedExam?.id === exam.id && (
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: alpha('#0A2463', 0.05), 
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2" color="#0A2463" fontWeight="medium">
                          ✓ Selected
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>
      
      {/* Join Queue */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 4, 
          height: '100%',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="#05103a">
            Join Queue
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {selectedExam ? (
            <Box>
              <Typography variant="body1" gutterBottom fontWeight="medium">
                Selected Exam:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3, 
                  mb: 3,
                  bgcolor: alpha('#0A2463', 0.03),
                  borderColor: alpha('#0A2463', 0.1)
                }}
              >
                <Typography variant="h6" color="#0A2463" fontWeight="bold">
                  {selectedExam.course_code}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="medium" sx={{ mb: 2 }}>
                  {selectedExam.course_name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1.5,
                  color: alpha('#0A2463', 0.7)
                }}>
                  <EventIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(selectedExam.exam_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: alpha('#0A2463', 0.7)
                }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="medium">
                    {selectedExam.start_time}
                  </Typography>
                </Box>
              </Paper>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleJoinQueue}
                disabled={joiningQueue || queueStatus !== null}
                sx={{ 
                  py: 1.8,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  bgcolor: '#0A2463',
                  boxShadow: '0 8px 16px rgba(10, 36, 99, 0.2)',
                  '&:hover': {
                    bgcolor: '#05103a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 20px rgba(10, 36, 99, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {joiningQueue ? (
                  <CircularProgress size={24} color="inherit" />
                ) : queueStatus ? (
                  'Already in Queue'
                ) : (
                  'Join Queue'
                )}
              </Button>
              
              {queueStatus && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: alpha('#0A2463', 0.05), 
                  borderRadius: 2,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    You are already in a queue. Check your status in the Queue Status tab.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setActiveTab(1)}
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#0A2463',
                      color: '#0A2463'
                    }}
                  >
                    View Queue Status
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              bgcolor: alpha('#0A2463', 0.03),
              borderRadius: 2
            }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Please select an exam from the list
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.scrollTo({ top: document.getElementById('exams-section').offsetTop - 100, behavior: 'smooth' })}
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#0A2463',
                  color: '#0A2463'
                }}
              >
                Browse Exams
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderProfile = () => (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={10} lg={8}>
        <Paper sx={{ 
          p: 0, 
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: 'linear-gradient(135deg, #05103a 0%, #0A2463 50%, #1e3a8a 100%)',
            position: 'relative',
            background: 'linear-gradient(135deg, #05103a 0%, #0A2463 50%, #1e3a8a 100%)',
            color: '#ffffff'
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                opacity: 0.3,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                backgroundSize: '15px 15px'
              }} 
            />
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                margin: '0 auto',
                bgcolor: '#ffffff', 
                color: '#05103a',
                fontSize: '3rem',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '4px solid rgba(255,255,255,0.2)'
              }}
            >
              {user?.first_name?.charAt(0) || 'S'}
            </Avatar>
            <Typography variant="h4" sx={{ mt: 3, fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
              {`${user?.first_name || ''} ${user?.last_name || ''}`}
            </Typography>
            <Chip 
              label="Student" 
              color="primary"
              sx={{ 
                mt: 1, 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: '#ffffff', 
                borderRadius: 6,
                px: 2,
                position: 'relative',
                zIndex: 1
              }}
            />
          </Box>
          
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: alpha('#0A2463', 0.03), 
                    borderRadius: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1)
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    color="#0A2463" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    Personal Information
                  </Typography>
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PersonIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Full Name</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{`${user?.first_name || ''} ${user?.last_name || ''}`}</Typography>}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SchoolIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Student ID</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{user?.username || 'N/A'}</Typography>}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EmailIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Email</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{user?.email || 'N/A'}</Typography>}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
    
              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: alpha('#0A2463', 0.03), 
                    borderRadius: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1)
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    color="#0A2463" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <SchoolIcon sx={{ mr: 1 }} />
                    Academic Information
                  </Typography>
                  <List disablePadding>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <SchoolIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Department</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{user?.department || 'N/A'}</Typography>}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ClassIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Level</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{user?.level || 'N/A'}</Typography>}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarTodayIcon color="primary" sx={{ color: '#0A2463' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" color="text.secondary">Session</Typography>}
                        secondary={<Typography variant="body1" fontWeight="medium">{user?.session || 'N/A'}</Typography>}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
  
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 3, 
                    bgcolor: alpha('#0A2463', 0.03), 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1)
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    color="#0A2463" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <QueueIcon sx={{ mr: 1 }} />
                    Queue Status
                  </Typography>
                  {queueStatus ? (
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        icon={<QueueIcon />}
                        label="Currently in Queue" 
                        color="success"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#ffffff', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: alpha('#0A2463', 0.1)
                      }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Exam</Typography>
                            <Typography variant="body1" fontWeight="medium">{selectedExam?.course_code}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Position</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              <Chip 
                                label={queuePosition} 
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Tag Number</Typography>
                            <Typography variant="body1" fontWeight="medium">
                              <Chip 
                                label={currentTag} 
                                color="secondary"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setActiveTab(1)}
                        sx={{ 
                          mt: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          bgcolor: '#0A2463'
                        }}
                      >
                        View Queue Status
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 2 }}>
                      <Typography variant="body1">
                        You are not currently in any queue.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setActiveTab(0)}
                        sx={{ 
                          ml: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: '#0A2463',
                          color: '#0A2463'
                        }}
                      >
                        Join a Queue
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render queue status
  const renderQueueStatus = () => (
    <Grid container spacing={3}>
      {queueStatus ? (
        <>
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 0, 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            }}>
              <Box sx={{ 
                py: 2.5, 
                px: 3, 
                bgcolor: '#05103a',
                color: '#ffffff',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Your Queue Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>Position:</Typography>
                  <Chip 
                    label={queuePosition} 
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem', 
                      py: 2, 
                      px: 1,
                      bgcolor: '#ffffff',
                      color: '#05103a'
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Exam
                      </Typography>
                      <Typography variant="h6" color="#0A2463" fontWeight="bold">
                        {selectedExam?.course_code}: {selectedExam?.course_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Date & Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="#0A2463">
                        {selectedExam ? new Date(selectedExam.exam_date).toLocaleDateString(undefined, { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'} at {selectedExam?.start_time || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tag Number
                      </Typography>
                      <Chip 
                        label={currentTag} 
                        color="secondary"
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: alpha('#0A2463', 0.03),
                      border: '1px solid',
                      borderColor: alpha('#0A2463', 0.1),
                      height: '100%'
                    }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="subtitle2" 
                          color="#0A2463" 
                          gutterBottom
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <PersonIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                          {queuePosition <= 250 ? 'Available Spaces' : 'People Ahead of You'}
                        </Typography>
                        <Box sx={{ 
  display: 'flex',
  alignItems: 'center',
  bgcolor: '#ffffff',
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: alpha('#0A2463', 0.1)
}}>
                          <Avatar sx={{ bgcolor: '#0A2463', mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" color="#0A2463" fontWeight="bold">
                              {peopleAhead}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {queuePosition <= 250 ? 
                                `spaces remaining in current batch` : 
                                `people waiting ahead of you`
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          color="#0A2463" 
                          gutterBottom
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <AccessTimeIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                          Estimated Wait Time
                        </Typography>
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: '#ffffff',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#0A2463', 0.1)
                        }}>
                          <Avatar sx={{ bgcolor: '#1e3a8a', mr: 2 }}>
                            <AccessTimeIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" color="#0A2463" fontWeight="bold">
                              {formatTime(Math.round(estimatedWaitTime * 60))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {queuePosition > 250 && queueStatus.first_check_in_time && (
                                `Based on first check-in at ${new Date(queueStatus.first_check_in_time).toLocaleTimeString()}`
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleLeaveQueue}
                          disabled={leavingQueue}
                          fullWidth
                          sx={{ 
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'medium'
                          }}
                        >
                          {leavingQueue ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Leave Queue'
                          )}
                        </Button>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={generateQRCode}
                          fullWidth
                          sx={{ 
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'medium',
                            bgcolor: '#0A2463'
                          }}
                          startIcon={<QrCodeIcon />}
                        >
                          Generate QR Code
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="#05103a">
                Queue Instructions
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List>
                <ListItem sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: alpha('#0A2463', 0.03), 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#0A2463', 0.1)
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#0A2463', width: 32, height: 32, fontSize: '0.875rem' }}>1</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium" color="#0A2463">
                        Wait for your turn
                      </Typography>
                    } 
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        You are currently in position #{queuePosition}. Please wait until you are called.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: alpha('#0A2463', 0.03), 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#0A2463', 0.1)
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#0A2463', width: 32, height: 32, fontSize: '0.875rem' }}>2</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium" color="#0A2463">
                        Generate your QR code
                      </Typography>
                    } 
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        When it's almost your turn, generate your QR code by clicking the button above.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: alpha('#0A2463', 0.03), 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#0A2463', 0.1)
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#0A2463', width: 32, height: 32, fontSize: '0.875rem' }}>3</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium" color="#0A2463">
                        Present your QR code
                      </Typography>
                    } 
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Show your QR code to the exam administrator for check-in.
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem sx={{ 
                  p: 2, 
                  bgcolor: alpha('#0A2463', 0.03), 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#0A2463', 0.1)
                }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#0A2463', width: 32, height: 32, fontSize: '0.875rem' }}>4</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" fontWeight="medium" color="#0A2463">
                        Take your exam
                      </Typography>
                    } 
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        After check-in, you will be directed to your exam location.
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 5, 
            borderRadius: 4, 
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: alpha('#0A2463', 0.1), 
                color: '#0A2463',
                margin: '0 auto'
              }}>
                <QueueIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="#05103a">
              You are not in any queue
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Please go to the Dashboard tab and join a queue for an upcoming exam.
              You'll be able to track your position and estimated wait time here.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveTab(0)}
              sx={{ 
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                bgcolor: '#0A2463',
                boxShadow: '0 8px 16px rgba(10, 36, 99, 0.2)',
                '&:hover': {
                  bgcolor: '#05103a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 20px rgba(10, 36, 99, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  
  // Render QR code
  const renderQrCode = () => (
    <Grid container spacing={3} justifyContent="center">
      {queueStatus ? (
        <Grid item xs={12} md={10} lg={8}>
          <Paper sx={{ 
            p: 0, 
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ 
              py: 2, 
              px: 3, 
              bgcolor: '#05103a',
              color: '#ffffff'
            }}>
              <Typography variant="h6" fontWeight="bold">
                Your Queue QR Code
              </Typography>
            </Box>
            
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ 
                mb: 4,
                p: 4,
                borderRadius: 3,
                display: 'inline-block',
                bgcolor: '#ffffff',
                border: '1px solid',
                borderColor: alpha('#0A2463', 0.1),
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
              }}>
                <QRCodeSVG 
                  value={qrCodeData || JSON.stringify({
                    studentName: `${user.first_name || ''} ${user.last_name || ''}`,
                    exam: selectedExam?.course_code,
                    matricNumber: user?.username || '',
                    position: queuePosition,
                  })} 
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </Box>
              
              <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                <Grid item>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: alpha('#0A2463', 0.03),
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1),
                    textAlign: 'center',
                    minWidth: 150
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tag Number
                    </Typography>
                    <Chip 
                      label={currentTag} 
                      color="primary" 
                      sx={{ 
                        fontWeight: 'bold',
                        bgcolor: '#0A2463'
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: alpha('#0A2463', 0.03),
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1),
                    textAlign: 'center',
                    minWidth: 150
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Position
                    </Typography>
                    <Chip 
                      label={queuePosition} 
                      color="secondary" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: alpha('#0A2463', 0.03),
                    border: '1px solid',
                    borderColor: alpha('#0A2463', 0.1),
                    textAlign: 'center',
                    minWidth: 150
                  }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Exam
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="#0A2463">
                      {selectedExam?.course_code}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ 
                p: 3, 
                bgcolor: alpha('#0A2463', 0.03), 
                borderRadius: 3,
                textAlign: 'left',
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
                border: '1px solid',
                borderColor: alpha('#0A2463', 0.1)
              }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Instructions:</strong> Show this QR code to the exam administrator when it's your turn.
                  The QR code contains your queue information and will be used for check-in.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Make sure your phone has enough battery and is not in power-saving mode to ensure the screen stays on when needed.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    // Create a temporary link to download the QR code
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `queue-qr-${currentTag}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    borderColor: '#0A2463',
                    color: '#0A2463'
                  }}
                >
                  Download QR Code
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(1)}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    bgcolor: '#0A2463'
                  }}
                >
                  Back to Queue Status
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ) : (
        <Grid item xs={12} md={10} lg={8}>
          <Paper sx={{ 
            p: 5, 
            borderRadius: 4, 
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: alpha('#0A2463', 0.1), 
                color: '#0A2463',
                margin: '0 auto'
              }}>
                <QrCodeIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" color="#05103a">
              No QR Code Available
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              You need to join a queue first before generating a QR code.
              Please go to the Dashboard tab to choose an exam and join the queue.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setActiveTab(0)}
              sx={{ 
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                bgcolor: '#0A2463',
                boxShadow: '0 8px 16px rgba(10, 36, 99, 0.2)',
                '&:hover': {
                  bgcolor: '#05103a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 20px rgba(10, 36, 99, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f6fa'
    }}>
      {/* Header */}
<Box sx={{ 
  bgcolor: '#05103a', // Changed this to the dark blue background instead of white
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  position: 'sticky',
  top: 0,
  zIndex: 10
}}>
  <Container maxWidth="lg">
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      py: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={babcockLogo} 
          alt="Babcock University Logo" 
          style={{ 
            height: '40px',
            marginRight: '12px',
            filter: 'brightness(0) invert(1)' // Keep this as is for white logo on dark
          }} 
        />
         <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            display: { xs: 'none', sm: 'block' },
            color: '#ffffff' // This is now visible on the dark background
          }}
        >
          EasyPass Queue System
        </Typography>
      </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 1,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.08)'
              }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: '#ffffff',
                    color: '#0A2463',
                    fontWeight: 'bold',
                    mr: 1
                  }}
                >
                  {user?.first_name?.charAt(0) || 'S'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Student
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                 variant="outlined"
                size="small"
                onClick={handleLogout}
                startIcon={<ExitToApp />}
                sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#ffffff',
                fontWeight: 'medium',
                '&:hover': {
                borderColor: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.08)'
                 }
  }}
>
                Sign Out
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Navigation Tabs */}
      <Box sx={{ 
        bgcolor: '#ffffff', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        mb: 3,
        position: 'sticky',
        top: '64px',
        zIndex: 9
      }}>
        <Container maxWidth="lg">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            centered={!isMobile}
            sx={{ 
              '& .MuiTab-root': { 
                py: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minWidth: 100
              },
              '& .Mui-selected': {
                color: '#0A2463 !important'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0A2463',
                height: 3
              }
            }}
          >
            <Tab 
              label="Dashboard" 
              icon={<DashboardIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Queue Status" 
              icon={<QueueIcon />} 
              iconPosition="start"
              disabled={!queueStatus}
            />
            <Tab 
              label="QR Code" 
              icon={<QrCodeIcon />} 
              iconPosition="start"
              disabled={!queueStatus}
            />
            <Tab 
              label="Profile" 
              icon={<AccountCircleIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mb: 6, flex: 1 }}>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Tab Content */}
        {activeTab === 0 && renderWelcomeDashboard()}
        {activeTab === 1 && renderQueueStatus()}
        {activeTab === 2 && renderQrCode()}
        {activeTab === 3 && renderProfile()}  
      </Container>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: '#05103a',
          color: '#ffffff',
          borderTop: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <img 
                src={babcockLogo} 
                alt="Babcock University Logo" 
                style={{ 
                  height: '30px',
                  marginRight: '10px',
                  filter: 'brightness(0) invert(1)'
                }} 
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                © {new Date().getFullYear()} Babcock University EasyPass
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              All rights reserved
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* QR Code Dialog */}
      <QRCodeDialog />
    </Box>
  );
};

export default Dashboard;