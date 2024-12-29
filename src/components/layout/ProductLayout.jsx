import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "./Header/Navbar";
import Footer from "./Footer/Footer";
import Sidebar from "./Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { FiArrowUp } from 'react-icons/fi';

const ProductLayout = ({ children }) => {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);


  // Close sidebar on larger screens when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Main Content with Sidebar */}

      {/* Sidebar - Only show if authenticated */}
      {isAuthenticated && (
        <div
          className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 lg:static`}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-200 ${
          isAuthenticated ? "" : ""
        }`}
      >
        <div className="p-4 mt-16">{children}</div>
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
      <Footer />
    </div>
  );
};

export default ProductLayout;
