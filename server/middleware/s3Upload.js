const multer = require('multer');
const { uploadToS3 } = require('../services/s3Upload');

// Configure multer for memory storage (for S3 uploads)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter check:', {
    originalName: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });
  
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname, 'Mimetype:', file.mimetype);
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration
const s3Upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to upload to S3 after multer processing
const uploadToS3Middleware = (folder = 'uploads/goaiz') => {
  return async (req, res, next) => {
    try {
      if (req.file) {
        console.log('📤 Processing file for S3 upload:', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          folder: folder
        });

        // Upload to S3
        const uploadResult = await uploadToS3(req.file, folder);
        
        // Add S3 info to request
        req.s3Upload = uploadResult;
        
        console.log('✅ S3 upload middleware completed:', {
          fileName: uploadResult.fileName,
          goaizUrl: uploadResult.goaizUrl
        });
      }
      
      next();
    } catch (error) {
      console.error('❌ S3 upload middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file to S3',
        details: error.message
      });
    }
  };
};

module.exports = {
  s3Upload,
  uploadToS3Middleware
};
