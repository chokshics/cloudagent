import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { Send, Users, CheckSquare, Square, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendWhatsAppCampaignModal = ({ isOpen, onClose, promotion, mobileNumbers, mobileNumberLimits }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [campaignSent, setCampaignSent] = useState(false);
  const [useTemplate, setUseTemplate] = useState(true);
  const [templateSid, setTemplateSid] = useState('HX1f0ca4d69ef77795608fd507e6dd5375'); // Default template SID
  const queryClient = useQueryClient();

  // Query to get current subscription info
  const { data: subscriptionInfo } = useQuery('subscription-info', async () => {
    const response = await axios.get('/api/subscriptions/can-send-whatsapp');
    return response.data;
  });

  // Query to check if campaign has already been sent for this promotion
  const { data: campaignHistory } = useQuery(
    ['whatsapp-campaign-history', promotion?.id],
    () => axios.get(`/api/whatsapp/logs/${promotion?.id}`),
    {
      enabled: !!promotion?.id && isOpen,
      onSuccess: (response) => {
        // Check if any successful campaigns were sent for this promotion
        const hasSuccessfulCampaigns = response.data.some(log => 
          log.status === 'delivered' || log.status === 'sent'
        );
        setCampaignSent(hasSuccessfulCampaigns);
      }
    }
  );

  const sendWhatsAppCampaignMutation = useMutation(
    (data) => {
      // Use template-based sending for promotions
      if (data.useTemplate && data.templateSid) {
        return axios.post('/api/whatsapp/send-promotion-template', {
          to: data.to,
          promotionId: data.promotionId,
          templateSid: data.templateSid
        });
      } else {
        // Fallback to regular message sending
        return axios.post('/api/whatsapp/send', data);
      }
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('whatsapp-logs');
        queryClient.invalidateQueries('subscription-info');
        queryClient.invalidateQueries(['whatsapp-campaign-history', promotion?.id]);
        setCampaignSent(true);
        toast.success('WhatsApp campaign sent successfully!');
        onClose();
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData?.error?.includes('campaign limit reached') || errorData?.error?.includes('WhatsApp campaign limit reached')) {
          toast.error('Monthly campaign limit reached. Please upgrade your plan to send more campaigns.');
        } else {
          toast.error(errorData?.error || 'Failed to send WhatsApp campaign');
        }
      },
      onSettled: () => {
        setSending(false);
      }
    }
  );

  useEffect(() => {
    if (promotion && mobileNumbers) {
      // Auto-select active mobile numbers up to the limit
      const activeNumbers = mobileNumbers.filter(m => m.is_active).map(m => m.id);
      const limit = mobileNumberLimits?.mobileNumberLimit || 10; // Default to 10 for Free plan
      const limitedNumbers = activeNumbers.slice(0, limit);
      setSelectedNumbers(limitedNumbers);
      setSelectAll(limitedNumbers.length === activeNumbers.length);
      
      if (activeNumbers.length > limit) {
        toast.error(`Your ${mobileNumberLimits?.planName || 'Free'} plan allows only ${limit} recipients per campaign. Only the first ${limit} numbers have been selected.`);
      }
      
      // Generate preview message
      generatePreviewMessage();
    }
  }, [promotion, mobileNumbers, mobileNumberLimits]);

  useEffect(() => {
    generatePreviewMessage();
  }, [customMessage, promotion]);

  const generatePreviewMessage = () => {
    if (!promotion) return;

    let message = customMessage || `🎉 *${promotion.title}*\n\n`;
    
    if (promotion.description) {
      message += `${promotion.description}\n\n`;
    }

    if (promotion.discount_percentage) {
      message += `*Get ${promotion.discount_percentage}% OFF!* `;
    } else if (promotion.discount_amount) {
      message += `*Save $${promotion.discount_amount}!* `;
    }

    if (promotion.start_date && promotion.end_date) {
      message += `\nValid from ${new Date(promotion.start_date).toLocaleDateString()} to ${new Date(promotion.end_date).toLocaleDateString()}`;
    }

    message += '\n\nReply STOP to unsubscribe';
    
    setPreviewMessage(message);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNumbers([]);
      setSelectAll(false);
    } else {
      const allNumbers = mobileNumbers?.filter(m => m.is_active).map(m => m.id) || [];
      const limit = mobileNumberLimits?.mobileNumberLimit || 10; // Default to 10 for Free plan
      const limitedNumbers = allNumbers.slice(0, limit);
      setSelectedNumbers(limitedNumbers);
      setSelectAll(limitedNumbers.length === allNumbers.length);
      
      if (allNumbers.length > limit) {
        toast.error(`Your ${mobileNumberLimits?.planName || 'Free'} plan allows only ${limit} recipients per campaign. Only the first ${limit} numbers have been selected.`);
      }
    }
  };

  const handleSelectNumber = (numberId) => {
    setSelectedNumbers(prev => {
      if (prev.includes(numberId)) {
        const newSelection = prev.filter(id => id !== numberId);
        setSelectAll(newSelection.length === mobileNumbers?.filter(m => m.is_active).length);
        return newSelection;
      } else {
        const limit = mobileNumberLimits?.mobileNumberLimit || 10; // Default to 10 for Free plan
        if (prev.length >= limit) {
          toast.error(`Your ${mobileNumberLimits?.planName || 'Free'} plan allows only ${limit} recipients per campaign. Please deselect some numbers first.`);
          return prev;
        }
        const newSelection = [...prev, numberId];
        setSelectAll(newSelection.length === mobileNumbers?.filter(m => m.is_active).length);
        return newSelection;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedNumbers.length === 0) {
      toast.error('Please select at least one mobile number');
      return;
    }

    setSending(true);
    
    // Get the selected mobile numbers' phone numbers
    const selectedPhoneNumbers = mobileNumbers
      .filter(m => selectedNumbers.includes(m.id))
      .map(m => m.phone_number);
    
    if (useTemplate) {
      // Use template-based sending
      sendWhatsAppCampaignMutation.mutate({
        to: selectedPhoneNumbers,
        promotionId: promotion.id,
        useTemplate: true,
        templateSid: templateSid
      });
    } else {
      // Use regular message sending
      sendWhatsAppCampaignMutation.mutate({
        to: selectedPhoneNumbers,
        message: previewMessage,
        promotionId: promotion.id,
        useTemplate: false
      });
    }
  };

  const handleClose = () => {
    setSelectedNumbers([]);
    setSelectAll(false);
    setCustomMessage('');
    setPreviewMessage('');
    setSending(false);
    setCampaignSent(false);
    onClose();
  };

  if (!isOpen || !promotion) return null;

  const activeMobileNumbers = mobileNumbers?.filter(m => m.is_active) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Send WhatsApp Campaign
                </h3>
                {subscriptionInfo && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subscriptionInfo.planName} Plan • {subscriptionInfo.sendsUsed}/{subscriptionInfo.sendLimit} campaigns used this month
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Limit Warning */}
              {subscriptionInfo && !subscriptionInfo.canSend && (
                <div className="lg:col-span-2 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Monthly Campaign Limit Reached
                      </h4>
                                             <p className="text-sm text-red-700 mt-1">
                         You've used {subscriptionInfo.sendsUsed} out of {subscriptionInfo.sendLimit} campaigns this month. 
                         {(subscriptionInfo.planName === 'Free' || subscriptionInfo.planName === 'Starter' || subscriptionInfo.planName === 'Professional' || subscriptionInfo.planName === 'Enterprise') ? ' Upgrade your plan to send more campaigns.' : ' Please wait until next month or upgrade your plan.'}
                       </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Left Column - Recipients */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Select Recipients</h4>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedNumbers.length} of {activeMobileNumbers.length} selected
                      </span>
                      {mobileNumberLimits && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Limit: {mobileNumberLimits.mobileNumberLimit} recipients
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      {selectAll ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {activeMobileNumbers.map((mobileNumber) => (
                      <div
                        key={mobileNumber.id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectNumber(mobileNumber.id)}
                          className="flex-shrink-0"
                        >
                          {selectedNumbers.includes(mobileNumber.id) ? (
                            <CheckSquare className="h-5 w-5 text-primary-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {mobileNumber.phone_number}
                          </p>
                          {mobileNumber.name && (
                            <p className="text-sm text-gray-500">
                              {mobileNumber.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Message Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Message Configuration</h4>
                
                <div className="space-y-4">
                  {/* Template Configuration */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">WhatsApp Template</h5>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useTemplate"
                          checked={useTemplate}
                          onChange={(e) => setUseTemplate(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="useTemplate" className="ml-2 text-sm text-gray-700">
                          Use Template
                        </label>
                      </div>
                    </div>
                    
                    {useTemplate ? (
                      <div>
                        <label htmlFor="templateSid" className="block text-sm font-medium text-gray-700 mb-1">
                          Template SID
                        </label>
                        <input
                          type="text"
                          id="templateSid"
                          value={templateSid}
                          onChange={(e) => setTemplateSid(e.target.value)}
                          className="input text-sm"
                          placeholder="Enter your Twilio template SID"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Template will map: Title → {1}, Description → {2}, Image → {3}, Company → {4}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700">
                          Custom Message
                        </label>
                        <textarea
                          id="customMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={3}
                          className="input mt-1"
                          placeholder="Enter a custom message or leave empty to use default"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {useTemplate ? 'Template Mapping Preview' : 'WhatsApp Preview'}
                    </label>
                    
                    {useTemplate ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="font-medium text-blue-900">Template Variables:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">{1}:</span> {promotion.title}
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">{2}:</span> {promotion.description?.substring(0, 30)}...
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">{3}:</span> {promotion.image_url ? 'Image URL' : 'No Image'}
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <span className="font-medium">{4}:</span> Cloud Solutions
                            </div>
                          </div>
                          <div className="text-xs text-blue-700">
                            💡 Template will automatically map promotion data to these variables
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Send className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            {/* Promotion Image */}
                            {promotion.image_url && (
                              <div className="mb-3">
                                <img
                                  src={promotion.image_url}
                                  alt={promotion.title}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                />
                              </div>
                            )}
                            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                              {previewMessage}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {previewMessage.length} characters
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`border rounded-lg p-4 ${
                    campaignSent 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {campaignSent ? (
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <Users className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${
                          campaignSent ? 'text-yellow-800' : 'text-green-800'
                        }`}>
                          Campaign Summary
                        </h3>
                        <div className={`mt-2 text-sm ${
                          campaignSent ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Promotion: {promotion.title}</li>
                            <li>Recipients: {selectedNumbers.length}</li>
                            <li>Message length: {previewMessage.length} characters</li>
                            <li>Platform: WhatsApp (via Twilio)</li>
                            {promotion.image_url && (
                              <li>Includes promotion image</li>
                            )}
                            {campaignSent && (
                              <li className="font-medium">Status: Campaign Already Sent</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {campaignSent && (
              <div className="w-full mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    A WhatsApp campaign has already been sent for this promotion. You cannot send another campaign.
                  </span>
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || selectedNumbers.length === 0 || campaignSent || (subscriptionInfo && !subscriptionInfo.canSend)}
              className={`sm:ml-3 sm:w-auto ${
                campaignSent || (subscriptionInfo && !subscriptionInfo.canSend)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'btn-primary'
              }`}
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : campaignSent ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Campaign Already Sent
                </>
              ) : subscriptionInfo && !subscriptionInfo.canSend ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Monthly Limit Reached
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send WhatsApp Campaign ({selectedNumbers.length})
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
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

export default SendWhatsAppCampaignModal; 