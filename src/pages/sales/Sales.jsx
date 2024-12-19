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
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import Receipt from "./Receipt";
import Loading from "../../components/loading/Loading";
import { FiTrendingUp, FiTrendingDown, FiDownload, FiPrinter, FiRefreshCw } from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; // npm install chart.js react-chartjs-2
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [timeRange, setTimeRange] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth < 640,    // sm
    isSmall: window.innerWidth < 768,     // md
    isTablet: window.innerWidth < 1024,   // lg
    isDesktop: window.innerWidth >= 1024  // lg and above
  });

  // Fetch both sales and products data
  const fetchData = async () => {
    setLoading(true);
    try {
      const salesResponse = await axios.get(`${url}/sales`);
      console.log('API Response:', salesResponse.data); // Debug log

      const sales = Array.isArray(salesResponse.data) ? salesResponse.data : [];

      // Process sales data - updated to handle numeric values properly
      const sortedSales = sales
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(sale => ({
          ...sale,
          product: {
            product_name: sale.product_name || 'Unknown Product',
            selling_price: parseFloat(sale.product_price) || 0
          },
          total_amount: parseFloat(sale.total_amount) || 0,
          quantity: parseInt(sale.quantity) || 0,
        }));

      console.log('Processed sales:', sortedSales); // Debug log
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
    // Debug the dates
    console.log('Calculating statistics for sales:', sales.map(sale => ({
      id: sale.id,
      date: sale.created_at,
      amount: sale.total_amount
    })));

    const stats = sales.reduce((acc, sale) => {
      const saleAmount = parseFloat(sale.total_amount) || 0;
      
      // Add to total sales
      acc.totalSales += saleAmount;
      
      // Consider all sales from the current day as "today's sales"
      // This is a temporary fix until the dates are corrected in the database
      acc.todaySales += saleAmount;

      // Track unique customers
      if (sale.user_id && !acc.customers.has(sale.user_id)) {
        acc.customers.add(sale.user_id);
      }

      return acc;
    }, {
      totalSales: 0,
      todaySales: 0,
      yesterdaySales: 0,
      customers: new Set(),
    });

    console.log('Calculated stats:', stats);

    setStatistics({
      totalSales: stats.totalSales,
      todaySales: stats.totalSales, // Temporarily show all sales as today's sales
      yesterdaySales: 0,
      averageTransaction: sales.length ? (stats.totalSales / sales.length) : 0,
      totalCustomers: stats.customers.size,
    });
  };

  // Filter sales by date
  const getFilteredSales = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const week = new Date(today - 7 * 24 * 60 * 60 * 1000).getTime();
    const month = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();

    return salesData.filter(sale => {
      const saleDate = new Date(sale.created_at);
      const saleDateStart = new Date(
        saleDate.getFullYear(), 
        saleDate.getMonth(), 
        saleDate.getDate()
      ).getTime();
      
      switch (dateFilter) {
        case "today":
          return saleDateStart === today;
        case "week":
          return saleDateStart >= week;
        case "month":
          return saleDateStart >= month;
        default:
          return true;
      }
    }).filter(sale => 
      sale.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id?.toString().includes(searchTerm)
    );
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      setLoading(true);
      try {
        await axios.delete(`${url}/sales/${id}`);
        showNotification('Sale deleted successfully');
        fetchData();
      } catch (error) {
        console.error("Error deleting sale:", error);
        showNotification('Failed to delete sale', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const getSalesPerformance = () => {
    const previousTotal = statistics.totalSales - statistics.todaySales;
    const percentageChange = previousTotal ? 
      ((statistics.todaySales - previousTotal) / previousTotal) * 100 : 0;
    return {
      trend: percentageChange >= 0 ? 'up' : 'down',
      percentage: Math.abs(percentageChange).toFixed(1)
    };
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  // Add this useEffect to handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isSmall: width < 768,
        isTablet: width < 1024,
        isDesktop: width >= 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update the columns definition
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
      omit: screenSize.isMobile,
    },
    {
      name: "Customer",
      selector: row => `${row.first_name || ''} ${row.last_name || ''}`,
      sortable: true,
      width: screenSize.isMobile ? "130px" : "auto",
      cell: row => (
        <div className="text-sm font-medium text-gray-900 truncate max-w-[130px] sm:max-w-full">
          {`${row.first_name || ''} ${row.last_name || ''}`}
        </div>
      ),
    },
    {
      name: "Product",
      selector: row => row.product.product_name,
      sortable: true,
      width: screenSize.isMobile ? "130px" : "auto",
      cell: row => (
        <div className="text-sm text-gray-600 truncate max-w-[130px] sm:max-w-full">
          {row.product.product_name}
        </div>
      ),
    },
    {
      name: "Qty",
      selector: row => row.quantity,
      sortable: true,
      width: screenSize.isMobile ? "60px" : "80px",
      cell: row => (
        <span className="text-sm font-medium text-gray-900">
          {row.quantity}
        </span>
      ),
    },
    {
      name: "Unit Price",
      selector: row => row.product.selling_price,
      sortable: true,
      omit: screenSize.isMobile || screenSize.isSmall,
      width: "120px",
      cell: row => (
        <div className="text-sm text-gray-900">
          KES {(row.product.selling_price || 0).toLocaleString()}
        </div>
      ),
    },
    {
      name: "Total",
      selector: row => row.total_amount,
      sortable: true,
      width: screenSize.isMobile ? "100px" : "120px",
      cell: row => (
        <div className="text-sm font-medium text-gray-900">
          KES {(row.total_amount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      name: "Date",
      selector: row => row.created_at,
      sortable: true,
      omit: screenSize.isMobile || screenSize.isSmall,
      width: "120px",
      cell: row => (
        <div className="text-sm text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => {
              setSelectedSale(row);
              setShowReceipt(true);
            }}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="View Receipt"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <Link
            to={`/sales/edit/${row.id}`}
            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            title="Edit Sale"
          >
            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Sale"
          >
            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: screenSize.isMobile ? "100px" : "120px",
    },
  ];

  const SalesTrend = ({ data }) => {
    const todayPercentage = data.totalSales ? (data.todaySales / data.totalSales) * 100 : 0;
    
    const chartData = {
      labels: ['Today', 'Previous'],
      datasets: [{
        data: [data.todaySales, data.totalSales - data.todaySales],
        backgroundColor: ['#3B82F6', '#E5E7EB'],
        borderWidth: 0,
        cutout: '80%',
        borderRadius: 8,
      }]
    };

    const options = {
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const value = context.raw;
              return `KES ${value.toLocaleString()}`;
            }
          },
          backgroundColor: '#1F2937',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          }
        }
      },
      maintainAspectRatio: false,
      rotation: -90,
      circumference: 360,
    };

    return (
      <div className="relative h-24 w-24">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xs font-medium text-gray-500">Today</span>
          <span className="text-sm font-bold text-gray-900">{todayPercentage.toFixed(0)}%</span>
        </div>
        <div className="absolute -bottom-6 right-0 transform translate-y-full">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function for exporting data
  const exportToCSV = () => {
    const filteredData = getFilteredSales();
    const headers = [
      'Sale ID',
      'Customer',
      'Product',
      'Quantity',
      'Unit Price',
      'Total Amount',
      'Date'
    ];

    const csvData = filteredData.map(sale => [
      sale.id,
      `${sale.first_name || ''} ${sale.last_name || ''}`,
      sale.product.product_name,
      sale.quantity,
      sale.product.selling_price,
      sale.total_amount,
      new Date(sale.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update the PrintLayout component
  const PrintLayout = ({ salesData }) => {
    return (
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{ width: 'auto', margin: '20px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          {/* Receipt Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '15px' }}>MyDuka Store</h2>
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>Sales Report</p>
            <p style={{ fontSize: '18px', color: '#444' }}>{new Date().toLocaleString()}</p>
          </div>

          {/* Receipt Details */}
          <div style={{ 
            borderTop: '2px solid #000', 
            borderBottom: '2px solid #000', 
            padding: '20px 0',
            margin: '20px 0'
          }}>
            <table style={{ 
              width: '100%', 
              fontSize: '18px',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', fontSize: '20px' }}>Item</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '20px' }}>Qty</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '20px' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '20px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '15px', textAlign: 'left', fontSize: '18px' }}>
                      {sale.product.product_name}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '18px' }}>
                      {sale.quantity}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '18px' }}>
                      KES {sale.product.selling_price.toLocaleString()}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '18px' }}>
                      KES {sale.total_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div style={{ 
            borderBottom: '2px solid #000', 
            padding: '20px 0',
            marginBottom: '30px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              <span>Total Amount:</span>
              <span>
                KES {salesData.reduce((sum, sale) => sum + sale.total_amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            fontSize: '18px',
            color: '#444'
          }}>
            <p style={{ marginBottom: '15px' }}>Thank you for your business!</p>
            <p>Please come again</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      {/* Add PrintLayout component with only salesData */}
      <PrintLayout salesData={getFilteredSales()} />

      {/* Rest of your existing dashboard content with print:hidden */}
      <div className="print:hidden">
        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}
            role="alert"
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with welcome message */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your sales today.</p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleRefreshData}
                  className={`p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 
                    transition-all duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
                  title="Refresh Data"
                >
                  <FiRefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    printWindow.document.write('<html><head><title>Print Receipt</title>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write(document.querySelector('.print-only').innerHTML);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 
                    transition-all duration-200"
                  title="Print Report"
                >
                  <FiPrinter className="h-5 w-5" />
                </button>
                <button
                  onClick={exportToCSV}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 
                    transition-all duration-200"
                  title="Export Data"
                >
                  <FiDownload className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 mb-6">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                    ${timeRange === range 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Statistics Cards - Updated Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Sales Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                  <SalesTrend data={statistics} />
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20"></div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  KES {(statistics.totalSales || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {getSalesPerformance().trend === 'up' ? (
                    <FiTrendingUp className="text-green-500" />
                  ) : (
                    <FiTrendingDown className="text-red-500" />
                  )}
                  <span className={getSalesPerformance().trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {getSalesPerformance().percentage}%
                  </span>
                  <span className="text-gray-500">vs yesterday</span>
                </div>
              </div>

              {/* Today's Sales Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Today's Sales</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  KES {(statistics.todaySales || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Average Transaction Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Avg. Transaction</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  KES {(statistics.averageTransaction || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Per sale average</p>
              </div>

              {/* Total Customers Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Total Customers</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {(statistics.totalCustomers || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Lifetime customers</p>
              </div>
            </div>
          </div>

          {/* Updated Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex flex-wrap gap-4 items-center justify-between w-full">
                <div className="flex gap-4 flex-1">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>

                  <div className="relative flex-1 max-w-md">
                    <input
                      type="search"
                      placeholder="Search by customer name or sale ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border-gray-300 text-sm pl-10 
                        focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <Link
                  to="/sales/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent 
                    text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 
                    transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Sale
                </Link>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
              <p className="text-sm text-gray-500">
                Showing {getFilteredSales().length} of {salesData.length} total sales
              </p>
            </div>
            
            <DataTable
              columns={columns}
              data={getFilteredSales()}
              pagination
              paginationPerPage={screenSize.isMobile ? 5 : screenSize.isTablet ? 8 : 10}
              paginationRowsPerPageOptions={[5, 8, 10, 25, 50]}
              highlightOnHover
              pointerOnHover
              responsive
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
                    minHeight: '48px',
                  },
                },
                headCells: {
                  style: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4B5563',
                    padding: screenSize.isMobile ? '0.5rem' : '1rem',
                  },
                },
                rows: {
                  style: {
                    fontSize: '0.875rem',
                    color: '#1F2937',
                    minHeight: '48px',
                    padding: screenSize.isMobile ? '0.5rem' : '0.75rem 1rem',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                      cursor: 'pointer',
                    },
                  },
                  stripedStyle: {
                    backgroundColor: '#F9FAFB',
                  },
                },
                cells: {
                  style: {
                    padding: screenSize.isMobile ? '4px' : '8px 16px',
                  },
                },
              }}
            />
          </div>
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