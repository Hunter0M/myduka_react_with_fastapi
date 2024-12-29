import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loading from '../../components/loading/Loading';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/axiosConfig';
import { eventEmitter } from '../../utils/eventEmitter';

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [product, setProduct] = useState({
    product_name: "",
    description: "",
    stock_quantity: 0,
    product_price: 0,
    selling_price: 0,
    image_url: "",
    created_at: "",
    updated_at: "",
    vendor: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formDataToSend = new FormData();
      
      // Append all required fields from existing product data
      formDataToSend.append('product_name', product.product_name);
      formDataToSend.append('product_price', product.product_price);
      formDataToSend.append('selling_price', product.selling_price);
      formDataToSend.append('stock_quantity', product.stock_quantity);
      formDataToSend.append('vendor_id', product.vendor_id);
      
      // Append optional fields if they exist
      if (product.description) {
        formDataToSend.append('description', product.description);
      }
      
      // Append the new image
      formDataToSend.append('image', file);

      const response = await api.put(
        `/products/${product.id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        // Show success message
        eventEmitter.emit('showNotification', {
          type: 'success',
          message: 'Image updated successfully'
        });

        // Add a small delay before refreshing to ensure the notification is visible
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.detail?.[0]?.msg || 'Failed to upload image';
      setUploadError(errorMessage);
      eventEmitter.emit('showNotification', {
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading product details..." fullScreen />;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f8fafc]'} flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300`}>
          <div className="text-center">
            <div className={`inline-flex p-4 ${isDark ? 'bg-red-900/50' : 'bg-red-100'} rounded-full mb-4`}>
              <svg className={`w-12 h-12 ${isDark ? 'text-red-400' : 'text-red-500'} animate-bounce`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{error}</h3>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 inline-flex items-center px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Return to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Floating Header */}
        <div className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-12 sticky top-4 z-10`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className={`p-2 ${isDark ? 'text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'} rounded-xl transition-colors duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {product.product_name}
              </h1>
            </div>
            <button
              onClick={() => navigate(`/products/edit/${id}`)}
              className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Product
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Section */}
          <div className="lg:col-span-1 p-4">
            <div className={`
              ${isDark ? 'bg-gray-800/90' : 'bg-white'} 
              rounded-3xl 
              shadow-lg 
              overflow-hidden 
              transform 
              hover:scale-[1.02] 
              transition-all 
              duration-300 
              hover:shadow-2xl
              border
              ${isDark ? 'border-gray-700' : 'border-gray-100'}
            `}>
              <div className="aspect-square relative group cursor-pointer">
                {product.image_url ? (
                  <>
                    {/* Main Image */}
                    <img
                      src={`${BACKEND_URL}${product.image_url}`}
                      alt={product.product_name}
                      className="w-full h-full object-cover transition-all duration-500 
                               group-hover:scale-110 group-hover:rotate-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {/* Zoom Icon */}
                      <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full 
                                    transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <svg 
                          className="w-5 h-5 text-gray-700" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                      
                      {/* Product Name on Hover */}
                      <div className="absolute bottom-4 left-4 right-16 transform translate-y-4 
                                    group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-medium truncate text-sm">
                          {product.product_name}
                        </h3>
                      </div>
                    </div>
                  </>
                ) : (
                  // No Image Placeholder
                  <div className={`
                    w-full h-full 
                    flex flex-col items-center justify-center 
                    ${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-gray-100'} 
                    p-8
                    animate-pulse
                  `}>
                    <div className={`
                      p-6 rounded-full mb-4
                      ${isDark ? 'bg-gray-600/50' : 'bg-gray-200/70'}
                    `}>
                      <svg 
                        className={`w-16 h-16 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="1.5" 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                    <p className={`
                      text-sm font-medium
                      ${isDark ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      No image available
                    </p>
                    <p className={`
                      text-xs mt-2
                      ${isDark ? 'text-gray-500' : 'text-gray-400'}
                    `}>
                      Click to upload an image
                    </p>
                  </div>
                )}
                
                {/* Image Status Badge */}
                <div className={`
                  absolute top-4 left-4 
                  px-3 py-1.5 
                  rounded-full 
                  text-xs font-medium
                  ${product.image_url 
                    ? isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-700'
                    : isDark ? 'bg-yellow-900/60 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                  }
                  backdrop-blur-sm
                `}>
                  {product.image_url ? 'Image Available' : 'No Image'}
                </div>
              </div>
            </div>

            {/* Image Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="imageUpload"
                className={`
                  px-4 py-2 
                  rounded-xl 
                  text-sm font-medium 
                  flex items-center gap-2
                  transition-all duration-200
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                  }
                  border
                  ${isDark ? 'border-gray-700' : 'border-gray-200'}
                  hover:shadow-md
                `}
              >
                {isUploading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload New Image
                  </>
                )}
              </label>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className={`
                mt-2 p-2 rounded-lg text-sm
                ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}
              `}>
                {uploadError}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Description</h3>
              </div>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-base`}>
                {product.description || "No description available"}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stock Card */}
              <div className={`${isDark ? 'bg-blue-900' : 'bg-gradient-to-br from-[#0EA5E9] to-[#0369A1]'} rounded-3xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 relative group`}>
                <div className="absolute inset-0 bg-black/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <svg className="w-6 h-6 text-[#F0F9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#F0F9FF] tracking-wider uppercase">Stock</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-4xl font-extrabold text-white tracking-tight">
                      {product.stock_quantity}
                      <span className="text-sm font-medium text-[#E0F2FE] ml-2">units</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Buy Price Card */}
              <div className={`${isDark ? 'bg-indigo-900' : 'bg-gradient-to-br from-[#4F46E5] to-[#3730A3]'} rounded-3xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 relative group`}>
                <div className="absolute inset-0 bg-black/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <svg className="w-6 h-6 text-[#E0E7FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#E0E7FF] tracking-wider uppercase">Buy Price</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-extrabold text-white tracking-tight">
                      KES {Number(product.product_price).toLocaleString()}
                      <span className="text-sm font-medium text-[#C7D2FE] ml-2">per unit</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Sell Price Card */}
              <div className={`${isDark ? 'bg-pink-900' : 'bg-gradient-to-br from-[#DB2777] to-[#9D174D]'} rounded-3xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 relative group`}>
                <div className="absolute inset-0 bg-black/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <svg className="w-6 h-6 text-[#FCE7F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-[#FCE7F3] tracking-wider uppercase">Sell Price</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-extrabold text-white tracking-tight">
                      KES {Number(product.selling_price).toLocaleString()}
                      <span className="text-sm font-medium text-[#FBCFE8] ml-2">per unit</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Timeline</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-green-900/30' : 'bg-[#F0FDF4]'} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-[#22C55E]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Created</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(product.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-blue-900/30' : 'bg-[#EFF6FF]'} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-[#3B82F6]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Last Updated</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(product.updated_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Details */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Vendor Details</h3>
              </div>
              
              {product.vendor ? (
                <div className="space-y-2">
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Name:</span> {product.vendor.name}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Contact Person:</span> {product.vendor.contact_person}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Email:</span> {product.vendor.email}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Phone:</span> {product.vendor.phone}
                  </p>
                  <Link 
                    to={`/vendors/${product.vendor.id}`}
                    className={`inline-block mt-2 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    View Vendor Details →
                  </Link>
                </div>
              ) : (
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No vendor assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 