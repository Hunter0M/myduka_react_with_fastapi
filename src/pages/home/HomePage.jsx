import React from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiTruck,
  FiPieChart,
  FiGlobe,
  FiServer,
  FiClock,
  FiUsers,
  FiZap,
  FiCheck,
  FiAward,
  FiShield,
  FiHeart,
  FiDownload,
  FiStar,
} from "react-icons/fi";
import inventoryImage from "../../assets/inventory-management.svg";
import { motion } from "framer-motion"; // npm install framer-motion
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    }`}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="space-y-8 transform transition-all duration-500 hover:translate-y-[-8px]">
              {/* Badge */}
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${
                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
              } shadow-sm`}>
                <span className="mr-2">✨</span>
                <span>Smart Inventory Solution</span>
              </div>

              {/* Headings */}
              <div className="space-y-4">
                <h1 className={`text-4xl tracking-tight font-extrabold ${
                  isDark ? 'text-white' : 'text-gray-900'
                } sm:text-5xl md:text-6xl`}>
                  <span className="block">Transform Your</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                    Inventory Management
                  </span>
                </h1>
                <p className={`mt-3 text-base ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                } sm:mt-5 sm:text-xl lg:text-lg xl:text-xl leading-relaxed`}>
                  Streamline your operations, boost efficiency, and make
                  data-driven decisions with our powerful inventory management
                  system.
                </p>
              </div>

              {/* CTA Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Get Started Free
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-600 text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Features List */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-xl ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-blue-50'
                    } transition-colors duration-200 shadow-sm`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${
                      isDark 
                        ? 'bg-blue-900 text-blue-300' 
                        : 'bg-blue-100 text-blue-600'
                    } flex items-center justify-center`}>
                      {feature.icon}
                    </div>
                    <p className={`text-base ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    } font-medium`}>
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className={`relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } p-4`}>
              <div className="relative block w-full rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105">
                <img
                  className="w-full"
                  src={inventoryImage}
                  alt="Inventory Management System"
                />
                {/* Floating Elements */}
                <div className={`absolute top-4 right-0 ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500'
                } text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg`}>
                  Pro
                </div>
                <div className={`absolute bottom-4 left-4 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } rounded-xl shadow-lg p-4`}>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Live Updates
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Trust Badges Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center p-4 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-sm`}
            >
              <div className={`w-12 h-12 rounded-full ${
                isDark 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-blue-100 text-blue-600'
              } flex items-center justify-center mb-3`}>
                {badge.icon}
              </div>
              <h3 className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {badge.title}
              </h3>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } text-center mt-1`}>
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-2xl ${
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-blue-50'
                } transition-colors duration-200`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-14 h-14 rounded-xl ${
                    isDark 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-100 text-blue-600'
                  } flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-3xl font-extrabold ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-400 to-blue-300' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-400'
                } bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Testimonials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Trusted by Industry Leaders
          </h2>
          <div className="flex justify-center mt-4 space-x-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <p className={`mt-4 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of satisfied customers worldwide
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-white hover:bg-gray-50'
              } p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                  <h4 className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {testimonial.name}
                  </h4>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {testimonial.position}
                  </p>
                </div>
              </div>
              <p className={`italic ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} py-16`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-8 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className={`group ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-100'
                } rounded-lg p-4`}
              >
                <summary className={`flex justify-between items-center font-medium cursor-pointer list-none ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <span>{faq.question}</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shape-rendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className={`mt-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-3xl md:text-4xl font-bold  mb-4 ${
          isDark ? 'text-white' : 'text-gray-700'
        }`}>
          Ready to Transform Your Inventory Management?
        </h2>
        <p className={`${
          isDark ? 'text-blue-200' : 'text-blue-600'
        } mb-8 max-w-2xl mx-auto text-lg`}>
          Join thousands of businesses that trust our platform for their
          inventory needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className={`group px-8 py-3 mb-6 ${
              isDark 
                ? 'bg-white text-blue-800 hover:bg-gray-100' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            } rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center`}
          >
            Start Free Trial
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            to="/contact"
            className={`group px-8 py-3 mb-6 ${
              isDark 
                ? 'bg-white text-blue-800 hover:bg-gray-100' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            } rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center`}
          >
            Schedule Demo
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

const features = [
  { text: "Real-time inventory tracking", icon: <FiBox className="w-6 h-6" /> },
  { text: "Automated reorder points", icon: <FiTruck className="w-6 h-6" /> },
  {
    text: "Advanced analytics & reporting",
    icon: <FiPieChart className="w-6 h-6" />,
  },
  { text: "Multi-location support", icon: <FiGlobe className="w-6 h-6" /> },
];

const stats = [
  { value: "99.9%", label: "Uptime", icon: <FiServer className="w-6 h-6" /> },
  { value: "24/7", label: "Support", icon: <FiClock className="w-6 h-6" /> },
  {
    value: "100K+",
    label: "Products Tracked",
    icon: <FiBox className="w-6 h-6" />,
  },
  { value: "50+", label: "Integrations", icon: <FiZap className="w-6 h-6" /> },
];

// New constants for testimonials and pricing
const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Operations Manager",
    quote:
      "This system has revolutionized how we manage our inventory. The real-time tracking is a game-changer.",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Michael Chen",
    position: "Supply Chain Director",
    quote:
      "The analytics capabilities have helped us reduce waste by 30% and optimize our stock levels.",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Emma Davis",
    position: "Retail Manager",
    quote:
      "Customer service is outstanding. The team is always there when we need support.",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "29",
    features: [
      "Up to 1,000 products",
      "Basic analytics",
      "Email support",
      "1 user account",
    ],
  },
  {
    name: "Professional",
    price: "99",
    features: [
      "Up to 10,000 products",
      "Advanced analytics",
      "24/7 support",
      "5 user accounts",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "299",
    features: [
      "Unlimited products",
      "Custom analytics",
      "Dedicated support",
      "Unlimited users",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

// New constants
const trustBadges = [
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Secure & Reliable",
    description: "Bank-grade security for your data",
  },
  {
    icon: <FiHeart className="w-6 h-6" />,
    title: "Customer First",
    description: "24/7 dedicated support",
  },
  {
    icon: <FiDownload className="w-6 h-6" />,
    title: "Easy Setup",
    description: "Up and running in minutes",
  },
  {
    icon: <FiAward className="w-6 h-6" />,
    title: "Industry Leader",
    description: "Award-winning platform",
  },
];

const faqs = [
  {
    question: "How long does it take to set up?",
    answer:
      "Our platform can be set up in as little as 15 minutes. Our intuitive interface and step-by-step guide make it easy to get started.",
  },
  {
    question: "Can I import my existing inventory data?",
    answer:
      "Yes! We support imports from Excel, CSV, and most major inventory management systems.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "We offer a 14-day free trial with full access to all features, no credit card required.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide 24/7 email and chat support for all plans, with dedicated phone support for Enterprise customers.",
  },
];

export default HomePage;
