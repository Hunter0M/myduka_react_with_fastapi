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
import SalesLayout from "../../components/layout/SalesLayout";
import { useTheme } from "../../context/ThemeContext";
ChartJS.register(ArcElement, Tooltip, Legend);

const url = import.meta.env.VITE_BACKEND_URL;

const Sales = () => {
  const { isDark } = useTheme();
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
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by created_at in descending order
        .map(sale => ({
          ...sale,
          product: {
            product_name: sale.product_name || 'Unknown Product', // Ensure product_name is always a string
            selling_price: parseFloat(sale.product_price) || 0 // Ensure selling_price is always a number
          },
          total_amount: parseFloat(sale.total_amount) || 0, // Ensure total_amount is always a number
          quantity: parseInt(sale.quantity) || 0, // Ensure quantity is always an integer
        }));

      console.log('Processed sales:', sortedSales); // Debug log
      setSalesData(sortedSales); // Set the processed sales data
      calculateStatistics(sortedSales); // Calculate statistics

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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Filter sales based on selected time range
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      switch (timeRange) {
        case 'today':
          return saleDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    });

    const stats = filteredSales.reduce((acc, sale) => {
      const saleDate = new Date(sale.created_at);
      const saleAmount = parseFloat(sale.total_amount) || 0;
      
      if (saleDate >= today) {
        acc.todaySales += saleAmount;
      }
      
      if (saleDate >= yesterday && saleDate < today) {
        acc.yesterdaySales += saleAmount;
      }
      
      acc.totalSales += saleAmount;

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

    setStatistics({
      totalSales: stats.totalSales,
      todaySales: stats.todaySales,
      yesterdaySales: stats.yesterdaySales,
      averageTransaction: filteredSales.length ? (stats.totalSales / filteredSales.length) : 0,
      totalCustomers: stats.customers.size,
    });
  };

  // Add useEffect to recalculate statistics when timeRange changes
  useEffect(() => {
    calculateStatistics(salesData);
  }, [timeRange, salesData]);

  // Filter sales by date
  const getFilteredSales = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return salesData.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      // Time range filtering
      switch (timeRange) {
        case 'today':
          return saleDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    }).filter(sale => 
      sale.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id?.toString().includes(searchTerm)
    );
  };

  const showNotification = (message, type = 'success') => { // Show notification
    setNotification({ show: true, message, type }); // Set notification
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' }); // Hide notification after 3 seconds
    }, 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) { // Confirm delete
      setLoading(true); // Set loading to true
      try {
        await axios.delete(`${url}/sales/${id}`); // Delete sale
        showNotification('Sale deleted successfully'); // Show success notification
        fetchData(); // Fetch data
      } catch (error) {
        console.error("Error deleting sale:", error); // Log error
        showNotification('Failed to delete sale', 'error'); // Show error notification
      } finally {
        setLoading(false); // Set loading to false
      }
    }
  };

  const getSalesPerformance = () => { // Get sales performance
    if (statistics.yesterdaySales === 0) {
      // If there were no sales yesterday, any sales today represent 100% increase
      return {
        trend: statistics.todaySales > 0 ? 'up' : 'neutral', // Set trend to up if today's sales are greater than 0
        percentage: statistics.todaySales > 0 ? 100 : 0 // Set percentage to 100 if today's sales are greater than 0
      };
    }

    const percentageChange = ((statistics.todaySales - statistics.yesterdaySales) / statistics.yesterdaySales) * 100; // Calculate percentage change
    
    return {
      trend: percentageChange >= 0 ? 'up' : 'down', // Set trend to up if percentage change is greater than or equal to 0
      percentage: Math.abs(percentageChange).toFixed(1) // Set percentage to absolute value of percentage change
    };
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true); // Set refreshing to true
    await fetchData(); // Fetch data
    setIsRefreshing(false); // Set refreshing to false
  };

  // Add this useEffect to handle screen resize
  useEffect(() => {
    const handleResize = () => { // Handle screen resize
      const width = window.innerWidth; // Get window width
      setScreenSize({ // Set screen size
        isMobile: width < 640, // Set isMobile to true if width is less than 640
        isSmall: width < 768, // Set isSmall to true if width is less than 768
        isTablet: width < 1024, // Set isTablet to true if width is less than 1024
        isDesktop: width >= 1024 // Set isDesktop to true if width is greater than or equal to 1024
      });
    };

    window.addEventListener('resize', handleResize); // Add event listener for screen resize
    return () => window.removeEventListener('resize', handleResize); // Remove event listener for screen resize
  }, []);

  // columns
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
        <div className={`text-sm font-medium truncate max-w-[130px] sm:max-w-full 
          ${isDark ? 'text-gray-200' : 'text-gray-900'}`}> 
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
        <div className={`text-sm truncate max-w-[130px] sm:max-w-full
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
        <span className={`text-sm font-medium
          ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
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
        <div className={`text-sm
          ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
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
        <div className={`text-sm font-medium
          ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
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
        <div className={`text-sm
          ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200
              ${isDark 
                ? 'text-blue-400 hover:bg-blue-900/50' 
                : 'text-blue-600 hover:bg-blue-50'}`}
            title="View Receipt"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <Link
            to={`/sales/edit/${row.id}`}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200
              ${isDark 
                ? 'text-green-400 hover:bg-green-900/50' 
                : 'text-green-600 hover:bg-green-50'}`}
            title="Edit Sale"
          >
            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200
              ${isDark 
                ? 'text-red-400 hover:bg-red-900/50' 
                : 'text-red-600 hover:bg-red-50'}`}
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

  const SalesTrend = ({ data }) => { // Sales trend
    const todayPercentage = data.totalSales ? (data.todaySales / data.totalSales) * 100 : 0; // Calculate today's percentage
    
    const chartData = { // Chart data
      labels: ['Today', 'Previous'], // Labels
      datasets: [{ // Datasets
        data: [data.todaySales, data.totalSales - data.todaySales], // Data
        backgroundColor: ['#3B82F6', '#E5E7EB'], // Background color
        borderWidth: 0, // Border width
        cutout: '80%', // Cutout
        borderRadius: 8, // Border radius
      }]
    };

    const options = { // Chart options
      plugins: {
        legend: { display: false }, // Hide legend
        tooltip: {
          enabled: true, // Enable tooltip
          callbacks: { // Callbacks
            label: (context) => { // Label
              const value = context.raw; // Get value
              return `KES ${value.toLocaleString()}`;
            }
          },
          backgroundColor: '#1F2937', // Background color
          padding: 12, // Padding
          cornerRadius: 8, // Corner radius
          titleFont: { // Title font
            size: 14, // Font size
            weight: 'bold' // Font weight
          },
          bodyFont: { // Body font
            size: 13 // Font size
          }
        }
      },
      maintainAspectRatio: false, // Maintain aspect ratio
      rotation: -90, // Rotation
      circumference: 360, // Circumference
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

    const csvData = filteredData.map(sale => [ // Map filtered data to CSV data
      sale.id, // Sale ID
      `${sale.first_name || ''} ${sale.last_name || ''}`, // Customer name
      sale.product.product_name, // Product name
      sale.quantity, // Quantity
      sale.product.selling_price, // Unit price
      sale.total_amount, // Total amount
      new Date(sale.created_at).toLocaleDateString()
    ]);

    const csvContent = [ // CSV content
      headers.join(','), // Join headers with commas
      ...csvData.map(row => row.join(',')) // Map rows to CSV data
    ].join('\n'); // Join rows with new lines

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
    <SalesLayout>
      <div className={`min-h-screen p-2 sm:p-4 print:p-0 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} print:bg-white`}>
        <PrintLayout salesData={getFilteredSales()} />

        <div className="print:hidden space-y-4 sm:space-y-6">
          {/* Notification - Made more visible on mobile */}
          {notification.show && (
            <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              notification.type === 'error' 
                ? `${isDark ? 'bg-red-900 text-red-100 border-red-800' : 'bg-red-100 text-red-800 border-red-200'}`
                : `${isDark ? 'bg-green-900 text-green-100 border-green-800' : 'bg-green-100 text-green-800 border-green-200'}`
            }`}>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          )}

          {/* Enhanced Header Section */}
          <div className={` bg-opacity-95 backdrop-blur-lg border-b shadow-sm
            ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              {/* Header Content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Title Section */}
                <div className="space-y-1">
                  <h1 className={`text-xl sm:text-2xl font-bold tracking-tight
                    ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Sales Dashboard
                  </h1>
                  <p className={`text-sm sm:text-base font-medium
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome back! Here's what's happening with your sales today.
                  </p>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-3">
                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <button
                      onClick={handleRefreshData}
                      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105
                        ${isDark 
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50 active:bg-gray-600' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}
                      title="Refresh Data"
                    >
                      <FiRefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Print Button */}
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
                      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105
                        ${isDark 
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50 active:bg-gray-600' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}
                      title="Print Report"
                    >
                      <FiPrinter className="h-5 w-5" />
                    </button>

                    {/* Export Button */}
                    <button
                      onClick={exportToCSV}
                      className={`p-2 rounded-lg border transition-all duration-200 hover:scale-105
                        ${isDark 
                          ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50 active:bg-gray-600' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100'}`}
                      title="Export Data"
                    >
                      <FiDownload className="h-5 w-5" />
                    </button>
                  </div>

                  {/* New Sale Button */}
                  <Link
                    to="/sales/create"
                    className={`inline-flex items-center px-4 py-2.5 rounded-lg font-medium
                      transition-all duration-200 transform hover:scale-105
                      shadow-sm hover:shadow-lg active:scale-95
                      ${isDark 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                      }`}
                  >
                    <svg 
                      className="h-5 w-5 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                      />
                    </svg>
                    <span className="text-sm sm:text-base">New Sale</span>
                  </Link>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="flex gap-2 mt-4 pb-1 overflow-x-auto scrollbar-hide">
                {['today', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium 
                      whitespace-nowrap transition-all duration-200
                      hover:scale-105 active:scale-95
                      ${timeRange === range 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Cards - Updated Design with Dark Mode Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales Card */}
            <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border relative overflow-hidden
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className={`absolute top-3 right-3 ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-1 shadow-sm`}>
                <SalesTrend data={statistics} />
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                <div className={`absolute inset-0 rounded-full opacity-20 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}></div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                  <CurrencyDollarIcon className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Sales</h3>
              </div>
              <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                KES {(statistics.totalSales || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-sm">
                {getSalesPerformance().trend === 'up' ? (
                  <FiTrendingUp className="text-green-500" />
                ) : (
                  <FiTrendingDown className="text-red-500" />
                )}
                <span className={getSalesPerformance().trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {getSalesPerformance().percentage}%
                </span>
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>vs yesterday</span>
              </div>
            </div>

            {/* Today's Sales Card */}
            <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/50' : 'bg-green-50'}`}>
                  <CalendarIcon className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Today's Sales</h3>
              </div>
              <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                KES {(statistics.todaySales || 0).toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Average Transaction Card */}
            <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-50'}`}>
                  <ShoppingCartIcon className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Transaction</h3>
              </div>
              <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                KES {(statistics.averageTransaction || 0).toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Per sale average</p>
            </div>

            {/* Total Customers Card */}
            <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/50' : 'bg-orange-50'}`}>
                  <UserGroupIcon className={`h-6 w-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Customers</h3>
              </div>
              <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {(statistics.totalCustomers || 0).toLocaleString()}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lifetime customers</p>
            </div>
          </div>

          {/* Search and Filters - Improved mobile layout */}
          <div className={`mx-3 sm:mx-6 lg:mx-8 p-3 sm:p-4 rounded-lg border
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sales..."
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors duration-200
                    ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
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
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`rounded-lg border text-sm transition-colors duration-200
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* DataTable - Improved responsive behavior */}
          <div className={`mx-3 sm:mx-6 lg:mx-8 rounded-lg shadow-sm overflow-hidden
            ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <DataTable
              columns={columns}
              data={getFilteredSales()}
              pagination
              responsive
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
                  },
                },
                cells: {
                  style: {
                    padding: '12px 16px',
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
    </SalesLayout>
  );
};

export default Sales;