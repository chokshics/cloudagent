const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireShopkeeperOrAdmin } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');
const { s3Upload, uploadToS3Middleware } = require('../middleware/s3Upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireShopkeeperOrAdmin);



// Get all promotions for the logged-in user
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT p.*, u.username as created_by_name 
    FROM promotions p 
    LEFT JOIN users u ON p.created_by = u.id 
    WHERE p.created_by = ? 
    ORDER BY p.created_at DESC
  `, [req.user.userId], (err, promotions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ promotions });
  });
});

// Get a specific promotion
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const promotionId = req.params.id;
  
  db.get(`
    SELECT p.*, u.username as created_by_name 
    FROM promotions p 
    LEFT JOIN users u ON p.created_by = u.id 
    WHERE p.id = ? AND p.created_by = ?
  `, [promotionId, req.user.userId], (err, promotion) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ promotion });
  });
});

// Create a new promotion
router.post('/', uploadMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('discount_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
  body('discount_amount').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }).withMessage('Discount amount must be a positive number'),
  body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      is_active = true
    } = req.body;

    // Convert empty strings to null for optional fields
    const processedDiscountPercentage = discount_percentage === '' ? null : discount_percentage;
    const processedDiscountAmount = discount_amount === '' ? null : discount_amount;
    const processedStartDate = start_date === '' ? null : start_date;
    const processedEndDate = end_date === '' ? null : end_date;

    // Handle uploaded image
    let image_url = null;
    let goaiz_image_url = null;
    
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Handle goaiz image URL if provided
    if (req.body.goaiz_image_url) {
      goaiz_image_url = req.body.goaiz_image_url;
    }

    const db = getDatabase();



    db.run(`
      INSERT INTO promotions (
        title, description, discount_percentage, discount_amount, 
        start_date, end_date, is_active, image_url, goaiz_image_url, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, description, processedDiscountPercentage, processedDiscountAmount,
      processedStartDate, processedEndDate, is_active, image_url, goaiz_image_url, req.user.userId
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create promotion' });
      }

      // Get the created promotion
      db.get(`
        SELECT p.*, u.username as created_by_name 
        FROM promotions p 
        LEFT JOIN users u ON p.created_by = u.id 
        WHERE p.id = ?
      `, [this.lastID], (err, promotion) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          message: 'Promotion created successfully',
          promotion
        });
      });
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a promotion
router.put('/:id', s3Upload.single('image'), uploadToS3Middleware('uploads/goaiz'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('discount_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
  body('discount_amount').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) {
      return true; // Allow empty values
    }
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }).withMessage('Discount amount must be a positive number'),
  body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if S3 upload failed
    if (req.file && !req.s3Upload) {
      console.log('❌ S3 upload failed for promotion update:', {
        hasFile: !!req.file,
        hasS3Upload: !!req.s3Upload,
        fileName: req.file ? req.file.originalname : 'no file'
      });
      return res.status(500).json({ error: 'Failed to upload image to S3' });
    }

    console.log('📤 Promotion update request:', {
      promotionId: req.params.id,
      hasFile: !!req.file,
      hasS3Upload: !!req.s3Upload,
      body: req.body
    });

    const promotionId = req.params.id;
    const db = getDatabase();

    // First check if promotion exists and belongs to the user
    db.get('SELECT id FROM promotions WHERE id = ? AND created_by = ?', [promotionId, req.user.userId], (err, promotion) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      // Handle uploaded image
      let image_url = null;
      let goaiz_image_url = null;
      
      if (req.file && req.s3Upload) {
        // Image uploaded to S3
        image_url = req.s3Upload.s3Url;
        goaiz_image_url = req.s3Upload.goaizUrl;
        console.log('📤 Image uploaded to S3:', {
          fileName: req.s3Upload.fileName,
          s3Url: req.s3Upload.s3Url,
          goaizUrl: req.s3Upload.goaizUrl
        });
      }
      
      // Handle goaiz image URL if provided in request body
      if (req.body.goaiz_image_url) {
        goaiz_image_url = req.body.goaiz_image_url;
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          // Convert empty strings to null for optional fields
          let value = req.body[key];
          if (value === '' && ['discount_percentage', 'discount_amount', 'start_date', 'end_date', 'description'].includes(key)) {
            value = null;
          }
          updateValues.push(value);
        }
      });

      // Add image_url to update if file was uploaded
      if (image_url) {
        updateFields.push('image_url = ?');
        updateValues.push(image_url);
      }
      
      // Add goaiz_image_url to update if provided
      if (goaiz_image_url) {
        updateFields.push('goaiz_image_url = ?');
        updateValues.push(goaiz_image_url);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(promotionId, req.user.userId);

      const updateQuery = `
        UPDATE promotions 
        SET ${updateFields.join(', ')} 
        WHERE id = ? AND created_by = ?
      `;

      db.run(updateQuery, updateValues, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update promotion' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Promotion not found' });
        }

        // Get the updated promotion
        db.get(`
          SELECT p.*, u.username as created_by_name 
          FROM promotions p 
          LEFT JOIN users u ON p.created_by = u.id 
          WHERE p.id = ?
        `, [promotionId], (err, updatedPromotion) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            message: 'Promotion updated successfully',
            promotion: updatedPromotion
          });
        });
      });
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a promotion
router.delete('/:id', (req, res) => {
  const promotionId = req.params.id;
  const db = getDatabase();

  // Check if promotion exists and belongs to the user
  db.get('SELECT id FROM promotions WHERE id = ? AND created_by = ?', [promotionId, req.user.userId], (err, promotion) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Delete the promotion
    db.run('DELETE FROM promotions WHERE id = ? AND created_by = ?', [promotionId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete promotion' });
      }

      res.json({ message: 'Promotion deleted successfully' });
    });
  });
});

// Upload image to S3 for goaiz.com template
router.post('/upload-goaiz-image', s3Upload.single('image'), uploadToS3Middleware('uploads/goaiz'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!req.s3Upload) {
      return res.status(500).json({ error: 'S3 upload failed' });
    }

    const { fileName, goaizUrl, s3Url } = req.s3Upload;
    
    console.log('📷 Image uploaded to S3 for goaiz.com template:', {
      fileName: fileName,
      goaizUrl: goaizUrl,
      s3Url: s3Url,
      originalName: req.file.originalname,
      size: req.file.size
    });

    res.json({
      success: true,
      filename: fileName,
      goaizUrl: goaizUrl,
      s3Url: s3Url,
      message: 'Image uploaded successfully to S3 for goaiz.com template'
    });

  } catch (error) {
    console.error('S3 goaiz image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image to S3 for goaiz.com template' });
  }
});

module.exports = router; 