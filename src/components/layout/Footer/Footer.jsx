import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Wave Separator - Made responsive */}
      <div className="relative">
        <svg
          className="w-full h-8 sm:h-12 fill-current text-white"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
        >
          <path d="M0,48L80,40C160,32,320,16,480,16C640,16,800,32,960,37.3C1120,43,1280,37,1360,34.7L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
        </svg>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        {/* Grid Layout - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-16">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">
                  IC
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                InventoryControl
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Empowering businesses with smart inventory solutions for the
              modern world.
            </p>
            {/* Social Icons - Made responsive */}
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="https://www.facebook.com/alrdaey/"
                target="_blank"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center group hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center group hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-500 transition-all duration-300"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/hunter-ahmed-361460243/"
                target="_blank"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links - Responsive spacing */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <Link
                  to="/dashboard"
                  className="group flex items-center text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Dashboard
                </Link>
              </li>
              {/* Add other quick links similarly */}
            </ul>
          </div>

          {/* Support - Responsive spacing */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 relative inline-block">
              Support
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="group flex items-center text-sm sm:text-base text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Help Center
                </a>
              </li>
              {/* Add other support links similarly */}
            </ul>
          </div>

          {/* Contact - Responsive design */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-blue-500"></span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <a
                href="mailto:support@example.com"
                className="group flex items-center space-x-3 p-2 sm:p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm sm:text-base text-gray-400 group-hover:text-white transition-colors duration-300">
                  735mo735@gmail.com
                </span>
              </a>
              <a
                href="tel:+15551234567"
                className="group flex items-center space-x-3 p-2 sm:p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm sm:text-base text-gray-400 group-hover:text-white transition-colors duration-300">
                  +254799911154
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Responsive padding */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            © {currentYear} InventoryControl. All rights reserved by{" "}
            <a
              href="https://www.linkedin.com/in/hunter-ahmed-361460243/"
              target="_blank"
              className="text-blue-500 hover:text-blue-600 transition-colors duration-300"
            >
              Hunter
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
