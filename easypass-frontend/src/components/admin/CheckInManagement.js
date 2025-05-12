import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Alert, Snackbar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Avatar, CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import api from '../../services/api';
import QRCodeScanner from './QRCodeScanner';

const CheckInManagement = () => {
  const [loading, setLoading] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalWaiting: 0,
    totalCheckedIn: 0,
    totalExams: 0
  });

  // Fetch recent check-ins and stats
  useEffect(() => {
    fetchData();
    // Set up polling for real-time updates every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueResponse, examsResponse] = await Promise.all([
        api.get('/queues/'),
        api.get('/exams/')
      ]);

      // Process data for stats
      const allQueues = queueResponse.data;
      const waitingQueues = allQueues.filter(q => q.status === 'waiting');
      const checkedInQueues = allQueues.filter(q => q.status === 'checked_in');
      
      setStats({
        totalWaiting: waitingQueues.length,
        totalCheckedIn: checkedInQueues.length,
        totalExams: examsResponse.data.filter(e => e.is_active).length
      });

      // Get recent check-ins (last 10)
      const recentCheckins = checkedInQueues
        .sort((a, b) => new Date(b.checked_in_time) - new Date(a.checked_in_time))
        .slice(0, 10);
      
      setRecentCheckins(recentCheckins);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (qrData) => {
    try {
      setProcessing(true);
      setScanResult(qrData);
      
      // Send check-in request to backend
      const response = await api.post('/queues/check_in/', {
        studentId: qrData.studentId,
        examId: qrData.examId,
        position: qrData.position,
        tagNumber: qrData.tagNumber
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Successfully checked in ${qrData.studentName} for ${qrData.exam}`,
        severity: 'success'
      });
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Error processing check-in:", err);
      
      let errorMessage = 'Failed to check in student. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      // Clear scan result after a few seconds
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#05103a">
        Student Check-In Management
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#0A2463', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#05103a">
                  Waiting
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#0A2463">
                {loading ? <CircularProgress size={30} /> : stats.totalWaiting}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                students in queue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#388e3c', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#05103a">
                  Checked In
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#388e3c">
                {loading ? <CircularProgress size={30} /> : stats.totalCheckedIn}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                students processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f57c00', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#05103a">
                  Active Exams
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#f57c00">
                {loading ? <CircularProgress size={30} /> : stats.totalExams}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ongoing exams
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Scanner Section */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mb: 3
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#05103a">
              Student Check-In
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    Use the scanner to check in students by scanning their QR codes.
                    The system will automatically update their status.
                  </Typography>
                  
                  <QRCodeScanner 
                    onScanSuccess={handleScanSuccess}
                    scannerTitle="Student Check-In Scanner"
                    buttonText="Scan Student QR Code"
                  />
                </Box>
                
                {scanResult && (
                  <Paper sx={{ 
                    p: 3, 
                    mt: 3, 
                    borderRadius: 2, 
                    bgcolor: processing ? 'rgba(0,0,0,0.02)' : 'rgba(46, 125, 50, 0.1)',
                    border: '1px solid',
                    borderColor: processing ? 'rgba(0,0,0,0.1)' : 'rgba(46, 125, 50, 0.3)'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {processing ? 'Processing...' : 'Successfully Scanned!'}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Student Name</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {scanResult.studentName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Matric Number</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {scanResult.matricNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Exam</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {scanResult.exam}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Queue Position</Typography>
                        <Chip 
                          label={scanResult.position} 
                          size="small" 
                          color="primary"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Grid>
                    </Grid>
                    
                    {processing && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <CircularProgress size={30} />
                      </Box>
                    )}
                  </Paper>
                )}
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  height: '100%', 
                  bgcolor: 'rgba(10, 36, 99, 0.03)',
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'rgba(10, 36, 99, 0.1)'
                }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <QrCodeIcon sx={{ mr: 1 }} />
                    Scanner Instructions
                  </Typography>
                  
                  <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                    1. Click the "Scan Student QR Code" button above
                  </Typography>
                  <Typography variant="body2" paragraph>
                    2. Allow camera access when prompted
                  </Typography>
                  <Typography variant="body2" paragraph>
                    3. Position the student's QR code in the scanner frame
                  </Typography>
                  <Typography variant="body2" paragraph>
                    4. The system will automatically process the check-in
                  </Typography>
                  <Typography variant="body2">
                    5. Verify the student's details after scanning
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Check-ins Table */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#05103a">
              Recent Check-ins
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : recentCheckins.length === 0 ? (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  No recent check-ins to display
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check-in Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentCheckins.map((checkin) => (
                      <TableRow key={checkin.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#0A2463',
                              fontSize: '0.875rem',
                              mr: 1
                            }}>
                              {checkin.student_name?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {checkin.student_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {checkin.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={checkin.exam_code} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(10, 36, 99, 0.1)', 
                              color: '#0A2463',
                              fontWeight: 'medium'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={checkin.position} 
                            color="primary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={checkin.tag_number} 
                            color="secondary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimerIcon sx={{ fontSize: '0.875rem', mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDateTime(checkin.checked_in_time)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      
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
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckInManagement;