import React, { useEffect, useState, useRef } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaSpinner,
  FaDollarSign
} from 'react-icons/fa';

const SalesLineChart = () => {
  const { isDark } = useTheme();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeView, setTimeView] = useState('daily');
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 400 });
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        const screenHeight = window.innerHeight;
        
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
    fetchSalesData();
  }, [timeView]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales`);
      
      const sales = response.data || [];
      console.log('Raw Sales Data:', sales);
      
      const processedData = processDataByTimeView(sales);
      console.log('Processed Sales Data:', processedData);
      
      setSalesData(processedData);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales data');
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const processDataByTimeView = (sales) => {
    if (!Array.isArray(sales)) return [];

    // Helper function to get consistent date string
    const getDateString = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Group sales by date
    const dailyTotals = {};

    sales.forEach(sale => {
      try {
        // Get date string from sale
        const dateStr = getDateString(sale.created_at || sale.date);
        
        // Initialize or update the total for this date
        if (!dailyTotals[dateStr]) {
          dailyTotals[dateStr] = {
            date: new Date(dateStr).getTime(),
            totalAmount: 0
          };
        }

        // Add to daily total
        dailyTotals[dateStr].totalAmount += parseFloat(sale.total_amount) || 0;
      } catch (error) {
        console.error('Error processing sale:', error);
      }
    });

    // Convert to array and sort by date
    const sortedData = Object.values(dailyTotals)
      .sort((a, b) => a.date - b.date);

    console.log('Processed Sales Data:', sortedData); // Debug log
    return sortedData;
  };

  const formatXAxisLabel = (timestamp) => {
    const date = new Date(timestamp);
    
    switch (timeView) {
      case 'daily':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric'
        }).format(date);
      
      case 'weekly':
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric'
        }).format(date)} - ${new Intl.DateTimeFormat('en-US', {
          day: 'numeric'
        }).format(weekEnd)}`;
      
      case 'monthly':
        return new Intl.DateTimeFormat('en-US', {
          month: 'long',
          year: 'numeric'
        }).format(date);
      
      case 'yearly':
        return date.getFullYear().toString();
      
      default:
        return new Intl.DateTimeFormat('en-US').format(date);
    }
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getChartTitle = () => {
    switch (timeView) {
      case 'daily': return 'Daily Sales';
      case 'weekly': return 'Weekly Sales';
      case 'monthly': return 'Monthly Sales';
      case 'yearly': return 'Yearly Sales';
      default: return 'Sales Trend';
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
              ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 border border-emerald-500/20' 
              : 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10'}
            transition-all duration-300`}>
            <FaChartLine className={`w-3.5 h-3.5 xs:w-4 xs:h-4 
              ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
              transition-colors duration-300`} />
          </div>
          <div>
            <h3 className={`text-sm xs:text-base font-semibold 
              ${isDark ? 'text-gray-100' : 'text-gray-800'}
              transition-colors duration-300`}>
              Daily Sales Summary
            </h3>
            <p className={`text-xs 
              ${isDark ? 'text-gray-400' : 'text-gray-500'} 
              transition-colors duration-300 mt-0.5`}>
              Total sales grouped by date
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div ref={chartContainerRef} 
           className={`flex-1 p-3 xs:p-4 sm:p-5 
             ${isDark ? 'bg-gray-800/20' : 'bg-white/50'}
             transition-colors duration-300`}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <FaSpinner className={`w-6 h-6 
              ${isDark ? 'text-emerald-400' : 'text-emerald-500'} 
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
          <LineChart
            xAxis={[{
              data: salesData.map(item => item.date),
              scaleType: 'time',
              tickLabelStyle: {
                fontSize: 12,
                fontWeight: 500,
                fill: isDark ? '#E5E7EB' : '#374151'
              },
              valueFormatter: (value) => {
                const date = new Date(value);
                return new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }).format(date);
              }
            }]}
            yAxis={[{
              tickLabelStyle: {
                fill: isDark ? '#E5E7EB' : '#374151',
                fontSize: 12,
                fontWeight: 500
              }
            }]}
            series={[{
              data: salesData.map(item => item.totalAmount),
              label: 'Daily Sales',
              color: isDark ? '#34D399' : '#059669', // Emerald colors for dark/light
              curve: 'natural',
              showMark: true,
              valueFormatter: (value) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'KES'
              }).format(value)
            }]}
            slotProps={{
              legend: {
                direction: 'row',
                position: { 
                  vertical: 'top', 
                  horizontal: 'middle'
                },
                padding: window.innerWidth < 480 ? 5 : window.innerWidth < 640 ? 10 : 20,
                labelStyle: {
                  fill: isDark ? '#E5E7EB' : '#374151',
                  fontSize: window.innerWidth < 480 ? 9 : window.innerWidth < 640 ? 10 : 12,
                  fontWeight: 500
                }
              }
            }}
            width={chartDimensions.width}
            height={chartDimensions.height}
            margin={{ top: 20, right: 30, bottom: 40, left: 60 }}
            sx={{
              '.MuiLineElement-root': {
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              },
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
              // Legend styling
              '.MuiChartsLegend-label': {
                fill: isDark ? '#E5E7EB' : '#374151',
                fontSize: '0.875rem',
                fontWeight: 500
              },
              // Tooltip styling
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
              },
              // Point markers
              '.MuiMarkElement-root': {
                stroke: isDark ? '#34D399' : '#059669',
                fill: isDark ? '#064E3B' : '#ECFDF5',
                '&:hover': {
                  fill: isDark ? '#34D399' : '#059669',
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SalesLineChart;