import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingBag, FiFileText, FiArrowUp } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const VendorLayout = ({ children }) => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false); // show back to top button

  const navItems = [ // nav items array
    { path: '/vendors', icon: FiUsers, label: 'Vendors' },
    { path: '/vendors/products', icon: FiPackage, label: 'Products' },
    { path: '/vendors/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/vendors/reports', icon: FiFileText, label: 'Reports' },
  ];

  const isActivePath = (path) => location.pathname === path; // check if the current path is the same as the path in the navItems array

  // show back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation Bar */}
      <nav className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b sticky top-0 z-10`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                    ${isActivePath(item.path)
                      ? isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-6`}>
          {children}
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-20 right-8 p-3 rounded-full bg-blue-600 text-white shadow-lg 
                hover:bg-blue-700 transition-all duration-300 z-50"
              aria-label="Back to top"
            >
              <FiArrowUp className="w-6 h-6" />
            </button>
          )}

      {/* Footer */}
      <footer className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-t mt-auto`}>
        <div className="container mx-auto px-4 py-6">
          <p className={`text-center text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © {new Date().getFullYear()} MyDuka Vendor Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VendorLayout; 