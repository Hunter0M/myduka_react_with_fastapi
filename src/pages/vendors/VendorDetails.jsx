import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../components/loading/Loading';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import SalesLayout from '../../components/layout/SalesLayout';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const VendorDetails = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        console.log('Fetching vendor with ID:', id);
        const response = await axios.get(`${API_URL}/vendors/${id}`);
        console.log('Vendor data:', response.data);
        setVendor(response.data);
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError("Failed to fetch vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${productId}`);
        setVendor(prevVendor => ({
          ...prevVendor,
          products: prevVendor.products.filter(p => p.id !== productId)
        }));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <Loading text="Loading vendor details..." fullScreen />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!vendor) return <div className="text-center">Vendor not found</div>;

  return (
    <SalesLayout>
      <div className={`min-h-screen p-2 sm:p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className={`rounded-lg shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className={`text-xl sm:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {vendor?.name}
                </h1>
                <Link
                  to="/vendors"
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg font-medium
                    transition-all duration-200 transform hover:scale-105 shadow-sm
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  Back to Vendors
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className={`rounded-lg shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 sm:p-6">
              <h2 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Contact Person</p>
                    <p className={`text-base ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>{vendor?.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Email</p>
                    <p className={`text-base ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>{vendor?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Phone</p>
                    <p className={`text-base ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>{vendor?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Address</p>
                    <p className={`text-base ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>{vendor?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table Card */}
          <div className={`rounded-lg shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Products</h2>
                <Link
                  to="/products/create"
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg font-medium
                    transition-all duration-200 transform hover:scale-105 shadow-sm
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  Add New Product
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${
                  isDark ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Stock
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Buy Price
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Sell Price
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-right text-xs font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {vendor?.products.map((product) => (
                      <tr key={product.id} className={
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          <Link to={`/products/${product.id}`} className="text-blue-600 hover:text-blue-800">
                            {product.product_name}
                          </Link>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {product.stock_quantity}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          KES {product.product_price.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          KES {product.selling_price.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {(() => {
                            const status = product.stock_quantity <= 0 ? 'Out of Stock' :
                                         product.stock_quantity <= 10 ? 'Low Stock' :
                                         product.stock_quantity <= 30 ? 'Medium Stock' : 'In Stock';
                            
                            const statusStyles = {
                              'Out of Stock': 'bg-red-100 text-red-800',
                              'Low Stock': 'bg-yellow-100 text-yellow-800',
                              'Medium Stock': 'bg-blue-100 text-blue-800',
                              'In Stock': 'bg-green-100 text-green-800'
                            };

                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                                {status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          <div className="flex items-center justify-end space-x-4">
                            <Link
                              to={`/products/${product.id}`}
                              className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                              title="View Details"
                            >
                              <FiEye className="w-5 h-5" />
                            </Link>
                            <Link
                              to={`/products/edit/${product.id}`}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors duration-200"
                              title="Edit"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors duration-200"
                              title="Delete"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SalesLayout>
  );
};

export default VendorDetails;
