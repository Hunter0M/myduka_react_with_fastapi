import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import Loading from "../../components/loading/Loading";
import { eventEmitter } from "../../utils/eventEmitter";
import { useTheme } from "../../context/ThemeContext";
import {
  HiOutlineInformationCircle,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi2";
import { FiPlus, FiUpload, FiDownload, FiFilter } from "react-icons/fi";
import ProductLayout from "../../components/layout/ProductLayout";

const API_URL = import.meta.env.VITE_Product_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const DEFAULT_IMAGE = "/assets/default-product.svg";

// First, all your imports
// import React, { useState, useEffect, useMemo } from "react";
// ... other imports ...

// Then, define all helper components before the main Product component
const FilterDropdown = ({ value, onChange, isDark }) => (
  <div className="relative inline-block text-left">
    <div>
      <button
        type="button"
        className={`
          inline-flex justify-between items-center w-full rounded-lg border shadow-sm 
          px-4 py-2.5 text-sm font-medium transition-all duration-200 
          ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${
            isDark
              ? "focus:ring-blue-500/40 focus:ring-offset-gray-900"
              : "focus:ring-blue-500/50 focus:ring-offset-white"
          }
        `}
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
      >
        <span className="flex items-center">
          <svg
            className={`mr-2 h-4 w-4 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {value === "all" && "All Products"}
          {value === "lowStock" && "Low Stock (≤10)"}
          {value === "mediumStock" && "Medium Stock (11-30)"}
          {value === "highStock" && "High Stock (>30)"}
          {value === "recentlyUpdated" && "Recently Updated"}
          {value === "highestPrice" && "Highest Price"}
          {value === "lowestPrice" && "Lowest Price"}
        </span>
        <svg
          className={`ml-2 h-4 w-4 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <div
      className={`
        absolute right-0 mt-2 w-64 rounded-lg shadow-lg 
        transform opacity-100 scale-100 transition-all duration-200 ease-out
        ${
          isDark
            ? "bg-gray-800 ring-1 ring-gray-700"
            : "bg-white ring-1 ring-black ring-opacity-5"
        }
      `}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="options-menu"
    >
      <div className="py-1" role="none">
        {[
          { value: "all", label: "All Products" },
          { value: "lowStock", label: "Low Stock (≤10)" },
          { value: "mediumStock", label: "Medium Stock (11-30)" },
          { value: "highStock", label: "High Stock (>30)" },
          { value: "recentlyUpdated", label: "Recently Updated" },
          { value: "highestPrice", label: "Highest Price" },
          { value: "lowestPrice", label: "Lowest Price" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
              ${
                isDark
                  ? `text-gray-300 hover:bg-gray-700 hover:text-white 
                   ${value === option.value ? "bg-gray-700 text-white" : ""}`
                  : `text-gray-700 hover:bg-gray-50 hover:text-gray-900
                   ${value === option.value ? "bg-gray-50 text-gray-900" : ""}`
              }
            `}
            role="menuitem"
          >
            <span className="flex items-center">
              {value === option.value && (
                <svg
                  className="mr-2 h-4 w-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              <span className={value === option.value ? "ml-2" : "ml-6"}>
                {option.label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// Filter Modal Component
const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  isDark,
}) => {
  const [filters, setFilters] = useState(currentFilters);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        {/* Modal */}
        <div
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
          ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          {/* Header with Close Button */}
          <div
            className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative
            ${
              isDark ? "border-b border-gray-700" : "border-b border-gray-200"
            }`}
          >
            <div className="sm:flex sm:items-start justify-between">
              <h3
                className={`text-lg leading-6 font-medium 
                ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Filter Products
              </h3>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:bg-opacity-80 transition-colors duration-200
                  ${
                    isDark
                      ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }`}
                aria-label="Close filter"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Rest of your modal content remains the same */}
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              {/* Filter Options */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2
                  ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Filter By
                </label>
                <select
                  value={filters.filterBy}
                  onChange={(e) =>
                    setFilters({ ...filters, filterBy: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 transition-colors duration-200
                    ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500/50"
                        : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500/50"
                    }`}
                >
                  <option value="all">All Products</option>
                  <option value="low-stock">Low Stock (≤10)</option>
                  <option value="medium-stock">Medium Stock (11-30)</option>
                  <option value="high-stock">High Stock (&gt;30)</option>{" "}
                  {/* &gt; is the html entity for greater than > */}
                  <option value="recent">Recently Updated</option>
                  <option value="price-high">Highest Price</option>
                  <option value="price-low">Lowest Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse
            ${
              isDark
                ? "bg-gray-800 border-t border-gray-700"
                : "bg-gray-50 border-t border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onApplyFilters(filters);
                onClose();
              }}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:w-auto sm:text-sm
                ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Then all your other helper components
const ImagePreviewModal = ({ imageUrl, onClose, isDark }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose, imageUrl]);

  if (!imageUrl) return null;

  // Image Preview Modal
  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-8 ${
        isDark ? "bg-black/80" : "bg-black/80"
      } backdrop-blur-sm`}
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
            src={
              imageUrl.startsWith("/") ? `${BACKEND_URL}${imageUrl}` : imageUrl
            }
            alt="Product preview"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
              setIsLoading(false);
            }}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
            onLoad={() => {
              setIsLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton - loading state for the table
const TableSkeleton = ({ isDark }) => (
  <div
    className={`animate-pulse ${
      isDark ? "bg-gray-800" : "bg-white"
    } rounded-lg overflow-hidden`}
  >
    {/* Header */}
    <div
      className={`${
        isDark ? "bg-gray-700" : "bg-gray-100"
      } px-6 py-4 flex items-center gap-4`}
    >
      {/* Checkbox placeholder */}
      <div
        className={`w-4 h-4 rounded ${isDark ? "bg-gray-600" : "bg-gray-200"}`}
      ></div>
      {/* Column headers */}
      <div className="flex-1 flex items-center gap-6">
        <div
          className={`h-4 w-24 rounded ${
            isDark ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-32 rounded ${
            isDark ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-20 rounded ${
            isDark ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-24 rounded ${
            isDark ? "bg-gray-600" : "bg-gray-200"
          }`}
        ></div>
      </div>
    </div>

    {/* Rows */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`px-6 py-4 flex items-center gap-4 border-t ${
          isDark ? "border-gray-700" : "border-gray-100"
        }`}
      >
        {/* Checkbox placeholder */}
        <div
          className={`w-4 h-4 rounded ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}
        ></div>

        {/* Row content */}
        <div className="flex-1 flex items-center gap-6">
          {/* Image placeholder */}
          <div
            className={`w-12 h-12 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Product info */}
          <div className="flex-1">
            <div
              className={`h-4 w-48 rounded mb-2 ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-3 w-32 rounded ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
          </div>

          {/* Stock */}
          <div
            className={`h-4 w-16 rounded ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Price */}
          <div
            className={`h-4 w-20 rounded ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className={`w-8 h-8 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-12">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      No products found
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      Get started by creating a new product or refresh the list.
    </p>
    <div className="mt-6">
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        Refresh List
      </button>
    </div>
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Product
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
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
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

// Bulk Action Bar its a bar that appears at the bottom of the table when a user selects multiple rows
const BulkActionBar = ({ selectedCount, onDelete, onExport, isDark }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex items-center space-x-4 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <span className="text-sm text-gray-600">
          {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Selected
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Selected
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Stats its a card that displays the total number of products, low stock items, total value, and average price
const ProductStats = ({ products, isDark }) => {
  const stats = useMemo(() => {
    return {
      total: products.length, // Total number of products
      lowStock: products.filter((p) => p.stock_quantity <= 10).length, // Number of products with low stock
      totalValue: products.reduce(
        (sum, p) => sum + p.product_price * p.stock_quantity,
        0
      ), // Total inventory value
      averagePrice:
        products.reduce((sum, p) => sum + p.selling_price, 0) / products.length, // Average price of products
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Products Card */}
      <div
        className={`rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-200 hover:shadow-md border 
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${
              isDark ? "bg-blue-900/50" : "bg-blue-50"
            }`}
          >
            <svg
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total Products
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {stats.total}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Items Card */}
      <div
        className={`rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-200 hover:shadow-md border 
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${
              isDark ? "bg-red-900/50" : "bg-red-50"
            }`}
          >
            <svg
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isDark ? "text-red-400" : "text-red-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Low Stock Items
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {stats.lowStock}
            </p>
          </div>
        </div>
      </div>

      {/* Total Value Card */}
      <div
        className={`rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-200 hover:shadow-md border 
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${
              isDark ? "bg-green-900/50" : "bg-green-50"
            }`}
          >
            <svg
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total Value
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold truncate ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Average Price Card */}
      <div
        className={`rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-200 hover:shadow-md border 
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div
            className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${
              isDark ? "bg-purple-900/50" : "bg-purple-50"
            }`}
          >
            <svg
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                isDark ? "text-purple-400" : "text-purple-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Average Price
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold truncate ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "KES",
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

// Quick View Modal its a modal that displays the details of a product when a user clicks on a product in the table
const QuickViewModal = ({ product, isOpen, onClose, isDark }) => {
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
                  src={
                    product.image_url
                      ? `${BACKEND_URL}${product.image_url}`
                      : DEFAULT_IMAGE
                  }
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
                    <span className="font-medium">
                      {product.stock_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buy Price:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "KES",
                      }).format(product.product_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sell Price:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "KES",
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

// View Toggle its a button that allows a user to switch between table and grid views
const ViewToggle = ({ mode, onChange, isDark }) => (
  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
    <button
      onClick={() => onChange("table")}
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
        mode === "table"
          ? "bg-blue-100 text-blue-800"
          : "text-gray-600 hover:text-gray-800"
      }`}
    >
      <svg
        className="w-4 h-4 mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
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

// Import Modal its a modal that allows a user to import products from a csv file
const ImportModal = ({ isOpen, onClose, isDark }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setImporting(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onClose();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to import products");
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
    } else {
      setError("Please upload a CSV file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className={`absolute inset-0 ${
              isDark ? "bg-gray-900" : "bg-gray-500"
            } opacity-75`}
          ></div>
        </div>

        <div
          className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg
          ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3
              className={`text-lg font-medium leading-6 mb-4 
              ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Import Products
            </h3>

            <div className="space-y-4">
              <div className="mt-2">
                <label
                  className={`block text-sm font-medium mb-2 
                  ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  CSV File
                </label>
                <div
                  className={`mt-1 flex justify-center px-4 py-4 sm:px-6 sm:py-6 border-2 border-dashed rounded-lg
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : isDark
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-gray-50"
                    }
                    transition-colors duration-200`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2 text-center">
                    <svg
                      className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 
                        ${isDark ? "text-gray-400" : "text-gray-400"}`}
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col sm:flex-row items-center justify-center text-sm gap-1">
                      <label
                        className={`relative cursor-pointer rounded-md font-medium 
                        ${
                          isDark
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-500"
                        }
                        focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}
                      >
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".csv"
                          onChange={(e) => setFile(e.target.files[0])}
                        />
                      </label>
                      <p
                        className={`${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        or drag and drop
                      </p>
                    </div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      CSV file up to 10MB
                    </p>
                    {file && (
                      <p
                        className={`text-sm ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            </div>
          </div>
          <div
            className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 
            ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
          >
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm 
                ${
                  !file || importing
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                sm:ml-3 sm:text-sm transition-colors duration-200`}
            >
              {importing ? "Importing..." : "Import"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`mt-3 w-full sm:w-auto inline-flex justify-center rounded-md border px-4 py-2 text-base font-medium shadow-sm 
                ${
                  isDark
                    ? "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                sm:mt-0 sm:ml-3 sm:text-sm transition-colors duration-200`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk Delete Modal its a modal that allows a user to delete multiple products
const BulkDeleteModal = ({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Multiple Products
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {selectedCount} selected
                  products? This action cannot be undone.
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
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

// Product Component its the main component that displays the products
const Product = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [productData, setProductData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [deleteMessage, setDeleteMessage] = useState({
    text: null,
    isError: false,
  });
  const [error, setError] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Update screenSize state to match Tailwind breakpoints
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth < 640, // sm
    isTablet: window.innerWidth < 768, // md
    isLaptop: window.innerWidth < 1024, // lg
    isDesktop: window.innerWidth >= 1024, // lg and above
  });

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width < 768,
        isLaptop: width < 1024,
        isDesktop: width >= 1024,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const productsArray = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      // Make sure each product has at least an empty vendor object if missing
      const processedProducts = productsArray.map((product) => ({
        ...product,
        vendor: product.vendor || { name: "N/A" },
      }));

      setProductData(processedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
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

  // Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toISOString().slice(0, 10);
  };

  // Define responsive columns
  const columns = [
    {
      name: "Image",
      cell: (row) => (
        <div className="w-12 h-12 relative rounded-lg overflow-hidden">
          <img
            src={row.image_url ? `${BACKEND_URL}${row.image_url}` : DEFAULT_IMAGE}
            alt={row.product_name}
            className="w-full h-full object-cover"
            onClick={() => handleImagePreview(row.image_url || DEFAULT_IMAGE)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
            }}
          />
        </div>
      ),
      width: "80px",
    },
    {
      name: "Product",
      selector: (row) => row.product_name,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div className="truncate max-w-xs">
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            {row.product_name}
          </span>
          {!screenSize.isMobile && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      name: "Stock",
      selector: (row) => row.stock_quantity,
      sortable: true,
      width: screenSize.isMobile ? "70px" : "100px",
      cell: (row) => (
        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
          {row.stock_quantity}
        </span>
      ),
    },
    {
      name: "Price",
      selector: (row) => row.selling_price,
      sortable: true,
      width: screenSize.isMobile ? "90px" : "120px",
      omit: screenSize.isMobile && !screenSize.isTablet,
      cell: (row) => (
        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES'
          }).format(row.selling_price)}
        </span>
      ),
    },
    {
      name: "Vendor",
      selector: (row) => row.vendor?.name || "N/A",
      sortable: true,
      cell: (row) => (
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {row.vendor?.name || "N/A"}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center justify-end gap-3 px-4">
          <Link to={`/products/${row.id}`} className="relative group">
            <div
              className={`flex items-center justify-center w-8 h-8 
            ${
              isDark
                ? "bg-blue-400/10 hover:bg-blue-400/20"
                : "bg-blue-500/10 hover:bg-blue-500/20"
            }
            rounded-xl hover:rounded-lg 
            ${isDark ? "border-blue-400/20" : "border-blue-500/20"} border
            transition-all duration-300 ease-out
            group-hover:shadow-lg ${
              isDark
                ? "group-hover:shadow-blue-400/20"
                : "group-hover:shadow-blue-500/20"
            }
            group-active:scale-95`}
            >
              <HiOutlineInformationCircle
                className={`w-4 h-4 
              ${
                isDark
                  ? "text-blue-400 group-hover:text-blue-300"
                  : "text-blue-600 group-hover:text-blue-700"
              }`}
              />
            </div>
          </Link>

          <Link to={`/products/edit/${row.id}`} className="relative group">
            <div
              className={`flex items-center justify-center w-8 h-8 
            ${
              isDark
                ? "bg-violet-400/10 hover:bg-violet-400/20"
                : "bg-violet-500/10 hover:bg-violet-500/20"
            }
            rounded-xl hover:rounded-lg 
            ${isDark ? "border-violet-400/20" : "border-violet-500/20"} border
            transition-all duration-300 ease-out
            group-hover:shadow-lg ${
              isDark
                ? "group-hover:shadow-violet-400/20"
                : "group-hover:shadow-violet-500/20"
            }
            group-active:scale-95`}
            >
              <HiOutlinePencil
                className={`w-4 h-4 
              ${
                isDark
                  ? "text-violet-400 group-hover:text-violet-300"
                  : "text-violet-600 group-hover:text-violet-700"
              }`}
              />
            </div>
          </Link>

          <button
            onClick={() => handleDelete(row.id)}
            className="relative group"
          >
            <div
              className={`flex items-center justify-center w-8 h-8 
            ${
              isDark
                ? "bg-rose-400/10 hover:bg-rose-400/20"
                : "bg-rose-500/10 hover:bg-rose-500/20"
            }
            rounded-xl hover:rounded-lg 
            ${isDark ? "border-rose-400/20" : "border-rose-500/20"} border
            transition-all duration-300 ease-out
            group-hover:shadow-lg ${
              isDark
                ? "group-hover:shadow-rose-400/20"
                : "group-hover:shadow-rose-500/20"
            }
            group-active:scale-95`}
            >
              <HiOutlineTrash
                className={`w-4 h-4 
              ${
                isDark
                  ? "text-rose-400 group-hover:text-rose-300"
                  : "text-rose-600 group-hover:text-rose-700"
              }`}
              />
            </div>
          </button>
        </div>
      ),
      width: "180px",
      alignRight: true,
    },
  ];

  // Filter State
  const [filterBy, setFilterBy] = useState("all");

  // Filter Dropdown
  const FilterDropdown = ({ value, onChange, isDark }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none w-full rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors duration-200
          ${
            isDark
              ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500/50"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500/50"
          }`}
      >
        <option value="all">All Products</option>
        <option value="low-stock">Low Stock (≤10)</option>
        <option value="medium-stock">Medium Stock (11-30)</option>
        <option value="high-stock">High Stock (&gt;30)</option>{" "}
        {/* &gt; is the html entity for greater than > */}
        <option value="recent">Recently Updated</option>
        <option value="price-high">Highest Price</option>
        <option value="price-low">Lowest Price</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );

  // Filtered Data
  const filteredData = useMemo(() => {
    // Filter by search term
    let filtered = productData.filter(
      (product) =>
        product.product_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by stock status
    switch (filterBy) {
      case "low-stock":
        filtered = filtered.filter((p) => p.stock_quantity <= 10);
        break;
      case "medium-stock":
        filtered = filtered.filter(
          (p) => p.stock_quantity > 10 && p.stock_quantity <= 30
        );
        break;
      case "high-stock":
        filtered = filtered.filter((p) => p.stock_quantity > 30);
        break;
      case "recent":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        break;
      case "price-high":
        filtered = [...filtered].sort(
          (a, b) => b.selling_price - a.selling_price
        );
        break;
      case "price-low":
        filtered = [...filtered].sort(
          (a, b) => a.selling_price - b.selling_price
        );
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
      setDeleteMessage({
        text: "Product deleted successfully!",
        isError: false,
      });
      fetchProducts();
    } catch (error) {
      setDeleteMessage({
        text: "Failed to delete product. Please try again.",
        isError: true,
      });
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
      setProductData((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    };

    // Listen for product updates
    eventEmitter.on("productUpdated", handleProductUpdate);

    // Cleanup listener
    return () => {
      eventEmitter.off("productUpdated", handleProductUpdate);
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
    const csvData = selectedRows.map((row) => ({
      "Product Name": row.product_name,
      Description: row.description,
      Stock: row.stock_quantity,
      "Buy Price": row.product_price,
      "Sell Price": row.selling_price,
      Created: new Date(row.created_at).toLocaleDateString(),
      Updated: new Date(row.updated_at).toLocaleDateString(),
    }));

    // Create CSV string
    const csvString = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "products_export.csv";
    link.click();
  };

  // Quick View Product
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Handle Row Double Click
  const handleRowDoubleClick = (row) => {
    setQuickViewProduct(row);
  };

  // View Mode
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

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
      await Promise.all(selectedRows.map((row) => deleteProduct(row.id)));

      setDeleteMessage({
        text: `Successfully deleted ${selectedRows.length} products`,
        isError: false,
      });

      // Refresh the product list and clear selection
      fetchProducts();
      setSelectedRows([]);
    } catch (error) {
      setDeleteMessage({
        text: "Failed to delete some products. Please try again.",
        isError: true,
      });
    } finally {
      setBulkDeleteModalOpen(false);
      setTimeout(() => setDeleteMessage({ text: null, isError: false }), 3000);
    }
  };

  // Add this state for managing the image preview
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Add this handler function
  const handleImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    setPreviewImageUrl(imageUrl);
  };

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    filterBy: "all",
  });

  // Add this handler function
  const handleApplyFilters = (newFilters) => {
    setCurrentFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setFilterBy(newFilters.filterBy);
    setFilterModalOpen(false);
  };

  return (
    <ProductLayout>
      <div className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Page Header */}
        <div
          className=" bg-opacity-95 backdrop-blur-sm border-b
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left side */}
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Products
                </h1>
                <p
                  className={`mt-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Manage your product inventory
                </p>
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/products/create")}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isDark
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Product
                </button>

                <button
                  onClick={() => setImportModalOpen(true)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isDark
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  Import
                </button>

                <button
                  onClick={handleBulkExport}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isDark
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200
                      ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                  />
                  <svg
                    className={`absolute left-3 top-2.5 h-5 w-5 ${
                      isDark ? "text-gray-400" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isDark
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <FiFilter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Alert Messages */}
          {deleteMessage.text && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                deleteMessage.isError
                  ? isDark
                    ? "bg-red-900/50 border border-red-800"
                    : "bg-red-50 border border-red-200"
                  : isDark
                  ? "bg-green-900/50 border border-green-800"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 mr-2 ${
                    deleteMessage.isError
                      ? isDark
                        ? "text-red-400"
                        : "text-red-400"
                      : isDark
                      ? "text-green-400"
                      : "text-green-400"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {deleteMessage.isError ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <span>{deleteMessage.text}</span>
              </div>
            </div>
          )}

          {/* Inside Product component's return, after the search/filter section and before DataTable */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductStats products={productData} isDark={isDark} />
            {/* DataTable component follows */}
          </div>

          {/* DataTable */}
          <div
            className={`rounded-lg shadow-sm overflow-hidden
            ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              responsive
              progressPending={loading}
              progressComponent={<Loading />}
              theme={isDark ? "dark" : "light"}
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
              noDataComponent={<EmptyState onRefresh={fetchProducts} />}
              onRowDoubleClicked={(row) => setQuickViewProduct(row)}
            />
          </div>
          <BulkActionBar
            selectedCount={selectedRows.length}
            onDelete={() => setBulkDeleteModalOpen(true)}
            onExport={handleBulkExport}
            isDark={isDark}
          />
        </div>

        {/* Keep your existing modals */}
        {/* ... */}
      </div>

      {/* Add the ImagePreviewModal component near the end of the return statement */}
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        isDark={isDark}
      />

      {/* Add this near the end of the return statement, before the closing ProductLayout tag */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete}
        isDark={isDark}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isDark={isDark}
      />
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        isDark={isDark}
      />
      <BulkDeleteModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        selectedCount={selectedRows.length}
        onConfirm={confirmBulkDelete}
        isDark={isDark}
      />
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
        isDark={isDark}
      />
    </ProductLayout>
  );
};

export default Product;
