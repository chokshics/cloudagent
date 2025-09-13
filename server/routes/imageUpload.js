const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads', 'goaiz');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload image for goaiz.com template
router.post('/upload-for-template', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Return the filename that will be used in the template
    const filename = req.file.filename;
    // Use your actual server domain instead of goaiz.com
    const serverDomain = process.env.SERVER_DOMAIN || `${req.protocol}://${req.get('host')}`;
    const goaizUrl = `${serverDomain}/uploads/goaiz/${filename}`;
    
    console.log('📷 Image uploaded for goaiz.com template:', {
      filename: filename,
      goaizUrl: goaizUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });

    res.json({
      success: true,
      filename: filename,
      goaizUrl: goaizUrl,
      message: 'Image uploaded successfully for template use'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get uploaded image info
router.get('/template-images', authenticateToken, (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'goaiz');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        goaizUrl: `https://www.goaiz.com/${file}`,
        uploadPath: path.join(uploadDir, file)
      }));

    res.json({ images });

  } catch (error) {
    console.error('Error fetching template images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete template image
router.delete('/template-images/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'goaiz', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted template image:', filename);
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }

  } catch (error) {
    console.error('Error deleting template image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
