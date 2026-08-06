import axios from 'axios';

// Change this to your deployed backend URL when you deploy to Render
const API_BASE_URL = 'https://prodesk-capstone-taskmatrix-1-r4qu.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export default api;
