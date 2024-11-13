import React from 'react';
import ProductPerformanceChart from './ProductPerformanceChart';
import SalesLineChart from './SalesLineChart';
import { PiChartLineUpBold } from "react-icons/pi";

const ChartsContainer = () => {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Charts Header */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 
                    flex items-center gap-2">
          <span className="bg-blue-100 p-1 sm:p-1.5 rounded-lg">
            <PiChartLineUpBold className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </span>
          Analytics Overview
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Monitor your product performance and sales trends
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Product Performance Chart Container */}
        <div className="relative w-full min-h-[250px] xs:min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-200 via-blue-100 to-white 
                       rounded-xl blur-lg opacity-60 animate-gradient"></div>
          
          <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl 
                       p-2 xs:p-3 sm:p-4 lg:p-6 shadow-lg">
            <ProductPerformanceChart />
          </div>
        </div>

        {/* Sales Line Chart Container */}
        <div className="relative w-full min-h-[250px] xs:min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-200 via-emerald-100 to-white 
                       rounded-xl blur-lg opacity-60 animate-gradient"></div>
          
          <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl 
                       p-2 xs:p-3 sm:p-4 lg:p-6 shadow-lg">
            <SalesLineChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsContainer; 