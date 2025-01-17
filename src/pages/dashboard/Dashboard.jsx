import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ChartsContainer from './ChartsContainer';
import DataTable from "react-data-table-component";
import Loading from '../../components/loading/Loading';
import { useTheme } from '../../context/ThemeContext';

// Import icons
import {
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineShoppingCart,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
} from "react-icons/hi";
import {
  HiOutlineBanknotes,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { PiChartLineUpBold } from "react-icons/pi";
import { TbTruckDelivery } from "react-icons/tb";

const Dashboard = () => {
  const { isDark } = useTheme();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for auth success message
    const authSuccess = sessionStorage.getItem('authSuccess');
    if (authSuccess) {
      setSuccessMessage(authSuccess);
      // Clear the message after showing it
      sessionStorage.removeItem('authSuccess');
      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, []);

  // State declarations
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  // تعريف statsDisplay داخل المكون
  const statsDisplay = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: <HiOutlineCube className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-blue-50',
      textColor: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    {
      title: "Low Stock",
      value: stats.lowStock.toLocaleString(),
      icon: <HiOutlineExclamationCircle className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-yellow-50',
      textColor: isDark ? 'text-yellow-400' : 'text-yellow-600',
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock.toLocaleString(),
      icon: <HiOutlineXCircle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-red-50',
      textColor: isDark ? 'text-red-400' : 'text-red-600',
    },
    {
      title: "Total Value",
      value: `KES ${stats.totalValue.toLocaleString()}`,
      icon: <HiOutlineBanknotes className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-green-50',
      textColor: isDark ? 'text-green-400' : 'text-green-600',
    },
    {
      title: "Today's Sales",
      value: salesStats.todaySales.toLocaleString(),
      subValue: `KES ${salesStats.todayRevenue.toLocaleString()}`,
      icon: <HiOutlineShoppingCart className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-purple-50',
      textColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
    {
      title: "Weekly Sales",
      value: salesStats.weekSales.toLocaleString(),
      icon: <HiOutlineChartBar className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-indigo-50',
      textColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
    },
    {
      title: "Monthly Sales",
      value: salesStats.monthSales.toLocaleString(),
      icon: <HiOutlineCalendar className={`w-8 h-8 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-pink-50',
      textColor: isDark ? 'text-pink-400' : 'text-pink-600',
    },
    {
      title: "Total Revenue",
      value: `KES ${salesStats.totalRevenue.toLocaleString()}`,
      icon: <HiOutlineCurrencyDollar className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />,
      bgColor: isDark ? 'bg-gray-800' : 'bg-emerald-50',
      textColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      
      console.log('Product API URL:', import.meta.env.VITE_Product_URL);

      // Fetch products with error handling
      const productsResponse = await axios.get(import.meta.env.VITE_Product_URL);
      console.log('Raw Product Response:', productsResponse); 

      // Check the data structure
      let products = [];
      if (productsResponse.data.products) {
        products = productsResponse.data.products;
      } else if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      }
      
      console.log('Processed Products:', products);

     
      const formattedProducts = products.map(product => ({
        id: product.id,
        product_name: product.product_name || 'Unnamed Product',
        stock_quantity: product.stock_quantity || 0,
        selling_price: product.selling_price || 0,
        product_price: product.product_price || 0,
        created_at: product.created_at || new Date().toISOString(),
        // sku: product.sku || 'N/A'
      }));

      console.log('Formatted Products:', formattedProducts); 

      // Update statsf
      const productStats = {
        totalProducts: formattedProducts.length,
        lowStock: formattedProducts.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length,
        outOfStock: formattedProducts.filter(p => p.stock_quantity === 0).length,
        totalValue: formattedProducts.reduce((sum, p) => sum + (p.stock_quantity * p.selling_price), 0)
      };

      // Sort products by creation date (newest first)
      const sortedProducts = formattedProducts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      // Update state
      setStats(productStats);
      setRecentProducts(sortedProducts.slice(0, 1000));

      // Fetch sales data
      const salesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/sales`);
      const sales = Array.isArray(salesResponse.data) ? salesResponse.data : [];
      
      // Calculate sales statistics
      const salesStatistics = calculateSalesStats(sales);
      setSalesStats(salesStatistics);
      setRecentSales(sales.slice(0, 1000000));

    } catch (err) {
      console.error('Fetch Error:', err);
      if (err.response) {
        console.error('Error Response:', err.response.data);
        setError(`Failed to load data: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        console.error('No Response:', err.request);
        setError("Network error - no response received");
      } else {
        console.error('Error Details:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect with error boundary
  useEffect(() => {
    fetchDashboardData().catch(err => {
      console.error('Effect Error:', err);
      setError("Failed to initialize dashboard");
      setLoading(false);
    });
  }, []);

  // Add console log to check state updates
  useEffect(() => {
    console.log('Recent Products State:', recentProducts);
  }, [recentProducts]);

  // Quick actions configuration
  const quickActions = [
    {
      title: "Add Product",
      icon: <HiOutlinePlusCircle className="w-5 h-5" />,
      bgColor: isDark 
        ? "bg-blue-500/20 border border-blue-500/30" 
        : "bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50",
      hoverColor: isDark 
        ? "hover:bg-blue-500/30 hover:border-blue-500/50" 
        : "hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200/80 hover:border-blue-300/50",
      textColor: isDark ? "text-blue-400" : "text-blue-600",
      link: "/products/create",
    },
    {
      title: "Create Sale",
      icon: <HiOutlineBanknotes className="w-5 h-5" />,
      bgColor: isDark 
        ? "bg-emerald-500/20 border border-emerald-500/30" 
        : "bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/50",
      hoverColor: isDark 
        ? "hover:bg-emerald-500/30 hover:border-emerald-500/50" 
        : "hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-200/80 hover:border-emerald-300/50",
      textColor: isDark ? "text-emerald-400" : "text-emerald-600",
      link: "/sales/create",
    },
    {
      title: "View Reports",
      icon: <HiOutlineDocumentText className="w-5 h-5" />,
      bgColor: isDark 
        ? "bg-purple-500/20 border border-purple-500/30" 
        : "bg-gradient-to-br from-purple-50 to-purple-100/80 border border-purple-200/50",
      hoverColor: isDark 
        ? "hover:bg-purple-500/30 hover:border-purple-500/50" 
        : "hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200/80 hover:border-purple-300/50",
      textColor: isDark ? "text-purple-400" : "text-purple-600",
      link: "/reports",
    },
    {
      title: "View Vendors",
      icon: <HiOutlineUsers className="w-5 h-5" />,
      bgColor: isDark 
        ? "bg-indigo-500/20 border border-indigo-500/30" 
        : "bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-200/50",
      hoverColor: isDark 
        ? "hover:bg-indigo-500/30 hover:border-indigo-500/50" 
        : "hover:bg-gradient-to-br hover:from-indigo-100 hover:to-indigo-200/80 hover:border-indigo-300/50",
      textColor: isDark ? "text-indigo-400" : "text-indigo-600",
      link: "/vendors",
    },
  ];

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_Product_URL}/${productId}`);
        // Refresh the data
        fetchDashboardData();
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };


  const recentProductColumns = [
    {
      name: "ID",
      selector: row => row.id,
      sortable: true,
      width: "80px",
      cell: row => (
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          #{row.id}
        </span>
      )
    },
    {
      name: "Product",
      cell: row => (
        <div className="py-1">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {row.product_name}
          </div>
        </div>
      ),
      width: "200px"
    },
    {
      name: "Stock",
      cell: row => (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold 
          ${isDark ? (
            row.stock_quantity === 0
              ? 'bg-red-900/30 text-red-400 ring-1 ring-red-400/30'
              : row.stock_quantity <= 10
                ? 'bg-yellow-900/30 text-yellow-400 ring-1 ring-yellow-400/30'
                : 'bg-green-900/30 text-green-400 ring-1 ring-green-400/30'
          ) : (
            row.stock_quantity === 0
              ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
              : row.stock_quantity <= 10
                ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
                : 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
          )}`}>
          <div className={`w-2 h-2 rounded-full ${
            row.stock_quantity === 0
              ? 'bg-red-500'
              : row.stock_quantity <= 10
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }`} />
          {row.stock_quantity}
        </span>
      ),
      width: "120px",
      sortable: true
    },
    {
      name: "Price",
      cell: row => (
        <div className="text-right">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            KES {row.selling_price.toLocaleString()}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Cost: KES {row.product_price.toLocaleString()}
          </div>
        </div>
      ),
      width: "150px",
      sortable: true
    },
    {
      name: "Status",
      cell: row => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isDark ? (
            row.stock_quantity === 0
              ? 'bg-red-900/30 text-red-400'
              : row.stock_quantity <= 10
                ? 'bg-yellow-900/30 text-yellow-400'
                : 'bg-green-900/30 text-green-400'
          ) : (
            row.stock_quantity === 0
              ? 'bg-red-100 text-red-800'
              : row.stock_quantity <= 10
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          )}`}>
          {row.stock_quantity === 0
            ? 'Out of Stock'
            : row.stock_quantity <= 10
              ? 'Low Stock'
              : 'In Stock'}
        </span>
      ),
      width: "120px"
    },
    {
      name: "Actions",
      cell: row => (
        <div className="flex items-center justify-end gap-3 px-4">
          <Link to={`/products/${row.id}`} className="relative group">
            <div className={`flex items-center justify-center w-8 h-8 
              ${isDark ? 'bg-blue-400/10 hover:bg-blue-400/20' : 'bg-blue-500/10 hover:bg-blue-500/20'}
              rounded-xl hover:rounded-lg 
              ${isDark ? 'border-blue-400/20' : 'border-blue-500/20'} border
              transition-all duration-300 ease-out
              group-hover:shadow-lg ${isDark ? 'group-hover:shadow-blue-400/20' : 'group-hover:shadow-blue-500/20'}
              group-active:scale-95`}>
              <HiOutlineInformationCircle className={`w-4 h-4 
                ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'}
                transition-colors duration-200`} />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5
                bg-gray-900/90 backdrop-blur-sm text-white text-xs
                rounded-full font-medium invisible opacity-0
                group-hover:visible group-hover:opacity-100
                transition-all duration-300 whitespace-nowrap">
                View Details
              </div>
            </div>
          </Link>

          <Link
            to={`/products/edit/${row.id}`}
            className="relative group"
          >
            <div className="flex items-center justify-center w-8 h-8 
                          backdrop-blur-sm bg-violet-500/10 hover:bg-violet-500/20
                          rounded-xl hover:rounded-lg border border-violet-500/20
                          transition-all duration-300 ease-out
                          group-hover:shadow-lg group-hover:shadow-violet-500/20
                          group-active:scale-95">
              <HiOutlinePencil className="w-4 h-4 text-violet-600 
                                      group-hover:text-violet-700
                                      transition-colors duration-200" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5
                            bg-gray-900/80 backdrop-blur-sm text-white text-xs
                            rounded-full font-medium invisible opacity-0
                            group-hover:visible group-hover:opacity-100
                            transition-all duration-300 whitespace-nowrap">
                Edit Product
              </div>
            </div>
          </Link>

          <button
            onClick={() => handleDeleteProduct(row.id)}
            className="relative group"
          >
            <div className="flex items-center justify-center w-8 h-8 
                          backdrop-blur-sm bg-rose-500/10 hover:bg-rose-500/20
                          rounded-xl hover:rounded-lg border border-rose-500/20
                          transition-all duration-300 ease-out
                          group-hover:shadow-lg group-hover:shadow-rose-500/20
                          group-active:scale-95">
              <HiOutlineTrash className="w-4 h-4 text-rose-600 
                                     group-hover:text-rose-700
                                     transition-colors duration-200" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5
                            bg-gray-900/80 backdrop-blur-sm text-white text-xs
                            rounded-full font-medium invisible opacity-0
                            group-hover:visible group-hover:opacity-100
                            transition-all duration-300 whitespace-nowrap">
                Delete Product
              </div>
            </div>
          </button>
        </div>
      ),
      width: "180px",
      alignRight: true
    }
  ];


  const recentSalesColumns = [
    {
      name: "ID",
      selector: row => row.id,
      sortable: true,
      width: "80px",
      cell: row => (
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          #{row.id}
        </span>
      )
    },
    {
      name: "Product ID",
      cell: row => (
        <div className="py-1">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            #{row.pid}
          </div>
        </div>
      ),
      width: "100px",
      sortable: true
    },
    {
      name: "Customer",
      cell: row => (
        <div className="py-1">
          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {row.first_name}
          </div>
          <div className="text-xs text-gray-500">
            ID: {row.user_id}
          </div>
        </div>
      ),
      width: "150px"
    },
    {
      name: "Quantity",
      cell: row => (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          row.quantity <= 5 
            ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' 
            : row.quantity <= 10 
              ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
              : 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
        }`}>
          <div 
            className={`w-2 h-2 rounded-full ${
              row.quantity <= 5 
                ? 'bg-red-500'
                : row.quantity <= 10
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
          />
          {row.quantity}
        </span>
      ),
      width: "120px",
      sortable: true
    },
    {
      name: "Amount",
      cell: row => (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            KES {row.total_amount.toLocaleString()}
          </div>
        </div>
      ),
      width: "130px",
      sortable: true
    },
    {
      name: "Date",
      cell: row => {
        const date = new Date(row.created_at);
        return (
          <div className="text-sm text-gray-900">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
      width: "150px",
      sortable: true
    }
  ];

  // تحديث حساب إحصائيات المبيعات
  const calculateSalesStats = (sales) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    return sales.reduce((stats, sale) => {
      const saleDate = new Date(sale.created_at);
      const saleAmount = sale.total_amount;

      stats.totalSales++;
      stats.totalRevenue += saleAmount;

      if (saleDate >= today) {
        stats.todaySales++;
        stats.todayRevenue += saleAmount;
      }
      if (saleDate >= weekAgo) {
        stats.weekSales++;
      }
      if (saleDate >= monthAgo) {
        stats.monthSales++;
      }

      return stats;
    }, {
      totalSales: 0,
      todaySales: 0,
      weekSales: 0,
      monthSales: 0,
      totalRevenue: 0,
      todayRevenue: 0,
    });
  };

  return (
    <div className="relative min-h-full pb-16">
      <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} 
        backdrop-blur-sm border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}
        sticky top-0 z-10`}>
            {/* Success Message */}
        {successMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            isDark 
              ? 'bg-green-900/50 text-green-200 border border-green-800' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className={`text-xl sm:text-2xl font-bold 
              ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              {/* ... existing header content ... */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-5 lg:mb-8">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-2.5 sm:p-4 lg:p-5 
                ${isDark 
                  ? 'shadow-lg shadow-gray-800/50 border-gray-700' 
                  : 'shadow-sm border-gray-100'} 
                border transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 ${stat.bgColor} rounded-lg`}>
                  {stat.icon}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 
                  rounded-full ${stat.bgColor} ${stat.textColor}`}>
                  Last 30 days
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-medium 
                ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {stat.title}
              </p>
              <p className={`text-base sm:text-lg lg:text-xl font-bold 
                ${isDark ? 'text-gray-100' : 'text-gray-900'} mt-0.5 sm:mt-1`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          rounded-lg shadow-sm border`}>
          <ChartsContainer isDark={isDark} />
        </div>

        <div className="mt-3 sm:mt-4 lg:mt-6 space-y-2 sm:space-y-3">
          <h2 className={`text-sm sm:text-base lg:text-lg font-semibold 
            ${isDark ? 'text-gray-100' : 'text-gray-900'}
            flex items-center gap-2`}>
            <TbTruckDelivery className={`w-4 h-4 sm:w-5 sm:h-5 
              ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.bgColor} ${action.hoverColor} 
                  rounded-lg sm:rounded-xl 
                  p-3 sm:p-4 lg:p-5 
                  shadow-sm transition-all duration-300 
                  hover:shadow-md hover:scale-[1.02]
                  backdrop-blur-sm
                  ${isDark ? 'shadow-gray-900/30' : 'shadow-gray-200/50'}`}
              >
                <div className={`flex items-center gap-2 sm:gap-3 ${action.textColor}`}>
                  <div className={`p-1.5 sm:p-2 rounded-lg 
                    ${isDark ? 'bg-white/5' : 'bg-white/80'} 
                    backdrop-blur-sm`}>
                    <span className="w-4 h-4 sm:w-5 sm:h-5">
                      {action.icon}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">
                    {action.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
            rounded-lg shadow-sm border`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} 
                flex items-center gap-2`}>
                <HiOutlineCube className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                Recent Added Products
              </h2>
            </div>

            {loading && <Loading text="Loading products..." />}
            {error && (
              <div className={`p-4 text-center ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {error}
              </div>
            )}
            {!loading && !error && recentProducts.length === 0 && (
              <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No products found
              </div>
            )}
            {!loading && !error && recentProducts.length > 0 && (
              <div className="overflow-hidden">
                <DataTable
                  columns={recentProductColumns}
                  data={recentProducts}
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10]}
                  className="rounded-lg"
                  highlightOnHover
                  pointerOnHover
                  responsive
                  dense
                  noHeader
                  persistTableHead
                  theme={isDark ? 'dark' : 'light'}
                  customStyles={{
                    table: {
                      style: {
                        backgroundColor: isDark ? '#1F2937' : 'white',
                        borderRadius: '0.5rem',
                      },
                    },
                    headRow: {
                      style: {
                        backgroundColor: isDark ? '#374151' : '#F9FAFB',
                        borderBottomWidth: '1px',
                        borderBottomColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    },
                    rows: {
                      style: {
                        fontSize: '0.875rem',
                        color: isDark ? '#D1D5DB' : '#1F2937',
                        borderBottomWidth: '1px',
                        borderBottomColor: isDark ? '#4B5563' : '#E5E7EB',
                        '&:hover': {
                          backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        },
                      },
                    },
                    pagination: {
                      style: {
                        backgroundColor: isDark ? '#1F2937' : 'white',
                        borderTopWidth: '1px',
                        borderTopColor: isDark ? '#4B5563' : '#E5E7EB',
                        color: isDark ? '#D1D5DB' : '#1F2937',
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
            rounded-lg shadow-sm border`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} 
                flex items-center gap-2`}>
                <HiOutlineShoppingCart className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                Recent Sales
              </h2>
            </div>

            {loading && <Loading text="Loading sales..." />}
            {error && (
              <div className={`p-4 text-center ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {error}
              </div>
            )}
            {!loading && !error && recentSales.length === 0 && (
              <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No sales found
              </div>
            )}
            {!loading && !error && recentSales.length > 0 && (
              <div className="overflow-hidden">
                <DataTable
                  columns={recentSalesColumns}
                  data={recentSales}
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10]}
                  className="rounded-lg"
                  highlightOnHover
                  pointerOnHover
                  responsive
                  dense
                  noHeader
                  persistTableHead
                  theme={isDark ? 'dark' : 'light'}
                  customStyles={{
                    table: {
                      style: {
                        backgroundColor: isDark ? '#1F2937' : 'white',
                        borderRadius: '0.5rem',
                      },
                    },
                    headRow: {
                      style: {
                        backgroundColor: isDark ? '#374151' : '#F9FAFB',
                        borderBottomWidth: '1px',
                        borderBottomColor: isDark ? '#4B5563' : '#E5E7EB',
                      },
                    },
                    rows: {
                      style: {
                        fontSize: '0.875rem',
                        color: isDark ? '#D1D5DB' : '#1F2937',
                        borderBottomWidth: '1px',
                        borderBottomColor: isDark ? '#4B5563' : '#E5E7EB',
                        '&:hover': {
                          backgroundColor: isDark ? '#374151' : '#F3F4F6',
                        },
                      },
                    },
                    pagination: {
                      style: {
                        backgroundColor: isDark ? '#1F2937' : 'white',
                        borderTopWidth: '1px',
                        borderTopColor: '#E5E7EB',
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
