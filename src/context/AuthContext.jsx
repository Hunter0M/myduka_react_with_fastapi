import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';

const AuthContext = createContext({});

const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_EMAIL: 'user_email'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshIntervalRef = useRef(null);

  const logout = (message = '') => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    localStorage.clear();
    setUser(null);
    navigate('/login', { state: { message } });
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN);
      if (!refresh) throw new Error('No refresh token');

      const { data } = await api.post('/refresh', {
        refresh_token: refresh
      });

      localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, data.refresh_token);
      }

      console.log('Token refreshed at:', new Date().toLocaleTimeString());
      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout('Session expired. Please login again.');
      throw error;
    }
  };

  // Set up refresh interval when user is logged in
  useEffect(() => {
    const startTokenRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshToken().catch(console.error);

      refreshIntervalRef.current = setInterval(() => {
        refreshToken().catch(console.error);
      }, 60000);
    };

    if (user) {
      startTokenRefresh();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user]);

  // Add request interceptor to include token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(requestInterceptor);
  }, []);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
        const email = localStorage.getItem(TOKEN_CONFIG.USER_EMAIL);

        if (!token || !email) {
          setLoading(false);
          return;
        }

        const response = await api.get(`/users/email/${email}`);
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        logout('Authentication failed. Please login again.');
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, data.access_token);
      localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, data.refresh_token);
      localStorage.setItem(TOKEN_CONFIG.USER_EMAIL, email);

      const userResponse = await api.get(`/users/email/${email}`);
      setUser(userResponse.data);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const checkIsTokenValid = () => {
    const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch (error) {
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    checkIsTokenValid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};