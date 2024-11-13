import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_Product_URL;

const Receipt = ({ sale, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/${sale.pid}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sale.pid]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    if (loading || !product) {
      alert('Please wait for product details to load');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt {
              border: 1px solid #ccc;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .details {
              margin: 20px 0;
              border-top: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
              padding: 10px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total {
              font-weight: bold;
              font-size: 1.2em;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>Your Company Name</h2>
              <p>123 Business Street</p>
              <p>City, State 12345</p>
            </div>
            
            <div class="details">
              <div class="row">
                <span>Receipt No:</span>
                <span>${sale.id}</span>
              </div>
              <div class="row">
                <span>Date:</span>
                <span>${formatDate(sale.created_at)}</span>
              </div>
              <div class="row">
                <span>Customer:</span>
                <span>${sale.first_name || ''} ${sale.last_name || ''}</span>
              </div>
              <div class="row">
                <span>Product:</span>
                <span>${product.product_name}</span>
              </div>
            </div>
            
            <div class="row">
              <span>Quantity:</span>
              <span>${sale.quantity}</span>
            </div>
            <div class="row">
              <span>Unit Price:</span>
              <span>KES ${product.selling_price.toFixed(2)}</span>
            </div>
            <div class="row total">
              <span>Total:</span>
              <span>KES ${(sale.quantity * product.selling_price).toFixed(2)}</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    // Write the receipt HTML to the new window and trigger print
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Receipt Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Sales Receipt</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Your Company Name</h2>
              <p className="text-sm text-gray-500">123 Business Street</p>
              <p className="text-sm text-gray-500">City, State 12345</p>
            </div>

            <div className="border-t border-b py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Receipt No:</p>
                  <p className="font-medium">{sale.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date:</p>
                  <p className="font-medium">{formatDate(sale.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer:</p>
                  <p className="font-medium">{`${sale.first_name || ''} ${sale.last_name || ''}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product Name:</p>
                  <p className="font-medium">
                    {loading ? 'Loading...' : product?.product_name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{sale.quantity}</span>
              </div>
              {product && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">KES {product.selling_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>KES {(sale.quantity * product.selling_price).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading || !product}
            >
              {loading ? 'Loading...' : 'Print Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt; 