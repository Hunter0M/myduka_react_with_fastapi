import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import SalesLayout from '../../components/layout/SalesLayout';
import DataTable from 'react-data-table-component';

const Vendors = () => {
  const { isDark } = useTheme();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/vendors`);
      setVendors(response.data);
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/vendors/${id}`);
        setVendors(vendors.filter(vendor => vendor.id !== id));
      } catch (err) {
        setError('Failed to delete vendor');
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
      sortable: true,
      cell: row => (
        <div className={`text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {row.id}
        </div>
      ),
    },
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div className={`text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {row.name}
        </div>
      ),
    },
    {
      name: "Contact Person",
      selector: row => row.contact_person,
      sortable: true,
      cell: row => (
        <div className={`text-sm ${
          isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {row.contact_person}
        </div>
      ),
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      cell: row => (
        <div className={`text-sm ${
          isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {row.email}
        </div>
      ),
    },
    {
      name: "Phone",
      selector: row => row.phone,
      sortable: true,
      cell: row => (
        <div className={`text-sm ${
          isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {row.phone}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex gap-1 sm:gap-2">
          <Link
            to={`/vendors/${row.id}`}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
              isDark ? 'text-blue-400 hover:bg-blue-900/50' : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="View Details"
          >
            <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <Link
            to={`/vendors/edit/${row.id}`}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
              isDark ? 'text-green-400 hover:bg-green-900/50' : 'text-green-600 hover:bg-green-50'
            }`}
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
              isDark ? 'text-red-400 hover:bg-red-900/50' : 'text-red-600 hover:bg-red-50'
            }`}
            title="Delete"
          >
            <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  return (
    <SalesLayout>
      <div className={`min-h-screen p-2 sm:p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className={`rounded-lg shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className={`text-xl sm:text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Vendors
                </h1>
                <Link
                  to="/vendors/create"
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg font-medium
                    transition-all duration-200 transform hover:scale-105 shadow-sm
                    ${isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  <FiPlus className="mr-2 h-5 w-5" />
                  Add Vendor
                </Link>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className={`mx-3 sm:mx-6 lg:mx-8 p-3 sm:p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendors..."
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors duration-200
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
              <svg 
                className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Updated DataTable Section */}
          <div className={`mx-3 sm:mx-6 lg:mx-8 rounded-lg shadow-sm overflow-hidden
            ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <DataTable
              columns={columns}
              data={vendors.filter(vendor => 
                vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.phone?.includes(searchTerm)
              )}
              pagination
              responsive
              progressPending={loading}
              theme={isDark ? 'dark' : 'light'}
              customStyles={{
                table: {
                  style: {
                    backgroundColor: isDark ? '#1F2937' : 'white',
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderBottomColor: isDark ? '#4B5563' : '#E5E7EB',
                    minHeight: '48px',
                  },
                },
                headCells: {
                  style: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: isDark ? '#D1D5DB' : '#4B5563',
                    padding: '12px 16px',
                  },
                },
                rows: {
                  style: {
                    backgroundColor: isDark ? '#1F2937' : 'white',
                    fontSize: '0.875rem',
                    color: isDark ? '#D1D5DB' : '#1F2937',
                    minHeight: '48px',
                    '&:hover': {
                      backgroundColor: isDark ? '#374151' : '#F9FAFB',
                      cursor: 'pointer',
                    },
                    borderBottomStyle: 'solid',
                    borderBottomWidth: '1px',
                    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                  },
                  stripedStyle: {
                    backgroundColor: isDark ? '#283548' : '#F9FAFB',
                  },
                },
                cells: {
                  style: {
                    padding: '12px 16px',
                    color: isDark ? '#D1D5DB' : '#1F2937',
                  },
                },
                pagination: {
                  style: {
                    backgroundColor: isDark ? '#1F2937' : 'white',
                    color: isDark ? '#D1D5DB' : '#4B5563',
                    borderTopColor: isDark ? '#4B5563' : '#E5E7EB',
                  },
                  pageButtonsStyle: {
                    color: isDark ? '#D1D5DB' : '#4B5563',
                    fill: isDark ? '#D1D5DB' : '#4B5563',
                    backgroundColor: 'transparent',
                    '&:disabled': {
                      color: isDark ? '#4B5563' : '#9CA3AF',
                      fill: isDark ? '#4B5563' : '#9CA3AF',
                    },
                    '&:hover:not(:disabled)': {
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    },
                    '&:focus': {
                      outline: 'none',
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    },
                  },
                },
                noData: {
                  style: {
                    backgroundColor: isDark ? '#1F2937' : 'white',
                    color: isDark ? '#D1D5DB' : '#4B5563',
                  },
                },
                progress: {
                  style: {
                    backgroundColor: isDark ? '#1F2937' : 'white',
                    color: isDark ? '#D1D5DB' : '#4B5563',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </SalesLayout>
  );
};

export default Vendors;
