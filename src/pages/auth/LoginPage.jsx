import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/styles/AuthLayout';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
          window.location.reload(); // Force page refresh
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

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    showMessage('Signing in...', 'info');

    try {
      await login(formData.email, formData.password);
      showMessage('Login successful! Redirecting...', 'success');
    } catch (err) {
      showMessage(
        err.response?.data?.detail || 'Invalid email or password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <button 
            onClick={() => navigate('/register')}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            create a new account
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
            <div className="space-y-2">
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-gray-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage; 