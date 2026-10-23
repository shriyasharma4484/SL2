import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sevadeep_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token if 401 returned
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('sevadeep_token');
        localStorage.removeItem('sevadeep_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  switchDemo: (role) => api.post('/auth/demo-switch', { role }),
  updateProfile: (profile) => api.put('/auth/profile', profile)
};

// Issues endpoints
export const issueService = {
  getPublicIssues: (params) => api.get('/issues', { params }),
  getIssueById: (id) => api.get(`/issues/${id}`),
  createIssue: (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleConfirm: (id) => api.post(`/issues/${id}/confirm`),
  addComment: (id, formData) => api.post(`/issues/${id}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, formData) => api.patch(`/issues/${id}/status`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  submitFeedback: (id, data) => api.post(`/issues/${id}/feedback`, data),
  getMyReports: () => api.get('/issues/my-reports'),
  getAssignedToMe: () => api.get('/issues/assigned-to-me'),
  submitVolunteerProgress: (id, formData) => api.post(`/issues/${id}/volunteer-progress`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Events & Volunteer Activities
export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancelRegistration: (id) => api.post(`/events/${id}/cancel`),
  createEvent: (formData) => api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvent: (id, formData) => api.put(`/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  recordAttendance: (id, data) => api.post(`/events/${id}/attendance`, data)
};

// Admin Dashboard endpoints
export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  getAnalytics: () => api.get('/admin/analytics'),
  getIncomingReports: () => api.get('/admin/incoming-reports'),
  getVolunteers: () => api.get('/admin/volunteers'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getComments: () => api.get('/admin/comments'),
  moderateComment: (id, data) => api.patch(`/admin/comments/${id}/moderate`, data)
};

// Social Impact
export const impactService = {
  getStats: () => api.get('/impact')
};

// Notifications
export const notificationService = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

// Civic Impact Intelligence Engine
export const intelligenceService = {
  getMetrics: () => api.get('/intelligence/metrics'),
  getLocations: (params) => api.get('/intelligence/locations', { params }),
  getLocationById: (id) => api.get(`/intelligence/locations/${id}`),
  createIntervention: (data) => api.post('/intelligence/interventions', data),
  completeIntervention: (id, data) => api.patch(`/intelligence/interventions/${id}/complete`, data),
  recordInspection: (data) => api.post('/intelligence/inspections', data)
};

// CivicOps — Intelligent Resource Allocation & Field Coordination Engine
export const civicOpsService = {
  getOverview: () => api.get('/civicops/overview'),
  generatePlans: (data = {}) => api.post('/civicops/generate-plans', data),
  simulateCancellation: (data) => api.post('/civicops/simulate-cancellation', data),
  approvePlan: (data) => api.post('/civicops/approve-plan', data),
  resetScenario: () => api.post('/civicops/reset')
};

export default api;
