import axios from 'axios';

// Create an Axios instance pointing to our backend API URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically runs before every request is sent
API.interceptors.request.use(
  (config) => {
    // Retrieve the JWT token stored during login/registration
    const token = localStorage.getItem('token');
    
    // If a token exists, attach it to the request Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
