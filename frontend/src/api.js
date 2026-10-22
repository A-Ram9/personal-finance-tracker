import axios from 'axios';

// Where the Flask backend lives. Set REACT_APP_API_URL in frontend/.env
// (see .env.example). Restart `npm start` after changing it.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// One shared axios instance: every call made with `api` gets this baseURL,
// so components only write the path, e.g. api.get('/transactions').
const api = axios.create({ baseURL: API_URL });

// Runs before every request sent through `api`.
api.interceptors.request.use((config) => {
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
  return config;
});

export default api;
