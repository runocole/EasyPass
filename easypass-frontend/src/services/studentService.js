import api from './api';

const getCurrentStudent = async () => {
  try {
    // Update this URL to match your backend endpoint
    const response = await api.get('/api/students/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current student:', error);
    throw error;
  }
};

const studentService = {
  getCurrentStudent
};

export default studentService;