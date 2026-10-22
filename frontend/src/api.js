import axios from 'axios';

// Where the Flask backend lives. Set REACT_APP_API_URL in frontend/.env
// (see .env.example). Restart `npm start` after changing it.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// One shared axios instance: every call made with `api` gets this baseURL,
// so components only write the path, e.g. api.get('/transactions').
const api = axios.create({ baseURL: API_URL });

// App registers a function here so a 401 can log the user out of the UI.
// api.js isn't a React component, so it can't touch App's state directly.
let handleUnauthorized = () => {};
export function onUnauthorized(handler) {
  handleUnauthorized = handler;
}

// Runs before every request: attach the saved login token, if there is one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Runs after every response. A 401 on a request that carried a token means the
// token expired or was rejected, so log out. A 401 without a token (e.g. a wrong
// password on the login form) is left alone for that form to show.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && sentToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      handleUnauthorized();
    }
    // Still reject, so the caller's own catch() runs as usual.
    return Promise.reject(error);
  }
);

export default api;
