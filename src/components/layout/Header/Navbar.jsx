import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { FiUpload, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const protectedNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/products' },
    { name: 'Vendors', href: '/vendors' },
    { name: 'Sales', href: '/sales' },
    { name: 'Reports', href: '/reports' },
  ];

  const navigation = isAuthenticated ? protectedNavigation : [];

  const handleClickOutside = () => {
    setIsImportOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-colors duration-200
      ${isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
      <div className="px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg ${
                isDark 
                  ? 'text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              } focus:outline-none lg:hidden`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo and Home Link */}
            <Link to="/" className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}>
                <span className="text-white text-lg font-bold">MD</span>
              </div>
              <span className={`text-lg font-semibold hidden sm:block
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                MyDuka
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                    ${location.pathname === item.href
                      ? isDark 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-900'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200
                ${isDark
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200
                    ${isDark
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 
                    ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-20
                      ${isDark ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'}`}>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className={`flex items-center px-4 py-2 text-sm
                            ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <FiUser className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className={`flex items-center px-4 py-2 text-sm
                            ${isDark
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <FiSettings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={logout}
                          className={`w-full flex items-center px-4 py-2 text-sm
                            ${isDark
                              ? 'text-red-400 hover:bg-gray-700'
                              : 'text-red-600 hover:bg-gray-100'
                            }`}
                        >
                          <FiLogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : ( 
              // login and register buttons
              <div className="flex items-center space-x-2">
                {location.pathname !== '/login' && ( // check if the current path is not the login page
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isDark
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isDark
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    Register
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 