import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Container, Box, Paper, Grid, Button, 
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Chip, Divider, Card, CardContent, CardHeader, Avatar,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, CircularProgress,
  Snackbar, Alert, Menu, MenuItem, Tooltip, FormControl, InputLabel, Select,
  Drawer, useTheme, useMediaQuery, Badge, Switch, FormControlLabel,
  InputAdornment, OutlinedInput, Stack, alpha, LinearProgress, Skeleton,
  Backdrop, Stepper, Step, StepLabel, StepContent, Fade, Grow, Zoom,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Accordion, AccordionSummary,
  AccordionDetails, Breadcrumbs, Link, ButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  QrCode as QrCodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  ViewList as QueueIcon,
  Room as RoomIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  Lightbulb as LightbulbIcon,
  DonutLarge as DonutLargeIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  Bookmark as BookmarkIcon,
  ReceiptLong as ReceiptLongIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Launch as LaunchIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import api from '../../services/api';
import authService from '../../services/authService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import QRScannerDialog from './QRScannerDialog';

// Styled components with enhanced aesthetics
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    transform: 'translateY(-4px)'
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ColorBar = styled(Box)(({ color }) => ({
  height: 8,
  backgroundColor: color || '#3f51b5',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 16,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.dark,
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let color = theme.palette.primary.main;
  if (status === 'checked-in') color = theme.palette.success.main;
  if (status === 'waiting') color = theme.palette.warning.main;
  if (status === 'absent') color = theme.palette.error.main;
  
  return {
    backgroundColor: alpha(color, 0.15),
    color: color,
    fontWeight: 600,
    border: `1px solid ${alpha(color, 0.3)}`,
  };
});

const StyledAvatar = styled(Avatar)(({ theme, color }) => ({
  backgroundColor: alpha(theme.palette[color || 'primary'].main, 0.12),
  color: theme.palette[color || 'primary'].main,
  width: 48,
  height: 48,
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontWeight: 'bold',
    boxShadow: '0 0 0 2px white',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  boxShadow: 'none',
  textTransform: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const AnimatedAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  borderRadius: `${theme.spacing(1)} !important`,
  marginBottom: theme.spacing(1.5),
  overflow: 'hidden',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(1.5)}px 0`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transform: 'scale(1.01)',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  height: '100%',
  overflow: 'visible',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(2),
  },
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
}));

const StatCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(45deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.15)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
  }
}));

const ActionButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`,
  }
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [queues, setQueues] = useState([]);
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [statsData, setStatsData] = useState({
    totalExams: 0,
    activeExams: 0,
    totalStudents: 0,
    inQueue: 0,
    checkedIn: 0
  });
  const [checkoutScannerOpen, setCheckoutScannerOpen] = useState(false);

  // Dialog states
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [editExamDialogOpen, setEditExamDialogOpen] = useState(false);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  // Form states
  const [newExam, setNewExam] = useState({
    course_code: '',
    course_name: '',
    exam_date: '',
    start_time: '',
    is_active: true
  });
  
  // Fetch exams from API
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/exams/');
      console.log('Fetched exams:', response.data);
      setExams(response.data);
      
      // Update stats
      setStatsData(prev => ({
        ...prev,
        totalExams: response.data.length,
        activeExams: response.data.filter(exam => exam.is_active).length
      }));
      
      if (response.data.length > 0 && !selectedExam) {
        setSelectedExam(response.data[0].id);
        fetchQueues(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedExam]);

  const getExamCode = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.course_code : 'N/A';
  };
  
  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
      
      // Update stats
      setStatsData(prev => ({
        ...prev,
        totalStudents: response.data.length
      }));
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    }
  }, []);
  
  // Fetch queues for a specific exam
  const fetchQueues = useCallback(async (examId) => {
    if (!examId) return;
    
    try {
      // Explicitly pass the exam ID to filter the queues
      const response = await api.get(`/queues/?exam=${examId}`);
      console.log(`Fetched queue data for exam ID ${examId}:`, response.data);
      
      // Sort queues by creation time to ensure correct order
      const sortedQueues = response.data.sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      
      // Add position information and ensure we only show queues for the selected exam
    const queuesWithPosition = sortedQueues
    .filter(queue => queue.exam === examId) // Extra filter to ensure only this exam's queues
    .map((queue, index) => ({
      ...queue,
      position: index + 1
    }));
      
      setQueues(queuesWithPosition);
      
      // Update stats
      setStatsData(prev => ({
        ...prev,
        inQueue: queuesWithPosition.length
      }));
      
      // Also fetch checked-in students for this exam
      const checkedInResponse = await api.get(`/check-in/?exam=${examId}`);
      
      // Make sure we only include students for this exam
    const filteredCheckedInStudents = checkedInResponse.data.filter(
      student => student.exam === examId
    );
    setCheckedInStudents(filteredCheckedInStudents);

     
    // Update stats
    setStatsData(prev => ({
      ...prev,
      checkedIn: filteredCheckedInStudents.length
    }));
  } catch (err) {
    console.error('Error fetching queues:', err);
    // setError('Failed to load queue data. Please try again.');
  }
}, []);
  
  // Check if user is admin
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (!user.is_staff && !user.is_superuser)) {
      navigate('/login');
      return;
    }
    
    fetchExams();
    fetchStudents();
  }, [navigate, fetchExams, fetchStudents]);
  
  // Auto-refresh data
  useEffect(() => {
    // Initial fetch
    if (selectedExam) {
      fetchQueues(selectedExam);
    }
    
    // Set up auto-refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      if (selectedExam) {
        console.log('Auto-refreshing queue data...');
        fetchQueues(selectedExam);
      }
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedExam, fetchQueues]);
  
  // Handle exam selection change
  const handleExamChange = (examId) => {
    // Clear the current queue and checked-in lists before fetching new data
    setQueues([]);
    setCheckedInStudents([]);
    setSelectedExam(examId);
    
    // Update the UI to indicate loading
    setLoading(true);
    
    // Fetch the queue data for the selected exam
    fetchQueues(examId)
      .finally(() => setLoading(false));
  };
  
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle creating a new exam
  const handleCreateExam = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newExam.course_code || !newExam.course_name || !newExam.exam_date || !newExam.start_time) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      
      // Format the date properly to ensure it's in YYYY-MM-DD format
      const formattedDate = newExam.exam_date ? 
        (newExam.exam_date instanceof Date ? 
          newExam.exam_date.toISOString().split('T')[0] : 
          newExam.exam_date) : 
        '';
      
      // Format the data properly to match backend field names
      const formattedExam = {
        course_code: newExam.course_code,
        course_name: newExam.course_name,
        exam_date: formattedDate,
        start_time: newExam.start_time,
        is_active: newExam.is_active !== undefined ? newExam.is_active : true
      };
      
      console.log('Creating exam with data:', formattedExam);
      
      const response = await api.post('/exams/', formattedExam);
      
      // Add the new exam to the list
      setExams([...exams, response.data]);
      
      // Reset the form
      setNewExam({
        course_code: '',
        course_name: '',
        exam_date: '',
        start_time: '',
        is_active: true
      });
      
      // Close the dialog
      setExamDialogOpen(false);
      
      // Show success message
      setSuccess('Exam created successfully');
    } catch (err) {
      console.error('Error creating exam:', err);
      
      let errorMessage = 'Failed to create exam. Please try again.';
      
      if (err.response && err.response.data) {
        // Format error message from backend
        if (typeof err.response.data === 'object') {
          errorMessage = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle editing an exam
  const handleEditExam = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!selectedExamForEdit.course_code || !selectedExamForEdit.course_name || 
          !selectedExamForEdit.exam_date || !selectedExamForEdit.start_time) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      
      // Format the date properly to ensure it's in YYYY-MM-DD format
      const formattedDate = selectedExamForEdit.exam_date ? 
        (selectedExamForEdit.exam_date instanceof Date ? 
          selectedExamForEdit.exam_date.toISOString().split('T')[0] : 
          selectedExamForEdit.exam_date) : 
        '';
      
      // Format the data properly to match backend field names
      const formattedExam = {
        course_code: selectedExamForEdit.course_code,
        course_name: selectedExamForEdit.course_name,
        exam_date: formattedDate,
        start_time: selectedExamForEdit.start_time,
        is_active: selectedExamForEdit.is_active
      };
      
      console.log('Updating exam with data:', formattedExam);
      
      const response = await api.put(`/exams/${selectedExamForEdit.id}/`, formattedExam);
      
      // Update the exam in the list
      setExams(exams.map(exam => exam.id === selectedExamForEdit.id ? response.data : exam));
      
      // Close the dialog
      setEditExamDialogOpen(false);
      
      // Show success message
      setSuccess('Exam updated successfully');
    } catch (err) {
      console.error('Error updating exam:', err);
      
      let errorMessage = 'Failed to update exam. Please try again.';
      
      if (err.response && err.response.data) {
        // Format error message from backend
        if (typeof err.response.data === 'object') {
          errorMessage = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle QR code scanning
  const handleScan = (data) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data);
        console.log('Scanned data:', scannedData);
        
        // Show confirmation dialog with scanned data
        setConfirmData(scannedData);
        setConfirmDialogOpen(true);
      } catch (err) {
        console.error('Error parsing QR code data:', err);
        setError('Invalid QR code format. Please try again.');
      }
    }
  };
  
  // Handle check-in confirmation
  const handleCheckIn = async () => {
    console.log("Handling check-in with data:", confirmData);
    
    if (!confirmData) {
      setError('No data available for check-in');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the selected exam
      const currentExam = exams.find(e => e.id === selectedExam);
      
      // Prepare the payload with the username and exam code
      const payload = {
        username: confirmData.username || confirmData.matricNumber || confirmData.studentId,
        exam_code: confirmData.exam_code || currentExam?.course_code,
        test_mode: true // Enable test mode for flexibility - creates student if missing
      };
      
      // Add position if available
      if (confirmData.position) {
        payload.position = confirmData.position;
      }
      
      if (!payload.username) {
        setError('Missing student ID information');
        setLoading(false);
        return;
      }
      
      if (!payload.exam_code) {
        setError('Missing exam code - please select an exam');
        setLoading(false);
        return;
      }
      
      console.log("Sending check-in payload:", payload);
      
      const response = await api.post('/check-in/', payload);
      
      console.log("Check-in response:", response.data);
      
      const tagNumber = response.data.tag_number || response.data.queue?.tag_number || 'Generated';
      const message = response.data.message || 'Student checked in successfully!';
      
      // Remove from the queue display immediately
      const username = payload.username;
      setQueues(prevQueues => prevQueues.filter(q => 
        q.username !== username && 
        q.student !== confirmData.studentId
      ));
      
      setSuccess(`${message} Tag: ${tagNumber}`);
      
      // Refresh data
      fetchQueues(selectedExam);
    } catch (err) {
      console.error('Error checking in student:', err);
      
      let errorMessage = 'Failed to check in student. Please try again.';
      
      // Better error extraction
      if (err.response) {
        console.log('Error response:', err.response);
        
        if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (typeof err.response.data === 'object') {
            errorMessage = JSON.stringify(err.response.data);
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        }
        
        // Add HTTP status context
        errorMessage += ` (Status: ${err.response.status})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle removing a student from queue
  const handleRemoveFromQueue = async (queueId) => {
    try {
      setLoading(true);
      console.log('Removing queue entry with ID:', queueId);
      
      const response = await api.delete(`/queues/${queueId}/`);
      console.log('Remove queue response:', response);
      
      setSuccess('Student removed from queue successfully!');
      setQueues(queues.filter(q => q.id !== queueId));
      fetchQueues(selectedExam);
    } catch (err) {
      console.error('Error removing student from queue:', err);
      
      let errorMessage = 'Failed to remove student from queue. Please try again.';
      
      if (err.response) {
        console.error('Error response:', err.response);
        if (err.response.data && err.response.data.detail) {
          errorMessage = `Error: ${err.response.data.detail}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle checking out a student
  const handleCheckoutScan = (studentData) => {
    setLoading(true);
    console.log("Processing checkout with data:", studentData);
    
    // Call the checkout endpoint
    api.post('/checkout/', studentData)
      .then(response => {
        console.log("Checkout response:", response.data);
        
        // Update UI immediately
        if (studentData.tag_number) {
          setCheckedInStudents(prev => 
            prev.filter(student => student.tag_number !== studentData.tag_number)
          );
        } else if (studentData.username) {
          setCheckedInStudents(prev => 
            prev.filter(student => 
              student.username !== studentData.username && 
              student.student_name !== studentData.username
            )
          );
        }
        
        // Update available spaces stats
        if (response.data.available_seats !== undefined) {
          setStatsData(prev => ({
            ...prev,
            checkedIn: response.data.hall_capacity - response.data.available_seats,
            availableSpaces: response.data.available_seats
          }));
        }
        
        setSuccess(response.data.message || 'Student checked out successfully!');
        
        // Refresh data
        fetchQueues(selectedExam);
        // Show report dialog after successful checkout
        setReportDialogOpen(true);
      })
      .catch(err => {
        console.error("Checkout error:", err);
        let errorMessage = "Failed to check out student";
        
        if (err.response?.data?.error) {
          errorMessage += ": " + err.response.data.error;
        }
        
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle checking out a student manually
  const handleCheckOut = async (checkInId) => {
    try {
      setLoading(true);
      console.log('Checking out student with ID:', checkInId);
      
      // Get the check-in record
      const checkInRecord = checkedInStudents.find(student => student.id === checkInId);
      
      if (!checkInRecord) {
        setError('Check-in record not found');
        setLoading(false);
        return;
      }
      
      // Prepare the payload
      const payload = {
        tag_number: checkInRecord.tag_number,
        exam_code: getExamCode(selectedExam)
      };
      
      console.log('Sending checkout payload:', payload);
      
      const response = await api.post('/checkout/', payload);
      console.log('Checkout response:', response.data);
      
      // Update UI immediately
      setCheckedInStudents(prev => 
        prev.map(student => 
          student.id === checkInId 
            ? {...student, check_out_time: new Date().toISOString()} 
            : student
        )
      );
      
      // Update stats if available
      if (response.data.available_seats !== undefined) {
        setStatsData(prev => ({
          ...prev,
          checkedIn: prev.checkedIn - 1,
          availableSpaces: response.data.available_seats
        }));
      }
      
      setSuccess(response.data.message || 'Student checked out successfully!');
      
      // Refresh data
      fetchQueues(selectedExam);

    // Show report dialog after successful checkout
    setReportDialogOpen(true);
  } catch (err) {
    console.error('Error checking out student:', err);
    
    let errorMessage = 'Failed to check out student. Please try again.';
    
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Handle deleting an exam
  const handleDeleteExam = async (examId) => {
    try {
      await api.delete(`/exams/${examId}/`);
      
      const deletedExam = exams.find(exam => exam.id === examId);
      setExams(exams.filter(exam => exam.id !== examId));
      setSuccess('Exam deleted successfully!');
      
      // Update stats
      setStatsData(prev => ({
        ...prev,
        totalExams: prev.totalExams - 1,
        activeExams: deletedExam?.is_active ? prev.activeExams - 1 : prev.activeExams
      }));
      
      if (selectedExam === examId) {
        if (exams.length > 1) {
          const newSelectedExam = exams.find(exam => exam.id !== examId)?.id;
          setSelectedExam(newSelectedExam);
          fetchQueues(newSelectedExam);
        } else {
          setSelectedExam(null);
          setQueues([]);
          setCheckedInStudents([]);
        }
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('Failed to delete exam. Please try again.');
    }
  };
  
  // Handle generating report
  const handleGenerateReport = () => {
    if (!selectedExam) {
      setError('Please select an exam to generate a report');
      return;
    }
    
    setReportDialogOpen(true);
  };
  
  // Handle exporting report to CSV
  const handleExportToCSV = () => {
    if (!selectedExam || !checkedInStudents.length) {
      setError('No data to export');
      return;
    }
    
    try {
      const selectedExamData = exams.find(exam => exam.id === selectedExam);
      const filename = `${selectedExamData.course_code}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Create CSV content
      let csvContent = "Student ID,Student Name,Tag Number,Check-In Time,Check-Out Time,Duration\n";
      
      checkedInStudents.forEach(student => {
        const checkInTime = new Date(student.check_in_time);
        const checkOutTime = student.check_out_time ? new Date(student.check_out_time) : null;
        
        let duration = 'Still present';
        if (checkOutTime) {
          const durationMs = checkOutTime - checkInTime;
          const durationMinutes = Math.floor(durationMs / 60000);
          duration = `${durationMinutes} minutes`;
        }
        
        csvContent += `${student.student_id},${student.student_name},${student.tag_number},${checkInTime.toLocaleString()},${checkOutTime ? checkOutTime.toLocaleString() : 'N/A'},${duration}\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Report exported successfully!');
      setReportDialogOpen(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    }
  };
  
  // Handle printing report
  const handlePrintReport = () => {
    if (!selectedExam || !checkedInStudents.length) {
      setError('No data to print');
      return;
    }
    
    try {
      const selectedExamData = exams.find(exam => exam.id === selectedExam);
      
      // Create a printable div
      const printContent = document.createElement('div');
      printContent.innerHTML = `
        <h1 style="text-align: center;">Attendance Report</h1>
        <h2 style="text-align: center;">${selectedExamData.course_code}: ${selectedExamData.course_name}</h2>
        <p style="text-align: center;">Date: ${new Date(selectedExamData.exam_date).toLocaleDateString()}</p>
        <p style="text-align: center;">Time: ${selectedExamData.start_time}</p>
        <hr />
        <h3>Attendance List (${checkedInStudents.length} students)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student ID</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tag Number</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Check-In Time</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Check-Out Time</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${checkedInStudents.map(student => {
              const checkInTime = new Date(student.check_in_time);
              const checkOutTime = student.check_out_time ? new Date(student.check_out_time) : null;
              
              let duration = 'Still present';
              if (checkOutTime) {
                const durationMs = checkOutTime - checkInTime;
                const durationMinutes = Math.floor(durationMs / 60000);
                duration = `${durationMinutes} minutes`;
              }
              
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.student_id}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.student_name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.tag_number}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${checkInTime.toLocaleString()}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${checkOutTime ? checkOutTime.toLocaleString() : 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${duration}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <hr />
        <p style="text-align: center;">Generated on ${new Date().toLocaleString()}</p>
      `;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Report - ${selectedExamData.course_code}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <div style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()" style="padding: 8px 16px; background-color: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Report</button>
              <button onclick="window.close()" style="padding: 8px 16px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-left: 10px;">Close</button>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setSuccess('Report prepared for printing!');
    } catch (err) {
      console.error('Error printing report:', err);
      setError('Failed to prepare report for printing. Please try again.');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  // Render dashboard tab
  const renderDashboardTab = () => {
    const currentDate = new Date().toLocaleDateString();
    const activeExams = exams.filter(exam => exam.is_active);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600} color="primary">Dashboard Overview</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome to the Exam Queue Management System. Here's an overview of your current data.
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={500}>
              <StatCard color="primary">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Exams</Typography>
                  <StyledAvatar color="primary">
                    <EventIcon />
                  </StyledAvatar>
                </Box>
                <Typography variant="h3" fontWeight={700}>{statsData.totalExams}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                  {statsData.activeExams} active exams
                </Typography>
              </StatCard>
            </Grow>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
              <StatCard color="secondary">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Total Students</Typography>
                  <StyledAvatar color="secondary">
                    <PersonIcon />
                  </StyledAvatar>
                </Box>
                <Typography variant="h3" fontWeight={700}>{statsData.totalStudents}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                  Registered in the system
                </Typography>
              </StatCard>
            </Grow>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={900}>
              <StatCard color="warning">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>In Queue</Typography>
                  <StyledAvatar color="warning">
                    <QueueIcon />
                  </StyledAvatar>
                </Box>
                <Typography variant="h3" fontWeight={700}>{statsData.inQueue}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                  Students waiting
                </Typography>
              </StatCard>
            </Grow>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1100}>
              <StatCard color="success">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>Checked In</Typography>
                  <StyledAvatar color="success">
                    <CheckIcon />
                  </StyledAvatar>
                </Box>
                <Typography variant="h3" fontWeight={700}>{statsData.checkedIn}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                  Students present
                </Typography>
              </StatCard>
            </Grow>
          </Grid>
        </Grid>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <StyledCard elevation={2}>
              <StyledCardHeader 
                avatar={<StyledAvatar color="primary"><EventIcon /></StyledAvatar>}
                title="Today's Exams"
                action={
                  <Tooltip title="Refresh">
                    <IconButton onClick={() => fetchExams()}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              
              <CardContent sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ p: 3 }}>
                    {[1, 2, 3].map((item) => (
                      <Box key={item} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                      </Box>
                    ))}
                  </Box>
                ) : exams.filter(exam => {
                    const examDate = new Date(exam.exam_date).toLocaleDateString();
                    return examDate === currentDate;
                  }).length > 0 ? (
                  <List sx={{ px: 0 }}>
                    {exams
                      .filter(exam => {
                        const examDate = new Date(exam.exam_date).toLocaleDateString();
                        return examDate === currentDate;
                      })
                      .map(exam => (
                        <Zoom in={true} key={exam.id} style={{ transitionDelay: '100ms' }}>
                          <ListItem 
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                            }}
                            secondaryAction={
                              <ActionButton
                                size="small" 
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                  setSelectedExam(exam.id);
                                  setQueues([]); // Clear existing queues
                                  setCheckedInStudents([]); // Clear existing checked-in students
                                  fetchQueues(exam.id);
                                  setTabValue(1);
                                }}
                              >
                                View Queue
                              </ActionButton>
                            }
                          >
                            <ListItemIcon>
                              <StyledAvatar sx={{ width: 36, height: 36 }} color="primary">
                                <EventIcon />
                              </StyledAvatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {exam.course_code}: {exam.course_name}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {exam.start_time}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </Zoom>
                      ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CalendarTodayIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No exams scheduled for today
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Add a new exam or check upcoming dates
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => setExamDialogOpen(true)}
                    >
                      Create Exam
                    </Button>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledCard elevation={2}>
              <StyledCardHeader 
                avatar={<StyledAvatar color="success"><CheckCircleIcon /></StyledAvatar>}
                title="Recent Activity"
                action={
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="View Report">
                      <IconButton 
                        onClick={handleGenerateReport}
                        disabled={!selectedExam || checkedInStudents.length === 0}
                      >
                        <AssessmentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                      <IconButton onClick={() => selectedExam && fetchQueues(selectedExam)}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              <Divider />
              
              <CardContent sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ p: 3 }}>
                    {[1, 2, 3].map((item) => (
                      <Box key={item} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                      </Box>
                    ))}
                  </Box>
                ) : checkedInStudents.length > 0 ? (
                  <List sx={{ px: 0 }}>
                    {checkedInStudents
                      .slice(0, 5)
                      .map((checkIn, index) => (
                        <Zoom in={true} key={checkIn.id} style={{ transitionDelay: `${100 * index}ms` }}>
                          <ListItem 
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                            }}
                            secondaryAction={
                              <Chip 
                                label={checkIn.check_out_time ? "Checked Out" : "Present"} 
                                color={checkIn.check_out_time ? "default" : "success"}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  borderRadius: '14px',
                                  px: 1
                                }}
                              />
                            }
                          >
                            <ListItemAvatar>
                              {checkIn.check_out_time ? (
                                <StyledAvatar color="warning" sx={{ width: 40, height: 40 }}>
                                  <ExitToAppIcon />
                                </StyledAvatar>
                              ) : (
                                <StyledAvatar color="success" sx={{ width: 40, height: 40 }}>
                                  <CheckIcon />
                                </StyledAvatar>
                              )}
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {checkIn.student_name}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Chip 
                                    label={`Tag #${checkIn.tag_number}`} 
                                    size="small"
                                    sx={{ 
                                      mr: 1, 
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main, 
                                      fontWeight: 600,
                                      borderRadius: '10px',
                                      height: 20
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(checkIn.check_in_time).toLocaleTimeString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </Zoom>
                      ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <AssignmentIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No recent check-ins
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Scan a student QR code to check them in
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, gap: 2 }}>
                <ActionButton 
                  variant="outlined" 
                  size="medium"
                  color="secondary"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setScannerDialogOpen(true)}
                >
                  Scan For Check-in
                </ActionButton>
                <ActionButton 
                  variant="contained" 
                  color="warning" 
                  startIcon={<QrCodeIcon />}
                  onClick={() => setCheckoutScannerOpen(true)}
                >
                  Scan for Checkout
                </ActionButton>
              </Box>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12}>
            <StyledCard elevation={2}>
              <StyledCardHeader 
                avatar={<StyledAvatar color="primary"><EventIcon /></StyledAvatar>}
                title="Upcoming Exams"
                action={
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setExamDialogOpen(true)}
                    sx={{ borderRadius: 8, textTransform: 'none', px: 2 }}
                  >
                    Add New Exam
                  </Button>
                }
              />
              <Divider />
              
              <CardContent sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
                  </Box>
                ) : exams.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="medium" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Course Code</StyledTableCell>
                          <StyledTableCell>Course Name</StyledTableCell>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Time</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exams
                          .filter(exam => new Date(exam.exam_date) >= new Date())
                          .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
                          .slice(0, 5)
                          .map((exam, index) => (
                            <Fade in={true} key={exam.id} style={{ transitionDelay: `${50 * index}ms` }}>
                              <TableRow hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}>
                                <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{exam.course_code}</TableCell>
                                <TableCell>{exam.course_name}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                    {new Date(exam.exam_date).toLocaleDateString()}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                    {exam.start_time}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={exam.is_active ? "Active" : "Inactive"} 
                                    color={exam.is_active ? "success" : "default"}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 600,
                                      borderRadius: '12px',
                                      px: 1
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <ButtonGroup size="small" variant="outlined">
                                    <Tooltip title="View Queue">
                                      <Button
                                        color="secondary"
                                        onClick={() => {
                                          setSelectedExam(exam.id);
                                          fetchQueues(exam.id);
                                          setTabValue(1);
                                        }}
                                        startIcon={<VisibilityIcon />}
                                      >
                                        Queue
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Edit Exam">
                                      <Button
                                        onClick={() => {
                                          setSelectedExamForEdit({...exam});
                                          setEditExamDialogOpen(true);
                                        }}
                                        color="primary"
                                      >
                                        <EditIcon fontSize="small" />
                                      </Button>
                                    </Tooltip>
                                  </ButtonGroup>
                                </TableCell>
                              </TableRow>
                            </Fade>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <EventIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No upcoming exams
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Get started by creating your first exam
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => setExamDialogOpen(true)}
                    >
                      Create Exam
                    </Button>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render exam management tab
  const renderExamsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} color="primary">Exam Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create, edit and manage all your exams in one place.
          </Typography>
        </Box>
        <ActionButton 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setExamDialogOpen(true)}
        >
          Create New Exam
        </ActionButton>
      </Box>
      
      {loading ? (
        <GlassPaper>
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
          </Box>
        </GlassPaper>
      ) : exams.length === 0 ? (
        <GlassPaper sx={{ py: 8, textAlign: 'center' }}>
          <EventIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No exams found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Get started by creating your first exam. You'll be able to manage check-ins, 
            view the queue, and generate reports.
          </Typography>
          <ActionButton 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setExamDialogOpen(true)}
            size="large"
          >
            Create Your First Exam
          </ActionButton>
        </GlassPaper>
      ) : (
        <AnimatedAccordion>
          <Box sx={{ py: 2, px: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <TextField
              placeholder="Search exams by course code or name..."
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                sx: { 
                  borderRadius: 8,
                  backgroundColor: theme.palette.background.paper, 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                }
              }}
            />
          </Box>
          <GlassPaper sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Course Code</StyledTableCell>
                    <StyledTableCell>Course Name</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Time</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams
                    .filter(exam => {
                      if (!searchTerm) return true;
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        exam.course_code.toLowerCase().includes(searchLower) ||
                        exam.course_name.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((exam, index) => (
                      <Fade in={true} key={exam.id} style={{ transitionDelay: `${30 * index}ms` }}>
                        <TableRow hover sx={{ 
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                          cursor: 'pointer'
                        }}>
                          <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{exam.course_code}</TableCell>
                          <TableCell>{exam.course_name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              {exam.start_time}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip 
                              label={exam.is_active ? "Active" : "Inactive"} 
                              status={exam.is_active ? "checked-in" : "absent"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <ButtonGroup variant="outlined" size="small">
                              <Tooltip title="Edit Exam">
                                <Button 
                                  color="primary"
                                  onClick={() => {
                                    setSelectedExamForEdit({...exam});
                                    setEditExamDialogOpen(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                              <Tooltip title="View Queue">
                                <Button 
                                  color="secondary"
                                  onClick={() => {
                                    setSelectedExam(exam.id);
                                    fetchQueues(exam.id);
                                    setTabValue(1);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                              <Tooltip title="Delete Exam">
                                <Button 
                                  color="error"
                                  onClick={() => {
                                    setConfirmAction(() => () => handleDeleteExam(exam.id));
                                    setConfirmData({
                                      title: 'Delete Exam',
                                      message: `Are you sure you want to delete the exam "${exam.course_code}: ${exam.course_name}"? This action cannot be undone.`
                                    });
                                    setConfirmDialogOpen(true);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </Button>
                              </Tooltip>
                            </ButtonGroup>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPaper>
        </AnimatedAccordion>
      )}
    </Box>
  );
  
  // Render queue management tab
  const renderQueueTab = () => {
    const selectedExamData = exams.find(exam => exam.id === selectedExam);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={600} color="primary">Queue Management</Typography>
            {selectedExamData && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                <EventIcon fontSize="small" sx={{ mr: 1 }} />
                {selectedExamData.course_code}: {selectedExamData.course_name} • {new Date(selectedExamData.exam_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Select Exam</InputLabel>
              <Select
                value={selectedExam || ''}
                onChange={(e) => handleExamChange(e.target.value)}
                label="Select Exam"
                sx={{ borderRadius: 2 }}
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.course_code}: {exam.course_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ActionButton 
              variant="contained" 
              color="secondary" 
              startIcon={<QrCodeIcon />}
              onClick={() => setScannerDialogOpen(true)}
            >
              Scan for Check-in
            </ActionButton>
            <ActionButton 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => fetchQueues(selectedExam)}
            >
              Refresh
            </ActionButton>
            <ActionButton
              variant="outlined"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={handleGenerateReport}
              disabled={!selectedExam || checkedInStudents.length === 0}
            >
              Report
            </ActionButton>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={500}>
              <StyledPaper>
                <ColorBar color="#f44336" />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <QueueIcon sx={{ mr: 1 }} color="error" />
                    Students in Queue
                    <Chip 
                      label={queues.length} 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1, fontWeight: 'bold', borderRadius: '12px' }}
                    />
                  </Typography>
                  <Tooltip title="Scan for Check-in">
                    <IconButton 
                      color="primary" 
                      onClick={() => setScannerDialogOpen(true)}
                      sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                    >
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                    <Box sx={{ mt: 2 }}>
                      {[1, 2, 3].map((item) => (
                        <Skeleton 
                          key={item} 
                          variant="rectangular" 
                          height={60} 
                          sx={{ borderRadius: 1, mb: 1 }} 
                        />
                      ))}
                    </Box>
                  </Box>
                ) : queues.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    backgroundColor: alpha(theme.palette.error.main, 0.03),
                    borderRadius: 2
                  }}>
                    <QueueIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No students in queue
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      When students join the queue, they'll appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 320px)' }}>
                    <Table size="medium" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Position</StyledTableCell>
                          <StyledTableCell>Tag #</StyledTableCell>
                          <StyledTableCell>Matric Number</StyledTableCell>
                          <StyledTableCell>Join Time</StyledTableCell>
                          <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {queues.map((queue, index) => (
                          <Zoom in={true} key={queue.id} style={{ transitionDelay: `${50 * index}ms` }}>
                            <TableRow 
                              hover
                              sx={{ 
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                                animation: index < 3 ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { backgroundColor: 'transparent' },
                                  '50%': { backgroundColor: alpha(theme.palette.warning.main, 0.1) },
                                  '100%': { backgroundColor: 'transparent' }
                                }
                              }}
                            >
                              <TableCell>
                                <Chip 
                                  label={index + 1} 
                                  color={index === 0 ? "error" : index < 3 ? "warning" : "default"} 
                                  size="small" 
                                  sx={{ 
                                    fontWeight: 'bold', 
                                    width: 32, 
                                    height: 32,
                                    '& .MuiChip-label': {
                                      padding: 0
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={queue.tag_number} 
                                  color="primary" 
                                  size="small" 
                                  sx={{ fontWeight: 'bold', borderRadius: '12px' }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{queue.username || 'N/A'}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                  {new Date(queue.created_at).toLocaleTimeString()}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <ButtonGroup size="small">
                                  <Tooltip title="Check In">
                                    <Button 
                                      variant="contained"
                                      size="small" 
                                      color="success"
                                      startIcon={<CheckIcon />}
                                      onClick={() => {
                                        setConfirmData({
                                          studentId: queue.student,
                                          examId: queue.exam,
                                          tagNumber: queue.tag_number,
                                          title: 'Check In Student',
                                          message: `Are you sure you want to check in the student with tag number ${queue.tag_number}?`
                                        });
                                        setConfirmAction(() => handleCheckIn);
                                        setConfirmDialogOpen(true);
                                      }}
                                    >
                                      Check In
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Remove from Queue">
                                    <Button 
                                      variant="outlined"
                                      size="small" 
                                      color="error"
                                      onClick={() => {
                                        setConfirmData({
                                          title: 'Remove from Queue',
                                          message: `Are you sure you want to remove the student with tag number ${queue.tag_number} from the queue?`
                                        });
                                        setConfirmAction(() => () => handleRemoveFromQueue(queue.id));
                                        setConfirmDialogOpen(true);
                                      }}
                                      >
                                      <DeleteIcon fontSize="small" />
                                    </Button>
                                  </Tooltip>
                                </ButtonGroup>
                              </TableCell>
                            </TableRow>
                          </Zoom>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </StyledPaper>
            </Grow>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
              <StyledPaper>
                <ColorBar color="#4caf50" />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} color="success" />
                    Checked-In Students
                    <Chip 
                      label={checkedInStudents.length} 
                      color="success" 
                      size="small" 
                      sx={{ ml: 1, fontWeight: 'bold', borderRadius: '12px' }}
                    />
                  </Typography>
                  <Tooltip title="Scan for Checkout">
                    <IconButton 
                      color="warning" 
                      onClick={() => setCheckoutScannerOpen(true)}
                      sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1) }}
                    >
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                    <Box sx={{ mt: 2 }}>
                      {[1, 2, 3].map((item) => (
                        <Skeleton 
                          key={item} 
                          variant="rectangular" 
                          height={60} 
                          sx={{ borderRadius: 1, mb: 1 }} 
                        />
                      ))}
                    </Box>
                  </Box>
                ) : checkedInStudents.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    backgroundColor: alpha(theme.palette.success.main, 0.03),
                    borderRadius: 2
                  }}>
                    <CheckCircleIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No checked-in students
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Students that have been checked in will appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 320px)' }}>
                    <Table size="medium" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Tag #</StyledTableCell>
                          <StyledTableCell>Student ID</StyledTableCell>
                          <StyledTableCell>Check-In Time</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {checkedInStudents.map((checkIn, index) => (
                          <Zoom in={true} key={checkIn.id} style={{ transitionDelay: `${50 * index}ms` }}>
                            <TableRow 
                              hover
                              sx={{ 
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                                backgroundColor: checkIn.check_out_time 
                                  ? alpha(theme.palette.grey[500], 0.1) 
                                  : 'transparent'
                              }}
                            >
                              <TableCell>
                                <Chip 
                                  label={checkIn.tag_number} 
                                  color="success" 
                                  size="small" 
                                  sx={{ fontWeight: 'bold', borderRadius: '12px' }}
                                  variant={checkIn.check_out_time ? "outlined" : "filled"}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{checkIn.student_name}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                  {new Date(checkIn.check_in_time).toLocaleTimeString()}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <StatusChip 
                                  label={checkIn.check_out_time ? "Checked Out" : "Present"} 
                                  status={checkIn.check_out_time ? "absent" : "checked-in"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {!checkIn.check_out_time && (
                                  <ButtonGroup size="small">
                                    <Tooltip title="Check Out">
                                      <Button 
                                        variant="contained"
                                        size="small" 
                                        color="warning"
                                        startIcon={<ExitToAppIcon />}
                                        onClick={() => {
                                          setConfirmData({
                                            title: 'Check Out Student',
                                            message: `Are you sure you want to check out the student with tag number ${checkIn.tag_number}?`
                                          });
                                          setConfirmAction(() => () => handleCheckOut(checkIn.id));
                                          setConfirmDialogOpen(true);
                                        }}
                                      >
                                        Check Out
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Force Checkout">
                                      <Button 
                                        variant="outlined"
                                        size="small" 
                                        color="error"
                                        onClick={async () => {
                                          try {
                                            setLoading(true);
                                            // Direct API call to mark as completed
                                            await api.patch(`/queues/${checkIn.id}/`, {
                                              status: 'completed',
                                              checked_out_at: new Date().toISOString(),
                                              is_active: false
                                            });
                                            
                                            // Update UI
                                            setCheckedInStudents(prev => prev.map(student => 
                                              student.id === checkIn.id 
                                                ? {...student, check_out_time: new Date().toISOString()} 
                                                : student
                                            ));
                                            
                                            setSuccess('Student force checked out successfully!');
                                            fetchQueues(selectedExam);
                                            
                                            // Show report dialog after checkout
                                            setReportDialogOpen(true);
                                          } catch (err) {
                                            console.error('Force checkout error:', err);
                                            setError('Failed to force checkout student.');
                                          } finally {
                                            setLoading(false);
                                          }
                                        }}
                                      >
                                        <CancelIcon fontSize="small" />
                                      </Button>
                                    </Tooltip>
                                  </ButtonGroup>
                                )}
                              </TableCell>
                            </TableRow>
                          </Zoom>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </StyledPaper>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render students tab
  const renderStudentsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} color="primary">Student Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage student profiles and attendance records.
          </Typography>
        </Box>
        <TextField
          placeholder="Search by ID, name or email..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            sx: { 
              borderRadius: 8,
              width: 300
            }
          }}
        />
      </Box>
      
      {loading ? (
        <GlassPaper>
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
          </Box>
        </GlassPaper>
      ) : students.length === 0 ? (
        <GlassPaper sx={{ py: 8, textAlign: 'center' }}>
          <PersonIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            Students are added automatically when they register or check in for an exam.
          </Typography>
        </GlassPaper>
      ) : (
        <GlassPaper>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Student ID</StyledTableCell>
                  <StyledTableCell>Username</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Date Joined</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students
                  .filter(student => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      (student.id && student.id.toString().includes(searchTerm)) ||
                      (student.username && student.username.toLowerCase().includes(searchLower)) ||
                      (student.email && student.email.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((student, index) => (
                    <Fade in={true} key={student.id} style={{ transitionDelay: `${30 * index}ms` }}>
                      <TableRow hover sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>{student.id}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            {new Date(student.date_joined).toLocaleDateString()}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Student Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassPaper>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: '4px 0 10px rgba(0,0,0,0.03)',
          },
        }}
      >
        <DrawerHeader sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Exam Queue Admin
            </Typography>
          </Box>
        </DrawerHeader>
        <Divider />
        <List sx={{ px: 2, pt: 2 }}>
          <ListItem 
            button 
            selected={tabValue === 0}
            onClick={() => setTabValue(0)}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon>
              <StyledAvatar color="primary" sx={{ width: 32, height: 32 }}>
                <DashboardIcon fontSize="small" />
              </StyledAvatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  Dashboard
                </Typography>
              }
            />
          </ListItem>
          <ListItem 
            button 
            selected={tabValue === 1}
            onClick={() => setTabValue(1)}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon>
              <StyledAvatar color="warning" sx={{ width: 32, height: 32 }}>
                <QueueIcon fontSize="small" />
              </StyledAvatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  Queue Management
                </Typography>
              }
            />
            {queues.length > 0 && (
              <Chip 
                label={queues.length} 
                color="warning" 
                size="small"
                sx={{ fontWeight: 'bold', borderRadius: '10px' }}
              />
            )}
          </ListItem>
          <ListItem 
            button 
            selected={tabValue === 2}
            onClick={() => setTabValue(2)}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon>
              <StyledAvatar color="primary" sx={{ width: 32, height: 32 }}>
                <EventIcon fontSize="small" />
              </StyledAvatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  Exams
                </Typography>
              }
            />
            <Chip 
              label={exams.length} 
              color="primary" 
              size="small"
              sx={{ fontWeight: 'bold', borderRadius: '10px' }}
            />
          </ListItem>
          <ListItem 
            button 
            selected={tabValue === 3}
            onClick={() => setTabValue(3)}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon>
              <StyledAvatar color="secondary" sx={{ width: 32, height: 32 }}>
                <PersonIcon fontSize="small" />
              </StyledAvatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  Students
                </Typography>
              }
            />
          </ListItem>
        </List>
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ flexGrow: 1 }} />
        <List sx={{ px: 2, pb: 2 }}>
          <ListItem button onClick={handleLogout} sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <StyledAvatar color="error" sx={{ width: 32, height: 32 }}>
                <LogoutIcon fontSize="small" />
              </StyledAvatar>
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  Logout
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', fontWeight: 500 }}
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTabValue(0);
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Dashboard
                </Link>
                {tabValue === 1 && (
                  <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }} color="text.primary">
                    <QueueIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Queue Management
                  </Typography>
                )}
                {tabValue === 2 && (
                  <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }} color="text.primary">
                    <EventIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Exams
                  </Typography>
                )}
                {tabValue === 3 && (
                  <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }} color="text.primary">
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Students
                  </Typography>
                )}
              </Breadcrumbs>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => {
                    fetchExams();
                    if (selectedExam) fetchQueues(selectedExam);
                  }}
                  sx={{ 
                    mx: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Scan for Check-in">
                <IconButton 
                  onClick={() => setScannerDialogOpen(true)}
                  sx={{ 
                    mr: 1,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                    },
                    color: theme.palette.secondary.main
                  }}
                >
                  <QrCodeIcon />
                </IconButton>
              </Tooltip>
              <ActionButton 
                color="primary" 
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                variant="outlined"
              >
                Logout
              </ActionButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* Empty toolbar to push content below AppBar */}
        
        {/* Tab content */}
        <Container maxWidth="xl">
          {tabValue === 0 && renderDashboardTab()}
          {tabValue === 1 && renderQueueTab()}
          {tabValue === 2 && renderExamsTab()}
          {tabValue === 3 && renderStudentsTab()}
        </Container>
        
        {/* Add Exam Dialog */}
        <Dialog 
          open={examDialogOpen} 
          onClose={() => setExamDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ 
            elevation: 5,
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StyledAvatar color="primary" sx={{ mr: 2 }}>
                <AddIcon />
              </StyledAvatar>
              <Typography variant="h5" component="div" fontWeight={600}>
                Create New Exam
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setExamDialogOpen(false)}
              sx={{ position: 'absolute', right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
              Fill out the form below to create a new exam. All fields are required.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Course Code"
                  fullWidth
                  value={newExam.course_code}
                  onChange={(e) => setNewExam({...newExam, course_code: e.target.value})}
                  required
                  error={!newExam.course_code && error}
                  helperText={!newExam.course_code && error ? "Course code is required" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BookmarkIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Course Name"
                  fullWidth
                  value={newExam.course_name}
                  onChange={(e) => setNewExam({...newExam, course_name: e.target.value})}
                  required
                  error={!newExam.course_name && error}
                  helperText={!newExam.course_name && error ? "Course name is required" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ArticleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Exam Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newExam.exam_date}
                  onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})}
                  required
                  error={!newExam.exam_date && error}
                  helperText={!newExam.exam_date && error ? "Exam date is required" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newExam.start_time}
                  onChange={(e) => setNewExam({...newExam, start_time: e.target.value})}
                  required
                  error={!newExam.start_time && error}
                  helperText={!newExam.start_time && error ? "Start time is required" : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newExam.is_active}
                      onChange={(e) => setNewExam({...newExam, is_active: e.target.checked})}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={500}>Active</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Toggle to enable/disable this exam)
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setExamDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <ActionButton 
              onClick={handleCreateExam} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Create Exam"}
            </ActionButton>
          </DialogActions>
        </Dialog>
        
        {/* Edit Exam Dialog */}
        <Dialog 
          open={editExamDialogOpen} 
          onClose={() => setEditExamDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ 
            elevation: 5,
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StyledAvatar color="primary" sx={{ mr: 2 }}>
                <EditIcon />
              </StyledAvatar>
              <Typography variant="h5" component="div" fontWeight={600}>
                Edit Exam
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setEditExamDialogOpen(false)}
              sx={{ position: 'absolute', right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
              Update the exam details below. All fields are required.
            </Typography>
            
            {selectedExamForEdit && (
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Course Code"
                    fullWidth
                    value={selectedExamForEdit.course_code}
                    onChange={(e) => setSelectedExamForEdit({...selectedExamForEdit, course_code: e.target.value})}
                    required
                    error={!selectedExamForEdit.course_code && error}
                    helperText={!selectedExamForEdit.course_code && error ? "Course code is required" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BookmarkIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Course Name"
                    fullWidth
                    value={selectedExamForEdit.course_name}
                    onChange={(e) => setSelectedExamForEdit({...selectedExamForEdit, course_name: e.target.value})}
                    required
                    error={!selectedExamForEdit.course_name && error}
                    helperText={!selectedExamForEdit.course_name && error ? "Course name is required" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ArticleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Exam Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={selectedExamForEdit.exam_date}
                    onChange={(e) => setSelectedExamForEdit({...selectedExamForEdit, exam_date: e.target.value})}
                    required
                    error={!selectedExamForEdit.exam_date && error}
                    helperText={!selectedExamForEdit.exam_date && error ? "Exam date is required" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={selectedExamForEdit.start_time}
                    onChange={(e) => setSelectedExamForEdit({...selectedExamForEdit, start_time: e.target.value})}
                    required
                    error={!selectedExamForEdit.start_time && error}
                    helperText={!selectedExamForEdit.start_time && error ? "Start time is required" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedExamForEdit.is_active}
                        onChange={(e) => setSelectedExamForEdit({...selectedExamForEdit, is_active: e.target.checked})}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500}>Active</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (Toggle to enable/disable this exam)
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setEditExamDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 8 }}
            >
              Cancel
            </Button>
            <ActionButton 
              onClick={handleEditExam} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save Changes"}
            </ActionButton>
          </DialogActions>
        </Dialog>
        
        {/* QR Scanner Dialogs */}
        <QRScannerDialog
          open={scannerDialogOpen}
          onClose={() => setScannerDialogOpen(false)}
          onScanSuccess={(scannedData) => {
            console.log('Raw QR scan data:', scannedData);
            
            try {
              // Parse the data if it's a string
              let parsedData;
              if (typeof scannedData === 'string') {
                console.log('Parsing string data...');
                parsedData = JSON.parse(scannedData);
              } else {
                parsedData = scannedData;
              }
              
              console.log('Parsed QR data:', parsedData);
              
              // Extract username and exam info with simpler logic
              const username = parsedData.matricNumber || 
                              parsedData.username || 
                              parsedData.studentId;
                              
              const examCode = parsedData.exam_code || 
                              parsedData.examCode || 
                              (selectedExam ? getExamCode(selectedExam) : null);
              
              if (!username) {
                setError('QR code missing student information');
                return;
              }
              
              // Set confirm data
              const confirmDataObj = {
                username: username,
                exam_code: examCode,
              };
              
              console.log('Setting confirm data:', confirmDataObj);
              setConfirmData(confirmDataObj);
              
              // Set the action to handle check-in
              setConfirmAction(() => handleCheckIn);
              
              // Show the confirmation dialog
              setConfirmDialogOpen(true);
            } catch (err) {
              console.error('Error parsing QR data:', err, scannedData);
              setError('Invalid QR code format. Please try again.');
            }
          }}
          title="Scan for Check-in"
          description="Scan student's QR code to check them in"
        />

        <QRScannerDialog
          open={checkoutScannerOpen}
          onClose={() => setCheckoutScannerOpen(false)}
          onScanSuccess={(scanData) => {
            setCheckoutScannerOpen(false);
            handleCheckoutScan(scanData);
          }}
          isCheckout={true}
          availableStudents={checkedInStudents}
          title="Scan for Checkout"
          description="Scan student's QR code to check them out"
        />

{/* Report Dialog */}
<Dialog 
  open={reportDialogOpen} 
  onClose={() => setReportDialogOpen(false)} 
  maxWidth="md" 
  fullWidth
  PaperProps={{ 
    elevation: 5,
    sx: { borderRadius: 3 }
  }}
>
  <DialogTitle sx={{ pb: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <StyledAvatar color="primary" sx={{ mr: 2 }}>
        <AssessmentIcon />
      </StyledAvatar>
      <Typography variant="h5" component="div" fontWeight={600}>
        Attendance Report
      </Typography>
    </Box>
    <IconButton
      aria-label="close"
      onClick={() => setReportDialogOpen(false)}
      sx={{ position: 'absolute', right: 10, top: 10 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <Box sx={{ p: 2 }}>
      {selectedExam && (
        <GlassPaper sx={{ mb: 3, p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BookmarkIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Course Code</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {exams.find(e => e.id === selectedExam)?.course_code}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Course Name</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {exams.find(e => e.id === selectedExam)?.course_name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Exam Date</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {new Date(exams.find(e => e.id === selectedExam)?.exam_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Start Time</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {exams.find(e => e.id === selectedExam)?.start_time}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon color="success" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Students Checked In</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {checkedInStudents.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QueueIcon color="warning" sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Students in Queue</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {queues.length}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </GlassPaper>
      )}
      
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Attendance Summary</Typography>
      
      {checkedInStudents.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Tag #</StyledTableCell>
                <StyledTableCell>Student ID</StyledTableCell>
                <StyledTableCell>Student Name</StyledTableCell>
                <StyledTableCell>Check-In Time</StyledTableCell>
                <StyledTableCell>Check-Out Time</StyledTableCell>
                <StyledTableCell>Duration</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checkedInStudents.map((student, index) => {
                const checkInTime = new Date(student.check_in_time);
                const checkOutTime = student.check_out_time ? new Date(student.check_out_time) : null;
                
                let duration = 'Still present';
                if (checkOutTime) {
                  const durationMs = checkOutTime - checkInTime;
                  const durationMinutes = Math.floor(durationMs / 60000);
                  duration = `${durationMinutes} minutes`;
                }
                
                return (
                  <TableRow 
                    key={student.id} 
                    hover
                    sx={{ 
                      backgroundColor: checkOutTime 
                        ? alpha(theme.palette.grey[500], 0.1) 
                        : 'transparent'
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={student.tag_number} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 'bold', borderRadius: '10px' }}
                        variant={checkOutTime ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{student.student_name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        {checkInTime.toLocaleTimeString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {checkOutTime ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ExitToAppIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                          {checkOutTime.toLocaleTimeString()}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Not checked out
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={duration} 
                        color={checkOutTime ? "default" : "success"}
                        size="small"
                        sx={{ fontWeight: 500, borderRadius: '10px' }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, backgroundColor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
          <AssessmentIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No attendance data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check in students to see attendance information
          </Typography>
        </Box>
      )}
    </Box>
  </DialogContent>
  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button 
      onClick={() => setReportDialogOpen(false)}
      variant="outlined"
      sx={{ borderRadius: 8 }}
    >
      Close
    </Button>
    <ActionButton 
      onClick={handleExportToCSV} 
      variant="outlined" 
      color="primary"
      startIcon={<DownloadIcon />}
      disabled={!checkedInStudents.length}
    >
      Export to CSV
    </ActionButton>
    <ActionButton 
      onClick={handlePrintReport} 
      variant="contained" 
      color="primary"
      startIcon={<PrintIcon />}
      disabled={!checkedInStudents.length}
    >
      Print Report
    </ActionButton>
  </DialogActions>
</Dialog>
          
                 
                  {/* Confirmation Dialog */}
                  <Dialog 
                    open={confirmDialogOpen} 
                    onClose={() => setConfirmDialogOpen(false)}
                    PaperProps={{ 
                      elevation: 5,
                      sx: { borderRadius: 3 }
                    }}
                  >
                    <DialogTitle sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StyledAvatar color={confirmAction === handleCheckIn ? "success" : "warning"} sx={{ mr: 2 }}>
                          {confirmAction === handleCheckIn ? <CheckIcon /> : <WarningIcon />}
                        </StyledAvatar>
                        <Typography variant="h5" component="div" fontWeight={600}>
                          {confirmData?.title || (confirmAction === handleCheckIn ? "Confirm Check-In" : "Confirm Action")}
                        </Typography>
                      </Box>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1 }}>
                      {confirmData?.message ? (
                        <Typography variant="body1" paragraph>
                          {confirmData.message}
                        </Typography>
                      ) : confirmAction === handleCheckIn ? (
                        <>
                          <Typography variant="body1" paragraph>
                            Are you sure you want to check in the following student?
                          </Typography>
                          <Box sx={{ 
                            p: 2, 
                            mb: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Username / Student ID</Typography>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {confirmData?.username || confirmData?.studentId || "N/A"}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">Exam Code</Typography>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {confirmData?.exam_code || "Using selected exam"}
                                </Typography>
                              </Grid>
                              {confirmData?.position && (
                                <Grid item xs={12}>
                                  <Typography variant="caption" color="text.secondary">Queue Position</Typography>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {confirmData.position}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                            <Typography color="text.secondary" variant="body2">
                              A tag number will be generated automatically.
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body1">
                          Are you sure you want to proceed with this action?
                        </Typography>
                      )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                      <Button 
                        onClick={() => setConfirmDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 8 }}
                      >
                        Cancel
                      </Button>
                      <ActionButton 
                        onClick={() => {
                          console.log("Executing confirm action");
                          if (confirmAction) {
                            confirmAction();
                          }
                          setConfirmDialogOpen(false);
                        }} 
                        variant="contained" 
                        color={confirmAction === handleCheckIn ? "success" : "primary"}
                        startIcon={confirmAction === handleCheckIn ? <CheckIcon /> : undefined}
                      >
                        Confirm
                      </ActionButton>
                    </DialogActions>
                  </Dialog>
                  
                  {/* Snackbars for feedback */}
                  <Snackbar 
                    open={!!error} 
                    autoHideDuration={6000} 
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  >
                    <Alert 
                      onClose={() => setError('')} 
                      severity="error" 
                      sx={{ 
                        width: '100%', 
                        borderRadius: 2,
                        alignItems: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        '& .MuiAlert-icon': {
                          fontSize: 28
                        }
                      }}
                      elevation={6}
                      variant="filled"
                    >
                      {error}
                    </Alert>
                  </Snackbar>
                  
                  <Snackbar 
                    open={!!success} 
                    autoHideDuration={6000} 
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  >
                    <Alert 
                      onClose={() => setSuccess('')} 
                      severity="success" 
                      sx={{ 
                        width: '100%', 
                        borderRadius: 2,
                        alignItems: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        '& .MuiAlert-icon': {
                          fontSize: 28
                        }
                      }}
                      elevation={6}
                      variant="filled"
                    >
                      {success}
                    </Alert>
                  </Snackbar>
                  
                  {/* Loading Backdrop */}
                  <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
                    open={loading && (examDialogOpen || editExamDialogOpen || confirmDialogOpen)}
                  >
                    <CircularProgress color="primary" />
                  </Backdrop>
                </Box>
              </Box>
            );
          }
          
          export default AdminDashboard; 