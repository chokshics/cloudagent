import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Send, Users, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendWhatsAppCampaignModal = ({ isOpen, onClose, promotion, mobileNumbers, mobileNumberLimits }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const sendWhatsAppCampaignMutation = useMutation(
    (data) => axios.post('/api/whatsapp/send', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('whatsapp-logs');
        queryClient.invalidateQueries('subscription-info');
        toast.success('WhatsApp campaign sent successfully!');
        onClose();
      },
      onError: (error) => {
        const errorData = error.response?.data;
        if (errorData?.error?.includes('campaign limit reached')) {
          toast.error('Campaign limit reached. Please upgrade your plan to send more campaigns.');
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
      const limit = mobileNumberLimits?.mobileNumberLimit || activeNumbers.length;
      const limitedNumbers = activeNumbers.slice(0, limit);
      setSelectedNumbers(limitedNumbers);
      setSelectAll(limitedNumbers.length === activeNumbers.length);
      
      if (activeNumbers.length > limit) {
        toast.error(`Your plan allows only ${limit} mobile numbers per campaign. Only the first ${limit} numbers have been selected.`);
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
      const limit = mobileNumberLimits?.mobileNumberLimit || allNumbers.length;
      const limitedNumbers = allNumbers.slice(0, limit);
      setSelectedNumbers(limitedNumbers);
      setSelectAll(limitedNumbers.length === allNumbers.length);
      
      if (allNumbers.length > limit) {
        toast.error(`Your plan allows only ${limit} mobile numbers per campaign. Only the first ${limit} numbers have been selected.`);
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
        const limit = mobileNumberLimits?.mobileNumberLimit || mobileNumbers?.length || 0;
        if (prev.length >= limit) {
          toast.error(`Your plan allows only ${limit} mobile numbers per campaign. Please deselect some numbers first.`);
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
    
    sendWhatsAppCampaignMutation.mutate({
      to: selectedPhoneNumbers,
      message: previewMessage,
      promotionId: promotion.id
    });
  };

  const handleClose = () => {
    setSelectedNumbers([]);
    setSelectAll(false);
    setCustomMessage('');
    setPreviewMessage('');
    setSending(false);
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Send WhatsApp Campaign
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Recipients */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Select Recipients</h4>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {selectedNumbers.length} of {activeMobileNumbers.length} selected
                    </span>
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
                <h4 className="text-sm font-medium text-gray-900 mb-3">Message Preview</h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700">
                      Custom Message (Optional)
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Preview
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Send className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">
                            {previewMessage}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {previewMessage.length} characters
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Campaign Summary
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Promotion: {promotion.title}</li>
                            <li>Recipients: {selectedNumbers.length}</li>
                            <li>Message length: {previewMessage.length} characters</li>
                            <li>Platform: WhatsApp (via Twilio)</li>
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
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || selectedNumbers.length === 0}
              className="btn-primary sm:ml-3 sm:w-auto"
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
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