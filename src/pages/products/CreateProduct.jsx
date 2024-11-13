import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import Message from '../../components/Message';
import Loading from '../../components/loading/Loading';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  
  const [formData, setFormData] = useState({
    product_name: '',
    product_price: '',
    selling_price: '',
    stock_quantity: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      const productName = formData.product_name.trim();
      if (!productName) {
        setMessage('Product name is required');
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      
      // Convert numeric values to numbers and append to FormData
      formDataToSend.append('product_name', productName);
      formDataToSend.append('product_price', Number(formData.product_price));
      formDataToSend.append('selling_price', Number(formData.selling_price));
      formDataToSend.append('stock_quantity', Number(formData.stock_quantity));
      
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      // Make the request with the correct content type
      const response = await api.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        // Add params for the required fields
        params: {
          product_name: productName,
          product_price: Number(formData.product_price),
          selling_price: Number(formData.selling_price),
          stock_quantity: Number(formData.stock_quantity)
        }
      });

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
      setImagePreview(null);

      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err) {
      console.error('Full error:', err);
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Enhanced validation error display
          const errorMessages = detail.map(error => {
            const field = error.loc ? error.loc[error.loc.length - 1] : 'unknown';
            const msg = error.msg || 'Unknown error';
            console.log(`Validation error for ${field}:`, error); // Debug log
            return `${field}: ${msg}`;
          });
          setMessage(errorMessages.join('\n'));
        } else {
          setMessage(detail);
        }
      } else if (err.response?.status === 401) {
        setMessage('Please login to create products');
      } else {
        setMessage(`Failed to create product: ${err.message}`);
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
            <div className="mt-1 flex items-center space-x-4">
              {/* Image Preview */}
              <div className="w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
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