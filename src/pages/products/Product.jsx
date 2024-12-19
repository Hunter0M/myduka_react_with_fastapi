import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import Loading from '../../components/loading/Loading';
import { eventEmitter } from '../../utils/eventEmitter';

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const DEFAULT_IMAGE = '/assets/default-product.svg';

const ImagePreviewModal = ({ imageUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, imageUrl]);

  if (!imageUrl) return null;

  // Image Preview Modal
  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl animate-scale-up">
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-4 -right-4 z-10 p-2 bg-white rounded-full shadow-lg 
                   hover:bg-gray-100 transition-colors duration-200 group"
          aria-label="Close preview"
        >
          <svg 
            className="w-6 h-6 text-gray-600 group-hover:text-gray-800" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Image Container */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Loading Spinner - Only show when loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Image */}
          <img
            src={imageUrl.startsWith('/') ? `${BACKEND_URL}${imageUrl}` : imageUrl}
            alt="Product preview"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
              setIsLoading(false);
            }}
            style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
            onLoad={() => {
              setIsLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-200 rounded-t-lg mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-12">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new product or refresh the list.</p>
    <div className="mt-6">
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Refresh List
      </button>
    </div>
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk Action Bar
const BulkActionBar = ({ selectedCount, onDelete, onExport }) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Selected
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Stats
const ProductStats = ({ products }) => {
  const stats = useMemo(() => {
    return {
      total: products.length, // Total number of products 
      lowStock: products.filter(p => p.stock_quantity <= 10).length, // Number of products with low stock
      totalValue: products.reduce((sum, p) => sum + (p.product_price * p.stock_quantity), 0), // Total inventory value
      averagePrice: products.reduce((sum, p) => sum + p.selling_price, 0) / products.length // Average price of products
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-3 bg-red-50 rounded-lg">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-3 bg-green-50 rounded-lg">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalValue)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 p-3 bg-purple-50 rounded-lg">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Price</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.averagePrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick View Modal
const QuickViewModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Product Image */}
              <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left flex-shrink-0">
                <img
                  src={product.image_url ? `${BACKEND_URL}${product.image_url}` : DEFAULT_IMAGE} 
                  alt={product.product_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="mt-3 sm:mt-0 sm:ml-4 text-left flex-grow">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {product.product_name}
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">{product.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className="font-medium">{product.stock_quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buy Price:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'KES'
                      }).format(product.product_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sell Price:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'KES'
                      }).format(product.selling_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
            <Link
              to={`/products/${product.id}`}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Toggle
const ViewToggle = ({ mode, onChange }) => (
  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
    <button
      onClick={() => onChange('table')}
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
        mode === 'table' 
          ? 'bg-blue-100 text-blue-800' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
      Table
    </button>
    {/* <button
      onClick={() => onChange('grid')}
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
        mode === 'grid' 
          ? 'bg-blue-100 text-blue-800' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      Grid
    </button> */}
  </div>
);

// // Product Grid
// const ProductGrid = ({ products, onEdit, onDelete, onPreview }) => (
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//     {products.map(product => (
//       <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
//         <div className="relative aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden bg-gray-100">
//           <img
//             src={product.image_url ? `${BACKEND_URL}${product.image_url}` : DEFAULT_IMAGE}
//             alt={product.product_name}
//             className="object-cover w-full h-full"
//             onClick={() => onPreview(product.image_url || DEFAULT_IMAGE)}
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
//             <div className="absolute bottom-2 right-2 flex space-x-1">
//               <button onClick={() => onEdit(product.id)} className="p-1.5 bg-white/90 rounded-full hover:bg-white">
//                 <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                 </svg>
//               </button>
//               <button onClick={() => onDelete(product.id)} className="p-1.5 bg-white/90 rounded-full hover:bg-white">
//                 <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="p-4">
//           <h3 className="text-sm font-medium text-gray-900 truncate">{product.product_name}</h3>
//           <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
//           <div className="mt-2 flex items-center justify-between">
//             <span className="text-sm font-medium text-gray-900">
//               {new Intl.NumberFormat('en-US', {
//                 style: 'currency',
//                 currency: 'KES'
//               }).format(product.selling_price)}
//             </span>
//             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
//               product.stock_quantity <= 10 
//                 ? 'bg-red-100 text-red-800' 
//                 : product.stock_quantity <= 30 
//                   ? 'bg-yellow-100 text-yellow-800' 
//                   : 'bg-green-100 text-green-800'
//             }`}>
//               {product.stock_quantity} in stock
//             </span>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// Import Modal
const ImportModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onClose();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Import Products
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    CSV File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        CSV file up to 10MB
                      </p>
                    </div>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                (!file || importing) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk Delete Modal
const BulkDeleteModal = ({ isOpen, onClose, selectedCount, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Multiple Products</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {selectedCount} selected products? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              Delete All Selected
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Component
const Product = () => {
  const [productData, setProductData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [deleteMessage, setDeleteMessage] = useState({ text: null, isError: false });
  const [error, setError] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Update screen size breakpoints
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth < 640,    // sm
    isSmall: window.innerWidth < 768,     // md
    isTablet: window.innerWidth < 1024,   // lg
    isDesktop: window.innerWidth >= 1024  // lg and above
  });

  // Update the resize handler
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

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const response = await axios.get(API_URL);
      const productsArray = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];

      const sortedProducts = productsArray
        .filter(product => product.stock_quantity > 0)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      setProductData(sortedProducts);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch products');
      setProductData([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Simplified deleteProduct function
  const deleteProduct = async (id) => {
    const deleteUrl = `${API_URL}/${id}`;
    
    try {
      await axios.delete(deleteUrl);
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toISOString().slice(0, 10);
  };

  // Define responsive columns
  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      width: "50px",
      
    },
    {
      name: "Image",
      width: screenSize.isMobile ? "60px" : "80px",
      cell: (row) => (
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer
                     transition-transform hover:scale-105"
          onClick={() => setPreviewImage(row.image_url || DEFAULT_IMAGE)}
        >
          {row.image_url ? (
            <img
              src={`${BACKEND_URL}${row.image_url}`}
              alt={row.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          ) : (
            <img
              src={DEFAULT_IMAGE}
              alt="Default product"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ),
    },
    {
      name: "Product Name",
      selector: (row) => row.product_name,
      sortable: true,
      width: screenSize.isMobile ? "130px" : screenSize.isTablet ? "200px" : "250px",
      cell: (row) => (
        <div className="text-sm font-medium text-gray-900 truncate max-w-[130px] sm:max-w-[200px] lg:max-w-[250px]">
          {row.product_name}
        </div>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      omit: screenSize.isMobile || screenSize.isSmall || screenSize.isTablet,
      width: "250px",
      cell: (row) => (
        <div className="text-sm text-gray-500 truncate max-w-[250px]" title={row.description}>
          {row.description || "No description"}
        </div>
      ),
    },
    {
      name: "Stock",
      selector: (row) => row.stock_quantity,
      sortable: true,
      width: screenSize.isMobile ? "100px" : "100px",
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.stock_quantity <= 10 
            ? 'bg-red-100 text-red-800' 
            : row.stock_quantity <= 30 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
        }`}>
          {row.stock_quantity}
        </span>
      ),
    },
    {
      name: "Buy Price",
      selector: (row) => row.product_price,
      sortable: true,
      omit: !screenSize.isDesktop && !screenSize.isTablet || screenSize.isMobile || screenSize.isSmall,
      
      width: "110px",
      cell: (row) => (
        <div className="text-sm text-right">
          {Number(row.product_price).toLocaleString()}
        </div>
      ),
    },
    {
      name: "Sell Price",
      selector: (row) => row.selling_price,
      sortable: true,
      
      width: screenSize.isMobile ? "90px" : "110px",
      cell: (row) => (
        <div className="text-sm text-right">
          {Number(row.selling_price).toLocaleString()}
        </div>
      ),
    },
    {
      name: "Created",
      selector: (row) => row.created_at,
      sortable: true,
      omit: screenSize.isDesktop && screenSize.isTablet || screenSize.isMobile || screenSize.isSmall || screenSize.isTablet,
      width: "120px",
      cell: (row) => (
        <div className="text-sm text-gray-500">
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Updated",
      selector: (row) => row.updated_at,
      sortable: true,
      omit: !screenSize.isDesktop && !screenSize.isTablet || screenSize.isMobile || screenSize.isSmall || screenSize.isTablet,
      width: "120px",
      cell: (row) => (
        <div className="text-sm text-gray-500">
          {new Date(row.updated_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Status",
      width: "120px",
      cell: (row) => {
        const status = row.stock_quantity <= 0 ? 'Out of Stock' :
                       row.stock_quantity <= 10 ? 'Low Stock' :
                       row.stock_quantity <= 30 ? 'Medium Stock' : 'In Stock';
        
        const statusStyles = {
          'Out of Stock': 'bg-red-100 text-red-800',
          'Low Stock': 'bg-yellow-100 text-yellow-800',
          'Medium Stock': 'bg-blue-100 text-blue-800',
          'In Stock': 'bg-green-100 text-green-800'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status}
          </span>
        );
      }
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* View button */}
          <Link to={`/products/${row.id}`}>
            <button className="p-1 sm:p-1.5 text-gray-600 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>
          
          <Link to={`/products/edit/${row.id}`}>
            <button className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </Link>
          
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ),
      width: screenSize.isMobile ? "100px" : "120px",
    },
  ];

  // Filter State
  const [filterBy, setFilterBy] = useState('all');

  // Filter Dropdown
  const FilterDropdown = ({ value, onChange }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Products</option>
        <option value="low-stock">Low Stock (≤10)</option>
        <option value="medium-stock">Medium Stock (11-30)</option>
        <option value="high-stock">High Stock (&gt;30)</option>
        <option value="recent">Recently Updated</option>
        <option value="price-high">Highest Price</option>
        <option value="price-low">Lowest Price</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  // Filtered Data
  const filteredData = useMemo(() => {
    // Filter by search term
    let filtered = productData.filter((product) =>
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Filter by stock status
    switch (filterBy) {
      case 'low-stock':
        filtered = filtered.filter(p => p.stock_quantity <= 10);
        break;
      case 'medium-stock':
        filtered = filtered.filter(p => p.stock_quantity > 10 && p.stock_quantity <= 30);
        break;
      case 'high-stock':
        filtered = filtered.filter(p => p.stock_quantity > 30);
        break;
      case 'recent':
        filtered = [...filtered].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.selling_price - a.selling_price);
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.selling_price - b.selling_price);
        break;
      default:
        break;
    }

    // Return filtered data
    return filtered;
  }, [productData, searchTerm, filterBy]);

  // Handle Delete
  const handleDelete = async (id) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      await deleteProduct(productToDelete);
      setDeleteMessage({ text: "Product deleted successfully!", isError: false });
      fetchProducts();
    } catch (error) {
      setDeleteMessage({ text: "Failed to delete product. Please try again.", isError: true });
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
      setTimeout(() => setDeleteMessage({ text: null, isError: false }), 3000);
    }
  };

  // Message Alert
  const MessageAlert = ({ message }) => {
    if (!message) return null;

    const bgColor = message.type === "success" ? "bg-green-100" : "bg-red-100";
    const textColor =
      message.type === "success" ? "text-green-800" : "text-red-800";
    const borderColor =
      message.type === "success" ? "border-green-200" : "border-red-200";

    return (
      // Message Alert
      <div
        className={`fixed  top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} ${textColor} ${borderColor} shadow-lg transition-opacity duration-300`}
      >
        {/* Message Icon */}
        <div className="flex  items-center gap-2">
          {message.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {/* Message Text */}
          <span>{message.text}</span>
        </div>
      </div>
    );
  };

  // Listen for product updates
  useEffect(() => {
    const handleProductUpdate = (updatedProduct) => {
      setProductData(prevProducts => 
        prevProducts.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    };

    // Listen for product updates
    eventEmitter.on('productUpdated', handleProductUpdate);

    // Cleanup listener
    return () => {
      eventEmitter.off('productUpdated', handleProductUpdate);
    };
  }, []);

  // Selected Rows
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Handle Row Selected
  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  // Handle Bulk Export
  const handleBulkExport = () => {
    const csvData = selectedRows.map(row => ({
      'Product Name': row.product_name,
      'Description': row.description,
      'Stock': row.stock_quantity,
      'Buy Price': row.product_price,
      'Sell Price': row.selling_price,
      'Created': new Date(row.created_at).toLocaleDateString(),
      'Updated': new Date(row.updated_at).toLocaleDateString()
    }));

    // Create CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    // Create Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_export.csv';
    link.click();
  };

  // Quick View Product
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Handle Row Double Click
  const handleRowDoubleClick = (row) => {
    setQuickViewProduct(row);
  };

  // View Mode
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Handle Bulk Delete
  const handleBulkDelete = () => {
    setBulkDeleteModalOpen(true);
  };

  // Confirm Bulk Delete
  const confirmBulkDelete = async () => {
    try {
      // Delete all selected products
      await Promise.all(
        selectedRows.map(row => deleteProduct(row.id))
      );
      
      setDeleteMessage({ 
        text: `Successfully deleted ${selectedRows.length} products`, 
        isError: false 
      });
      
      // Refresh the product list and clear selection
      fetchProducts();
      setSelectedRows([]);
    } catch (error) {
      setDeleteMessage({ 
        text: "Failed to delete some products. Please try again.", 
        isError: true 
      });
    } finally {
      setBulkDeleteModalOpen(false);
      setTimeout(() => setDeleteMessage({ text: null, isError: false }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <span className="px-3 py-1 text-sm font-semibold bg-blue-50 text-blue-700 rounded-full">
                {productData.length} items
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/products/create"
                className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                         hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>

              <button
                onClick={() => setImportModalOpen(true)}
                className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium 
                         hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 
                         transition-colors duration-200"
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex gap-3">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
              <FilterDropdown value={filterBy} onChange={setFilterBy} />
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {deleteMessage.text && (
          <div className={`mb-3 p-2.5 rounded-md ${deleteMessage.isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center">
              <svg className={`h-4 w-4 mr-1.5 ${deleteMessage.isError ? 'text-red-400' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                {deleteMessage.isError ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              <p className={`text-xs font-medium ${deleteMessage.isError ? 'text-red-700' : 'text-green-700'}`}>
                {deleteMessage.text}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <ProductStats products={productData} />

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {viewMode === 'table' ? (
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={screenSize.isMobile ? 5 : screenSize.isTablet ? 8 : 10}
              paginationRowsPerPageOptions={[5, 8, 10, 25]}
              highlightOnHover
              pointerOnHover
              striped
              responsive
              progressPending={loading}
              progressComponent={<TableSkeleton />}
              dense
              noHeader
              persistTableHead
              sortFunction={(rows, field, direction) => {
                return [...rows].sort((a, b) => {
                  const aField = a[field] || '';
                  const bField = b[field] || '';
                  
                  if (direction === 'asc') {
                    return aField < bField ? -1 : 1;
                  }
                  
                  return aField > bField ? -1 : 1;
                });
              }}
              customStyles={{
                table: {
                  style: {
                    minWidth: '100%',
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: '#F9FAFB',
                    fontSize: '0.75rem',
                    minHeight: '35px',
                    paddingRight: '0',
                  },
                },
                rows: {
                  style: {
                    minHeight: '30px',
                    paddingRight: '0',
                  },
                },
                cells: {
                  style: {
                    padding: '4px 2px',
                  },
                },
              }}
              selectableRows
              selectableRowsHighlight
              onSelectedRowsChange={handleRowSelected}
              onRowDoubleClicked={handleRowDoubleClick}
            />
          ) : (
            <ProductGrid 
              products={filteredData}
              onEdit={(id) => navigate(`/products/edit/${id}`)}
              onDelete={handleDelete}
              onPreview={setPreviewImage}
            />
          )}
        </div>

        {/* Image Preview Modal */}
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />

        {/* Bulk Action Bar */}
        <BulkActionBar 
          selectedCount={selectedRows.length}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
        />

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />

        {/* Import Modal */}
        <ImportModal 
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
        />

        {/* Bulk Delete Modal */}
        <BulkDeleteModal
          isOpen={bulkDeleteModalOpen}
          onClose={() => setBulkDeleteModalOpen(false)}
          selectedCount={selectedRows.length}
          onConfirm={confirmBulkDelete}
        />
      </div>
    </div>
  );
};

export default Product;
