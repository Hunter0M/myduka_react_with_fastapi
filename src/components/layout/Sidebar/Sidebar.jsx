import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { FiUpload, FiList, FiPackage, FiShoppingCart, FiBarChart2, FiHome, FiX, FiLayout, FiUsers } from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  const handleLinkClick = () => {
    console.log('Link clicked, window width:', window.innerWidth);
    if (window.innerWidth < 1024) {
      console.log('Closing sidebar');
      onClose();
    }
  };

  const navigation = isAuthenticated ? [
    {
      title: 'Main',
      items: [
        { name: 'Home', href: '/', icon: <FiHome className="w-5 h-5" /> },
        { name: 'Dashboard', href: '/dashboard', icon: <FiLayout className="w-5 h-5" /> },
        { name: 'Products', href: '/products', icon: <FiPackage className="w-5 h-5" /> },
        { name: 'Vendors', href: '/vendors', icon: <FiUsers className="w-5 h-5" /> },
        { name: 'Sales', href: '/sales', icon: <FiShoppingCart className="w-5 h-5" /> },
        { name: 'Reports', href: '/reports', icon: <FiBarChart2 className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Data Management',
      items: [
        { name: 'Import Products', href: '/import', icon: <FiUpload className="w-5 h-5" /> },
        { name: 'Import History', href: '/import/history', icon: <FiList className="w-5 h-5" /> },
      ]
    }
  ] : [
    {
      title: 'Main',
      items: [
        { name: 'Home', href: '/', icon: <FiHome className="w-5 h-5" /> },
      ]
    }
  ];

  // Only render the sidebar if isOpen is true
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
        role="presentation"
      />

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform 
        transition-transform duration-200 ease-in-out
        ${isDark ? 'bg-gray-900' : 'bg-white'} border-r
        ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Menu
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <FiX className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
            </button>
          </div>
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-8">
              {navigation.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {section.title}
                  </h3>
                  <div className="mt-3 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        to={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg
                          transition-colors duration-200
                          ${location.pathname === item.href
                            ? isDark
                              ? 'text-white bg-gray-800'
                              : 'text-blue-600 bg-blue-50'
                            : isDark
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                      >
                        <span className="mr-3">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;