import axios from 'axios';
import { getAuthToken } from '../cookie';
import { API_CONFIG } from './config';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

const axiosInstance = axios.create(
    {
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        }
    }
);

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if(token && config.headers){
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Debug: log outgoing requests to help diagnose 404s in browser
        try{
            const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
            // eslint-disable-next-line no-console
            console.debug('[API Request]', config.method?.toUpperCase(), fullUrl);
        }catch(e){/* ignore */}
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle rate limiting (429)
        if (error.response?.status === 429) {
            // eslint-disable-next-line no-console
            console.warn('[API Rate Limit]', error.response.data?.message || 'Too many requests');
            // Don't crash - return a proper error that can be handled
            return Promise.reject(error);
        }

        // Handle authentication errors (401)
        if (error.response?.status === 401) {
            // eslint-disable-next-line no-console
            console.warn('[API Auth Error]', 'Token expired or invalid');
            // Clear auth and redirect to login on client-side pages
            if (typeof window !== 'undefined') {
                try {
                    // Only redirect if we're not already on a public page
                    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                        window.location.href = '/login';
                    }
                } catch (e) {
                    // Ignore errors during redirect
                }
            }
            return Promise.reject(error);
        }

        // Handle server errors (5xx)
        if (error.response?.status >= 500) {
            // eslint-disable-next-line no-console
            console.error('[API Server Error]', error.response.status, error.response.data?.message || 'Server error');
            return Promise.reject(error);
        }

        // Handle network errors
        if (!error.response) {
            // eslint-disable-next-line no-console
            console.error('[API Network Error]', error.message);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;