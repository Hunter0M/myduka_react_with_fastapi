import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      w-full
      ${isDark 
        ? 'bg-gray-900 text-gray-300 border-t border-gray-800' 
        : 'bg-white text-gray-600 border-t border-gray-100'
      }
      mt-auto
      relative
      bottom-0
      left-0
      right-0
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold 
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              MyDuka
            </h3>
            <p className="text-sm">
              Empowering businesses with smart inventory management solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <FaEnvelope className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold 
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-sm hover:text-blue-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/products" className="text-sm hover:text-blue-500 transition-colors">Products</Link></li>
              <li><Link to="/sales" className="text-sm hover:text-blue-500 transition-colors">Sales</Link></li>
              <li><Link to="/reports" className="text-sm hover:text-blue-500 transition-colors">Reports</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold 
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Resources
            </h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-sm hover:text-blue-500 transition-colors">Help Center</Link></li>
              <li><Link to="/documentation" className="text-sm hover:text-blue-500 transition-colors">Documentation</Link></li>
              <li><Link to="/api" className="text-sm hover:text-blue-500 transition-colors">API Reference</Link></li>
              <li><Link to="/status" className="text-sm hover:text-blue-500 transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold 
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="text-sm">Email: support@myduka.com</li>
              <li className="text-sm">Phone: +254 700 000 000</li>
              <li className="text-sm">Address: Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-4 border-t 
          ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
        >
          <p className="text-sm text-center">
            © {currentYear} MyDuka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
