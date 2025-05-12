import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Divider,
  Button,
  Card,
  CardContent,
  Alert,
  Chip
} from '@mui/material';
import { AccessTime, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import Header from '../common/Header';
import api from '../../services/api';

const QueueStatus = () => {
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await api.get('/queue/status/');
        setQueueData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching queue status:', error);
        setError('You are not currently in any queue.');
        setLoading(false);
      }
    };

    fetchQueueStatus();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchQueueStatus, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const leaveQueue = async () => {
    try {
      await api.post('/queue/leave/');
      setQueueData(null);
    } catch (error) {
      console.error('Error leaving queue:', error);
      setError('Failed to leave the queue. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
            Queue Status
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {error && !queueData ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : queueData ? (
            <>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5">{queueData.exam.course}: {queueData.exam.title}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Date: {new Date(queueData.exam.date).toLocaleDateString()} | Time: {queueData.exam.time}
                      </Typography>
                      <Typography variant="body1">
                        Venue: {queueData.exam.venue}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          icon={queueData.status === 'waiting' ? <HourglassEmpty /> : queueData.status === 'ready' ? <CheckCircle /> : <Cancel />} 
                          label={queueData.status === 'waiting' ? 'Waiting' : queueData.status === 'ready' ? 'Ready to Enter' : 'Completed'} 
                          color={queueData.status === 'waiting' ? 'primary' : queueData.status === 'ready' ? 'success' : 'default'} 
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                          <CircularProgress 
                            variant="determinate" 
                            value={((queueData.total_students - queueData.position) / queueData.total_students) * 100} 
                            size={100} 
                            thickness={5}
                            color={queueData.status === 'ready' ? 'success' : 'primary'}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="h4" component="div">
                              {queueData.position}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Your position in queue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="h6">Total Students</Typography>
                    <Typography variant="h3">{queueData.total_students}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h6">Students Ahead</Typography>
                    <Typography variant="h3">{queueData.position - 1}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h6">Est. Wait Time</Typography>
                    <Typography variant="h3">{queueData.estimated_wait_time} min</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={leaveQueue}
                  startIcon={<Cancel />}
                >
                  Leave Queue
                </Button>
              </Box>

              {queueData.status === 'ready' && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body1">
                    <strong>You are now ready to enter the exam hall!</strong> Please proceed to the entrance and have your QR code ready for scanning.
                  </Typography>
                </Alert>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>You are not currently in any queue</Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }} 
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default QueueStatus;