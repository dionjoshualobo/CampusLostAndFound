import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getUserData = () => api.get('/auth/user');

// User Profile APIs
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (profileData) => api.put('/users/profile', profileData);
export const changePassword = (passwordData) => api.put('/users/password', passwordData);
export const getUserContact = (userId) => api.get(`/users/contact/${userId}`);

// Items APIs
export const getItems = () => api.get('/items');
export const getItemStats = () => api.get('/items/stats');
export const getItem = (id) => api.get(`/items/${id}`);
export const createItem = (itemData) => api.post('/items', itemData);
export const updateItem = (id, itemData) => api.put(`/items/${id}`, itemData);
export const claimItem = (id, action) => {
  // Map actions to API status values
  const statusValue = action === 'resolve' ? 'resolved' : 'notify';
  
  console.log(`API sending action: "${statusValue}" for item ${id}`);
  
  // Send exactly what the backend expects
  return api.put(`/items/${id}/claim`, { newStatus: statusValue });
};
export const deleteItem = (id) => api.delete(`/items/${id}`);

// Categories APIs
export const getCategories = () => api.get('/categories');

// Comments APIs
export const getItemComments = (itemId) => api.get(`/comments/item/${itemId}`);
export const addComment = (commentData) => api.post('/comments', commentData);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// Notifications APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);

export default api;
