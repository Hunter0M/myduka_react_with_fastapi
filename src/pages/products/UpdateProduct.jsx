import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Message from '../../components/Message';
import Loading from '../../components/loading/Loading';

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UpdateProduct = () => {
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
        if (product.image_url) {
          setImagePreview(`${BACKEND_URL}${product.image_url}`);
        }
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
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        setMessageType('error');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image_url: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      if (formData.product_name) {
        formDataToSend.append('product_name', formData.product_name);
      }
      if (formData.product_price) {
        formDataToSend.append('product_price', formData.product_price);
      }
      if (formData.selling_price) {
        formDataToSend.append('selling_price', formData.selling_price);
      }
      if (formData.stock_quantity) {
        formDataToSend.append('stock_quantity', formData.stock_quantity);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      
      if (formData.image_url instanceof File) {
        formDataToSend.append('image', formData.image_url);
      }

      const response = await axios.put(`${API_URL}/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          product_name: formData.product_name,
          product_price: formData.product_price,
          selling_price: formData.selling_price,
          stock_quantity: formData.stock_quantity,
          description: formData.description
        }
      });

      setMessage('Product updated successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update product');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading product details..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Message
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
        duration={5000}
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Update Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Buy Price</label>
                <input
                  type="number"
                  name="product_price"
                  value={formData.product_price}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sell Price</label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label 
                htmlFor="image" 
                className="block text-base font-semibold text-gray-800 mb-3"
              >
                Product Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Image Preview Container */}
                <div className="relative group">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200 border-dashed transition-all duration-300 group-hover:border-blue-400">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <p className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-sm font-medium">
                            Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-500">No image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
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
                        className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                                 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                                 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500
                                 transition-all duration-200 cursor-pointer group"
                      >
                        <svg
                          className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 transition-colors duration-200"
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
                      
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="inline-flex items-center justify-center px-4 py-2.5 border border-red-200 rounded-lg
                                   text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                                   transition-all duration-200"
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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