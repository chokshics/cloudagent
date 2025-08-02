import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PromotionModal from '../components/PromotionModal';

const Promotions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery('promotions', async () => {
    const response = await axios.get('/api/promotions');
    return response.data.promotions;
  });

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/promotions/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('promotions');
        toast.success('Promotion deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete promotion');
      },
    }
  );

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    console.log('Create button clicked, setting modal to open');
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your promotions and discounts
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </button>
      </div>

      {/* Promotions Grid */}
      {promotions?.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No promotions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new promotion.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promotions?.map((promotion) => (
            <div key={promotion.id} className="card">
              <div className="card-body">
                {/* Promotion Image */}
                {promotion.image_url && (
                  <div className="mb-4">
                    <img
                      src={promotion.image_url}
                      alt={promotion.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {promotion.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {promotion.description || 'No description'}
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      {promotion.discount_percentage && (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {promotion.discount_percentage}% OFF
                          </span>
                        </div>
                      )}
                      
                      {promotion.discount_amount && (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Save ${promotion.discount_amount}
                          </span>
                        </div>
                      )}

                      {promotion.start_date && promotion.end_date && (
                        <div className="text-xs text-gray-500">
                          Valid: {format(new Date(promotion.start_date), 'MMM dd')} - {format(new Date(promotion.end_date), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          promotion.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {console.log('Modal state - isOpen:', isModalOpen, 'editingPromotion:', editingPromotion)}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        promotion={editingPromotion}
      />
    </div>
  );
};

export default Promotions; 