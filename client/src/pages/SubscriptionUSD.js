import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { CreditCard, Check, Star, Zap, Crown, DollarSign, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SubscriptionUSD = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const queryClient = useQueryClient();

  // USD subscription plans
  const usdPlans = [
    {
      id: 1,
      name: 'Free',
      description: 'Perfect for getting started',
      price_usd: 0,
      whatsapp_send_limit: 10,
      mobile_number_limit: 10
    },
    {
      id: 2,
      name: 'Starter',
      description: 'Great for small businesses',
      price_usd: 20,
      whatsapp_send_limit: 100,
      mobile_number_limit: 50
    },
    {
      id: 3,
      name: 'Professional',
      description: 'Ideal for growing businesses',
      price_usd: 50,
      whatsapp_send_limit: 500,
      mobile_number_limit: 100
    },
    {
      id: 4,
      name: 'Enterprise',
      description: 'For large scale operations',
      price_usd: 100,
      whatsapp_send_limit: 1000,
      mobile_number_limit: 200
    }
  ];

  // Fetch current subscription
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery('current-subscription', async () => {
    const response = await axios.get('/api/subscriptions/current');
    return response.data.subscription;
  });

  // Complete payment mutation
  const completePaymentMutation = useMutation(
    async ({ planName, priceUSD, userData }) => {
      const response = await axios.post('/api/subscriptions/complete-usd-payment', {
        planName,
        priceUSD,
        userData
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Payment request sent! An invoice will be sent to your email soon.');
        queryClient.invalidateQueries('current-subscription');
        setSelectedPlan(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to process payment request');
      },
      onSettled: () => {
        setIsProcessingPayment(false);
      }
    }
  );

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCompletePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessingPayment(true);
    
    try {
      // Get current user data
      const userResponse = await axios.get('/api/auth/me');
      const userData = userResponse.data.user;

      await completePaymentMutation.mutateAsync({
        planName: selectedPlan.name,
        priceUSD: selectedPlan.price_usd,
        userData
      });
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'Free':
        return <Star className="h-6 w-6" />;
      case 'Starter':
        return <Zap className="h-6 w-6" />;
      case 'Professional':
        return <Crown className="h-6 w-6" />;
      case 'Enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case 'Free':
        return 'border-gray-200 hover:border-gray-300';
      case 'Starter':
        return 'border-blue-200 hover:border-blue-300';
      case 'Professional':
        return 'border-purple-200 hover:border-purple-300';
      case 'Enterprise':
        return 'border-indigo-200 hover:border-indigo-300';
      default:
        return 'border-gray-200 hover:border-gray-300';
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">USD Subscription Plans</h1>
          <p className="text-lg text-gray-600">
            Choose your plan and pay in USD via WISE
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-semibold">{currentSubscription.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp Campaigns</p>
                  <p className="font-semibold">
                    {currentSubscription.whatsapp_sends_used} / {currentSubscription.whatsapp_send_limit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mobile Numbers per Campaign</p>
                  <p className="font-semibold">Up to {currentSubscription.mobile_number_limit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USD Subscription Plans */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {usdPlans.map((plan) => (
            <div
              key={plan.id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-indigo-500' : ''
              } ${getPlanColor(plan.name)}`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="card-body text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    {getPlanIcon(plan.name)}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  ${plan.price_usd}
                  {plan.price_usd > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                </div>
                
                {plan.price_usd > 0 && (
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
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan && selectedPlan.price_usd > 0 && (
          <div className="card mt-8">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">USD Payment via WISE</h4>
                    <p className="text-sm text-blue-700">
                      Amount: ${selectedPlan.price_usd} for {selectedPlan.name} plan
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Payment Process</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      Payment in USD will be supported via WISE. An invoice will be sent to your registered email address soon to complete payment.
                    </p>
                    <p className="text-sm text-yellow-700">
                      Thank you for choosing our USD subscription option.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompletePayment}
                disabled={isProcessingPayment}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionUSD; 