import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CreditCard, Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery('subscription-plans', async () => {
    const response = await axios.get('/api/subscriptions/plans');
    return response.data.plans;
  });

  // Fetch current subscription
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery('current-subscription', async () => {
    const response = await axios.get('/api/subscriptions/current');
    return response.data.subscription;
  });

  // Fetch payment history
  const { data: paymentsData } = useQuery('payment-history', async () => {
    const response = await axios.get('/api/subscriptions/payments');
    return response.data.payments;
  });



  // Verify payment mutation
  const verifyPaymentMutation = useMutation(
    async ({ paymentId, upiTransactionId }) => {
      const response = await axios.post('/api/subscriptions/verify-payment', {
        paymentId,
        upiTransactionId
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Payment verified! Your subscription has been upgraded.');
        queryClient.invalidateQueries('current-subscription');
        queryClient.invalidateQueries('payment-history');
        setSelectedPlan(null);
        setUpiTransactionId('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to verify payment');
      },
      onSettled: () => {
        setIsProcessingPayment(false);
      }
    }
  );

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };



  const handleVerifyPayment = async () => {
    if (!upiTransactionId.trim()) {
      toast.error('Please enter the UPI transaction ID');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }

    setIsProcessingPayment(true);
    verifyPaymentMutation.mutate({
      planId: selectedPlan.id,
      amountInr: selectedPlan.price_inr,
      upiTransactionId: upiTransactionId.trim()
    });
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="h-6 w-6" />;
      case 'starter':
        return <Zap className="h-6 w-6" />;
      case 'professional':
        return <Crown className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'border-gray-200 bg-gray-50';
      case 'starter':
        return 'border-blue-200 bg-blue-50';
      case 'professional':
        return 'border-purple-200 bg-purple-50';
      case 'enterprise':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getQRCodeImage = (planName) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return '/qrcode-750.jpeg';
      case 'professional':
        return '/qrcode-750.jpeg';
      case 'enterprise':
        return '/qrcode-1500.jpeg';
      default:
        return '/qrcode-100.jpeg';
    }
  };

  if (plansLoading || subscriptionLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose a plan that fits your business needs
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="card border-green-200 bg-green-50">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Current Plan: {currentSubscription.plan_name}
                </h3>
                <p className="text-sm text-green-700">
                  WhatsApp campaigns: {currentSubscription.whatsapp_sends_used} / {currentSubscription.whatsapp_send_limit}
                </p>
                <p className="text-sm text-green-700">
                  Mobile numbers per campaign: Up to {currentSubscription.mobile_number_limit}
                </p>
                {currentSubscription.end_date && (
                  <p className="text-sm text-green-700">
                    Expires: {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">
                  Started: {new Date(currentSubscription.start_date).toLocaleDateString()}
                </p>
                {currentSubscription.end_date && (
                  <p className="text-sm text-green-600">
                    Duration: 1 month
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plansData?.map((plan) => (
          <div
            key={plan.id}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPlan?.id === plan.id ? 'ring-2 ring-primary-500' : ''
            } ${getPlanColor(plan.name)}`}
            onClick={() => handlePlanSelect(plan)}
          >
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                  {getPlanIcon(plan.name)}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ₹{plan.price_inr}
                {plan.price_inr > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
              </div>
              
              {plan.price_inr > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  Valid for 1 month
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  {plan.whatsapp_send_limit} WhatsApp campaigns
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Up to {plan.mobile_number_limit} mobile numbers per campaign
                </div>
              </div>
              
              {selectedPlan?.id === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Section */}
      {selectedPlan && selectedPlan.price_inr > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">UPI Payment</h4>
                  <p className="text-sm text-blue-700">
                    Amount: ₹{selectedPlan.price_inr} for {selectedPlan.name} plan
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Scan QR Code to Pay</h4>
                <p className="text-sm text-green-700 mb-4">
                  Use any UPI app (PhonePe, Google Pay, Paytm, etc.) to scan the QR code below and pay ₹{selectedPlan.price_inr}.
                </p>
                
                {/* Dynamic UPI QR Code based on plan */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <div className="w-48 h-48 rounded-lg overflow-hidden">
                      <img 
                        src={getQRCodeImage(selectedPlan.name)} 
                        alt="UPI QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>UPI ID:</strong> chokshics@okaxis
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> ₹{selectedPlan.price_inr}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI Transaction ID
                </label>
                <input
                  type="text"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                  placeholder="Enter UPI transaction ID (e.g., 1234567890)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handleVerifyPayment}
                disabled={isProcessingPayment || !upiTransactionId.trim()}
                className="btn-primary flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {isProcessingPayment ? 'Verifying...' : 'Verify Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {paymentsData && paymentsData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentsData.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{payment.amount_inr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage; 