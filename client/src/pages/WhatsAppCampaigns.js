import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send, MessageSquare, Filter, TestTube, Crown, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import SendWhatsAppCampaignModal from '../components/SendWhatsAppCampaignModal';

const WhatsAppCampaigns = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: promotions } = useQuery('promotions', async () => {
    const response = await axios.get('/api/promotions');
    return response.data.promotions.filter(p => p.is_active);
  });

  const { data: mobileNumbers } = useQuery('mobile-numbers', async () => {
    const response = await axios.get('/api/users/mobile-numbers');
    return response.data.mobileNumbers.filter(m => m.is_active);
  });

  const { data: whatsappLogs, isLoading } = useQuery(
    ['whatsapp-logs', filterStatus],
    async () => {
      const response = await axios.get('/api/whatsapp/logs');
      return response.data;
    }
  );

  const { data: whatsappStatus } = useQuery('whatsapp-status', async () => {
    const response = await axios.get('/api/whatsapp/status');
    return response.data;
  });

  // Fetch subscription info
  const { data: subscriptionInfo } = useQuery('subscription-info', async () => {
    const response = await axios.get('/api/subscriptions/can-send-whatsapp');
    return response.data;
  });

  // Fetch mobile number limits
  const { data: mobileNumberLimits } = useQuery('mobile-number-limits', async () => {
    const response = await axios.get('/api/subscriptions/mobile-number-limits');
    return response.data;
  });

  // Test WhatsApp connection mutation
  const testWhatsAppMutation = useMutation(
    async () => {
      const response = await axios.post('/api/whatsapp/test');
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Test WhatsApp message sent successfully!');
        queryClient.invalidateQueries('whatsapp-status');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to send test message');
      }
    }
  );

  const handleSendCampaign = (promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleTestWhatsApp = () => {
    testWhatsAppMutation.mutate();
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Campaigns</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send promotions to your mobile number list via WhatsApp using Twilio
        </p>
      </div>

      {/* WhatsApp Status */}
      {whatsappStatus && (
        <div className={`card ${whatsappStatus.connected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className={`h-6 w-6 ${whatsappStatus.connected ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${whatsappStatus.connected ? 'text-green-800' : 'text-yellow-800'}`}>
                    WhatsApp Status
                  </h3>
                  <p className={`text-sm ${whatsappStatus.connected ? 'text-green-700' : 'text-yellow-700'}`}>
                    {whatsappStatus.message}
                  </p>
                </div>
              </div>
              {whatsappStatus.connected && (
                <button
                  onClick={handleTestWhatsApp}
                  disabled={testWhatsAppMutation.isLoading}
                  className="btn-secondary text-sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testWhatsAppMutation.isLoading ? 'Testing...' : 'Test Connection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Limit Warning */}
      {subscriptionInfo && !subscriptionInfo.canSend && (
        <div className={`card ${subscriptionInfo.isExpired ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className={`h-5 w-5 ${subscriptionInfo.isExpired ? 'text-red-600' : 'text-yellow-600'} mr-3`} />
                <div>
                  <h3 className={`text-sm font-medium ${subscriptionInfo.isExpired ? 'text-red-800' : 'text-yellow-800'}`}>
                    {subscriptionInfo.isExpired ? 'Subscription Expired' : 'WhatsApp Send Limit Reached'}
                  </h3>
                  <p className={`text-sm ${subscriptionInfo.isExpired ? 'text-red-700' : 'text-yellow-700'}`}>
                    {subscriptionInfo.isExpired 
                      ? `Your ${subscriptionInfo.planName} plan has expired. Please renew your subscription to continue sending WhatsApp campaigns.`
                      : `You've used ${subscriptionInfo.sendsUsed} out of ${subscriptionInfo.sendLimit} WhatsApp campaigns. Upgrade your plan to send more messages.`
                    }
                  </p>
                </div>
              </div>
              <Link
                to="/subscription"
                className={`${subscriptionInfo.isExpired ? 'btn-danger' : 'btn-primary'} text-sm flex items-center`}
              >
                <Crown className="h-4 w-4 mr-2" />
                {subscriptionInfo.isExpired ? 'Renew Plan' : 'Upgrade Plan'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Number Limit Warning */}
      {mobileNumberLimits && mobileNumbers && mobileNumbers.length > mobileNumberLimits.mobileNumberLimit && (
        <div className="card border-orange-200 bg-orange-50">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800">
                    Mobile Number Limit Exceeded
                  </h3>
                  <p className="text-sm text-orange-700">
                    You have {mobileNumbers.length} mobile numbers, but your {mobileNumberLimits.planName} plan only allows up to {mobileNumberLimits.mobileNumberLimit} numbers per campaign. 
                    Upgrade your plan to send to more recipients.
                  </p>
                </div>
              </div>
              <Link
                to="/subscription"
                className="btn-primary text-sm flex items-center"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!whatsappStatus?.connected && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="card-body">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Setup Required
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              To use WhatsApp campaigns, you need to configure Twilio. Follow the setup guide:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Sign up for a Twilio account at <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="underline">twilio.com</a></li>
              <li>Get your Account SID and Auth Token from Twilio Console</li>
              <li>Enable WhatsApp Business API in your Twilio account</li>
              <li>Add your credentials to the .env file</li>
              <li>Restart the server</li>
            </ol>
            <div className="mt-3">
              <a 
                href="/TWILIO_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                View detailed setup guide →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Send Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Send Campaign</h3>
        </div>
        <div className="card-body">
          {promotions?.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active promotions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a promotion first to send WhatsApp campaigns.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promotions?.map((promotion) => (
                <div key={promotion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {promotion.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {promotion.description || 'No description'}
                      </p>
                      
                      <div className="mt-3 space-y-1">
                        {promotion.discount_percentage && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {promotion.discount_percentage}% OFF
                          </span>
                        )}
                        {promotion.discount_amount && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Save ${promotion.discount_amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {mobileNumbers?.length || 0} recipients available
                      {mobileNumberLimits && (
                        <span className="text-orange-600">
                          {' '}(Limit: {mobileNumberLimits.mobileNumberLimit})
                        </span>
                      )}
                    </span>
                    {subscriptionInfo?.canSend ? (
                      <button
                        onClick={() => handleSendCampaign(promotion)}
                        className="btn-primary"
                        disabled={!mobileNumbers?.length || !whatsappStatus?.connected}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Campaign ({subscriptionInfo.sendsUsed}/{subscriptionInfo.sendLimit})
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-red-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Limit reached
                        </div>
                        <Link
                          to="/subscription"
                          className="btn-secondary text-xs flex items-center"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Upgrade Plan
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Logs */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">WhatsApp Logs</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input py-1 px-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          {whatsappLogs?.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No WhatsApp logs</h3>
              <p className="mt-1 text-sm text-gray-500">
                Send your first WhatsApp campaign to see logs here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Twilio SID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {whatsappLogs?.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.promotion_title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.twilio_sid ? (
                          <span className="font-mono text-xs">{log.twilio_sid}</span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <SendWhatsAppCampaignModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        promotion={selectedPromotion}
        mobileNumbers={mobileNumbers}
        mobileNumberLimits={mobileNumberLimits}
      />
    </div>
  );
};

export default WhatsAppCampaigns; 