import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Tag, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Plus,
  Send
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const [promotionsRes, mobileNumbersRes, whatsappStatsRes] = await Promise.all([
      axios.get('/api/promotions'),
      axios.get('/api/users/mobile-numbers/count'),
      axios.get('/api/whatsapp/stats')
    ]);

    return {
      promotions: promotionsRes.data.promotions,
      mobileNumbers: mobileNumbersRes.data.counts,
      whatsappStats: whatsappStatsRes.data.stats
    };
  });

  const recentPromotions = stats?.promotions?.slice(0, 5) || [];
  const totalPromotions = stats?.promotions?.length || 0;
  const activePromotions = stats?.promotions?.filter(p => p.is_active)?.length || 0;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your promotions and campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Promotions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPromotions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Promotions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activePromotions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Mobile Numbers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.mobileNumbers?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    WhatsApp Sent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.whatsappStats?.sent || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/promotions"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                  <Plus className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Create Promotion
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add a new promotion with discounts and details
                </p>
              </div>
            </Link>

            <Link
              to="/mobile-numbers"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Add Mobile Numbers
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Import or add mobile numbers for WhatsApp campaigns
                </p>
              </div>
            </Link>

            <Link
              to="/whatsapp-campaigns"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <Send className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Send WhatsApp Campaign
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Send promotions via WhatsApp to your contacts
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Promotions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Promotions</h3>
          <Link
            to="/promotions"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        <div className="card-body">
          {recentPromotions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No promotions created yet.</p>
          ) : (
            <div className="space-y-4">
              {recentPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {promotion.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {promotion.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {format(new Date(promotion.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        promotion.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {promotion.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {promotion.discount_percentage && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {promotion.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 