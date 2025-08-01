import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X, Upload, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkImportModal = ({ isOpen, onClose }) => {
  const [importData, setImportData] = useState('');
  const [errors, setErrors] = useState({});
  const [importResult, setImportResult] = useState(null);
  const queryClient = useQueryClient();

  const bulkImportMutation = useMutation(
    (data) => axios.post('/api/users/mobile-numbers/bulk', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('mobile-numbers');
        queryClient.invalidateQueries('mobile-numbers-count');
        setImportResult(response.data);
        toast.success('Mobile numbers imported successfully');
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData?.errors) {
          const newErrors = {};
          errorData.errors.forEach(err => {
            newErrors[err.param] = err.msg;
          });
          setErrors(newErrors);
        } else {
          toast.error(errorData?.error || 'Failed to import mobile numbers');
        }
      },
    }
  );

  const handleChange = (e) => {
    setImportData(e.target.value);
    setErrors({});
    setImportResult(null);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const mobileNumbers = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, handling quoted values
      const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      
      if (values.length >= 1) {
        const phoneNumber = values[0];
        const name = values[1] || null;
        
        if (phoneNumber) {
          mobileNumbers.push({
            phone_number: phoneNumber,
            name: name
          });
        }
      }
    }

    return mobileNumbers;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!importData.trim()) {
      setErrors({ importData: 'Please enter mobile numbers to import' });
      return;
    }

    const mobileNumbers = parseCSV(importData);
    
    if (mobileNumbers.length === 0) {
      setErrors({ importData: 'No valid mobile numbers found' });
      return;
    }

    bulkImportMutation.mutate({ mobileNumbers });
  };

  const handleClose = () => {
    setImportData('');
    setErrors({});
    setImportResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    const template = 'phone_number,name\n+919876543210,John Doe\n+919876543211,Jane Smith';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mobile-numbers-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bulk Import Mobile Numbers
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {!importResult ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="importData" className="block text-sm font-medium text-gray-700">
                    Mobile Numbers *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="importData"
                      name="importData"
                      value={importData}
                      onChange={handleChange}
                      rows={10}
                      className={`input ${errors.importData ? 'border-red-500' : ''}`}
                      placeholder="Enter mobile numbers (one per line or CSV format)&#10;Example:&#10;+919876543210,John Doe&#10;+919876543211,Jane Smith"
                    />
                  </div>
                  {errors.importData && <p className="mt-1 text-sm text-red-600">{errors.importData}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter phone numbers in international format. You can use CSV format with phone_number,name or just one number per line.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="btn-secondary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Upload className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Import completed successfully!
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Total processed: {importResult.summary.total}</li>
                          <li>Successfully added: {importResult.summary.added}</li>
                          <li>Duplicates skipped: {importResult.summary.duplicates}</li>
                          <li>Invalid entries: {importResult.summary.invalid}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {importResult.results && importResult.results.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Import Results:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {importResult.results.map((result, index) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded ${
                            result.status === 'sent' 
                              ? 'bg-green-50 text-green-800' 
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {result.phone_number} - {result.status}
                          {result.error && ` (${result.error})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {!importResult ? (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={bulkImportMutation.isLoading}
                  className="btn-primary sm:ml-3 sm:w-auto"
                >
                  {bulkImportMutation.isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary sm:w-auto"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal; 