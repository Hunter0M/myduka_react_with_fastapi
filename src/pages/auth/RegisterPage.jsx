import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiUser, FiMail, FiPhone, FiLock, FiLoader } from 'react-icons/fi';
import api from '../../services/axiosConfig';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showMessage('Please enter your full name', 'error');
      return false;
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showMessage('Please enter a valid email address', 'error');
      return false;
    }

    if (!formData.phone.match(/^\+?1?\d{9,15}$/)) {
      showMessage('Please enter a valid phone number', 'error');
      return false;
    }

    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      showMessage('Passwords do not match', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    showMessage('Creating your account...', 'info');

    try {
      // Register user
      await api.post('/register', formData);
      showMessage('Registration successful! Redirecting to login...', 'success');
      
      // Instead of auto-login, redirect to login page
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email, 
            message: 'Registration successful! Please login.',
            messageType: 'success'
          }
        });
      }, 2000);
      
    } catch (err) {
      if (err.response?.status === 400 && 
          err.response?.data?.detail?.includes('already exists')) {
        showMessage('Account already exists. Redirecting to login...', 'info');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: formData.email, 
              message: 'Account already exists. Please login.' 
            }
          });
        }, 2000);
        return;
      }
      showMessage(err.response?.data?.detail || 'Registration failed', 'error');
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

      <div className="relative w-full max-w-md mx-auto px-4">
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
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Or{' '}
            <Link to="/login" 
              className={`font-medium transition-colors duration-200
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className={`mt-8 p-6 sm:p-8 shadow-xl rounded-xl
          ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
          
          {/* Alert Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'error' 
                ? isDark 
                  ? 'bg-red-900/50 text-red-200 border border-red-800'
                  : 'bg-red-50 text-red-700 border border-red-200'
                : messageType === 'success'
                  ? isDark
                    ? 'bg-green-900/50 text-green-200 border border-green-800'
                    : 'bg-green-50 text-green-700 border border-green-200'
                  : isDark
                    ? 'bg-blue-900/50 text-blue-200 border border-blue-800'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <input
                    name="first_name"
                    type="text"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                      transition-colors duration-200
                      ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                      border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2
                  ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <input
                    name="last_name"
                    type="text"
                    required
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                      transition-colors duration-200
                      ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                      border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Phone number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-2
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}
                    border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg
                text-sm font-medium text-white transition-all duration-200
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'}
                disabled:opacity-50 transform hover:scale-[1.02]`}
            >
              {loading ? (
                <span className="flex items-center">
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>

            {/* Login Link */}
            <p className="text-center">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Already have an account?{' '}
              </span>
              <Link
                to="/login"
                className={`font-medium transition-colors duration-200
                  ${isDark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'}`}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 