import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/axiosConfig';
import AuthLayout from '../../components/styles/AuthLayout';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const inputClasses = "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm";

  return (
    <AuthLayout>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button 
            onClick={() => navigate('/login')}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            sign in to your existing account
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100/50 sm:rounded-lg sm:px-10 
          border border-gray-100">
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg relative ${
              messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
              messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`} role="alert">
              <span className="block text-sm font-medium">{message}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <div className="grid grid-cols-1 gap-y-2">
                <div className="grid grid-cols-2 gap-x-2">
                  <input
                    name="first_name"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                      border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      transition-colors duration-200"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  <input
                    name="last_name"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                      border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      transition-colors duration-200"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>

                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                    border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors duration-200"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />

                <input
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                    border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors duration-200"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                    border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <input
                  name="confirm_password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border 
                    border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none 
                    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                    transition-colors duration-200"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border 
                  border-transparent text-sm font-medium rounded-md text-white 
                  bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
                  transition-all duration-200 ease-in-out
                  transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Register'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage; 