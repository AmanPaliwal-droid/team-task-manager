import axios from 'axios';

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

/* =========================
   AUTH API
========================= */

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),

  login: (data) => API.post('/auth/login', data),

  getMe: () => API.get('/auth/me'),
};

/* =========================
   PROJECT API
========================= */

export const projectAPI = {
  list: () => API.get('/projects'),

  get: (id) => API.get(`/projects/${id}`),       // used by ProjectContext.fetchProject
  getById: (id) => API.get(`/projects/${id}`),   // alias kept for compatibility

  create: (data) =>
    API.post('/projects', data),

  update: (id, data) =>
    API.put(`/projects/${id}`, data),

  delete: (id) =>
    API.delete(`/projects/${id}`),

  addMember: (projectId, userId) =>
    API.post(`/projects/${projectId}/members`, { userId }),

  removeMember: (projectId, userId) =>
    API.delete(`/projects/${projectId}/members/${userId}`),
};

/* =========================
   TASK API
========================= */

export const taskAPI = {
  list: () => API.get('/tasks'),

  myTasks: () => API.get('/tasks/my'),

  getById: (id) =>
    API.get(`/tasks/${id}`),

  create: (data) =>
    API.post('/tasks', data),

  update: (id, data) =>
    API.put(`/tasks/${id}`, data),

  delete: (id) =>
    API.delete(`/tasks/${id}`),
};