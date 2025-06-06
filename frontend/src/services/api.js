import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Включить логирование в консоль для отладки
const enableLogging = true;

// Перехватчик запросов для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Для FormData не устанавливаем Content-Type, браузер сделает это автоматически с boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    if (enableLogging) {
      console.log('API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data instanceof FormData ? 'FormData...' : config.data
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => {
    if (enableLogging) {
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    if (enableLogging) {
      console.error('API Error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : null,
        request: error.request ? 'Request exists but no response received' : null
      });
    }
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 