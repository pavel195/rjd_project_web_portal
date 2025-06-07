import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Token ${token}`;
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/users/me/');
      console.log('Получены данные пользователя:', response.data);
      
      // Обеспечиваем, что у пользователя всегда есть роль
      const userData = {
        ...response.data,
        // Если роль не определена, устанавливаем роль по умолчанию для тестирования
        role: response.data.role || 'administration'
      };
      
      console.log('Установлены данные пользователя:', userData);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      logout();
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/token/login/', {
        username,
        password,
      });
      const { auth_token } = response.data;
      localStorage.setItem('token', auth_token);
      api.defaults.headers.Authorization = `Token ${auth_token}`;
      await fetchUserData();
      return true;
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      setError('Неверное имя пользователя или пароль');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 