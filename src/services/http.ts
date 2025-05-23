import axios from 'axios';
import { refreshToken } from './user.services';

const { VITE_API_URL } = import.meta.env;

const http = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    if (error.response && error.response.status == 401 && error.response.data?.message === 'jwt access_token expired') {
      try {
        const response = await refreshToken({ refresh_token: localStorage.getItem('refresh_token') as string });
        const { access_token, refresh_token } = response.data.result;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        originalConfig.headers['Authorization'] = `Bearer ${access_token}`;

        if (originalConfig.data) {
          const parsedData = JSON.parse(originalConfig.data);
          if (parsedData.refresh_token) {
            parsedData.refresh_token = refresh_token;
            originalConfig.data = JSON.stringify(parsedData);
          }
        }
        return http(originalConfig);
      } catch (err: any) {
        if (err.response && err.response.status === 401 && err.response.data?.message === 'jwt refresh_token expired') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default http;
