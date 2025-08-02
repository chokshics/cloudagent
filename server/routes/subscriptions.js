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
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, upiTransactionId } = req.body;
    const db = getDatabase();

    // Update payment status
    db.run(
      'UPDATE payments SET payment_status = ?, upi_transaction_id = ? WHERE id = ? AND user_id = ?',
      ['completed', upiTransactionId, paymentId, req.user.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update payment' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }

        // Get payment details
        db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, payment) => {
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

              // Create new subscription with expiry date (1 month from now)
              const startDate = new Date();
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);
              
              db.run(
                'INSERT INTO user_subscriptions (user_id, plan_id, whatsapp_sends_used, start_date, end_date) VALUES (?, ?, 0, ?, ?)',
                [req.user.userId, payment.plan_id, startDate.toISOString(), endDate.toISOString()],
                function(err) {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to create new subscription' });
                  }

                  res.json({
                    message: 'Subscription upgraded successfully',
                    paymentId,
                    upiTransactionId
                  });
                }
              );
            }
          );
        });
      }
    );
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

// Get payment history
router.get('/payments', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      p.*,
      sp.name as plan_name,
      sp.description as plan_description
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