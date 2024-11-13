import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  Square3Stack3DIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalSales: 0,
    averagePrice: 0,
    stockValue: 0,
    stockLevels: {
      low: 0,
      medium: 0,
      high: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/products');
        const products = Array.isArray(response.data) ? response.data : response.data.products;

        if (!Array.isArray(products)) {
          throw new Error('Products data is not an array');
        }

        // Calculate report metrics
        const stockValue = products.reduce((sum, product) => 
          sum + (product.stock_quantity * product.selling_price), 0
        );

        const averagePrice = products.reduce((sum, product) => 
          sum + product.selling_price, 0) / products.length;

        // Count products by stock level
        const stockLevels = products.reduce((acc, product) => {
          if (product.stock_quantity <= 10) acc.low++;
          else if (product.stock_quantity <= 30) acc.medium++;
          else acc.high++;
          return acc;
        }, { low: 0, medium: 0, high: 0 });

        setReportData({
          totalSales: 0, // This would come from a sales API endpoint
          averagePrice,
          stockValue,
          stockLevels
        });
      } catch (error) {
        setError('Failed to load report data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Reports</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Analytics and insights about your inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Total Stock Value Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
              Total Stock Value
            </h3>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">
            KES {Number(reportData.stockValue).toLocaleString()}
          </p>
        </div>

        {/* Average Product Price Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wider">
              Average Product Price
            </h3>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-gray-900">
            KES {Number(reportData.averagePrice).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stock Levels */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Square3Stack3DIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Stock Levels</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Low Stock Card */}
          <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <p className="text-sm sm:text-base text-red-800 font-semibold">Low Stock</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                Alert
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-red-700">{reportData.stockLevels.low}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowSmallDownIcon className="w-4 h-4 text-red-600" />
              <p className="text-xs sm:text-sm text-red-600">Items ≤ 10 units</p>
            </div>
          </div>
          
          {/* Medium Stock Card */}
          <div className="bg-yellow-50 rounded-xl p-4 sm:p-6 border border-yellow-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                <p className="text-sm sm:text-base text-yellow-800 font-semibold">Medium Stock</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                Warning
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-yellow-700">{reportData.stockLevels.medium}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowSmallUpIcon className="w-4 h-4 text-yellow-600" />
              <p className="text-xs sm:text-sm text-yellow-600">Items 11-30 units</p>
            </div>
          </div>
          
          {/* Good Stock Card */}
          <div className="bg-green-50 rounded-xl p-4 sm:p-6 border border-green-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <p className="text-sm sm:text-base text-green-800 font-semibold">Good Stock</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                Optimal
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-700">{reportData.stockLevels.high}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowSmallUpIcon className="w-4 h-4 text-green-600" />
              <p className="text-xs sm:text-sm text-green-600">Items &gt; 30 units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 