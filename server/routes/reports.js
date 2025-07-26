const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Get comprehensive user reports
router.get('/users', (req, res) => {
  const db = getDatabase();
  
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.phone_number,
      u.first_name,
      u.last_name,
      u.role,
      u.created_at as registration_date,
      sp.name as subscription_plan,
      sp.price_inr as plan_price,
      us.start_date as subscription_start_date,
      us.end_date as subscription_end_date,
      us.is_active as subscription_active,
      us.whatsapp_sends_used,
      sp.whatsapp_send_limit,
      sp.mobile_number_limit,
      (SELECT COUNT(*) FROM promotions WHERE created_by = u.id AND is_active = 1) as promotions_created,
      (SELECT COUNT(*) FROM mobile_numbers WHERE created_by = u.id AND is_active = 1) as mobile_numbers_added,
      (SELECT COUNT(*) FROM whatsapp_logs WHERE user_id = u.id) as whatsapp_campaigns_sent,
      (SELECT COUNT(*) FROM payments WHERE user_id = u.id AND payment_status = 'completed') as payments_made,
      (SELECT SUM(amount_inr) FROM payments WHERE user_id = u.id AND payment_status = 'completed') as total_payments_amount,
      (SELECT MAX(created_at) FROM payments WHERE user_id = u.id AND payment_status = 'completed') as last_payment_date
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.is_active = 1
    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE u.role != 'superadmin'
    ORDER BY u.created_at DESC
  `;
  
  db.all(query, (err, reports) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Format the data for better display
    const formattedReports = reports.map(report => ({
      ...report,
      total_payments_amount: report.total_payments_amount || 0,
      promotions_created: report.promotions_created || 0,
      mobile_numbers_added: report.mobile_numbers_added || 0,
      whatsapp_campaigns_sent: report.whatsapp_campaigns_sent || 0,
      payments_made: report.payments_made || 0,
      whatsapp_sends_used: report.whatsapp_sends_used || 0,
      whatsapp_send_limit: report.whatsapp_send_limit || 0,
      mobile_number_limit: report.mobile_number_limit || 0
    }));
    
    res.json({ 
      reports: formattedReports,
      summary: {
        total_users: formattedReports.length,
        total_promotions: formattedReports.reduce((sum, r) => sum + r.promotions_created, 0),
        total_mobile_numbers: formattedReports.reduce((sum, r) => sum + r.mobile_numbers_added, 0),
        total_whatsapp_campaigns: formattedReports.reduce((sum, r) => sum + r.whatsapp_campaigns_sent, 0),
        total_payments: formattedReports.reduce((sum, r) => sum + r.payments_made, 0),
        total_revenue: formattedReports.reduce((sum, r) => sum + r.total_payments_amount, 0)
      }
    });
  });
});

// Get summary statistics
router.get('/summary', (req, res) => {
  const db = getDatabase();
  
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users WHERE role != "superadmin"',
    totalPromotions: 'SELECT COUNT(*) as count FROM promotions WHERE is_active = 1',
    totalMobileNumbers: 'SELECT COUNT(*) as count FROM mobile_numbers WHERE is_active = 1',
    totalWhatsAppCampaigns: 'SELECT COUNT(*) as count FROM whatsapp_logs',
    totalPayments: 'SELECT COUNT(*) as count, SUM(amount_inr) as total FROM payments WHERE payment_status = "completed"',
    activeSubscriptions: 'SELECT COUNT(*) as count FROM user_subscriptions WHERE is_active = 1'
  };
  
  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.get(queries[key], (err, result) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
      } else {
        results[key] = result;
      }
      
      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({
          summary: {
            totalUsers: results.totalUsers?.count || 0,
            totalPromotions: results.totalPromotions?.count || 0,
            totalMobileNumbers: results.totalMobileNumbers?.count || 0,
            totalWhatsAppCampaigns: results.totalWhatsAppCampaigns?.count || 0,
            totalPayments: results.totalPayments?.count || 0,
            totalRevenue: results.totalPayments?.total || 0,
            activeSubscriptions: results.activeSubscriptions?.count || 0
          }
        });
      }
    });
  });
});

module.exports = router; 