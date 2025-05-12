import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Alert, Snackbar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Avatar, CircularProgress
} from '@mui/material';
import {
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import api from '../../services/api';
import QRCodeScanner from './QRCodeScanner';

const CheckOutManagement = () => {
  const [loading, setLoading] = useState(false);
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [recentCheckouts, setRecentCheckouts] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    totalCheckedOut: 0,
    totalExams: 0
  });
  const [capacity, setCapacity] = useState({
    total: 0,
    available: 0
  });

  // Fetch data
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
      const checkedInQueues = allQueues.filter(q => q.status === 'checked_in');
      const checkedOutQueues = allQueues.filter(q => q.status === 'completed');
      
      //set the primary stats
      setStats({
        totalCheckedIn: checkedInQueues.length,
        totalCheckedOut: checkedOutQueues.length,
        totalExams: examsResponse.data.filter(e => e.is_active).length
      });

       // Calculate available spaces
         const activeExams = examsResponse.data.filter(e => e.is_active);
         if (activeExams.length > 0) {
           const totalCapacity = activeExams.reduce((sum, exam) => sum + (exam.capacity || 0), 0);
           const availableSpaces = totalCapacity - checkedInQueues.length;
      
      setCapacity({
        total: totalCapacity,
        available: Math.max(0, availableSpaces)
      });
    }
      // Get currently checked in students
      setCheckedInStudents(checkedInQueues);

      // Get recent check-outs (last 10)
      const recentCheckouts = checkedOutQueues
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 10);
      
      setRecentCheckouts(recentCheckouts);
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
      
      // Parse the QR data - it could be a string or object
      let parsedData = qrData;
      if (typeof qrData === 'string') {
        try {
          parsedData = JSON.parse(qrData);
        } catch (e) {
          console.error("Error parsing QR code string:", e);
        }
      }
      
      console.log("Parsed QR data:", parsedData);
      
      // Extract student identification from QR data - use same format as check-in
      const username = parsedData.matricNumber || 
                      parsedData.username || 
                      parsedData.studentId || 
                      parsedData.student_id;
                      
      const examCode = parsedData.exam || 
                      parsedData.examId || 
                      parsedData.exam_code || 
                      parsedData.course_code;
      
      const tagNumber = parsedData.tag_number || parsedData.tagNumber;
      
      if (!username && !tagNumber) {
        setSnackbar({
          open: true,
          message: 'Invalid QR code format - student identification not found',
          severity: 'error'
        });
        setProcessing(false);
        return;
      }
      
      // Prepare the payload with all possible identifiers
      const payload = {
        username: username,
        exam_code: examCode
      };
      
      // Add tag number if available
      if (tagNumber) {
        payload.tag_number = tagNumber;
      }
      
      console.log('Checking out with payload:', payload);
      
      // Send check-out request to backend
      const response = await api.post('/checkout/', payload);
      
      console.log('Checkout response:', response.data);
      
      // Update local stats to show increased capacity
      if (response.data.available_seats !== undefined) {
        setStats(prevStats => ({
          ...prevStats,
          totalCheckedIn: Math.max(0, response.data.hall_capacity - response.data.available_seats),
          totalCheckedOut: prevStats.totalCheckedOut + 1
        }));
      } else {
        // Fallback if no capacity data
        setStats(prevStats => ({
          ...prevStats,
          totalCheckedIn: Math.max(0, prevStats.totalCheckedIn - 1),
          totalCheckedOut: prevStats.totalCheckedOut + 1
        }));
      }
      
      // Update student being checked out in UI
      const checkoutIdentifier = tagNumber || username;
      
      setCheckedInStudents(prevStudents => 
        prevStudents.filter(student => 
          (student.tag_number !== checkoutIdentifier) && 
          (student.username !== checkoutIdentifier)
        )
      );
      
      // Add to recent checkouts
      if (response.data.queue) {
        const checkoutData = response.data.queue;
        setRecentCheckouts(prev => {
          // Add the new checkout at the beginning
          const updated = [
            {
              ...checkoutData,
              updated_at: new Date().toISOString()
            },
            ...prev
          ].slice(0, 10); // Keep only the 10 most recent
          
          return updated;
        });
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: response.data.message || 'Successfully checked out student',
        severity: 'success'
      });
      
      // Refresh data after a delay
      setTimeout(() => fetchData(), 1000);
    } catch (err) {
      console.error("Error processing check-out:", err);
      
      let errorMessage = 'Failed to check out student. Please try again.';
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

  const calculateDuration = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return 'N/A';
    
    const start = new Date(checkInTime);
    const end = new Date(checkOutTime);
    const diffMs = end - start;
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins} min`;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom color="#05103a">
        Student Check-Out Management
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
                <Avatar sx={{ bgcolor: '#388e3c', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#05103a">
                  Currently In
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#388e3c">
                {loading ? <CircularProgress size={30} /> : stats.totalCheckedIn}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                students checked in
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
                <Avatar sx={{ bgcolor: '#0A2463', mr: 2 }}>
                  <ExitToAppIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#05103a">
                  Checked Out
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#0A2463">
                {loading ? <CircularProgress size={30} /> : stats.totalCheckedOut}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                students completed
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
              Student Check-Out
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    Use the scanner to check out students by scanning their QR codes.
                    The system will automatically update their status.
                  </Typography>
                  
                  <QRCodeScanner 
                    onScanSuccess={handleScanSuccess}
                    scannerTitle="Student Check-Out Scanner"
                    buttonText="Scan Student QR Code"
                  />
                </Box>
                
                {scanResult && (
                  <Paper sx={{ 
                    p: 3, 
                    mt: 3, 
                    borderRadius: 2, 
                    bgcolor: processing ? 'rgba(0,0,0,0.02)' : 'rgba(10, 36, 99, 0.1)',
                    border: '1px solid',
                    borderColor: processing ? 'rgba(0,0,0,0.1)' : 'rgba(10, 36, 99, 0.3)'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {processing ? 'Processing...' : 'Successfully Scanned!'}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Tag Number</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          <Chip 
                            label={scanResult.tag_number || scanResult.tagNumber} 
                            size="small" 
                            color="secondary"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Typography>
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
                    4. The system will automatically process the check-out
                  </Typography>
                  <Typography variant="body2">
                    5. Verify the student's details after scanning
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Currently Checked In Students */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mb: 3
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#05103a">
              Currently Checked In Students
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : checkedInStudents.length === 0 ? (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  No students currently checked in
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Checked In At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checkedInStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#0A2463',
                              fontSize: '0.875rem',
                              mr: 1
                            }}>
                              {student.student_name?.charAt(0) || student.username?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.student_name || `Student #${student.student}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.username || ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={student.exam_code || student.exam_name || `Exam #${student.exam}`} 
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
                            label={student.tag_number} 
                            color="secondary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={student.position} 
                            color="primary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimerIcon sx={{ fontSize: '0.875rem', mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDateTime(student.checked_in_at || student.created_at)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const checkInTime = new Date(student.checked_in_at || student.created_at);
                            const now = new Date();
                            const diffMs = now - checkInTime;
                            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            
                            return (
                              <Typography variant="body2">
                                {diffHrs > 0 ? `${diffHrs}h ${diffMins}m` : `${diffMins}m`}
                              </Typography>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Check-outs Table */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#05103a">
              Recent Check-outs
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : recentCheckouts.length === 0 ? (
              <Box sx={{ 
                py: 5, 
                textAlign: 'center',
                bgcolor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  No recent check-outs to display
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Exam</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Checked Out At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentCheckouts.map((checkout) => (
                      <TableRow key={checkout.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#0A2463',
                              fontSize: '0.875rem',
                              mr: 1
                            }}>
                              {checkout.student_name?.charAt(0) || checkout.username?.charAt(0) || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {checkout.student_name || `Student #${checkout.student}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {checkout.username || ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={checkout.exam_code || checkout.exam_name || `Exam #${checkout.exam}`} 
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
                            label={checkout.tag_number} 
                            color="secondary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={checkout.position} 
                            color="primary" 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimerIcon sx={{ fontSize: '0.875rem', mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDateTime(checkout.updated_at)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {calculateDuration(
                            checkout.checked_in_at || checkout.created_at,
                            checkout.updated_at
                          )}
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

export default CheckOutManagement;