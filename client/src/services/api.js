import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

// ============ ML SERVICE API (Status & Initialization) ============
export const checkMLHealth = async () => {
    try {
        const response = await api.get('/predictions/health');
        return response.data;
    } catch (error) {
        console.error("ML health check failed:", error.message);
        return { status: "offline" };
    }
};

export const getSymptoms = async () => {
    const response = await api.get('/predictions/symptoms');
    return response.data;
};

// ============ PREDICTION API (Submitting Data) ============

// 1. Symptom Based
export const predictDisease = async (symptoms, userData = {}) => {
    const response = await api.post('/predictions/symptoms', {
        symptoms,
        age: userData.age,
        temperature: userData.temperature,
        bp: userData.bp
    });
    return response.data;
};

// 2. Blood Report Based
export const predictByReport = async (reportData, userData = {}) => {
    const response = await api.post('/predictions/report', {
        report_data: reportData,
        age: userData.age,
        bp: userData.bp
    });
    return response.data;
};

/**
 * 3. X-Ray Based Prediction (NEW)
 * Sends the image file to the /predict-xray endpoint
 */
export const predictByXray = async (imageFile) => {
    // Create FormData object to handle file upload
    const formData = new FormData();
    formData.append('file', imageFile);

    // We override the Content-Type header specifically for this request
    const response = await api.post('/predictions/xray', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ============ HISTORY API (Managing Records) ============
export const getHistory = async () => {
    const response = await api.get('/predictions/history');
    return response.data;
};

export const getPredictionRecord = async (id) => {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
};

export const deletePredictionRecord = async (id) => {
    const response = await api.delete(`/predictions/${id}`);
    return response.data;
};

// ============ AUTH API ============
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export default api;