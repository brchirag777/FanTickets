import axios from 'axios';

// Automatically uses VITE_API_URL, or Render production backend, fallback to localhost for local dev
const backendUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5001' : 'https://fantickets.onrender.com');

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true, 
});

export default api;
