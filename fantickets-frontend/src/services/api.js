import axios from 'axios';

const api = axios.create({
    baseURL: 'https://fantickets.onrender.com', // Your backend port
    withCredentials: true,
});

export default api;
