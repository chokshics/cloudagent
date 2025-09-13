const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const { authenticateToken, requireShopkeeperOrAdmin } = require('../middleware/auth');

// Initialize Twilio client conditionally
let twilioClient = null;
let whatsappStatus = {
  connected: false,
  message: 'WhatsApp not configured'
};

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'admin_portal.db');
const db = new sqlite3.Database(dbPath);

// Create whatsapp_logs table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    promotion_id INTEGER,
    mobile_number TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    twilio_sid TEXT,
    error_message TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions (id),
    FOREIGN KEY (created_by) REFERENCES users (id)
  )
`);

// Check if Twilio credentials are available
console.log('🔍 Checking Twilio credentials...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'set' : 'not-set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'set' : 'not-set');
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'not-set');

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
    whatsappStatus = {
      connected: true,
      message: 'WhatsApp connected via Twilio'
    };
  } catch (error) {
    console.error('❌ Failed to initialize Twilio client:', error.message);
    whatsappStatus = {
      connected: false,
      message: 'Failed to initialize Twilio: ' + error.message
    };
  }
} else {
  console.log('⚠️ Twilio credentials not found. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
  whatsappStatus = {
    connected: false,
    message: 'Twilio credentials not configured'
  };
}

// Initialize WhatsApp connection using Twilio
async function initializeWhatsApp() {
  if (!twilioClient) {
    whatsappStatus = {
      connected: false,
      message: 'Twilio client not initialized. Please check your environment variables.'
    };
    return;
  }

  try {
    // Test the Twilio connection
    const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    if (account) {
      whatsappStatus = {
        connected: true,
        message: 'WhatsApp connected via Twilio'
      };
      console.log('✅ WhatsApp connected via Twilio');
    }
  } catch (error) {
    console.error('❌ Twilio WhatsApp connection failed:', error.message);
    whatsappStatus = {
      connected: false,
      message: `Twilio connection failed: ${error.message}`
    };
  }
}

// Initialize on startup
initializeWhatsApp();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireShopkeeperOrAdmin);

// Get WhatsApp status
router.get('/status', (req, res) => {
  res.json(whatsappStatus);
});

// Debug endpoint to check Twilio configuration
router.get('/debug', (req, res) => {
  const debugInfo = {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ? 'set' : 'not-set',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ? 'set' : 'not-set',
    twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'not-set',
    twilioClientInitialized: !!twilioClient,
    whatsappStatus: whatsappStatus,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Additional debugging info
    allEnvVars: Object.keys(process.env).filter(key => key.includes('TWILIO')),
    dotenvLoaded: typeof require('dotenv').config === 'function',
    cwd: process.cwd(),
    envFileExists: require('fs').existsSync('.env'),
    pm2ProcessId: process.env.pm_id || 'not-pm2',
    // WhatsApp specific debugging
    whatsappFromFormat: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    isProductionNumber: process.env.TWILIO_WHATSAPP_NUMBER && !process.env.TWILIO_WHATSAPP_NUMBER.includes('14155238886'),
    sandboxDetected: process.env.TWILIO_WHATSAPP_NUMBER && process.env.TWILIO_WHATSAPP_NUMBER.includes('14155238886')
  };
  
  res.json(debugInfo);
});

// Helper function to send WhatsApp messages
async function sendWhatsAppMessages(req, res, to, message, promotionId, imageUrl = null) {
  const results = [];
  const failedNumbers = [];

  for (const phoneNumber of to) {
    try {
      // Format phone number for WhatsApp (remove + if present and add country code if needed)
      let formattedNumber = phoneNumber.replace(/^\+/, '');
      
      // If number doesn't start with country code, assume it's an Indian number
      if (formattedNumber.length === 10) {
        // Assume Indian number (91 prefix)
        formattedNumber = '91' + formattedNumber;
      } else if (formattedNumber.startsWith('91') && formattedNumber.length === 12) {
        // Already has Indian country code
        formattedNumber = formattedNumber;
      } else if (formattedNumber.startsWith('1') && formattedNumber.length === 11) {
        // US number
        formattedNumber = formattedNumber;
      } else {
        // Unknown format, try to use as is
        console.log(`⚠️ Unknown phone number format: ${phoneNumber} -> ${formattedNumber}`);
      }

      // Send WhatsApp message via Twilio
      console.log(`📤 Sending WhatsApp to: ${phoneNumber} -> +${formattedNumber}`);
      console.log(`📤 From: whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`);
      console.log(`📤 Full from format: whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`);
      console.log(`📤 Full to format: whatsapp:+${formattedNumber}`);
      
      // Prepare message data - Use template for outbound messages
      const messageData = {
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:+${formattedNumber}`,
        // Use a simple template format for outbound messages
        body: `*${process.env.COMPANY_NAME || 'Cloud Solutions'}*\n\n${message}\n\n_This is a promotional message. Reply STOP to unsubscribe._`
      };

      // Add media URL if image is provided
      if (imageUrl) {
        // Convert relative URL to absolute URL
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${req.protocol}://${req.get('host')}${imageUrl}`;
        
        messageData.mediaUrl = [fullImageUrl];
        console.log(`📷 Including image: ${fullImageUrl}`);
      }
      
      const twilioMessage = await twilioClient.messages.create(messageData);

      // Log successful message
      const logQuery = `
        INSERT INTO whatsapp_logs (mobile_number, message, status, twilio_sid, promotion_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(logQuery, [
        phoneNumber,
        message,
        'delivered',
        twilioMessage.sid,
        promotionId || null,
        req.user.userId
      ]);

      results.push({
        phoneNumber,
        status: 'sent',
        sid: twilioMessage.sid
      });

      console.log(`✅ WhatsApp message sent to ${phoneNumber}: ${twilioMessage.sid}`);

    } catch (error) {
      console.error(`❌ Failed to send WhatsApp to ${phoneNumber}:`, error.message);
      console.error(`❌ Error details:`, error);
      console.error(`❌ Phone number: ${phoneNumber}, Formatted: +${formattedNumber}`);
      
      // Handle specific WhatsApp errors
      let errorMessage = error.message;
      let errorType = 'unknown';
      
      if (error.message.includes('63016')) {
        errorMessage = 'Cannot send freeform message outside 24-hour window. Message templates required for outbound marketing.';
        errorType = 'template_required';
      } else if (error.message.includes('63017')) {
        errorMessage = 'WhatsApp number not found or invalid.';
        errorType = 'invalid_number';
      } else if (error.message.includes('63018')) {
        errorMessage = 'WhatsApp message template not approved.';
        errorType = 'template_not_approved';
      } else if (error.message.includes('63019')) {
        errorMessage = 'WhatsApp message template not found.';
        errorType = 'template_not_found';
      }
      
      // Log failed message
      const logQuery = `
        INSERT INTO whatsapp_logs (mobile_number, message, status, error_message, promotion_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(logQuery, [
        phoneNumber,
        message,
        'failed',
        errorMessage,
        promotionId || null,
        req.user.userId
      ]);

      failedNumbers.push({
        phoneNumber,
        error: errorMessage,
        errorType: errorType
      });
    }
  }

  // Increment WhatsApp campaigns count (1 campaign = 1 increment, regardless of number of recipients)
  db.run(
    'UPDATE user_subscriptions SET whatsapp_sends_used = whatsapp_sends_used + 1 WHERE user_id = ? AND id = (SELECT id FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1)',
    [req.user.userId, req.user.userId],
    function(err) {
      if (err) {
        console.error('Failed to update campaign count:', err);
      }
    }
  );

  res.json({
    success: true,
    message: `WhatsApp campaign completed. ${results.length} sent, ${failedNumbers.length} failed`,
    results,
    failedNumbers
  });
}

