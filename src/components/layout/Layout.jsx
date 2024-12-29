import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Header/Navbar';
import Sidebar from './Sidebar/Sidebar';
import Footer from './Footer/Footer';
import { FiArrowUp } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  // Check if we're on an auth page (login/register)
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Fixed Background for Auth Pages */}
      {isAuthPage && (
        <div className={`fixed inset-0 transition-colors duration-200
          ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} 
        />
      )}

      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative pt-10">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleCloseSidebar} 
          isMobile={isMobile} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1">
            <div className={`${isAuthPage ? 'pt-4' : 'pt-6'} pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto`}>
              <Outlet />
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
        </div>
      </div>

      {/* Footer - Always visible at bottom */}
      <div className="mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Layout; 