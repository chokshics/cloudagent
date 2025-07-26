#!/bin/bash

# AWS Deployment Script for Admin Portal
# Usage: ./deploy.sh [eb|ec2|ecs|lambda]

set -e

echo "🚀 Starting deployment process..."

# Check if deployment method is provided
if [ -z "$1" ]; then
    echo "❌ Please specify deployment method: eb, ec2, ecs, or lambda"
    echo "Usage: ./deploy.sh [eb|ec2|ecs|lambda]"
    exit 1
fi

DEPLOYMENT_METHOD=$1

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to build application
build_app() {
    echo "📦 Building application..."
    npm run deploy:build
    echo "✅ Build completed"
}

# Function to deploy to Elastic Beanstalk
deploy_eb() {
    echo "🌱 Deploying to Elastic Beanstalk..."
    
    if ! command_exists eb; then
        echo "❌ EB CLI not found. Installing..."
        pip install awsebcli
    fi
    
    # Check if EB is initialized
    if [ ! -f ".elasticbeanstalk/config.yml" ]; then
        echo "🔧 Initializing Elastic Beanstalk..."
        eb init
    fi
    
    # Deploy
    eb deploy
    echo "✅ Deployment to Elastic Beanstalk completed"
}

# Function to deploy to EC2 with Docker
deploy_ec2() {
    echo "🐳 Deploying to EC2 with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker not found. Please install Docker first."
        exit 1
    fi
    
    # Build Docker image
    echo "🔨 Building Docker image..."
    docker build -t admin-portal .
    
    # Run container
    echo "🚀 Starting container..."
    docker-compose up -d
    
    echo "✅ Deployment to EC2 completed"
}

# Function to deploy to ECS
deploy_ecs() {
    echo "☁️ Deploying to ECS..."
    
    if ! command_exists aws; then
        echo "❌ AWS CLI not found. Please install AWS CLI first."
        exit 1
    fi
    
    # Get AWS account ID
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)
    
    # Create ECR repository if it doesn't exist
    echo "📦 Creating ECR repository..."
    aws ecr create-repository --repository-name admin-portal --region $REGION 2>/dev/null || true
    
    # Login to ECR
    echo "🔐 Logging into ECR..."
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
    
    # Build and tag image
    echo "🔨 Building and tagging image..."
    docker build -t admin-portal .
    docker tag admin-portal:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/admin-portal:latest
    
    # Push to ECR
    echo "📤 Pushing to ECR..."
    docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/admin-portal:latest
    
    echo "✅ Deployment to ECS completed"
    echo "📋 Next steps:"
    echo "1. Create ECS cluster"
    echo "2. Create task definition"
    echo "3. Create service"
}

# Function to deploy to Lambda
deploy_lambda() {
    echo "⚡ Deploying to Lambda..."
    
    if ! command_exists serverless; then
        echo "❌ Serverless Framework not found. Installing..."
        npm install -g serverless
    fi
    
    # Deploy using serverless
    serverless deploy
    
    echo "✅ Deployment to Lambda completed"
}

# Main deployment logic
case $DEPLOYMENT_METHOD in
    "eb")
        build_app
        deploy_eb
        ;;
    "ec2")
        build_app
        deploy_ec2
        ;;
    "ecs")
        build_app
        deploy_ecs
        ;;
    "lambda")
        build_app
        deploy_lambda
        ;;
    *)
        echo "❌ Invalid deployment method: $DEPLOYMENT_METHOD"
        echo "Valid options: eb, ec2, ecs, lambda"
        exit 1
        ;;
esac

echo "🎉 Deployment process completed!"
echo "🌐 Your application should be available shortly." 