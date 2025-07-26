import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PromotionModal = ({ isOpen, onClose, promotion }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    discount_amount: '',
    start_date: '',
    end_date: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    (data) => axios.post('/api/promotions', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('promotions');
        toast.success('Promotion created successfully');
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
          toast.error(errorData?.error || 'Failed to create promotion');
        }
      },
    }
  );

  const updateMutation = useMutation(
    (data) => axios.put(`/api/promotions/${promotion?.id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('promotions');
        toast.success('Promotion updated successfully');
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
          toast.error(errorData?.error || 'Failed to update promotion');
        }
      },
    }
  );

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        discount_percentage: promotion.discount_percentage || '',
        discount_amount: promotion.discount_amount || '',
        start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
        is_active: promotion.is_active
      });
    } else {
      setFormData({
        title: '',
        description: '',
        discount_percentage: '',
        discount_amount: '',
        start_date: '',
        end_date: '',
        is_active: true
      });
    }
    setErrors({});
  }, [promotion]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.discount_percentage && (formData.discount_percentage < 0 || formData.discount_percentage > 100)) {
      newErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
    }
    if (formData.discount_amount && formData.discount_amount < 0) {
      newErrors.discount_amount = 'Discount amount must be positive';
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null
    };

    if (promotion) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
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
                {promotion ? 'Edit Promotion' : 'Create Promotion'}
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input mt-1 ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter promotion title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input mt-1"
                  placeholder="Enter promotion description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    id="discount_percentage"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={`input mt-1 ${errors.discount_percentage ? 'border-red-500' : ''}`}
                    placeholder="0-100"
                  />
                  {errors.discount_percentage && <p className="mt-1 text-sm text-red-600">{errors.discount_percentage}</p>}
                </div>

                <div>
                  <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700">
                    Discount Amount ($)
                  </label>
                  <input
                    type="number"
                    id="discount_amount"
                    name="discount_amount"
                    value={formData.discount_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input mt-1 ${errors.discount_amount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.discount_amount && <p className="mt-1 text-sm text-red-600">{errors.discount_amount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`input mt-1 ${errors.end_date ? 'border-red-500' : ''}`}
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
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
                  {promotion ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                promotion ? 'Update' : 'Create'
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

export default PromotionModal; 