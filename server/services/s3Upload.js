const { s3 } = require('../config/aws');
const path = require('path');

/**
 * Upload file to S3 bucket
 * @param {Object} file - Multer file object
 * @param {string} folder - S3 folder path (e.g., 'uploads/goaiz')
 * @returns {Promise<Object>} - Upload result with URL
 */
async function uploadToS3(file, folder = 'uploads/goaiz') {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}-${randomString}-${file.originalname.replace(fileExtension, '')}${fileExtension}`;
    
    // S3 upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET || 'testingbucketchints',
      Key: `${folder}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL removed - bucket doesn't allow ACLs
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    };

    console.log('📤 Uploading to S3:', {
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      contentType: uploadParams.ContentType,
      size: file.size
    });

    // Upload to S3
    const uploadResult = await s3.upload(uploadParams).promise();
    
    // Generate goaiz.com URL format
    const goaizUrl = `https://www.goaiz.com/${folder}/${fileName}`;
    
    console.log('✅ S3 upload successful:', {
      s3Url: uploadResult.Location,
      goaizUrl: goaizUrl,
      fileName: fileName
    });

    return {
      success: true,
      fileName: fileName,
      s3Url: uploadResult.Location,
      goaizUrl: goaizUrl,
      key: uploadParams.Key,
      bucket: uploadParams.Bucket
    };

  } catch (error) {
    console.error('❌ S3 upload error:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Delete file from S3 bucket
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} - Delete result
 */
async function deleteFromS3(key) {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET || 'testingbucketchints',
      Key: key
    };

    console.log('🗑️ Deleting from S3:', deleteParams);

    const deleteResult = await s3.deleteObject(deleteParams).promise();
    
    console.log('✅ S3 delete successful:', deleteResult);

    return {
      success: true,
      result: deleteResult
    };

  } catch (error) {
    console.error('❌ S3 delete error:', error);
    throw new Error(`S3 delete failed: ${error.message}`);
  }
}

/**
 * Get file info from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Object>} - File info
 */
async function getFileInfo(key) {
  try {
    const headParams = {
      Bucket: process.env.AWS_S3_BUCKET || 'testingbucketchints',
      Key: key
    };

    const headResult = await s3.headObject(headParams).promise();
    
    return {
      success: true,
      exists: true,
      contentType: headResult.ContentType,
      size: headResult.ContentLength,
      lastModified: headResult.LastModified,
      metadata: headResult.Metadata
    };

  } catch (error) {
    if (error.statusCode === 404) {
      return {
        success: true,
        exists: false
      };
    }
    throw new Error(`S3 file info failed: ${error.message}`);
  }
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  getFileInfo
};
