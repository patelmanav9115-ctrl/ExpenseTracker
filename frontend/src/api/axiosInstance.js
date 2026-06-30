import axios from 'axios';

// Use the environment variable if it exists, otherwise use the live Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://expense-tracker-api-m8dv.onrender.com';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Send cookies automatically
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Auto-logout or refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise(function(resolve, reject) {
          axios.post(`${API_URL}/api/users/refresh`, {}, { withCredentials: true })
            .then(() => {
              // The backend will set the new token as an HttpOnly cookie
              processQueue(null, null);
              resolve(axiosInstance(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              localStorage.removeItem('user');
              if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
              }
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else {
        // TOKEN_INVALID or no token, clear and logout
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
