import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Receipt from "./Receipt";
import Loading from "../../components/loading/Loading";

const url = import.meta.env.VITE_BACKEND_URL;

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    todaySales: 0,
    averageTransaction: 0,
    totalCustomers: 0,
  });

  // Fetch both sales and products data
  const fetchData = async () => {
    setLoading(true);
    try {
      const salesResponse = await axios.get(`${url}/sales`);

      const sales = Array.isArray(salesResponse.data) ? salesResponse.data : [];

      // Process sales data - updated to match backend response
      const sortedSales = sales
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(sale => ({
          ...sale,
          product: {
            product_name: sale.product_name || 'Unknown Product',
            selling_price: sale.product_price || 0
          },
          total_amount: sale.total_amount || 0,
          quantity: parseInt(sale.quantity) || 0,
        }));

      setSalesData(sortedSales);
      calculateStatistics(sortedSales);

    } catch (error) {
      console.error("Error fetching data:", error);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const calculateStatistics = (sales) => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    const stats = sales.reduce((acc, sale) => {
      const saleDate = new Date(sale.created_at).setHours(0, 0, 0, 0);
      const saleAmount = sale.total_amount || 0;

      acc.totalSales += saleAmount;
      if (saleDate === today) {
        acc.todaySales += saleAmount;
      }
      if (sale.user_id && !acc.customers.has(sale.user_id)) {
        acc.customers.add(sale.user_id);
      }
      return acc;
    }, {
      totalSales: 0,
      todaySales: 0,
      customers: new Set(),
    });

    setStatistics({
      totalSales: stats.totalSales,
      todaySales: stats.todaySales,
      averageTransaction: sales.length ? (stats.totalSales / sales.length) : 0,
      totalCustomers: stats.customers.size,
    });
  };

  // Filter sales by date
  const getFilteredSales = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const week = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today);
    month.setMonth(month.getMonth() - 1);

    return salesData.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      switch (dateFilter) {
        case "today":
          return saleDate >= new Date(today);
        case "week":
          return saleDate >= week;
        case "month":
          return saleDate >= month;
        default:
          return true;
      }
    }).filter(sale => 
      sale.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id?.toString().includes(searchTerm)
    );
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Customer",
      selector: row => `${row.first_name || ''} ${row.last_name || ''}`,
      sortable: true,
    },
    {
      name: "Product",
      selector: row => row.product.product_name,
      sortable: true,
    },
    {
      name: "Quantity",
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: "Unit Price",
      selector: row => row.product.selling_price,
      sortable: true,
      cell: row => `KES ${(row.product.selling_price || 0).toLocaleString()}`
    },
    {
      name: "Total",
      selector: row => row.total_amount,
      sortable: true,
      cell: row => `KES ${(row.total_amount || 0).toLocaleString()}`
    },
    {
      name: "Date",
      selector: row => row.created_at,
      sortable: true,
      cell: row => row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A',
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedSale({
                ...row,
                product: {
                  product_name: row.product.product_name,
                  selling_price: row.product.selling_price
                }
              });
              setShowReceipt(true);
            }}
            className="px-4 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            Receipt
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                KES {(statistics.totalSales || 0).toLocaleString()}
              </p>
            </div>

            {/* Today's Sales Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                KES {(statistics.todaySales || 0).toLocaleString()}
              </p>
            </div>

            {/* Average Transaction Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-sm font-medium text-gray-500">Avg. Transaction</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                KES {(statistics.averageTransaction || 0).toLocaleString()}
              </p>
            </div>

            {/* Total Customers Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
                <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(statistics.totalCustomers || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 min-w-0 w-full sm:w-auto">
              <input
                type="search"
                placeholder="Search by customer name or sale ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-lg border-gray-300 text-sm pl-10 pr-4 
                focus:ring-blue-500 focus:border-blue-500 
                placeholder:text-gray-400 placeholder:text-sm
                sm:text-base md:w-80 lg:w-96"
              />
              <div className="absolu  te inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>

            {/* Add Sale Button */}
            <Link
              to="/sales/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Sale
            </Link>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable
            columns={columns}
            data={getFilteredSales()}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            pointerOnHover
            progressPending={loading}
            progressComponent={<Loading />}
            noDataComponent={
              <div className="p-4 text-center text-gray-500">
                No sales records found
              </div>
            }
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                },
              },
              headCells: {
                style: {
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#4B5563',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                },
              },
              rows: {
                style: {
                  fontSize: '0.875rem',
                  color: '#1F2937',
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedSale && (
        <Receipt
          sale={selectedSale}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
};

export default Sales;