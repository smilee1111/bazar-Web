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

export default axiosInstance;