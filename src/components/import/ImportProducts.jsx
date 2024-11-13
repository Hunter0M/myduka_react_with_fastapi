import React, { useState } from 'react';
import { FiUpload, FiDownload, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const ImportProducts = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const response = await axios.get(`http://localhost:8000/import/template/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product_template.${type === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/import/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Import Products</h2>

        {/* Template Downloads */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Download Template</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              <FiDownload className="mr-2" />
              CSV Template
            </button>
            <button
              onClick={() => downloadTemplate('excel')}
              className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              <FiDownload className="mr-2" />
              Excel Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-sm text-gray-600">
                {file ? file.name : 'Choose file or drag and drop'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Supported formats: CSV, XLSX, XLS
              </span>
            </label>
          </div>
        </div>

        {/* Import Button */}
        <div className="mb-6">
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={`w-full py-3 rounded-lg font-medium ${
              !file || loading
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Importing...' : 'Import Products'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start">
            <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiCheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="font-semibold">Import Complete</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p>Total Processed: {result.total_processed}</p>
              <p className="text-green-600">Successful: {result.successful}</p>
              <p className="text-red-600">Failed: {result.failed}</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-red-600 text-sm mb-1">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportProducts; 