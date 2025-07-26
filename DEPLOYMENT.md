# 🚀 AWS Deployment Guide

## **Option 1: AWS Elastic Beanstalk (Recommended)**

### **Prerequisites**
- AWS Account
- AWS CLI installed and configured
- EB CLI installed: `pip install awsebcli`

### **Step 1: Install EB CLI**
```bash
pip install awsebcli
```

### **Step 2: Initialize Elastic Beanstalk**
```bash
# Initialize EB application
eb init

# Follow the prompts:
# - Select your region
# - Create new application: "admin-portal"
# - Platform: Node.js
# - Platform version: Latest
# - Setup SSH: No (for now)
```

### **Step 3: Create Environment**
```bash
# Create production environment
eb create admin-portal-prod

# Or use the script
npm run deploy:create
```

### **Step 4: Set Environment Variables**
```bash
# Set environment variables
eb setenv NODE_ENV=production
eb setenv JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
eb setenv TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
eb setenv TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
eb setenv TWILIO_WHATSAPP_NUMBER=+14155238886
eb setenv CLIENT_URL=https://your-app-domain.elasticbeanstalk.com
```

### **Step 5: Deploy**
```bash
# Build and deploy
npm run deploy:build
eb deploy

# Or use the script
npm run deploy:eb
```

---

## **Option 2: AWS EC2 with Docker**

### **Step 1: Create Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Copy build to server
RUN cp -r client/build server/public

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### **Step 2: Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-super-secret-jwt-key
      - TWILIO_ACCOUNT_SID=your_twilio_account_sid
      - TWILIO_AUTH_TOKEN=your_twilio_auth_token
      - TWILIO_WHATSAPP_NUMBER=+14155238886
    volumes:
      - ./server/database:/app/server/database
```

### **Step 3: Deploy to EC2**
```bash
# SSH to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose

# Clone repository
git clone your-repo-url
cd your-project

# Build and run
docker-compose up -d
```

---

## **Option 3: AWS ECS (Elastic Container Service)**

### **Step 1: Create ECS Task Definition**
```json
{
  "family": "admin-portal",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "admin-portal",
      "image": "your-account.dkr.ecr.region.amazonaws.com/admin-portal:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "JWT_SECRET",
          "value": "your-super-secret-jwt-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/admin-portal",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **Step 2: Build and Push to ECR**
```bash
# Create ECR repository
aws ecr create-repository --repository-name admin-portal

# Login to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com

# Build and tag image
docker build -t admin-portal .
docker tag admin-portal:latest account.dkr.ecr.region.amazonaws.com/admin-portal:latest

# Push to ECR
docker push account.dkr.ecr.region.amazonaws.com/admin-portal:latest
```

---

## **Option 4: AWS Lambda + API Gateway (Serverless)**

### **Step 1: Install Serverless Framework**
```bash
npm install -g serverless
```

### **Step 2: Create serverless.yml**
```yaml
service: admin-portal

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    JWT_SECRET: ${env:JWT_SECRET}
    TWILIO_ACCOUNT_SID: ${env:TWILIO_ACCOUNT_SID}
    TWILIO_AUTH_TOKEN: ${env:TWILIO_AUTH_TOKEN}
    TWILIO_WHATSAPP_NUMBER: ${env:TWILIO_WHATSAPP_NUMBER}

functions:
  api:
    handler: server/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

### **Step 3: Deploy**
```bash
serverless deploy
```

---

## **Environment Variables Setup**

### **Required Environment Variables**
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
CLIENT_URL=https://your-domain.com
```

### **Optional Environment Variables**
```bash
PORT=5000
DATABASE_URL=your-database-url
LOG_LEVEL=info
```

---

## **Database Considerations**

### **For Production, consider:**
1. **RDS (Relational Database Service)** - For PostgreSQL/MySQL
2. **DynamoDB** - For NoSQL requirements
3. **Aurora** - For MySQL/PostgreSQL with better performance

### **Current SQLite Setup**
- SQLite is fine for development and small applications
- For production with multiple users, consider migrating to RDS

---

## **SSL/HTTPS Setup**

### **For Elastic Beanstalk:**
```bash
# Configure SSL certificate
eb config
# Add SSL certificate ARN in the configuration
```

### **For Custom Domain:**
1. Register domain in Route 53
2. Request SSL certificate in Certificate Manager
3. Configure load balancer with SSL listener

---

## **Monitoring and Logging**

### **CloudWatch Setup**
```bash
# Enable CloudWatch logs
eb config
# Add logging configuration
```

### **Health Checks**
- Application already has `/api/health` endpoint
- Configure load balancer health checks

---

## **Security Best Practices**

1. **Use IAM Roles** instead of access keys
2. **Enable VPC** for network isolation
3. **Configure Security Groups** properly
4. **Use Secrets Manager** for sensitive data
5. **Enable CloudTrail** for audit logs

---

## **Cost Optimization**

1. **Use Spot Instances** for non-critical workloads
2. **Enable Auto Scaling** based on demand
3. **Use Reserved Instances** for predictable workloads
4. **Monitor costs** with AWS Cost Explorer

---

## **Troubleshooting**

### **Common Issues:**
1. **Port Configuration** - Ensure port 5000 is open
2. **Environment Variables** - Check all required vars are set
3. **Database Permissions** - Ensure proper file permissions
4. **CORS Issues** - Verify CLIENT_URL is correct

### **Debug Commands:**
```bash
# Check EB logs
eb logs

# SSH into EB environment
eb ssh

# Check application status
eb status
```

---

## **Recommended Deployment Flow**

1. **Start with Elastic Beanstalk** (easiest)
2. **Move to ECS** when you need more control
3. **Consider Lambda** for cost optimization
4. **Use RDS** for database scaling

---

## **Next Steps After Deployment**

1. **Set up monitoring** with CloudWatch
2. **Configure backups** for database
3. **Set up CI/CD** pipeline
4. **Configure custom domain**
5. **Set up SSL certificate**
6. **Configure auto-scaling** 