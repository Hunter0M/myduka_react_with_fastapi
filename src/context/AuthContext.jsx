import { createContext, useContext, useState, useEffect } from 'react';
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

  const logout = (message = '') => {
    // Clear all auth data
    localStorage.clear();
    setUser(null);
    
    // Force navigation to login
    window.location.href = '/login'; // Using window.location for hard redirect
  };

  // Add interceptor for token expiration
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if error is 401 (Unauthorized)
        if (error.response?.status === 401) {
          // Clear everything and redirect to login
          localStorage.clear();
          setUser(null);
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired'));
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Add refreshToken function
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

      return data.access_token;
    } catch (error) {
      throw error;
    }
  };

  // Update the token expiration check to attempt refresh
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;

        // If token is expired or about to expire in the next minute
        if (Date.now() >= expirationTime - 60000) {
          try {
            await refreshToken();
          } catch (error) {
            console.error('Token refresh failed:', error);
            logout('Session expired. Please login again.');
          }
        }
      } catch (error) {
        console.error('Token validation error:', error);
        logout('Authentication error. Please login again.');
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, []);

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
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password });
      const { access_token, refresh_token } = data;

      localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, access_token);
      localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, refresh_token);
      localStorage.setItem(TOKEN_CONFIG.USER_EMAIL, email);

      const userResponse = await api.get(`/users/email/${email}`);
      setUser(userResponse.data);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshToken
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