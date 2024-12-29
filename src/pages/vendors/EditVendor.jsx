import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import SalesLayout from '../../components/layout/SalesLayout';

const EditVendor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [vendor, setVendor] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/${id}`);
      setVendor(response.data);
    } catch (err) {
      setError('Failed to fetch vendor details');
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/vendors/${id}`, vendor);
      navigate('/vendors');
    } catch (err) {
      setError('Failed to update vendor');
      console.error('Error updating vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SalesLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SalesLayout>
    );
  }

  return (
    <SalesLayout>
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`max-w-3xl mx-auto rounded-lg shadow-sm ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Edit Vendor
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Vendor Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={vendor.name}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg shadow-sm text-sm
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-blue-500 focus:ring-1`}
                />
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contact_person" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Contact Person *
                </label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={vendor.contact_person}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg shadow-sm text-sm
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-blue-500 focus:ring-1`}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={vendor.email}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg shadow-sm text-sm
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-blue-500 focus:ring-1`}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={vendor.phone}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-lg shadow-sm text-sm
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-blue-500 focus:ring-1`}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label htmlFor="address" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={vendor.address}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-lg shadow-sm text-sm
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-blue-500 focus:ring-1`}
                />
              </div>

              
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/vendors')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center
                  ${isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                <FiX className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center
                  ${loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
              >
                <FiSave className="mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </SalesLayout>
  );
};

export default EditVendor; 