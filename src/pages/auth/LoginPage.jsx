import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState(
    location.state?.messageType || 'info'
  );

  useEffect(() => {
    // Check token expiration every minute
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Decode the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // If token is expired or about to expire in the next minute
        if (currentTime >= expirationTime - 60000) { // 60000ms = 1 minute
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.setItem('authMessage', 'Session error. Please log in again.');
        window.location.reload();
      }
    };

    // Check immediately and then every minute
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    if (type !== 'error') {
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  useEffect(() => {
    if (location.state?.message) {
      showMessage(location.state.message, location.state.messageType || 'info');
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      sessionStorage.setItem('authSuccess', 'Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      showMessage('Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`} />
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20
          ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`} />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center
              ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <span className="text-white text-2xl font-bold">IC</span>
            </div>
          </div>
          <h2 className={`mt-6 text-3xl font-bold tracking-tight
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Or{' '}
            <Link to="/register" 
              className={`font-medium transition-colors duration-200
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
              create a new account
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className={`p-6 sm:p-8 shadow-xl rounded-xl
          ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
          
          {/* Alert Messages */}
          {(error || message) && (
            <div className={`p-4 rounded-lg ${
              messageType === 'error' 
                ? isDark 
                  ? 'bg-red-900/50 text-red-200 border border-red-800'
                  : 'bg-red-50 text-red-700 border border-red-200'
                : isDark
                  ? 'bg-blue-900/50 text-blue-200 border border-blue-800'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <p className="text-sm font-medium">{error || message}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className={`text-sm font-medium transition-colors duration-200
                  ${isDark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'}`}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg
                text-sm font-medium text-white transition-all duration-200
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}
                disabled:opacity-50 transform hover:scale-[1.02]`}
            >
              {loading ? (
                <span className="flex items-center">
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 