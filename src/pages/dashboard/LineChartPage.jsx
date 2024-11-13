// import React, { useState, useEffect, useRef } from 'react';
// import { LineChart } from '@mui/x-charts/LineChart';
// import axios from 'axios';
// import { 
//   FaChartLine, 
//   FaCalendarAlt, 
//   FaSpinner, 
//   FaExclamationTriangle,
//   FaDownload
// } from 'react-icons/fa';

// const LineChartPage = () => {
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [timeView, setTimeView] = useState('monthly');
//   const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 400 });
//   const chartContainerRef = useRef(null);

//   // Handle resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (chartContainerRef.current) {
//         const containerWidth = chartContainerRef.current.offsetWidth;
//         setChartDimensions({
//           width: containerWidth - 20,
//           height: Math.max(300, containerWidth * 0.5)
//         });
//       }
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Fetch Data
//   useEffect(() => {
//     fetchSalesData();
//   }, [timeView]);

//   const fetchSalesData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales`);
//       const processedData = processData(response.data);
//       setSalesData(processedData);
//     } catch (err) {
//       setError('Failed to fetch sales data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processData = (rawData) => {
//     if (!Array.isArray(rawData)) return [];

//     // Group sales by date
//     const groupedData = rawData.reduce((acc, sale) => {
//       const date = new Date(sale.created_at || sale.date);
//       const key = getDateKey(date);
      
//       if (!acc[key]) {
//         acc[key] = {
//           date: date,
//           totalQuantity: 0,
//           totalAmount: 0,
//           count: 0
//         };
//       }
      
//       acc[key].totalQuantity += Number(sale.quantity) || 0;
//       acc[key].totalAmount += Number(sale.total_amount) || 0;
//       acc[key].count += 1;
      
//       return acc;
//     }, {});

//     // Convert grouped data to array and sort by date
//     return Object.values(groupedData)
//       .sort((a, b) => a.date - b.date)
//       .map(item => ({
//         date: item.date,
//         amount: item.totalQuantity, // or item.totalAmount for monetary value
//         average: item.totalAmount / item.count
//       }));
//   };

//   const getDateKey = (date) => {
//     switch (timeView) {
//       case 'daily':
//         return date.toISOString().split('T')[0];
//       case 'weekly':
//         const weekNumber = getWeekNumber(date);
//         return `${date.getFullYear()}-W${weekNumber}`;
//       case 'monthly':
//         return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//       case 'yearly':
//         return `${date.getFullYear()}`;
//       default:
//         return date.toISOString().split('T')[0];
//     }
//   };

//   const formatXAxisLabel = (value) => {
//     const date = new Date(value);
//     switch (timeView) {
//       case 'daily':
//         return date.toLocaleDateString('default', { 
//           month: 'short', 
//           day: 'numeric' 
//         });
//       case 'weekly':
//         return `Week ${getWeekNumber(date)}`;
//       case 'monthly':
//         return date.toLocaleDateString('default', { 
//           month: 'short',
//           year: '2-digit'
//         });
//       case 'yearly':
//         return date.getFullYear().toString();
//       default:
//         return date.toLocaleDateString();
//     }
//   };

//   const getWeekNumber = (date) => {
//     const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
//     const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
//     return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
//   };

//   // Calculate summary statistics
//   const getSummaryStats = () => {
//     if (!salesData.length) return {
//       total: 0,
//       average: 0,
//       highest: 0,
//       lowest: 0
//     };

//     const amounts = salesData.map(item => item.amount);
//     const total = amounts.reduce((sum, val) => sum + val, 0);
//     const average = total / amounts.length;
//     const highest = Math.max(...amounts);
//     const lowest = Math.min(...amounts);

//     // Calculate percentage changes
//     const previousTotal = amounts.slice(0, -1).reduce((sum, val) => sum + val, 0);
//     const totalChange = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;

