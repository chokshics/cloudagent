# 🚀 AWS Deployment Quick Start Guide

## **Quick Deployment Options**

### **Option 1: Elastic Beanstalk (Easiest - 5 minutes)**

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize and deploy
eb init
eb create admin-portal-prod
eb setenv NODE_ENV=production JWT_SECRET=your-secret-key
eb deploy
```

### **Option 2: Docker + EC2 (10 minutes)**

```bash
# 1. Build and run with Docker
docker build -t admin-portal .
docker-compose up -d

# 2. Deploy to EC2
# - Launch EC2 instance
# - Install Docker
# - Run the above commands
```

### **Option 3: ECS (15 minutes)**

```bash
# 1. Build and push to ECR
aws ecr create-repository --repository-name admin-portal
aws ecr get-login-password | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com
docker build -t admin-portal .
docker tag admin-portal:latest account.dkr.ecr.region.amazonaws.com/admin-portal:latest
docker push account.dkr.ecr.region.amazonaws.com/admin-portal:latest

# 2. Create ECS cluster and service
```

---

## **Required Environment Variables**

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
CLIENT_URL=https://your-domain.com
```

---

## **Cost Estimates (Monthly)**

| Service | Small Instance | Medium Instance | Large Instance |
|---------|---------------|-----------------|----------------|
| **Elastic Beanstalk** | $15-25 | $30-50 | $60-100 |
| **EC2** | $10-20 | $25-40 | $50-80 |
| **ECS** | $15-30 | $35-60 | $70-120 |
| **Lambda** | $5-15 | $10-25 | $20-40 |

---

## **Security Checklist**

- [ ] Change default JWT secret
- [ ] Use IAM roles instead of access keys
- [ ] Enable VPC for network isolation
- [ ] Configure security groups
- [ ] Enable CloudTrail for audit logs
- [ ] Use Secrets Manager for sensitive data
- [ ] Enable SSL/HTTPS
- [ ] Set up monitoring and alerts

---

## **Monitoring Setup**

```bash
# Enable CloudWatch logs
eb config
# Add logging configuration

# Set up health checks
# Application has /api/health endpoint
```

---

## **Troubleshooting**

### **Common Issues:**

1. **Port Issues**: Ensure port 5000 is open
2. **Environment Variables**: Check all required vars are set
3. **Database Permissions**: Ensure proper file permissions
4. **CORS Issues**: Verify CLIENT_URL is correct

### **Debug Commands:**

```bash
# Check logs
eb logs
docker logs container-name

# Check status
eb status
docker ps

# SSH into environment
eb ssh
docker exec -it container-name bash
```

---

## **Next Steps After Deployment**

1. **Set up custom domain** in Route 53
2. **Configure SSL certificate** in Certificate Manager
3. **Set up auto-scaling** based on demand
4. **Configure backups** for database
5. **Set up CI/CD pipeline** for automated deployments
6. **Monitor costs** with AWS Cost Explorer

---

## **Support**

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Elastic Beanstalk**: https://docs.aws.amazon.com/elasticbeanstalk/
- **ECS Documentation**: https://docs.aws.amazon.com/ecs/
- **Lambda Documentation**: https://docs.aws.amazon.com/lambda/ 