const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireShopkeeperOrAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireShopkeeperOrAdmin);

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

module.exports = router; 