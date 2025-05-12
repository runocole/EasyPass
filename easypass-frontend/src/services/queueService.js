import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

// Join a queue
const joinQueue = async (examId) => {
  try {
    authService.setAuthHeader();
    const user = authService.getCurrentUser();
    
    if (!user || !user.id) {
      throw new Error('User information not available');
    }
    
    const response = await axios.post(`${API_URL}/queues/`, {
      exam: examId,
      student: user.id
    });
    
    return response.data;
  } catch (error) {
    console.error('Error joining queue:', error);
    throw error;
  }
};

// Leave a queue
const leaveQueue = async (queueId) => {
  try {
    authService.setAuthHeader();
    await axios.delete(`${API_URL}/queues/${queueId}/`);
    return true;
  } catch (error) {
    console.error(`Error leaving queue ${queueId}:`, error);
    throw error;
  }
};

// Get queue status for current student
const getStudentQueueStatus = async () => {
  try {
    authService.setAuthHeader();
    const user = authService.getCurrentUser();
    
    if (!user || !user.id) {
      throw new Error('User information not available');
    }
    
    const response = await axios.get(`${API_URL}/queues/?student=${user.id}`);
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('Error fetching queue status:', error);
    throw error;
  }
};

// Get all queues (admin only)
const getAllQueues = async () => {
  try {
    authService.setAuthHeader();
    const response = await axios.get(`${API_URL}/queues/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all queues:', error);
    throw error;
  }
};

// Generate QR code for a tag
const generateQrCode = async (tagId) => {
  try {
    authService.setAuthHeader();
    const response = await axios.post(
      `${API_URL}/generate-qr/`,
      { tag_id: tagId },
      { responseType: 'blob' }
    );
    
    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const queueService = {
  joinQueue,
  leaveQueue,
  getStudentQueueStatus,
  getAllQueues,
  generateQrCode
};

export default queueService;