// Send WhatsApp message using Twilio
router.post('/send', [
  body('to').isArray().withMessage('Recipients must be an array'),
  body('message').notEmpty().withMessage('Message is required'),
  body('promotionId').optional().isInt().withMessage('Promotion ID must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, message, promotionId } = req.body;

    // Check if user can send WhatsApp messages
    const subscriptionQuery = `
      SELECT 
        us.whatsapp_sends_used,
        sp.whatsapp_send_limit
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    db.get(subscriptionQuery, [req.user.userId], (err, subscription) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'Subscription not found. Please contact support.' 
        });
      }
      
      if (subscription.whatsapp_sends_used >= subscription.whatsapp_send_limit) {
        return res.status(403).json({ 
          error: 'WhatsApp campaign limit reached. Please upgrade your plan to send more campaigns.',
          sendsUsed: subscription.whatsapp_sends_used,
          sendLimit: subscription.whatsapp_send_limit
        });
      }

      // Get promotion image if promotionId is provided
      if (promotionId) {
        const promotionQuery = `SELECT image_url FROM promotions WHERE id = ? AND created_by = ?`;
        db.get(promotionQuery, [promotionId, req.user.userId], (err, promotion) => {
          if (err) {
            console.error('Error fetching promotion:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          const imageUrl = promotion ? promotion.image_url : null;
          sendWhatsAppMessages(req, res, to, message, promotionId, imageUrl);
        });
      } else {
        // No promotion, send text only
        sendWhatsAppMessages(req, res, to, message, promotionId, null);
      }
    });

  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp messages' });
  }
});

// Get WhatsApp logs
router.get('/logs', (req, res) => {
  const query = `
    SELECT 
      wl.*,
      p.title as promotion_title
    FROM whatsapp_logs wl
    LEFT JOIN promotions p ON wl.promotion_id = p.id
    WHERE wl.created_by = ?
    ORDER BY wl.created_at DESC
    LIMIT 100
  `;

  db.all(query, [req.user.userId], (err, rows) => {
    if (err) {
      console.error('Error fetching WhatsApp logs:', err);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    res.json(rows);
  });
});

// Get WhatsApp logs by promotion
router.get('/logs/:promotionId', (req, res) => {
  const { promotionId } = req.params;
  
  const query = `
    SELECT 
      wl.*,
      p.title as promotion_title
    FROM whatsapp_logs wl
    LEFT JOIN promotions p ON wl.promotion_id = p.id
    WHERE wl.promotion_id = ? AND wl.created_by = ?
    ORDER BY wl.created_at DESC
  `;

  db.all(query, [promotionId, req.user.userId], (err, rows) => {
    if (err) {
      console.error('Error fetching promotion WhatsApp logs:', err);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }
    res.json(rows);
  });
});

// Get WhatsApp stats
router.get('/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as sent,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
    FROM whatsapp_logs 
    WHERE created_by = ?
  `;

  db.get(query, [req.user.userId], (err, stats) => {
    if (err) {
      console.error('Error fetching WhatsApp stats:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json({ stats });
  });
});

// Test WhatsApp connection
router.post('/test', async (req, res) => {
  try {
    if (!whatsappStatus.connected) {
      return res.status(400).json({ 
        error: 'WhatsApp not connected', 
        message: whatsappStatus.message 
      });
    }

    if (!twilioClient) {
      return res.status(500).json({ 
        error: 'Twilio client not available' 
      });
    }

    // Test with a sample number (you can modify this)
    const testNumber = process.env.TEST_WHATSAPP_NUMBER;
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!testNumber) {
      return res.status(400).json({ 
        error: 'Test number not configured. Please set TEST_WHATSAPP_NUMBER in .env file' 
      });
    }

    // Check if test number is different from Twilio number
    if (testNumber === twilioNumber) {
      return res.status(400).json({ 
        error: 'Test number cannot be the same as Twilio WhatsApp number. Please set a different TEST_WHATSAPP_NUMBER in .env file',
        details: 'The test number and Twilio number must be different for testing'
      });
    }

    const testMessage = await twilioClient.messages.create({
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${testNumber}`,
      body: 'This is a test message from your WhatsApp campaign system! 🚀'
    });

    res.json({
      success: true,
      message: 'Test WhatsApp message sent successfully',
      sid: testMessage.sid
    });

  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({ 
      error: 'Failed to send test WhatsApp message',
      details: error.message 
    });
  }
});

// Send WhatsApp message using template (for outbound marketing)
router.post('/send-template', [
  body('to').isArray().withMessage('Recipients must be an array'),
  body('templateName').notEmpty().withMessage('Template name is required'),
  body('templateParams').optional().isObject().withMessage('Template parameters must be an object'),
  body('promotionId').optional().isInt().withMessage('Promotion ID must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, templateName, templateParams = {}, promotionId } = req.body;

    // Check if user can send WhatsApp messages
    const subscriptionQuery = `
      SELECT 
        us.whatsapp_sends_used,
        sp.whatsapp_send_limit
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    db.get(subscriptionQuery, [req.user.userId], (err, subscription) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'Subscription not found. Please contact support.' 
        });
      }
      
      if (subscription.whatsapp_sends_used >= subscription.whatsapp_send_limit) {
        return res.status(403).json({ 
          error: 'WhatsApp campaign limit reached. Please upgrade your plan to send more campaigns.',
          sendsUsed: subscription.whatsapp_sends_used,
          sendLimit: subscription.whatsapp_send_limit
        });
      }

      // Send template messages
      sendWhatsAppTemplateMessages(req, res, to, templateName, templateParams, promotionId);
    });

  } catch (error) {
    console.error('WhatsApp template send error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp template messages' });
  }
});

