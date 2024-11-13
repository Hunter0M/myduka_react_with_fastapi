import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Message from '../../components/Message';
import Loading from '../../components/loading/Loading';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error.response?.data) {
    const data = error.response.data;
    // If data is a string
    if (typeof data === 'string') return data;
    // If data has msg property
    if (data.msg) return data.msg;
    // If data has message property
    if (data.message) return data.message;
    // If data has detail property
    if (data.detail) return data.detail;
    // If data is an array
    if (Array.isArray(data)) return data[0]?.msg || 'An error occurred';
  }
  
  // If error has a message property
  if (error.message) return error.message;
  
  return 'An unexpected error occurred';
};

const UpdateSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    pid: "",
    user_id: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [remainingStock, setRemainingStock] = useState(null);
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  // Fetch initial sale data and related data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [saleRes, productsRes, customersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/sales/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/products`),
          axios.get(`${import.meta.env.VITE_API_URL}/users`)
        ]);

        const sale = saleRes.data;
        setFormData({
          pid: sale.pid.toString(),
          user_id: sale.user_id.toString(),
          quantity: sale.quantity.toString()
        });
        setOriginalQuantity(sale.quantity);
        
        setProducts(productsRes.data);
        setCustomers(customersRes.data);

        // Set selected product
        const product = productsRes.data.find(p => p.id === sale.pid);
        setSelectedProduct(product);
        if (product) {
          // Calculate remaining stock including the original quantity
          const newRemainingStock = product.stock_quantity + sale.quantity - sale.quantity;
          setRemainingStock(newRemainingStock);
        }

      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setMessage(errorMessage);
        setMessageType('error');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'pid') {
      const product = products.find(p => p.id === parseInt(value));
      setSelectedProduct(product);
      if (product) {
        // Add back original quantity to available stock when calculating remaining
        const quantityToSubtract = formData.quantity === '' ? 0 : parseInt(formData.quantity);
        const newRemainingStock = (product.stock_quantity + originalQuantity) - quantityToSubtract;
        setRemainingStock(newRemainingStock);
      } else {
        setRemainingStock(null);
      }
    }

    if (name === 'quantity' && selectedProduct) {
      const quantityValue = value === '' ? 0 : parseInt(value);
      // Add back original quantity to available stock when calculating remaining
      const newRemainingStock = (selectedProduct.stock_quantity + originalQuantity) - quantityValue;
      setRemainingStock(newRemainingStock);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/sales/${id}`, formData);
      setMessage('Sale updated successfully!');
      setMessageType('success');
      
      setTimeout(() => {
        navigate("/sales");
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <Loading text="Loading sale details..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Message
        message={message}
        type={messageType}
        onClose={() => setMessage(null)}
        duration={5000}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Sale</h1>
          <p className="text-gray-600">
            Modify the sale details below
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-8">
          {/* Product Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <label htmlFor="pid" className="block text-lg font-semibold text-gray-800 mb-3">
              Select Product
            </label>
            <select
              name="pid"
              id="pid"
              required
              value={formData.pid}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 ease-in-out hover:border-blue-400 text-base"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name} - ${product.product_price.toFixed(2)} (Stock: {product.stock_quantity})
                </option>
              ))}
            </select>

            {/* Product Details Card */}
            {selectedProduct && (
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                  </svg>
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-xl font-bold text-blue-600">${selectedProduct.product_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Available Stock</p>
                    <p className="text-xl font-bold text-green-600">
                      {(selectedProduct.stock_quantity + originalQuantity).toString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Selection */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <label htmlFor="user_id" className="block text-lg font-semibold text-gray-800 mb-3">
              Select Customer
            </label>
            <select
              name="user_id"
              id="user_id"
              required
              value={formData.user_id}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out hover:border-purple-400 text-base"
            >
              <option value="">Choose a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl">
            <label htmlFor="quantity" className="block text-lg font-semibold text-gray-800 mb-3">
              Quantity
            </label>
            <div className="relative">
              <input
                type="number"
                name="quantity"
                id="quantity"
                required
                min="1"
                max={selectedProduct ? selectedProduct.stock_quantity + originalQuantity : 1}
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200 ease-in-out hover:border-green-400 text-base"
                placeholder="Enter quantity"
              />
              
              {selectedProduct && remainingStock !== null && (
                <div className={`mt-3 rounded-lg p-3 ${remainingStock >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    {remainingStock >= 0 ? (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Remaining stock after sale: {remainingStock}</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Not enough stock available</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/sales")}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 ease-in-out hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (selectedProduct && remainingStock < 0)}
                className={`px-6 py-3 rounded-lg text-base font-medium text-white shadow-lg transition duration-200 ease-in-out
                  ${loading || (selectedProduct && remainingStock < 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Update Sale
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSale; 