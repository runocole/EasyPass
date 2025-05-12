import api from './api';

const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default notificationService;