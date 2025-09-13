import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  Globe, 
  Store, 
  MessageSquare,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OptInManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showBulkOptIn, setShowBulkOptIn] = useState(false);
  const [bulkContacts, setBulkContacts] = useState('');
  const [bulkConsentMethod, setBulkConsentMethod] = useState('website');
  const queryClient = useQueryClient();

  // Fetch opt-ins
  const { data: optIns = [], isLoading, refetch } = useQuery(
    'opt-ins',
    () => axios.get('/api/optin/admin/opt-ins').then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Fetch opt-in statistics
  const { data: stats } = useQuery(
    'opt-in-stats',
    () => axios.get('/api/optin/admin/stats').then(res => res.data)
  );

  // Bulk opt-in mutation
  const bulkOptInMutation = useMutation(
    (data) => axios.post('/api/optin/admin/bulk-opt-in', data),
    {
      onSuccess: (response) => {
        toast.success(response.data.message);
        queryClient.invalidateQueries('opt-ins');
        queryClient.invalidateQueries('opt-in-stats');
        setShowBulkOptIn(false);
        setBulkContacts('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to process bulk opt-in');
      }
    }
  );

  // Filter opt-ins based on search and filters
  const filteredOptIns = optIns.filter(optIn => {
    const matchesSearch = optIn.phone_number.includes(searchTerm) || 
                         (optIn.name && optIn.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && optIn.is_active) ||
                         (filterStatus === 'opted_out' && !optIn.is_active);
    const matchesMethod = filterMethod === 'all' || optIn.consent_method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Handle bulk opt-in
  const handleBulkOptIn = () => {
    const contacts = bulkContacts
      .split('\n')
      .map(line => {
        const [phone, name] = line.split(',').map(s => s.trim());
        return { phone_number: phone, name: name || '' };
      })
      .filter(contact => contact.phone_number);

    if (contacts.length === 0) {
      toast.error('Please enter at least one valid contact');
      return;
    }

    bulkOptInMutation.mutate({
      contacts,
      consent_method: bulkConsentMethod,
      consent_text: `Bulk opt-in for promotional messages via WhatsApp. Users can opt out by replying STOP.`
    });
  };

  // Get consent method icon
  const getConsentMethodIcon = (method) => {
    switch (method) {
      case 'website': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'in_store': return <Store className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Opt-in Management</h1>
        <p className="text-gray-600">Manage user consent for WhatsApp promotional messages</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Opt-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_opt_ins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Opt-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_opt_ins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opted Out</p>
                <p className="text-2xl font-bold text-gray-900">{stats.opted_out}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Website Opt-ins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.website_opt_ins}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search phone numbers or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="opted_out">Opted Out</option>
            </select>

            {/* Method Filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="website">Website</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="in_store">In Store</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            
            <button
              onClick={() => setShowBulkOptIn(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Bulk Opt-in
            </button>
          </div>
        </div>
      </div>

      {/* Opt-ins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Consent Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opt-in Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opt-out Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOptIns.map((optIn) => (
                <tr key={optIn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    +{optIn.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {optIn.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {getConsentMethodIcon(optIn.consent_method)}
                      <span className="capitalize">{optIn.consent_method.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      optIn.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {optIn.is_active ? 'Active' : 'Opted Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(optIn.consent_timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {optIn.opt_out_timestamp ? formatDate(optIn.opt_out_timestamp) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOptIns.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No opt-ins found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterMethod !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No users have opted in yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Bulk Opt-in Modal */}
      {showBulkOptIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Bulk Opt-in</h2>
                <button
                  onClick={() => setShowBulkOptIn(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacts (one per line, format: phone_number, name)
                  </label>
                  <textarea
                    value={bulkContacts}
                    onChange={(e) => setBulkContacts(e.target.value)}
                    placeholder="+919876543210, John Doe&#10;+919876543211, Jane Smith&#10;+919876543212"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Example: +919876543210, John Doe
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consent Method
                  </label>
                  <select
                    value={bulkConsentMethod}
                    onChange={(e) => setBulkConsentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="website">Website</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="in_store">In Store</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important Notice
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Only use this for contacts who have already given explicit consent 
                          through other channels (email, phone, in-person, etc.). This feature 
                          should not be used for unsolicited opt-ins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBulkOptIn(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkOptIn}
                    disabled={bulkOptInMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    {bulkOptInMutation.isLoading ? 'Processing...' : 'Process Opt-ins'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptInManagement;
