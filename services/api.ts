import axios from 'axios';

// Dynamic API URL for Vercel/Production vs Localhost
const getBaseUrl = () => {
  // If we are in a Vite environment
  if ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  // Fallback for local development
  return 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopgenius_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Transform _id to id and Handle Errors
api.interceptors.response.use(
  (response) => {
    // Helper to recursively transform _id to id
    const transformData = (data: any): any => {
      if (Array.isArray(data)) {
        return data.map(transformData);
      }
      if (data && typeof data === 'object') {
        if (data._id) {
          data.id = data._id;
          delete data._id;
        }
        for (const key in data) {
          data[key] = transformData(data[key]);
        }
      }
      return data;
    };

    if (response.data) {
        response.data = transformData(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401
      localStorage.removeItem('shopgenius_token');
      // Optional: Redirect to login, but handle carefully to avoid loops
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);