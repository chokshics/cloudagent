import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  FileText, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  TrendingUp,
  Calendar,
  User,
  Crown,
  Activity
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const Reports = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch reports data
  const { data: reportsData, isLoading, error } = useQuery('reports', async () => {
    const response = await axios.get('/api/reports/users');
    return response.data;
  });

  // Fetch summary data
  const { data: summaryData } = useQuery('reports-summary', async () => {
    const response = await axios.get('/api/reports/summary');
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Activity className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
        <p className="text-gray-500">Failed to load reports data. Please try again.</p>
      </div>
    );
  }

  const { reports = [], summary = {} } = reportsData || {};
  const { summary: summaryStats = {} } = summaryData || {};

  const stats = [
    {
      title: 'Total Users',
      value: summaryStats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Promotions',
      value: summaryStats.totalPromotions || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Mobile Numbers',
      value: summaryStats.totalMobileNumbers || 0,
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'WhatsApp Campaigns',
      value: summaryStats.totalWhatsAppCampaigns || 0,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Payments',
      value: summaryStats.totalPayments || 0,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${summaryStats.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive overview of all users and system statistics
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Reports Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">User Reports</h3>
          <p className="text-sm text-gray-500">
            Detailed information about all registered users
          </p>
        </div>
        <div className="card-body">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No user data available for reports.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-gray-500">{user.phone_number || 'No phone number'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.registration_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {user.subscription_plan || 'No Plan'}
                          </div>
                          {user.subscription_plan && (
                            <div className="text-xs text-gray-500">
                              {user.subscription_active ? 'Active' : 'Inactive'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-500 mr-1" />
                            {user.promotions_created} promotions
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-blue-500 mr-1" />
                            {user.mobile_numbers_added} mobile numbers
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 text-orange-500 mr-1" />
                            {user.whatsapp_campaigns_sent} campaigns
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            ₹{user.total_payments_amount || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.payments_made} payments
                          </div>
                          {user.last_payment_date && (
                            <div className="text-xs text-gray-400">
                              Last: {format(new Date(user.last_payment_date), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports; 