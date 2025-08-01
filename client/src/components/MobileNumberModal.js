import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MobileNumberModal = ({ isOpen, onClose, mobileNumber }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    (data) => axios.post('/api/users/mobile-numbers', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mobile-numbers');
        queryClient.invalidateQueries('mobile-numbers-count');
        toast.success('Mobile number added successfully');
        onClose();
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
          toast.error(errorData?.error || 'Failed to add mobile number');
        }
      },
    }
  );

  const updateMutation = useMutation(
    (data) => axios.put(`/api/users/mobile-numbers/${mobileNumber?.id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mobile-numbers');
        queryClient.invalidateQueries('mobile-numbers-count');
        toast.success('Mobile number updated successfully');
        onClose();
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
          toast.error(errorData?.error || 'Failed to update mobile number');
        }
      },
    }
  );

  useEffect(() => {
    if (mobileNumber) {
      setFormData({
        phone_number: mobileNumber.phone_number || '',
        name: mobileNumber.name || '',
        is_active: mobileNumber.is_active
      });
    } else {
      setFormData({
        phone_number: '',
        name: '',
        is_active: true
      });
    }
    setErrors({});
  }, [mobileNumber]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePhoneNumber = (phone) => {
    // Basic phone number validation (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mobileNumber) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {mobileNumber ? 'Edit Mobile Number' : 'Add Mobile Number'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`input mt-1 ${errors.phone_number ? 'border-red-500' : ''}`}
                  placeholder="+919876543210"
                />
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Enter phone number in international format (e.g., +919876543210)
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="Enter contact name"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="btn-primary sm:ml-3 sm:w-auto"
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mobileNumber ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                mobileNumber ? 'Update' : 'Add'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNumberModal; 