// Send WhatsApp campaign using promotion data with template mapping
router.post('/send-promotion-template', [
  body('to').isArray().withMessage('Recipients must be an array'),
  body('promotionId').isInt().withMessage('Promotion ID must be a number'),
  body('templateSid').notEmpty().withMessage('Template SID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, promotionId, templateSid } = req.body;

    // Check if user can send WhatsApp messages
    const subscriptionQuery = `
      SELECT 
        us.whatsapp_sends_used,
        sp.whatsapp_send_limit
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT 1
    `;
    
    db.get(subscriptionQuery, [req.user.userId], (err, subscription) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'Subscription not found. Please contact support.' 
        });
      }
      
      if (subscription.whatsapp_sends_used >= subscription.whatsapp_send_limit) {
        return res.status(403).json({ 
          error: 'WhatsApp campaign limit reached. Please upgrade your plan to send more campaigns.',
          sendsUsed: subscription.whatsapp_sends_used,
          sendLimit: subscription.whatsapp_send_limit
        });
      }

      // Get promotion data
      const promotionQuery = `
        SELECT title, description, image_url, goaiz_image_url, discount_percentage, discount_amount, 
               start_date, end_date 
        FROM promotions 
        WHERE id = ? AND created_by = ?
      `;
      
      db.get(promotionQuery, [promotionId, req.user.userId], (err, promotion) => {
        if (err) {
          console.error('Error fetching promotion:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!promotion) {
          return res.status(404).json({ error: 'Promotion not found' });
        }

        // Map promotion data to template variables
        const templateVariables = mapPromotionToTemplateVariables(promotion, req);
        
        // Send template messages with promotion data
        sendWhatsAppTemplateMessages(req, res, to, templateSid, templateVariables, promotionId);
      });
    });

  } catch (error) {
    console.error('WhatsApp promotion template send error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp promotion template messages' });
  }
});

