import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import Loading from '../../components/loading/Loading';

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
            src={`${BACKEND_URL}${imageUrl}`}
            alt="Product preview"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.png';
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

const Product = () => {
  const [productData, setProductData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [deleteMessage, setDeleteMessage] = useState({ text: null, isError: false });

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const productsArray = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];

      const sortedProducts = productsArray
        .filter(product => product.stock_quantity > 0)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      setProductData(sortedProducts);
    } catch (e) {
      setProductData([]);
    } finally {
      setLoading(false);
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
          onClick={() => setPreviewImage(row.image_url)}
        >
          {row.image_url ? (
            <img
              src={`${BACKEND_URL}${row.image_url}`}
              alt={row.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg 
                className="w-6 h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
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

  const filteredData = productData.filter((product) =>
    product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setDeleteMessage({ text: "Product deleted successfully!", isError: false });
      fetchProducts(); // Refresh the product list

      setTimeout(() => {
        setDeleteMessage({ text: null, isError: false });
      }, 3000);
    } catch (error) {
      setDeleteMessage({ text: "Failed to delete product. Please try again.", isError: true });
    }
  };

  const MessageAlert = ({ message }) => {
    if (!message) return null;

    const bgColor = message.type === "success" ? "bg-green-100" : "bg-red-100";
    const textColor =
      message.type === "success" ? "text-green-800" : "text-red-800";
    const borderColor =
      message.type === "success" ? "border-green-200" : "border-red-200";

    return (
      <div
        className={`fixed  top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} ${textColor} ${borderColor} shadow-lg transition-opacity duration-300`}
      >
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
          <span>{message.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
            {/* Title and Count */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
              <span className="px-2.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {productData.length} items
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link
                to="/products/create"
                className="inline-flex justify-center items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium 
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                         transition-colors duration-200 w-full sm:w-auto"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Product</span>
              </Link>
              
              {/* Search Input */}
              <div className="relative flex-grow sm:max-w-xs">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {deleteMessage.text && (
          <div className={`mb-3 p-2.5 rounded-md ${deleteMessage.isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center">
              <svg className={`h-4 w-4 mr-1.5 ${deleteMessage.isError ? 'text-red-400' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                {deleteMessage.isError ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
            progressComponent={<Loading text="Loading products..." />}
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
          />
        </div>

        {/* Image Preview Modal */}
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      </div>
    </div>
  );
};

export default Product;
