const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireSubscriptionAccess } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSubscriptionAccess);

// Get all subscription plans
router.get('/plans', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY price_inr ASC', (err, plans) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ plans });
  });
});

// Get current user's subscription
router.get('/current', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      us.*,
      sp.name as plan_name,
      sp.description as plan_description,
      sp.price_inr,
      sp.whatsapp_send_limit,
      sp.mobile_number_limit
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ? AND us.is_active = 1
    ORDER BY us.created_at DESC
    LIMIT 1
  `;
  
  db.get(query, [req.user.userId], (err, subscription) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!subscription) {
      // Create free plan subscription for new users (no expiry for free plan)
      db.run(
        'INSERT INTO user_subscriptions (user_id, plan_id, whatsapp_sends_used, start_date) VALUES (?, 1, 0, ?)',
        [req.user.userId, new Date().toISOString()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create subscription' });
          }
          
          // Get the created subscription
          db.get(query, [req.user.userId], (err, newSubscription) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ subscription: newSubscription });
          });
        }
      );
    } else {
      res.json({ subscription });
    }
  });
});

// Check if user can send WhatsApp messages
router.get('/can-send-whatsapp', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      us.whatsapp_sends_used,
      us.end_date,
      us.created_at,
      sp.whatsapp_send_limit,
      sp.mobile_number_limit,
      sp.name as plan_name,
      sp.id as plan_id
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ? AND us.is_active = 1
    ORDER BY us.created_at DESC
    LIMIT 1
  `;
  
  db.get(query, [req.user.userId], (err, subscription) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!subscription) {
      // For new users without subscription, create a free plan subscription
      db.run(
        'INSERT INTO user_subscriptions (user_id, plan_id, whatsapp_sends_used, start_date) VALUES (?, 1, 0, ?)',
        [req.user.userId, new Date().toISOString()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create subscription' });
          }
          
          // Return free plan limits
          return res.json({ 
            canSend: true, 
            sendsUsed: 0, 
            sendLimit: 2, 
            mobileNumberLimit: 10,
            isExpired: false, 
            planName: 'Free',
            planId: 1
          });
        }
      );
      return;
    }
    
    // For Free plan (plan_id = 1), Starter plan (plan_id = 2), Professional plan (plan_id = 3), and Enterprise plan (plan_id = 4), check monthly limits
    if (subscription.plan_id === 1 || subscription.plan_id === 2 || subscription.plan_id === 3 || subscription.plan_id === 4) {
      const now = new Date();
      const subscriptionStart = new Date(subscription.created_at);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // If subscription was created before this month, reset the count
      if (subscriptionStart < monthStart) {
        db.run(
          'UPDATE user_subscriptions SET whatsapp_sends_used = 0 WHERE user_id = ? AND is_active = 1',
          [req.user.userId],
          function(err) {
            if (err) {
              console.error('Failed to reset monthly count:', err);
            }
          }
        );
        subscription.whatsapp_sends_used = 0;
      }
    } else {
      // For paid plans, check if subscription has expired
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      const isExpired = now > endDate;
      
      // If expired, deactivate the subscription
      if (isExpired) {
        db.run(
          'UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
          [req.user.userId],
          function(err) {
            if (err) {
              console.error('Failed to deactivate expired subscription:', err);
            }
          }
        );
        
        return res.json({
          canSend: false,
          sendsUsed: subscription.whatsapp_sends_used,
          sendLimit: subscription.whatsapp_send_limit,
          mobileNumberLimit: subscription.mobile_number_limit,
          isExpired: true,
          planName: subscription.plan_name,
          planId: subscription.plan_id,
          message: 'Subscription has expired. Please renew your plan.'
        });
      }
    }
    
    const canSend = subscription.whatsapp_sends_used < subscription.whatsapp_send_limit;
    
    res.json({
      canSend,
      sendsUsed: subscription.whatsapp_sends_used,
      sendLimit: subscription.whatsapp_send_limit,
      mobileNumberLimit: subscription.mobile_number_limit,
      isExpired: false,
      planName: subscription.plan_name,
      planId: subscription.plan_id
    });
  });
});

