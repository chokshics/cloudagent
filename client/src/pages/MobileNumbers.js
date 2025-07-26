import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Upload, Edit, Trash2, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import MobileNumberModal from '../components/MobileNumberModal';
import BulkImportModal from '../components/BulkImportModal';

const MobileNumbers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);
  const queryClient = useQueryClient();

  const { data: mobileNumbers, isLoading } = useQuery('mobile-numbers', async () => {
    const response = await axios.get('/api/users/mobile-numbers');
    return response.data.mobileNumbers;
  });

  const { data: counts } = useQuery('mobile-numbers-count', async () => {
    const response = await axios.get('/api/users/mobile-numbers/count');
    return response.data.counts;
  });

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/users/mobile-numbers/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mobile-numbers');
        queryClient.invalidateQueries('mobile-numbers-count');
        toast.success('Mobile number deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete mobile number');
      },
    }
  );

  const handleEdit = (mobileNumber) => {
    setEditingNumber(mobileNumber);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNumber(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this mobile number?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingNumber(null);
  };

  const handleBulkModalClose = () => {
    setIsBulkModalOpen(false);
  };

  const exportToCSV = () => {
    if (!mobileNumbers || mobileNumbers.length === 0) {
      toast.error('No mobile numbers to export');
      return;
    }

    const csvContent = [
      ['Phone Number', 'Name', 'Status', 'Created Date'],
      ...mobileNumbers.map(number => [
        number.phone_number,
        number.name || '',
        number.is_active ? 'Active' : 'Inactive',
        format(new Date(number.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-numbers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Mobile numbers exported successfully');
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
          <h1 className="text-2xl font-bold text-gray-900">Mobile Numbers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your mobile number list for WhatsApp campaigns
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={exportToCSV}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Number
          </button>
        </div>
      </div>

      {/* Stats */}
      {counts && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{counts.total}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Numbers</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">{counts.active}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.active}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">{counts.inactive}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <p className="text-lg font-semibold text-gray-900">{counts.inactive}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Numbers List */}
      {mobileNumbers?.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Plus className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No mobile numbers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding mobile numbers for your WhatsApp campaigns.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="btn-secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Number
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Mobile Numbers</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mobileNumbers?.map((mobileNumber) => (
                    <tr key={mobileNumber.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mobileNumber.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mobileNumber.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mobileNumber.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {mobileNumber.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(mobileNumber.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(mobileNumber)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mobileNumber.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MobileNumberModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        mobileNumber={editingNumber}
      />
      
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={handleBulkModalClose}
      />
    </div>
  );
};

export default MobileNumbers; 