//     return {
//       total: Math.round(total),
//       average: Math.round(average),
//       highest: Math.round(highest),
//       lowest: Math.round(lowest),
//       totalChange: totalChange.toFixed(1)
//     };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[400px] flex items-center justify-center bg-white/80 rounded-xl shadow-sm">
//         <div className="flex flex-col items-center gap-3">
//           <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
//           <p className="text-sm text-gray-600">Loading chart data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-xl shadow-sm">
//         <div className="flex items-center gap-3 text-red-600">
//           <FaExclamationTriangle className="w-6 h-6" />
//           <p className="text-sm">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className=" p-4 sm:p-6 lg:p-8 bg-gray-50">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         {/* Header */}
//         <div className="p-4 sm:p-6 border-b border-gray-100">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             {/* Title */}
//             <div className="flex items-center gap-3">
//               <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg">
//                 <FaChartLine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
//                   Sales Analytics
//                 </h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Track your sales performance over time
//                 </p>
//               </div>
//             </div>

//             {/* Controls */}
//             <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//               <div className="flex items-center gap-2">
//                 <FaCalendarAlt className="w-4 h-4 text-gray-400" />
//                 <select
//                   value={timeView}
//                   onChange={(e) => setTimeView(e.target.value)}
//                   className="px-3 py-2 text-sm border border-gray-200 rounded-lg
//                            bg-white text-gray-700 font-medium focus:outline-none 
//                            focus:ring-2 focus:ring-blue-500/50"
//                 >
//                   <option value="daily">Daily</option>
//                   <option value="weekly">Weekly</option>
//                   <option value="monthly">Monthly</option>
//                   <option value="yearly">Yearly</option>
//                 </select>
//               </div>

//               <button className="flex items-center gap-2 px-3 py-2 text-sm
//                                bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100
//                                transition-colors duration-200">
//                 <FaDownload className="w-4 h-4" />
//                 <span>Export</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Chart */}
//         <div ref={chartContainerRef} 
//              className="p-4 sm:p-6">
//           <div className=" bg-white/50 rounded-lg">
//             <LineChart
//               xAxis={[{ 
//                 data: salesData.map(item => item.date),
//                 scaleType: 'time',
//                 tickLabelStyle: {
//                   fontSize: 12,
//                   fontWeight: 500,
//                   fill: '#374151',
//                 },
//                 valueFormatter: formatXAxisLabel
//               }]}
//               series={[
//                 {
//                   data: salesData.map(item => item.amount),
//                   label: 'Sales Quantity',
//                   color: '#2563eb',
//                   curve: 'natural',
//                   showMark: timeView === 'yearly',
//                   valueFormatter: (value) => `${value} units`
//                 },
//                 {
//                   data: salesData.map(item => item.average),
//                   label: 'Average Sale',
//                   color: '#10b981',
//                   curve: 'natural',
//                   showMark: false,
//                   valueFormatter: (value) => `$${value.toFixed(2)}`
//                 }
//               ]}
//               width={chartDimensions.width}
//               height={chartDimensions.height}
//               margin={{ 
//                 top: 20, 
//                 right: 30, 
//                 bottom: 40,
//                 left: 60 
//               }}
//               slotProps={{
//                 legend: {
//                   direction: 'row',
//                   position: { 
//                     vertical: 'top', 
//                     horizontal: 'right' 
//                   },
//                   padding: 20,
//                   labelStyle: {
//                     fill: '#4B5563',
//                     fontSize: 12,
//                     fontWeight: 500
//                   }
//                 }
//               }}
//             />
//           </div>

//           {/* Stats Summary */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
//             {(() => {
//               const stats = getSummaryStats();
//               return [
//                 { 
//                   label: 'Total Sales', 
//                   value: stats.total.toLocaleString(), 
//                   change: `${stats.totalChange}%` 
//                 },
//                 { 
//                   label: 'Average', 
//                   value: stats.average.toLocaleString(), 
//                   change: '0%' 
//                 },
//                 { 
//                   label: 'Highest', 
//                   value: stats.highest.toLocaleString(), 
//                   change: '+0%' 
//                 },
//                 { 
//                   label: 'Lowest', 
//                   value: stats.lowest.toLocaleString(), 
//                   change: '0%' 
//                 }
//               ].map((stat, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg p-4">
//                   <p className="text-sm text-gray-500">{stat.label}</p>
//                   <p className="text-xl font-semibold text-gray-900 mt-1">
//                     {stat.value}
//                   </p>
//                   <span className={`text-xs font-medium ${
//                     stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
//                   }`}>
//                     {stat.change}
//                   </span>
//                 </div>
//               ));
//             })()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LineChartPage; 