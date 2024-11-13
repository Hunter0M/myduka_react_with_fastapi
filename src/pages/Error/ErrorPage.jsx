import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi';

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl px-8 py-16 text-center relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-8 left-1/3 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* 404 Large Text */}
        <div className="relative">
          <h1 className="text-[150px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none mb-8">
            404
          </h1>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full">
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-16 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full animate-equalize"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for seems to have vanished into the digital void.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
            <div className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-purple-500 opacity-30 group-hover:rotate-90 ease"></div>
            <span className="relative flex items-center gap-2">
              <HiOutlineHome className="w-5 h-5" />
              Return Home
            </span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center px-8 py-3 font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl overflow-hidden border border-gray-200 hover:bg-gray-50"
          >
            <span className="relative flex items-center gap-2 text-gray-700">
              <HiOutlineArrowLeft className="w-5 h-5" />
              Go Back
            </span>
          </button>
        </div>

        {/* Support Link */}
        <div className="mt-12">
          <a
            href="mailto:735mo735@gmail.com"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 transition-colors duration-200"
          >
            <span>Need help? Contact support</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;