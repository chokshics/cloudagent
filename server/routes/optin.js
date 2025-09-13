const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireShopkeeperOrAdmin } = require('../middleware/auth');

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

// Public route to opt-in (no authentication required)
router.post('/opt-in', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number is required'),
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('consent_method').isIn(['website', 'sms', 'email', 'in_store', 'phone']).withMessage('Valid consent method required'),
  body('consent_text').isLength({ min: 10 }).withMessage('Consent text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, name, consent_method, consent_text } = req.body;
    
    // Format phone number
    let formattedNumber = phone_number.replace(/^\+/, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }

    // Check if already opted in
    const existingOptIn = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM whatsapp_opt_ins WHERE phone_number = ? AND is_active = 1',
        [formattedNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingOptIn) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already opted in for WhatsApp messages',
        already_opted_in: true
      });
    }

    // Create opt-in record
    const optInData = {
      phone_number: formattedNumber,
      name: name || null,
      consent_method,
      consent_text,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      created_by: null // Public opt-in, no user association
    };

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO whatsapp_opt_ins 
         (phone_number, name, consent_method, consent_text, ip_address, user_agent, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          optInData.phone_number,
          optInData.name,
          optInData.consent_method,
          optInData.consent_text,
          optInData.ip_address,
          optInData.user_agent,
          optInData.created_by
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({
      success: true,
      message: 'Successfully opted in for WhatsApp messages',
      phone_number: formattedNumber
    });

  } catch (error) {
    console.error('Opt-in error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process opt-in request' 
    });
  }
});

// Public route to opt-out
router.post('/opt-out', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number is required'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, reason } = req.body;
    
    // Format phone number
    let formattedNumber = phone_number.replace(/^\+/, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }

    // Update opt-in record to inactive
    const result = await new Promise((resolve, reject) => {
      db.run(
        `UPDATE whatsapp_opt_ins 
         SET is_active = 0, opt_out_timestamp = CURRENT_TIMESTAMP, opt_out_reason = ?
         WHERE phone_number = ? AND is_active = 1`,
        [reason || 'User requested opt-out', formattedNumber],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not found or already opted out'
      });
    }

    res.json({
      success: true,
      message: 'Successfully opted out of WhatsApp messages',
      phone_number: formattedNumber
    });

  } catch (error) {
    console.error('Opt-out error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process opt-out request' 
    });
  }
});

// Check opt-in status (public)
router.get('/status/:phone_number', async (req, res) => {
  try {
    const { phone_number } = req.params;
    
    // Format phone number
    let formattedNumber = phone_number.replace(/^\+/, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }

    const optIn = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM whatsapp_opt_ins WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1',
        [formattedNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!optIn) {
      return res.json({
        opted_in: false,
        message: 'Phone number not found in opt-in records'
      });
    }

    res.json({
      opted_in: optIn.is_active === 1,
      consent_method: optIn.consent_method,
      consent_timestamp: optIn.consent_timestamp,
      opt_out_timestamp: optIn.opt_out_timestamp,
      name: optIn.name
    });

  } catch (error) {
    console.error('Opt-in status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check opt-in status' 
    });
  }
});

// Admin routes (require authentication)
router.use(authenticateToken);
router.use(requireShopkeeperOrAdmin);

// Get all opt-ins for admin
router.get('/admin/opt-ins', (req, res) => {
  const query = `
    SELECT 
      id,
      phone_number,
      name,
      consent_method,
      consent_timestamp,
      is_active,
      opt_out_timestamp,
      opt_out_reason,
      created_at
    FROM whatsapp_opt_ins 
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching opt-ins:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get opt-in statistics
router.get('/admin/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_opt_ins,
      COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_opt_ins,
      COUNT(CASE WHEN is_active = 0 THEN 1 END) as opted_out,
      COUNT(CASE WHEN consent_method = 'website' THEN 1 END) as website_opt_ins,
      COUNT(CASE WHEN consent_method = 'sms' THEN 1 END) as sms_opt_ins,
      COUNT(CASE WHEN consent_method = 'email' THEN 1 END) as email_opt_ins,
      COUNT(CASE WHEN consent_method = 'in_store' THEN 1 END) as in_store_opt_ins,
      COUNT(CASE WHEN consent_method = 'phone' THEN 1 END) as phone_opt_ins
    FROM whatsapp_opt_ins
  `;

  db.get(query, [], (err, stats) => {
    if (err) {
      console.error('Error fetching opt-in stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

// Bulk opt-in for admin (for existing contacts)
router.post('/admin/bulk-opt-in', [
  body('contacts').isArray().withMessage('Contacts must be an array'),
  body('consent_method').isIn(['website', 'sms', 'email', 'in_store', 'phone']).withMessage('Valid consent method required'),
  body('consent_text').isLength({ min: 10 }).withMessage('Consent text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contacts, consent_method, consent_text } = req.body;
    const results = {
      successful: [],
      failed: [],
      already_opted_in: []
    };

    for (const contact of contacts) {
      try {
        // Format phone number
        let formattedNumber = contact.phone_number.replace(/^\+/, '');
        if (formattedNumber.length === 10) {
          formattedNumber = '91' + formattedNumber;
        }

        // Check if already opted in
        const existingOptIn = await new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM whatsapp_opt_ins WHERE phone_number = ? AND is_active = 1',
            [formattedNumber],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (existingOptIn) {
          results.already_opted_in.push({
            phone_number: formattedNumber,
            name: contact.name
          });
          continue;
        }

        // Create opt-in record
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO whatsapp_opt_ins 
             (phone_number, name, consent_method, consent_text, ip_address, user_agent, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedNumber,
              contact.name || null,
              consent_method,
              consent_text,
              req.ip || req.connection.remoteAddress,
              req.get('User-Agent'),
              req.user.userId
            ],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        results.successful.push({
          phone_number: formattedNumber,
          name: contact.name
        });

      } catch (error) {
        results.failed.push({
          phone_number: contact.phone_number,
          name: contact.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk opt-in completed. ${results.successful.length} successful, ${results.failed.length} failed, ${results.already_opted_in.length} already opted in`,
      results
    });

  } catch (error) {
    console.error('Bulk opt-in error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process bulk opt-in request' 
    });
  }
});

module.exports = router;
