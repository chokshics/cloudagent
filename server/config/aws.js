const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create S3 instance
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: process.env.AWS_S3_BUCKET || 'testingbucketchints'
  }
});

module.exports = {
  s3,
  AWS
};
