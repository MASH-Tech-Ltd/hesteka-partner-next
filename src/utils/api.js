import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storage";
import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer
  ? (process.env.BACKEND_API_URL || "http://localhost:5000/api/v1")
  : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    if (!isServer) {
      const token = getStorageItem('partnerAccessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add language preference to headers
      const lang = getStorageItem('partnerLang') || 'en';
      config.headers['Accept-Language'] = lang;
    }
    
    // Explicitly identify requests as coming from the Partner Dashboard
    config.headers['X-Partner-Dashboard'] = 'true';
    config.headers['X-Requested-From'] = 'web/partner';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, and we are in client browser
    if (!isServer && error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getStorageItem('partnerRefreshToken');

      if (refreshToken) {
        try {
          // Call the refresh token endpoint via proxy
          const res = await axios.post(
            `${baseURL}/auth/generate-access-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                'X-Requested-From': 'web/partner',
                'X-Partner-Dashboard': 'true',
              },
              withCredentials: true,
            }
          );

          if (res.data.status === 'ok') {
            const { accessToken } = res.data.data;
            setStorageItem('partnerAccessToken', accessToken);
            
            // Update the original request's header and retry
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          removeStorageItem('partnerAccessToken');
          removeStorageItem('partnerRefreshToken');
          removeStorageItem('partnerUser');
          window.location.href = '/login';
        }
      } else {
        removeStorageItem('partnerAccessToken');
        removeStorageItem('partnerRefreshToken');
        removeStorageItem('partnerUser');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
