import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { FiUpload, FiChevronDown } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Separate protected and public navigation
  const protectedNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/products' },
    { name: 'Sales', href: '/sales' },
    { name: 'Reports', href: '/reports' },
  ];

  // Choose which navigation items to show based on authentication status
  const navigation = isAuthenticated ? protectedNavigation : [];

  // Add this function to handle click outside
  const handleClickOutside = () => {
    setIsImportOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-40 transition-colors duration-200
      ${isDark ? 'bg-gray-800' : 'bg-blue-600'}`}>
      <div className="px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-white hover:bg-blue-700 focus:outline-none lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo and Home Link */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">IC</span>
              </div>
              <span className="text-white text-lg font-semibold hidden sm:block">InventoryControl</span>
            </Link>



            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                  ${location.pathname === '/'
                    ? 'text-white bg-blue-700'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                  }`}
              >
                Home
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                    flex items-center 
                    ${location.pathname === item.href
                      ? 'text-white bg-blue-700'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700'
                    }`}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}

              {/* Import Dropdown */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsImportOpen(!isImportOpen)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                      flex items-center space-x-1
                      ${location.pathname.startsWith('/import')
                        ? 'text-white bg-blue-700'
                        : 'text-blue-100 hover:text-white hover:bg-blue-700'
                      }`}
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>Import</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 
                      ${isImportOpen ? 'transform rotate-180' : ''}`} 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isImportOpen && (
                    <>
                      {/* Invisible overlay to handle clicking outside */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={handleClickOutside}
                      />
                      
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                          <Link
                            to="/import"
                            onClick={() => setIsImportOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Import Products
                          </Link>
                          <Link
                            to="/import/history"
                            onClick={() => setIsImportOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Import History
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg text-white 
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-700'}
                focus:outline-none focus:ring-2 focus:ring-blue-400 
                focus:ring-offset-2 transition-colors duration-200`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 