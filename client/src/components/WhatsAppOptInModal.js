import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Phone, Mail, Globe, Store, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WhatsAppOptInModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    consent_method: 'website'
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success, 3: Already opted in

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/optin/opt-in', {
        phone_number: formData.phone_number,
        name: formData.name,
        consent_method: formData.consent_method,
        consent_text: `I agree to receive promotional messages and updates from Cloud Solutions via WhatsApp at ${formData.phone_number}. I understand that I can opt out at any time by replying STOP.`
      });

      if (response.data.success) {
        if (response.data.already_opted_in) {
          setStep(3);
        } else {
          setStep(2);
        }
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      console.error('Opt-in error:', error);
      if (error.response?.data?.already_opted_in) {
        setStep(3);
      } else {
        toast.error(error.response?.data?.message || 'Failed to opt in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ phone_number: '', name: '', consent_method: 'website' });
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 && 'Join WhatsApp Updates'}
              {step === 2 && 'Successfully Opted In!'}
              {step === 3 && 'Already Subscribed'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step 1: Opt-in Form */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Get Updates via WhatsApp
                </h3>
                <p className="text-sm text-gray-600">
                  Receive promotional offers, updates, and exclusive deals directly on WhatsApp.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    name="consent_method"
                    value={formData.consent_method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="website">Website</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in_store">In Store</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Consent Notice:</p>
                      <p>
                        By providing your phone number, you agree to receive promotional messages 
                        and updates from Cloud Solutions via WhatsApp. You can opt out at any time 
                        by replying "STOP" to any message.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    {loading ? 'Opting In...' : 'Join WhatsApp Updates'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Success */}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                You're all set!
              </h3>
              <p className="text-sm text-gray-600">
                You'll now receive updates and promotional offers via WhatsApp at{' '}
                <span className="font-medium">{formData.phone_number}</span>
              </p>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Step 3: Already Opted In */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Already Subscribed
              </h3>
              <p className="text-sm text-gray-600">
                This phone number is already opted in for WhatsApp updates.
              </p>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppOptInModal;