// Helper function to map promotion data to template variables
function mapPromotionToTemplateVariables(promotion, req) {
  // Extract filename without extension for template format
  let imageFilename = '';
  
  // Prefer goaiz_image_url if available, otherwise use regular image_url
  const imageUrl = promotion.goaiz_image_url || promotion.image_url;
  
  if (imageUrl) {
    // Extract filename from the URL format
    // Expected format: https://www.goaiz.com/uploads/goaiz/filename.jpg or S3 URL
    const imagePath = imageUrl.startsWith('http') 
      ? imageUrl 
      : imageUrl;
    
    // Get just the filename without extension (e.g., "worldmap" from "worldmap.jpg")
    const fullFilename = imagePath.split('/').pop() || '';
    imageFilename = fullFilename.replace(/\.[^/.]+$/, ''); // Remove file extension
    
    console.log('🖼️ Template image mapping:', {
      originalUrl: imageUrl,
      fullFilename: fullFilename,
      imageFilename: imageFilename,
      note: 'Using filename for template variable {3}'
    });
  }

  // Build promotion description with template variables
  let description = promotion.description || '';
  
  // Add discount information to description
  if (promotion.discount_percentage) {
    description += `\n\n🎉 Get ${promotion.discount_percentage}% OFF!`;
  } else if (promotion.discount_amount) {
    description += `\n\n💰 Save $${promotion.discount_amount}!`;
  }
  
  // Add validity period if available
  if (promotion.start_date && promotion.end_date) {
    const startDate = new Date(promotion.start_date).toLocaleDateString();
    const endDate = new Date(promotion.end_date).toLocaleDateString();
    description += `\n\n📅 Valid from ${startDate} to ${endDate}`;
  }

  // Map to template variables
  // Template expects:
  // {1} - Promotion title
  // {2} - Promotion description (with discount info)
  // {3} - Image filename (e.g., "test.jpg" for https://your-server.com/uploads/goaiz/{3})
  // {4} - Company name or additional info
  
  // Build template variables - only include variables that have content
  // Based on user request: {1} and {4} should be empty, but Twilio doesn't allow empty strings
  // So we'll only include variables that are actually used
  const templateVariables = {};
  
  // Only include description if it exists
  if (description && description.trim()) {
    templateVariables['2'] = description.trim();
  }
  
  // Only include image URL if it exists
  if (imageUrl && imageUrl.trim()) {
    templateVariables['3'] = imageUrl.trim();
  }
  
  // Note: Variables {1} and {4} are intentionally omitted as requested by user
  // If the template requires them, we'll need to provide non-empty values

  console.log('📋 Template variables mapped:', {
    variablesIncluded: Object.keys(templateVariables),
    description: templateVariables['2'] ? templateVariables['2'].substring(0, 100) + '...' : '(not included)',
    imageUrl: templateVariables['3'] || '(not included)',
    note: 'Only non-empty variables included. Variables {1} and {4} omitted as requested'
  });

  return templateVariables;
}

