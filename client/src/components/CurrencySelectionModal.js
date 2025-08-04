import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, DollarSign, IndianRupee, ArrowRight } from 'lucide-react';

const CurrencySelectionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleCurrencySelect = (currency) => {
    if (currency === 'INR') {
      // Navigate to the current subscription page (INR)
      navigate('/subscription');
    } else if (currency === 'USD') {
      // Navigate to USD subscription page
      navigate('/subscription-usd');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Currency</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-600 text-center mb-6">
              Choose your preferred currency for subscription plans
            </p>

            {/* INR Option */}
            <button
              onClick={() => handleCurrencySelect('INR')}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <IndianRupee className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Indian Rupee (₹)</h3>
                    <p className="text-sm text-gray-600">Pay in INR via UPI</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </button>

            {/* USD Option */}
            <button
              onClick={() => handleCurrencySelect('USD')}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">US Dollar ($)</h3>
                    <p className="text-sm text-gray-600">Pay in USD via WISE</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelectionModal; 