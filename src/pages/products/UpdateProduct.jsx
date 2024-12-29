import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Message from '../../components/Message';
import Loading from '../../components/loading/Loading';
import { eventEmitter } from '../../utils/eventEmitter';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const DEFAULT_IMAGE = '/assets/default-product.svg';

const UpdateProduct = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    stock_quantity: 0,
    product_price: 0,
    selling_price: 0,
    image_url: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        const product = response.data;
        setFormData({
          product_name: product.product_name,
          description: product.description,
          stock_quantity: product.stock_quantity,
          product_price: product.product_price,
          selling_price: product.selling_price,
          image_url: product.image_url,
        });
        setImagePreview(product.image_url ? `${BACKEND_URL}${product.image_url}` : DEFAULT_IMAGE);
      } catch (err) {
        setMessage("Failed to fetch product details");
        setMessageType('error');
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage('Please select an image file');
            setMessageType('error');
            return;
        }
        
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setMessage('Image size should not exceed 5MB');
            setMessageType('error');
            return;
        }

        // Update formData with the file
        setFormData(prev => ({
            ...prev,
            image: file  // Changed from image_url to image
        }));
        setImagePreview(URL.createObjectURL(file));
    }
};

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (!file.type.startsWith('image/')) {
  //       setMessage('Please select an image file');
  //       setMessageType('error');
  //       return;
  //     }
  //     setFormData(prev => ({
  //       ...prev,
  //       image_url: file
  //     }));
  //     setImagePreview(URL.createObjectURL(file));
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const formDataToSend = new FormData();
        
        // Add required fields
        formDataToSend.append('product_name', formData.product_name.trim());
        formDataToSend.append('product_price', formData.product_price);
        formDataToSend.append('selling_price', formData.selling_price);
        formDataToSend.append('stock_quantity', formData.stock_quantity);
        
        // Add optional fields
        if (formData.description?.trim()) {
            formDataToSend.append('description', formData.description.trim());
        }
        
        // Add image if exists
        if (formData.image instanceof File) {
            formDataToSend.append('image', formData.image);
        }

        console.log('FormData contents:');
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.put(
            `${API_URL}/${id}`,
            formDataToSend,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data) {
            setMessage(response.data.message);
            setMessageType('success');
            
            // Update local state
            setFormData(prev => ({
                ...prev,
                ...response.data.product,
                image: null  // Reset image after successful upload
            }));

            // Update image preview
            if (response.data.product.image_url) {
                setImagePreview(`${BACKEND_URL}${response.data.product.image_url}`);
            }

            // Emit event
            eventEmitter.emit('productUpdated', response.data.product);
            
            setTimeout(() => {
                navigate('/products');
            }, 2000);
        }

    } catch (err) {
        console.error('Update error:', err);
        if (err.response?.status === 400) {
            setMessage(err.response.data.detail || 'Product name already exists');
        } else {
            setMessage(err.response?.data?.detail || 'Failed to update product');
        }
        setMessageType('error');
    } finally {
        setLoading(false);
    }
};

  const handleRemoveImage = async () => {
    try {
      const response = await axios.put(`${API_URL}/${id}/remove-image`);

      // Update local state
      setImagePreview(DEFAULT_IMAGE);
      setFormData(prev => ({ ...prev, image_url: null }));
      
      // Emit event with updated product data
      eventEmitter.emit('productUpdated', {
        ...response.data.product,
        image_url: null
      });
      
      setMessage('Image removed successfully');
      setMessageType('success');

      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (error) {
      console.error('Remove image error:', error);
      setMessage('Failed to remove image: ' + (error.response?.data?.detail || error.message));
      setMessageType('error');
    }
  };

  if (loading) {
    return <Loading text="Loading product details..." fullScreen />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12`}>
      <Message
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
        duration={5000}
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-lg shadow-sm p-6 md:p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Update Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Product Name
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm 
                  ${isDark ? `
                    bg-gray-700 
                    border-gray-600 
                    text-gray-100
                    focus:border-blue-400/50 
                    focus:ring-blue-400/20
                  ` : `
                    bg-white
                    border-gray-300 
                    text-gray-900
                    focus:border-blue-500 
                    focus:ring-blue-500/20
                  `}
                  border focus:outline-none focus:ring-1`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`mt-1 block w-full rounded-md px-3 py-2 text-sm 
                  ${isDark ? `
                    bg-gray-700 
                    border-gray-600 
                    text-gray-100
                    focus:border-blue-400/50 
                    focus:ring-blue-400/20
                  ` : `
                    bg-white
                    border-gray-300 
                    text-gray-900
                    focus:border-blue-500 
                    focus:ring-blue-500/20
                  `}
                  border focus:outline-none focus:ring-1`}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className={`mt-1 block w-full rounded-md px-3 py-2 text-sm 
                    ${isDark ? `
                      bg-gray-700 
                      border-gray-600 
                      text-gray-100
                      focus:border-blue-400/50 
                      focus:ring-blue-400/20
                    ` : `
                      bg-white
                      border-gray-300 
                      text-gray-900
                      focus:border-blue-500 
                      focus:ring-blue-500/20
                    `}
                    border focus:outline-none focus:ring-1`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Buy Price
                </label>
                <input
                  type="number"
                  name="product_price"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  min="0"
                  className={`mt-1 block w-full rounded-md px-3 py-2 text-sm 
                    ${isDark ? `
                      bg-gray-700 
                      border-gray-600 
                      text-gray-100
                      focus:border-blue-400/50 
                      focus:ring-blue-400/20
                    ` : `
                      bg-white
                      border-gray-300 
                      text-gray-900
                      focus:border-blue-500 
                      focus:ring-blue-500/20
                    `}
                    border focus:outline-none focus:ring-1`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Sell Price
                </label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  min="0"
                  className={`mt-1 block w-full rounded-md px-3 py-2 text-sm 
                    ${isDark ? `
                      bg-gray-700 
                      border-gray-600 
                      text-gray-100
                      focus:border-blue-400/50 
                      focus:ring-blue-400/20
                    ` : `
                      bg-white
                      border-gray-300 
                      text-gray-900
                      focus:border-blue-500 
                      focus:ring-blue-500/20
                    `}
                    border focus:outline-none focus:ring-1`}
                  required
                />
              </div>
            </div>

            <div className={`md:col-span-2 p-6 rounded-xl shadow-sm border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <label className={`block text-base font-semibold mb-3 
                ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                Product Image
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group">
                  <div className={`w-40 h-40 rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300
                    ${isDark ? 'bg-gray-700 border-gray-600 group-hover:border-blue-400' : 
                              'bg-gray-50 border-gray-200 group-hover:border-blue-400'}`}>
                    <div className="relative w-full h-full">
                      {formData.image_url ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                          }}
                        />
                      ) : (
                        <img
                          src={DEFAULT_IMAGE}
                          alt="Default preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <p className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-sm font-medium">
                          {!formData.image_url ? 'Upload Image' : 'Change Image'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-grow space-y-4">
                  <div className="flex flex-col">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label
                        htmlFor="image"
                        className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg shadow-sm text-sm font-medium
                          transition-all duration-200 cursor-pointer
                          ${isDark ? `
                            bg-gray-700 
                            border-gray-600 
                            text-gray-200
                            hover:bg-gray-600
                          ` : `
                            bg-white 
                            border-gray-300 
                            text-gray-700
                            hover:bg-gray-50
                          `}`}
                      >
                        <svg
                          className={`w-5 h-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Upload New Image
                      </label>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${isDark ? `
                            bg-red-900/30 
                            border-red-400/30 
                            text-red-400
                            hover:bg-red-900/50
                          ` : `
                            bg-red-50 
                            border-red-200 
                            text-red-600
                            hover:bg-red-100
                          `}`}
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className={`px-4 py-2 text-sm font-medium rounded-md
                  ${isDark ? `
                    bg-gray-700 
                    text-gray-200 
                    border-gray-600
                    hover:bg-gray-600
                  ` : `
                    bg-white 
                    text-gray-700 
                    border-gray-300
                    hover:bg-gray-50
                  `}
                  border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md
                  ${isDark ? `
                    bg-blue-600 
                    hover:bg-blue-500 
                    focus:ring-blue-400
                  ` : `
                    bg-blue-600 
                    hover:bg-blue-700 
                    focus:ring-blue-500
                  `}
                  border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct; 