// Helper function to send WhatsApp template messages
async function sendWhatsAppTemplateMessages(req, res, to, templateName, templateParams, promotionId) {
  const results = [];
  const failedNumbers = [];

  for (const phoneNumber of to) {
    try {
      // Format phone number for WhatsApp
      let formattedNumber = phoneNumber.replace(/^\+/, '');
      
      if (formattedNumber.length === 10) {
        formattedNumber = '91' + formattedNumber;
      } else if (formattedNumber.startsWith('91') && formattedNumber.length === 12) {
        formattedNumber = formattedNumber;
      } else if (formattedNumber.startsWith('1') && formattedNumber.length === 11) {
        formattedNumber = formattedNumber;
      }

      console.log(`📤 Sending WhatsApp template to: ${phoneNumber} -> +${formattedNumber}`);
      console.log(`📤 Template: ${templateName}`);
      console.log(`📤 Content Variables:`, JSON.stringify(templateParams, null, 2));
      
      // Prepare template message data
      // Check if template has media (image/document) in variables
      const hasMedia = templateParams['3'] && templateParams['3'].startsWith('http');
      
      let messageData;
      
      if (hasMedia) {
        // Template with media - use the newer format
        const mediaUrl = templateParams['3'];
        const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        if (isImage) {
          // Image template - use the correct Twilio format
          messageData = {
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+${formattedNumber}`,
            contentSid: templateName,
            contentVariables: templateParams,
            // For image templates, the media URL should be in contentVariables, not separate media field
            // Remove the media field and let the template handle the image via {3} variable
          };
        } else {
          // Document template - use the correct Twilio format
          messageData = {
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+${formattedNumber}`,
            contentSid: templateName,
            contentVariables: templateParams,
            // For document templates, the media URL should be in contentVariables, not separate media field
            // Remove the media field and let the template handle the document via {3} variable
          };
        }
        
        console.log('📷 Template with media:', {
          templateSid: templateName,
          mediaUrl: mediaUrl,
          mediaType: isImage ? 'image' : 'document'
        });
      } else {
        // Template without media - use standard format
        messageData = {
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:+${formattedNumber}`,
          contentSid: templateName,
        contentVariables: templateParams
      };
        
        console.log('📝 Template without media:', {
          templateSid: templateName,
          variables: Object.keys(templateParams)
        });
      }
      
      console.log('📤 Final message data being sent to Twilio:', JSON.stringify(messageData, null, 2));
      
      const twilioMessage = await twilioClient.messages.create(messageData);
      
      console.log('✅ Twilio message created successfully:', twilioMessage.sid);

      // Log successful message
      const logQuery = `
        INSERT INTO whatsapp_logs (mobile_number, message, status, twilio_sid, promotion_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(logQuery, [
        phoneNumber,
        `Template: ${templateName}`,
        'delivered',
        twilioMessage.sid,
        promotionId || null,
        req.user.userId
      ]);

      results.push({
        phoneNumber,
        status: 'sent',
        sid: twilioMessage.sid
      });

      console.log(`✅ WhatsApp template sent to ${phoneNumber}: ${twilioMessage.sid}`);

    } catch (error) {
      console.error(`❌ Failed to send WhatsApp template to ${phoneNumber}:`, error.message);
      
      let errorMessage = error.message;
      let errorType = 'unknown';
      
      if (error.message.includes('63016')) {
        errorMessage = 'Cannot send freeform message outside 24-hour window. Message templates required for outbound marketing.';
        errorType = 'template_required';
      } else if (error.message.includes('63017')) {
        errorMessage = 'WhatsApp number not found or invalid.';
        errorType = 'invalid_number';
      } else if (error.message.includes('63018')) {
        errorMessage = 'WhatsApp message template not approved.';
        errorType = 'template_not_approved';
      } else if (error.message.includes('63019')) {
        errorMessage = 'WhatsApp message template not found.';
        errorType = 'template_not_found';
      }
      
      // Log failed message
      const logQuery = `
        INSERT INTO whatsapp_logs (mobile_number, message, status, error_message, promotion_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(logQuery, [
        phoneNumber,
        `Template: ${templateName}`,
        'failed',
        errorMessage,
        promotionId || null,
        req.user.userId
      ]);

      failedNumbers.push({
        phoneNumber,
        error: errorMessage,
        errorType: errorType
      });
    }
  }

  // Increment WhatsApp campaigns count
  db.run(
    'UPDATE user_subscriptions SET whatsapp_sends_used = whatsapp_sends_used + 1 WHERE user_id = ? AND id = (SELECT id FROM user_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1)',
    [req.user.userId, req.user.userId],
    function(err) {
      if (err) {
        console.error('Failed to update campaign count:', err);
      }
    }
  );

  res.json({
    success: true,
    message: `WhatsApp template campaign completed. ${results.length} sent, ${failedNumbers.length} failed`,
    results,
    failedNumbers
  });
}

// Validate template configuration
router.get('/validate-template/:templateSid', async (req, res) => {
  try {
    const templateSid = req.params.templateSid;
    
    console.log('🔍 Validating template configuration for:', templateSid);
    
    // This is a mock validation - in reality you'd need to call Twilio API
    // to get the actual template configuration
    const templateValidation = {
      templateSid: templateSid,
      status: 'needs_review',
      issues: [
        {
          type: 'media_url_format',
          severity: 'error',
          message: 'Media URL needs correct S3 format with file extension',
          current: 'https://www.goaiz.com/{2}.jpg',
          recommended: 'https://testingbucketchints.s3.ap-south-1.amazonaws.com/uploads/goaiz/{3}.jpg'
        },
        {
          type: 'template_structure',
          severity: 'info',
          message: 'Template should use proper variable mapping',
          current: 'Body: "Check out our promotion: {1}"',
          recommended: 'Body: "🎉 {1}\\n\\n{2}\\n\\n_Reply STOP to unsubscribe_"'
        },
        {
          type: 'template_header',
          severity: 'warning',
          message: 'Template header type must match media type',
          current: 'Unknown header type',
          recommended: 'Set header to "Image" for .jpg/.png files or "Document" for other files'
        }
      ],
      recommendations: [
        'Update Media URL to use {3} variable instead of {2}.jpg',
        'Ensure template variables are properly mapped',
        'Test with actual image files uploaded to goaiz.com',
        'Verify template is approved by WhatsApp'
      ],
      correctFormat: {
        body: 'Hi {1}, check out our latest promotion: {2}\\n{4}\\nReply STOP to unsubscribe',
        mediaUrl: 'https://testingbucketchints.s3.ap-south-1.amazonaws.com/uploads/goaiz/{3}',
        variables: {
          '1': '(empty - not used)',
          '2': 'Promotion Description with discount info',
          '3': 'Image filename (e.g., 1757742343766-w29670-indmap.jpg)',
          '4': '(empty - not used)'
        }
      }
    };
    
    res.json({
      success: true,
      templateValidation,
      nextSteps: [
        '1. Go to Twilio Console → Messaging → Content Template Builder',
        '2. Find template with SID: ' + templateSid,
        '3. Update Media URL to: https://testingbucketchints.s3.ap-south-1.amazonaws.com/uploads/goaiz/{3}.jpg',
        '4. Update Body to include {2} variable',
        '5. Save and test the template'
      ]
    });

  } catch (error) {
    console.error('Template validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate template configuration'
    });
  }
});

module.exports = router; 