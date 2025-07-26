const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireShopkeeperOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireShopkeeperOrAdmin);

// Get all mobile numbers for the logged-in user
router.get('/mobile-numbers', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT * FROM mobile_numbers 
    WHERE created_by = ? 
    ORDER BY created_at DESC
  `, [req.user.userId], (err, mobileNumbers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ mobileNumbers });
  });
});

// Add a single mobile number
router.post('/mobile-numbers', [
  body('phone_number').notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('name').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone_number, name } = req.body;
    const db = getDatabase();

    // Check if phone number already exists for this user
    db.get('SELECT id FROM mobile_numbers WHERE phone_number = ? AND created_by = ?', 
      [phone_number, req.user.userId], (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }

      // Add the mobile number
      db.run(`
        INSERT INTO mobile_numbers (phone_number, name, created_by) 
        VALUES (?, ?, ?)
      `, [phone_number, name, req.user.userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add mobile number' });
        }

        // Get the added mobile number
        db.get('SELECT * FROM mobile_numbers WHERE id = ?', [this.lastID], (err, mobileNumber) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.status(201).json({
            message: 'Mobile number added successfully',
            mobileNumber
          });
        });
      });
    });
  } catch (error) {
    console.error('Add mobile number error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add multiple mobile numbers (bulk import)
router.post('/mobile-numbers/bulk', [
  body('mobileNumbers').isArray({ min: 1 }).withMessage('At least one mobile number is required'),
  body('mobileNumbers.*.phone_number').notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('mobileNumbers.*.name').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobileNumbers } = req.body;
    const db = getDatabase();

    // Validate and prepare data
    const validNumbers = [];
    const invalidNumbers = [];

    mobileNumbers.forEach((item, index) => {
      if (/^\+?[1-9]\d{1,14}$/.test(item.phone_number)) {
        validNumbers.push({
          phone_number: item.phone_number,
          name: item.name || null
        });
      } else {
        invalidNumbers.push({
          index,
          phone_number: item.phone_number,
          reason: 'Invalid phone number format'
        });
      }
    });

    if (validNumbers.length === 0) {
      return res.status(400).json({ 
        error: 'No valid phone numbers provided',
        invalidNumbers 
      });
    }

    // Check for duplicates
    const phoneNumbers = validNumbers.map(item => item.phone_number);
    const placeholders = phoneNumbers.map(() => '?').join(',');
    
    db.all(`
      SELECT phone_number FROM mobile_numbers 
      WHERE phone_number IN (${placeholders}) AND created_by = ?
    `, [...phoneNumbers, req.user.userId], (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const existingNumbers = existing.map(item => item.phone_number);
      const newNumbers = validNumbers.filter(item => !existingNumbers.includes(item.phone_number));
      const duplicates = validNumbers.filter(item => existingNumbers.includes(item.phone_number));

      if (newNumbers.length === 0) {
        return res.status(400).json({ 
          error: 'All phone numbers already exist',
          duplicates: duplicates.map(item => item.phone_number)
        });
      }

      // Insert new numbers
      const insertPromises = newNumbers.map(item => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO mobile_numbers (phone_number, name, created_by) 
            VALUES (?, ?, ?)
          `, [item.phone_number, item.name, req.user.userId], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID, ...item });
            }
          });
        });
      });

      Promise.all(insertPromises)
        .then(insertedNumbers => {
          res.status(201).json({
            message: 'Mobile numbers added successfully',
            added: insertedNumbers.length,
            duplicates: duplicates.length,
            invalid: invalidNumbers.length,
            summary: {
              total: mobileNumbers.length,
              added: insertedNumbers.length,
              duplicates: duplicates.length,
              invalid: invalidNumbers.length
            }
          });
        })
        .catch(err => {
          console.error('Bulk insert error:', err);
          res.status(500).json({ error: 'Failed to add mobile numbers' });
        });
    });
  } catch (error) {
    console.error('Bulk add mobile numbers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a mobile number
router.put('/mobile-numbers/:id', [
  body('phone_number').optional().notEmpty().withMessage('Phone number cannot be empty')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('name').optional().trim(),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mobileNumberId = req.params.id;
    const db = getDatabase();

    // Check if mobile number exists and belongs to the user
    db.get('SELECT id FROM mobile_numbers WHERE id = ? AND created_by = ?', 
      [mobileNumberId, req.user.userId], (err, mobileNumber) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!mobileNumber) {
        return res.status(404).json({ error: 'Mobile number not found' });
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(req.body[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(mobileNumberId, req.user.userId);

      const updateQuery = `
        UPDATE mobile_numbers 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND created_by = ?
      `;

      db.run(updateQuery, updateValues, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update mobile number' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Mobile number not found' });
        }

        // Get the updated mobile number
        db.get('SELECT * FROM mobile_numbers WHERE id = ?', [mobileNumberId], (err, updatedMobileNumber) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            message: 'Mobile number updated successfully',
            mobileNumber: updatedMobileNumber
          });
        });
      });
    });
  } catch (error) {
    console.error('Update mobile number error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a mobile number
router.delete('/mobile-numbers/:id', (req, res) => {
  const mobileNumberId = req.params.id;
  const db = getDatabase();

  // Check if mobile number exists and belongs to the user
  db.get('SELECT id FROM mobile_numbers WHERE id = ? AND created_by = ?', 
    [mobileNumberId, req.user.userId], (err, mobileNumber) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!mobileNumber) {
      return res.status(404).json({ error: 'Mobile number not found' });
    }

    // Delete the mobile number
    db.run('DELETE FROM mobile_numbers WHERE id = ? AND created_by = ?', 
      [mobileNumberId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete mobile number' });
      }

      res.json({ message: 'Mobile number deleted successfully' });
    });
  });
});

// Get mobile numbers count
router.get('/mobile-numbers/count', (req, res) => {
  const db = getDatabase();
  
  db.get(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
      COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive
    FROM mobile_numbers 
    WHERE created_by = ?
  `, [req.user.userId], (err, counts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ counts });
  });
});

module.exports = router; 