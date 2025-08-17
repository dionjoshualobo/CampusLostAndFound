import axios from 'axios';

// Use environment-specific API URL
const API_URL = import.meta.env.PROD 
  ? '/api'  // Production: use relative path for Vercel routing
  : 'http://localhost:5000/api';  // Development: use localhost

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
export const createItem = (itemData) => {
  // Check if itemData contains a file (image)
  if (itemData.image) {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(itemData).forEach(key => {
      if (itemData[key] !== null && itemData[key] !== undefined) {
        formData.append(key, itemData[key]);
      }
    });
    
    // Use multipart/form-data content type
    return api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } else {
    // Regular JSON request
    return api.post('/items', itemData);
  }
};
export const updateItem = (id, itemData) => api.put(`/items/${id}`, itemData);
export const claimItem = (id, action) => {
  // Map actions to API status values
  const statusValue = action === 'resolve' ? 'resolved' : 'notify';
  
  // Send exactly what the backend expects
  return api.put(`/items/${id}/claim`, { newStatus: statusValue });
};
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const deleteItemImage = (itemId, imageId) => api.delete(`/items/${itemId}/images/${imageId}`);

// Categories APIs
export const getCategories = () => api.get('/categories');

// Comments APIs
export const getItemComments = (itemId) => api.get(`/comments/item/${itemId}`);
export const addComment = (commentData) => api.post('/comments', commentData);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// Notifications APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;
