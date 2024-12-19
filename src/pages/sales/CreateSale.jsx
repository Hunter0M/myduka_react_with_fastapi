import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "../../components/Message";
import Loading from "../../components/loading/Loading";

const CreateSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
  });

  const [loggedInUser, setLoggedInUser] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityError, setQuantityError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_Product_URL);
        console.log("API Response:", response.data);

        const productsArray = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];

        setProducts(productsArray);
      } catch (error) {
        console.error("Error fetching products:", error);
        setMessage("Failed to load products");
        setMessageType("error");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const userEmail = localStorage.getItem('user_email');
        if (!userEmail) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setLoggedInUser(response.data);
      } catch (error) {
        console.error('Error fetching logged-in user:', error);
        setMessage('Failed to load user information');
        setMessageType('error');
        navigate('/login');
      }
    };

    fetchLoggedInUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "product_id") {
      const product = products.find((p) => p.id === parseInt(value));
      setSelectedProduct(product);
      setQuantityError("");
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        quantity: "",
      }));
      return;
    }

    if (name === "quantity") {
      if (selectedProduct) {
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity <= 0) {
          setQuantityError("Quantity must be greater than 0");
        } else if (quantity > selectedProduct.stock_quantity) {
          setQuantityError(
            `Exceeds available stock (${selectedProduct.stock_quantity} items available)`
          );
        } else {
          setQuantityError("");
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInUser) {
        setMessage('User not authenticated');
        setMessageType('error');
        navigate('/login');
        return;
    }

    if (quantityError) {
        setMessage("Please correct the quantity errors before submitting");
        setMessageType("error");
        return;
    }

    setLoading(true);

    try {
        // First, create the sale
        const saleData = {
            pid: parseInt(formData.product_id),
            user_id: loggedInUser.id,
            quantity: parseInt(formData.quantity)
        };

        const token = localStorage.getItem('access_token');
        const saleResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/sales`,
            saleData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (saleResponse.data) {
            // Calculate new stock quantity
            const newStockQuantity = selectedProduct.stock_quantity - parseInt(formData.quantity);
            
            // Create FormData for product update
            const productFormData = new FormData();
            productFormData.append('product_name', selectedProduct.product_name);
            productFormData.append('product_price', selectedProduct.product_price);
            productFormData.append('selling_price', selectedProduct.selling_price);
            productFormData.append('stock_quantity', newStockQuantity);
            if (selectedProduct.description) {
                productFormData.append('description', selectedProduct.description);
            }

            // Update product stock
            await axios.put(
                `${import.meta.env.VITE_Product_URL}/${formData.product_id}`,
                productFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Update local products state
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    product.id === parseInt(formData.product_id)
                        ? { ...product, stock_quantity: newStockQuantity }
                        : product
                )
            );

            setMessage('Sale created successfully and stock updated!');
            setMessageType('success');
            
            // Reset form
            setFormData({
                product_id: '',
                quantity: '',
            });
            setSelectedProduct(null);
            
            // Navigate after delay
            setTimeout(() => {
                navigate('/sales');
            }, 2000);
        }

    } catch (err) {
        console.error('Error details:', err.response?.data);
        let errorMessage = 'Failed to create sale';
        
        if (err.response?.data?.detail) {
            errorMessage = err.response.data.detail;
        } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else if (typeof err.response?.data === 'string') {
            errorMessage = err.response.data;
        }
        
        setMessage(errorMessage);
        setMessageType('error');
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      setSelectedProduct(product);
    }
  }, [formData.product_id, products]);

  if (loading) {
    return <Loading text="Loading..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Message
          message={message}
          type={messageType}
          onClose={() => setMessage(null)}
          duration={5000}
        />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Sale</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new sale transaction to your records
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Product Selection */}
              <div className="col-span-1">
                <label
                  htmlFor="product_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Product *
                </label>
                {products && products.length > 0 ? (
                  <select
                    id="product_id"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Choose a product</option>
                    {products
                      .filter(product => product.stock_quantity > 0) // Filter out products with zero stock
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_name} (Stock: {product.stock_quantity})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    No products available
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-1">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity *
                </label>
                <div className="space-y-2">
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      className={`block w-full px-4 py-2.5 border ${
                        quantityError ? "border-red-300" : "border-gray-300"
                      } rounded-lg shadow-sm text-gray-900 
                      focus:ring-2 ${
                        quantityError
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-blue-500 focus:border-blue-500"
                      } sm:text-sm`}
                      placeholder="Enter quantity"
                    />
                  </div>

                  {/* Stock Information */}
                  {selectedProduct && (
                    <div
                      className={`text-sm ${
                        quantityError ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {quantityError ? (
                        <div className="flex items-center space-x-1">
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{quantityError}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              Current stock: {selectedProduct.stock_quantity}{" "}
                              items
                            </span>
                          </div>
                          {formData.quantity && !quantityError && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                              <span>
                                Stock after sale:{" "}
                                {selectedProduct.stock_quantity -
                                  parseInt(formData.quantity)}{" "}
                                items
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/sales")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                         rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                         bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                         transition-colors duration-200"
              >
                Create Sale
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSale;
