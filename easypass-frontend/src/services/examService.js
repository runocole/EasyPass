import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

// Get all exams
const getExams = async () => {
  try {
    authService.setAuthHeader();
    const response = await axios.get(`${API_URL}/exams/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// Get exam by ID
const getExamById = async (examId) => {
  try {
    authService.setAuthHeader();
    const response = await axios.get(`${API_URL}/exams/${examId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam ${examId}:`, error);
    throw error;
  }
};

// Create new exam (admin only)
const createExam = async (examData) => {
  try {
    authService.setAuthHeader();
    const response = await axios.post(`${API_URL}/exams/`, examData);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Update exam (admin only)
const updateExam = async (examId, examData) => {
  try {
    authService.setAuthHeader();
    const response = await axios.put(`${API_URL}/exams/${examId}/`, examData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exam ${examId}:`, error);
    throw error;
  }
};

// Delete exam (admin only)
const deleteExam = async (examId) => {
  try {
    authService.setAuthHeader();
    await axios.delete(`${API_URL}/exams/${examId}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting exam ${examId}:`, error);
    throw error;
  }
};

const examService = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
};

export default examService;