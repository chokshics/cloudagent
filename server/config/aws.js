const AWS = require('aws-sdk');

// Lazy initialization of AWS services
let s3Instance = null;
let awsConfigured = false;

function configureAWS() {
  if (!awsConfigured) {
    console.log('🔧 Configuring AWS...');
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    awsConfigured = true;
    console.log('✅ AWS configured');
  }
}

function getS3() {
  if (!s3Instance) {
    configureAWS();
    s3Instance = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {
        Bucket: process.env.AWS_S3_BUCKET || 'testingbucketchints'
      }
    });
    console.log('✅ S3 instance created');
  }
  return s3Instance;
}

module.exports = {
  get s3() {
    return getS3();
  },
  get AWS() {
    configureAWS();
    return AWS;
  }
};
