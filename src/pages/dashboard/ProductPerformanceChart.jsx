import React, { useEffect, useState, useRef } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  FaChartBar, 
  FaSort, 
  FaExclamationTriangle, 
  FaSpinner,
  FaDollarSign
} from 'react-icons/fa';

const ProductPerformanceChart = () => {
  const { isDark } = useTheme();
  const [productNames, setProductNames] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 400 });
  const chartContainerRef = useRef(null);

  // Enhanced resize handler
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        const screenHeight = window.innerHeight;
        
        // Responsive dimensions based on screen size
        const dimensions = {
          width: Math.max(containerWidth - 20, 300), // Minimum width of 300px
          height: screenHeight < 600 ? 250 : // Mobile portrait
                 screenHeight < 800 ? 300 : // Mobile landscape/tablet
                 screenHeight < 1024 ? 350 : // Small desktop
                 400 // Large desktop
        };
        
        setChartDimensions(dimensions);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    fetchProductData();
  }, [displayCount]);

  // Enhanced product name formatting
  const formatProductName = (name) => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 360) return name.slice(0, 6) + '...';
    if (screenWidth < 480) return name.slice(0, 8) + '...';
    if (screenWidth < 768) return name.slice(0, 12) + '...';
    return name.slice(0, 20) + (name.length > 20 ? '...' : '');
  };

  const fetchProductData = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_Product_URL);

      let productsArray = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          productsArray = response.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (typeof response.data === 'object') {
          productsArray = Object.values(response.data).filter(Array.isArray)[0] || [];
        }
      }

      if (productsArray.length === 0) {
        throw new Error('No product data available');
      }

      const products = productsArray.filter(product => 
        product && 
        product.product_name &&
        (typeof product.selling_price === 'number' || typeof product.selling_price === 'string') &&
        (typeof product.product_price === 'number' || typeof product.product_price === 'string')
      );

      if (products.length === 0) {
        throw new Error('No valid product data available');
      }

      const sortedProducts = products
        .map(product => ({
          name: formatProductName(product.product_name),
          sales: Number(product.selling_price),
          profit: Number(product.selling_price) - Number(product.product_price),
          fullName: product.product_name
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, displayCount);

      setProductNames(sortedProducts.map(product => product.name));
      setSalesData(sortedProducts.map(product => product.sales));
      setProfitData(sortedProducts.map(product => product.profit));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch product data');
      setProductNames([]);
      setSalesData([]);
      setProfitData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-full flex flex-col rounded-xl 
      ${isDark ? 'bg-gray-800/40 backdrop-blur-sm border border-gray-700/50' : 'bg-white'}
      transition-colors duration-300`}>
      {/* Chart Header */}
      <div className={`flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 
        p-3 xs:p-4 sm:p-5 border-b 
        ${isDark ? 'border-gray-700/50' : 'border-gray-100'}
        transition-colors duration-300`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 xs:p-2 rounded-lg
            ${isDark 
              ? 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-500/10 border border-blue-500/20' 
              : 'bg-gradient-to-br from-blue-500/20 to-blue-500/10'}
            transition-all duration-300`}>
            <FaChartBar className={`w-3.5 h-3.5 xs:w-4 xs:h-4 
              ${isDark ? 'text-blue-400' : 'text-blue-600'}
              transition-colors duration-300`} />
          </div>
          <div>
            <h3 className={`text-sm xs:text-base font-semibold 
              ${isDark ? 'text-gray-100' : 'text-gray-800'}
              transition-colors duration-300`}>
              Product Performance
            </h3>
            <p className={`text-xs 
              ${isDark ? 'text-gray-400' : 'text-gray-500'} 
              transition-colors duration-300 mt-0.5`}>
              Sales and profit by product
            </p>
          </div>
        </div>

        <select
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
          className={`px-2 py-1 text-xs sm:text-sm border rounded-lg
            ${isDark 
              ? 'bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-700/70' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
            focus:outline-none focus:ring-2 
            ${isDark ? 'focus:ring-blue-500/30' : 'focus:ring-blue-500/50'}
            transition-all duration-300`}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={15}>Top 15</option>
        </select>
      </div>

      {/* Chart Area */}
      <div ref={chartContainerRef} 
           className={`flex-1 p-3 xs:p-4 sm:p-5 
             ${isDark ? 'bg-gray-800/20' : 'bg-white/50'}
             transition-colors duration-300`}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <FaSpinner className={`w-6 h-6 
              ${isDark ? 'text-blue-400' : 'text-blue-500'} 
              animate-spin transition-colors duration-300`} />
          </div>
        ) : error ? (
          <div className={`h-full flex items-center justify-center gap-2 
            ${isDark ? 'text-red-400' : 'text-red-500'}
            transition-colors duration-300`}>
            <FaExclamationTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: productNames,
              tickLabelStyle: {
                angle: window.innerWidth < 360 ? 75 : window.innerWidth < 640 ? 60 : 45,
                textAnchor: 'start',
                fontSize: window.innerWidth < 360 ? 8 : window.innerWidth < 480 ? 10 : 12,
                fontWeight: 500,
                fill: isDark ? '#D1D5DB' : '#374151',
              },
              tickSize: 0,
              borderWidth: 0,
              tickMargin: window.innerWidth < 480 ? 2 : window.innerWidth < 640 ? 4 : 8,
            }]}
            series={[
              { 
                data: salesData,
                label: 'Sales',
                color: isDark ? 'rgb(59, 130, 246)' : 'rgb(25, 118, 210)', // Brighter blue for dark mode
                valueFormatter: (value) => new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  maximumFractionDigits: 0
                }).format(value)
              },
              { 
                data: profitData,
                label: 'Profit',
                color: isDark ? 'rgb(167, 139, 250)' : 'rgb(156, 39, 176)', // Brighter purple for dark mode
                valueFormatter: (value) => new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  maximumFractionDigits: 0
                }).format(value)
              }
            ]}
            width={chartDimensions.width}
            height={chartDimensions.height}
            margin={{ 
              top: 20, 
              right: window.innerWidth < 480 ? 10 : window.innerWidth < 640 ? 20 : 30,
              bottom: window.innerWidth < 480 ? 90 : window.innerWidth < 640 ? 80 : 60,
              left: window.innerWidth < 480 ? 30 : window.innerWidth < 640 ? 40 : 60 
            }}
            slotProps={{
              legend: {
                direction: 'row',
                position: { 
                  vertical: 'top', 
                  horizontal: window.innerWidth < 480 ? 'middle' : 'right'
                },
                padding: window.innerWidth < 480 ? 5 : window.innerWidth < 640 ? 10 : 20,
                labelStyle: {
                  fill: isDark ? '#E5E7EB' : '#4B5563',
                  fontSize: window.innerWidth < 480 ? 9 : window.innerWidth < 640 ? 10 : 12,
                  fontWeight: 500
                }
              }
            }}
            yAxis={[{
              tickLabelStyle: {
                fill: isDark ? '#E5E7EB' : '#374151',
                fontSize: 12,
                fontWeight: 500
              }
            }]}
            sx={{
              '.MuiChartsAxis-line': {
                stroke: isDark ? '#4B5563' : '#E5E7EB',
                strokeWidth: isDark ? 0.5 : 1,
              },
              '.MuiChartsAxis-tick': {
                stroke: isDark ? '#4B5563' : '#E5E7EB',
                strokeWidth: isDark ? 0.5 : 1,
              },
              '.MuiChartsAxis-tickLabel': {
                fill: isDark ? '#E5E7EB' : '#374151',
              },
              '.MuiChartsAxis-grid': {
                stroke: isDark ? 'rgba(75, 85, 99, 0.2)' : '#F3F4F6',
                strokeDasharray: isDark ? '2 2' : 'none',
              },
              // Enhanced tooltip styling
              '.MuiTooltip-tooltip': {
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : '#E5E7EB'}`,
                color: isDark ? '#F3F4F6' : '#111827',
                boxShadow: isDark 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductPerformanceChart;