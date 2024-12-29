import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import SalesLayout from '../../components/layout/SalesLayout';

const VendorForm = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchVendor();
    }
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch vendor details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/vendors/${id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/vendors`, formData);
      }
      navigate('/vendors');
    } catch (err) {
      setError('Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <SalesLayout>
      <div className={`min-h-screen p-2 sm:p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`container mx-auto px-4 py-8 rounded-lg shadow-sm ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h1 className={`text-2xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-lg">
            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-bold mb-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
                rows="3"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded font-bold ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Saving...' : 'Save Vendor'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/vendors')}
                className={`px-4 py-2 rounded font-bold ${
                  isDark
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </SalesLayout>
  );
};

export default VendorForm;
