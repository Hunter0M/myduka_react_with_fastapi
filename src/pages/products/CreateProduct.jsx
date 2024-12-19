import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import Message from '../../components/Message';
import Loading from '../../components/loading/Loading';

const DEFAULT_IMAGE = 'https://placehold.co/400x400?text=No+Image';

const CreateProduct = () => {
  const navigate = useNavigate();
  
  // All state declarations
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(DEFAULT_IMAGE);
  
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    selling_price: '',
    stock_quantity: '',
    description: '',
    image: null
  });

  // Add this new function after your state declarations
  const checkProductName = async (name) => {
    try {
      const response = await api.get(`/products/check-name?product_name=${encodeURIComponent(name.trim())}`);
      console.log('Name check response:', response.data); // Debug log
      return response.data.exists;
    } catch (err) {
      console.error('Error checking product name:', err);
      return false;
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});
    
    // Validate all required fields
    const errors = {};
    if (!formData.product_name?.trim()) {
      errors.product_name = 'Product Name is required';
    }
    if (!formData.product_price || isNaN(formData.product_price)) {
      errors.product_price = 'Valid Buying Price is required';
    }
    if (!formData.selling_price || isNaN(formData.selling_price)) {
      errors.selling_price = 'Valid Selling Price is required';
    }
    if (!formData.stock_quantity || isNaN(formData.stock_quantity)) {
      errors.stock_quantity = 'Valid Stock Quantity is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage('Please fill in all required fields correctly');
      setMessageType('error');
      return;
    }

    setLoading(true);
    
    try {
      // Check if product name exists - make sure to wait for the result
      const nameExists = await checkProductName(formData.product_name);
      console.log('Product name exists?', nameExists); // Debug log
      
      if (nameExists) {
        setFieldErrors(prev => ({
          ...prev,
          product_name: 'This product name already exists'
        }));
        setMessage('A product with this name already exists. Please choose a different name.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // If we get here, the name is unique - proceed with product creation
      const formDataToSend = new FormData();
      
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      const params = new URLSearchParams({
        product_name: formData.product_name.trim(),
        product_price: Math.round(Number(formData.product_price)),
        selling_price: Math.round(Number(formData.selling_price)),
        stock_quantity: Math.round(Number(formData.stock_quantity))
      });

      if (formData.description?.trim()) {
        params.append('description', formData.description.trim());
      }

      const url = `/products?${params.toString()}`;
      console.log('Submitting to URL:', url); // Debug log

      const response = await api.post(url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Product creation response:', response.data); // Debug log

      setMessage('Product created successfully!');
      setMessageType('success');
      
      // Reset form
      setFormData({
        product_name: '',
        product_price: '',
        selling_price: '',
        stock_quantity: '',
        description: '',
        image: null
      });
      setImagePreview(DEFAULT_IMAGE);

      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err) {
      console.error('API Error:', err.response?.data || err);
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const errorMessages = detail.map(error => {
            const field = error.loc ? error.loc[error.loc.length - 1] : 'unknown';
            return `${field}: ${error.msg}`;
          }).join('\n');
          setMessage(errorMessages);
        } else {
          setMessage(detail);
        }
      } else {
        setMessage('Failed to create product. Please try again.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Creating product..." fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Message
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
        duration={5000}
      />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new product to your inventory
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label 
                htmlFor="product_name" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter product name"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label 
                htmlFor="stock_quantity" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                required
                min="0"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter quantity"
              />
            </div>

            {/* Buying Price */}
            <div>
              <label 
                htmlFor="product_price" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Buying Price (KES) *
              </label>
              <input
                type="number"
                id="product_price"
                name="product_price"
                value={formData.product_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter buying price"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label 
                htmlFor="selling_price" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Selling Price (KES) *
              </label>
              <input
                type="number"
                id="selling_price"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter selling price"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter product description (optional)"
              />
            </div>
          </div>

          {/* Add Image Upload Section before the Description field */}
          <div className="md:col-span-2">
            <label 
              htmlFor="image" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Image
            </label>
            <div className="mt-2 flex items-center gap-x-3">
              <div className="relative w-40 h-40 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>

              {/* Upload Button */}
              <div className="flex-grow">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5 text-gray-400"
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
                  Upload Image
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct; 