// Increment WhatsApp sends count
router.post('/increment-whatsapp-sends', (req, res) => {
  const db = getDatabase();
  
  db.run(
    'UPDATE user_subscriptions SET whatsapp_sends_used = whatsapp_sends_used + 1 WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update send count' });
      }
      
      res.json({ message: 'Send count updated successfully' });
    }
  );
});

// Create payment for subscription upgrade
router.post('/create-payment', [
  body('planId').isInt().withMessage('Plan ID must be a number'),
  body('amountInr').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, amountInr } = req.body;
    const db = getDatabase();

    // Verify plan exists
    db.get('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1', [planId], (err, plan) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Create payment record
      db.run(
        'INSERT INTO payments (user_id, plan_id, amount_inr) VALUES (?, ?, ?)',
        [req.user.userId, planId, amountInr],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create payment' });
          }

          const paymentId = this.lastID;
          
          // Generate UPI payment link
          const upiId = 'shopkeeperpro@paytm'; // You can make this configurable
          const upiLink = `upi://pay?pa=${upiId}&pn=ShopKeeper Pro&am=${amountInr}&tn=Subscription Payment ${paymentId}`;
          
          res.json({
            paymentId,
            upiLink,
            amountInr,
            planName: plan.name,
            message: 'Payment created successfully. Please complete the UPI payment.'
          });
        }
      );
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify payment and upgrade subscription
router.post('/verify-payment', [
  body('paymentId').isInt().withMessage('Payment ID must be a number'),
  body('upiTransactionId').notEmpty().withMessage('UPI transaction ID is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { paymentId, upiTransactionId } = req.body;
    const db = getDatabase();

    // First, check if payment exists and belongs to the user
    db.get('SELECT * FROM payments WHERE id = ? AND user_id = ?', [paymentId, req.user.userId], (err, payment) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Check if payment is already completed
      if (payment.payment_status === 'completed') {
        return res.status(400).json({ error: 'Payment has already been processed' });
      }

      // Check if payment is failed
      if (payment.payment_status === 'failed') {
        return res.status(400).json({ error: 'Payment has failed and cannot be processed' });
      }

      // Validate UPI transaction ID format (basic validation)
      if (!upiTransactionId.match(/^[A-Za-z0-9]{8,20}$/)) {
        return res.status(400).json({ error: 'Invalid UPI transaction ID format' });
      }

      // Update payment status with UPI transaction ID
      db.run(
        'UPDATE payments SET payment_status = ?, upi_transaction_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        ['completed', upiTransactionId, paymentId, req.user.userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update payment' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Payment not found' });
          }

          // Get payment details and plan information
          db.get(`
            SELECT p.*, sp.name as plan_name, sp.whatsapp_send_limit, sp.mobile_number_limit 
            FROM payments p 
            JOIN subscription_plans sp ON p.plan_id = sp.id 
            WHERE p.id = ?
          `, [paymentId], (err, paymentWithPlan) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            // Deactivate current subscription
            db.run(
              'UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
              [req.user.userId],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Failed to deactivate current subscription' });
                }

                // Create new subscription with reset WhatsApp counts and expiry date (1 month from now)
                const startDate = new Date();
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1);
                
                db.run(
                  'INSERT INTO user_subscriptions (user_id, plan_id, whatsapp_sends_used, mobile_numbers_used, promotions_used, start_date, end_date, is_active) VALUES (?, ?, 0, 0, 0, ?, ?, 1)',
                  [req.user.userId, paymentWithPlan.plan_id, startDate.toISOString(), endDate.toISOString()],
                  function(err) {
                    if (err) {
                      return res.status(500).json({ error: 'Failed to create new subscription' });
                    }

                    // Log payment success with UPI transaction ID
                    console.log(`✅ Payment Success: User ${req.user.userId} upgraded to ${paymentWithPlan.plan_name} plan. UPI Transaction ID: ${upiTransactionId}. Amount: ₹${paymentWithPlan.amount_inr}. Expires: ${endDate.toISOString()}`);

                    res.json({
                      message: `Payment successful! Your subscription has been upgraded to ${paymentWithPlan.plan_name} plan. UPI Transaction ID: ${upiTransactionId}. Valid until ${endDate.toLocaleDateString()}`,
                      paymentId,
                      upiTransactionId,
                      planName: paymentWithPlan.plan_name,
                      whatsappSendLimit: paymentWithPlan.whatsapp_send_limit,
                      mobileNumberLimit: paymentWithPlan.mobile_number_limit,
                      expiresAt: endDate.toISOString()
                    });
                  }
                );
              }
            );
          });
        }
      );
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check mobile number limits for campaign
router.get('/mobile-number-limits', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      sp.mobile_number_limit,
      sp.name as plan_name,
      sp.id as plan_id
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = ? AND us.is_active = 1
    ORDER BY us.created_at DESC
    LIMIT 1
  `;
  
  db.get(query, [req.user.userId], (err, subscription) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!subscription) {
      // Create free plan subscription for new users
      db.run(
        'INSERT INTO user_subscriptions (user_id, plan_id, whatsapp_sends_used, start_date) VALUES (?, 1, 0, ?)',
        [req.user.userId, new Date().toISOString()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create subscription' });
          }
          
          return res.json({ 
            mobileNumberLimit: 10, 
            planName: 'Free',
            planId: 1,
            canSendToAll: true 
          });
        }
      );
      return;
    }
    
               // For Free plan, always return 5 as limit
           if (subscription.plan_id === 1) {
             return res.json({
               mobileNumberLimit: 5,
               planName: 'Free',
               planId: 1,
               canSendToAll: true
             });
           }
           
           // For Starter plan, always return 25 as limit
           if (subscription.plan_id === 2) {
             return res.json({
               mobileNumberLimit: 25,
               planName: 'Starter',
               planId: 2,
               canSendToAll: true
             });
           }
    
    // For Professional plan, always return 100 as limit
    if (subscription.plan_id === 3) {
      return res.json({
        mobileNumberLimit: 100,
        planName: 'Professional',
        planId: 3,
        canSendToAll: true
      });
    }
    
               // For Enterprise plan, always return 250 as limit
           if (subscription.plan_id === 4) {
             return res.json({
               mobileNumberLimit: 250,
               planName: 'Enterprise',
               planId: 4,
               canSendToAll: true
             });
           }
    
    // For paid plans, check if subscription has expired
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const isExpired = now > endDate;
    
    if (isExpired) {
      return res.json({
        mobileNumberLimit: 10,
        planName: 'Free',
        planId: 1,
        canSendToAll: false,
        message: 'Subscription has expired. Please renew your plan.'
      });
    }
    
    res.json({
      mobileNumberLimit: subscription.mobile_number_limit,
      planName: subscription.plan_name,
      planId: subscription.plan_id,
      canSendToAll: true
    });
  });
});

// Mark payment as failed
router.post('/mark-payment-failed', [
  body('paymentId').isInt().withMessage('Payment ID must be a number'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { paymentId, reason = 'Payment verification failed' } = req.body;
    const db = getDatabase();

    // Update payment status to failed
    db.run(
      'UPDATE payments SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      ['failed', paymentId, req.user.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update payment status' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }

        console.log(`❌ Payment Failed: User ${req.user.userId}, Payment ID: ${paymentId}, Reason: ${reason}`);

        res.json({
          message: 'Payment marked as failed',
          paymentId,
          reason
        });
      }
    );
  } catch (error) {
    console.error('Mark payment failed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment history
router.get('/payments', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      p.*,
      sp.name as plan_name,
      sp.description as plan_description,
      sp.whatsapp_send_limit,
      sp.mobile_number_limit
    FROM payments p
    JOIN subscription_plans sp ON p.plan_id = sp.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [req.user.userId], (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ payments });
  });
});

// Complete USD payment and send email
router.post('/complete-usd-payment', [
  body('planName').isString().withMessage('Plan name is required'),
  body('priceUSD').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
  body('userData').isObject().withMessage('User data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { planName, priceUSD, userData } = req.body;
    const db = getDatabase();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Create email content for sales team
    const salesEmailContent = `
      <h2>USD Subscription Payment Request</h2>
      <p><strong>Plan:</strong> ${planName}</p>
      <p><strong>Amount:</strong> $${priceUSD}</p>
      <p><strong>User Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${userData.first_name} ${userData.last_name}</li>
        <li><strong>Email:</strong> ${userData.email}</li>
        <li><strong>Phone:</strong> ${userData.phone_number}</li>
        <li><strong>Country:</strong> ${userData.country || 'Not specified'}</li>
      </ul>
      <hr>
      <p><em>This is a USD payment request for subscription via WISE. Please process the payment and send an invoice to the user.</em></p>
    `;

    // Create invoice email content for user
    const userInvoiceContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0;">Invoice</h1>
          <p style="color: #6B7280; margin: 5px 0;">CloudAgent Subscription</p>
        </div>
        
        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1F2937; margin: 0 0 10px 0;">Subscription Details</h2>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${priceUSD}</p>
          <p style="margin: 5px 0;"><strong>Billing Period:</strong> Monthly</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> WISE Transfer</p>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1F2937; margin: 0 0 15px 0;">Payment Instructions</h3>
          <p style="margin: 10px 0; color: #374151;">Please complete your payment using WISE transfer. Click the button below to start your payment:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://wise.com" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00B9FF 0%, #9C27B0 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 185, 255, 0.3);">
              💳 Pay with WISE
            </a>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 15px; border-radius: 6px; border-left: 4px solid #00B9FF; margin: 15px 0;">
            <h4 style="color: #1F2937; margin: 0 0 10px 0; font-size: 14px;">Bank Transfer Details:</h4>
            <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li><strong>Account Name:</strong> Chintan S Chokshi</li>
              <li><strong>Bank Name:</strong> ICICI Bank</li>
              <li><strong>Branch:</strong> RACE COURSE CIRCLE</li>
              <li><strong>City:</strong> Vadodara</li>
              <li><strong>Account Number:</strong> 000301513589</li>
              <li><strong>IFSC Code:</strong> ICIC0000003</li>
              <li><strong>Amount:</strong> $${priceUSD}</li>
              <li><strong>Reference:</strong> ${planName}-${Date.now()}</li>
            </ul>
          </div>
          
          <p style="margin: 15px 0 0 0; color: #6B7280; font-size: 14px; font-style: italic;">
            💡 <strong>Tip:</strong> Use the reference number when making the transfer to help us process your subscription faster.
          </p>
        </div>
        
        <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1E40AF; margin: 0 0 10px 0;">What's Included</h3>
          <ul style="color: #1E40AF; margin: 10px 0; padding-left: 20px;">
            <li>WhatsApp Campaign Management</li>
            <li>Mobile Number Management</li>
            <li>Promotion Management</li>
            <li>Analytics and Reporting</li>
            <li>24/7 Customer Support</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; margin: 5px 0;">Thank you for choosing CloudAgent!</p>
          <p style="color: #6B7280; margin: 5px 0;">If you have any questions, please contact us at support@goaiz.com</p>
        </div>
      </div>
    `;

    // Send email to sales team
    const salesMailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'sales@goaiz.com',
      subject: `USD Subscription Payment Request - ${planName} Plan`,
      html: salesEmailContent
    };

    // Send invoice email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userData.email,
      subject: `Invoice - ${planName} Plan Subscription - $${priceUSD}`,
      html: userInvoiceContent
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(salesMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log(`✅ USD Payment Request Sent: User ${userData.first_name} ${userData.last_name}, Plan: ${planName}, Amount: $${priceUSD}`);
    console.log(`✅ Invoice email sent to user: ${userData.email}`);
    console.log(`✅ Sales notification sent to: sales@goaiz.com`);

    res.json({
      message: 'Payment request sent successfully. An invoice will be sent to your email soon.',
      planName,
      priceUSD
    });

  } catch (error) {
    console.error('USD payment error:', error);
    res.status(500).json({ error: 'Failed to process USD payment request' });
  }
});

module.exports = router; 