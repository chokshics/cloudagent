# AWS Deployment Script for Admin Portal (PowerShell)
# Usage: .\deploy.ps1 [eb|ec2|ecs|lambda]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("eb", "ec2", "ecs", "lambda")]
    [string]$DeploymentMethod
)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to build application
function Build-App {
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    npm run deploy:build
    Write-Host "✅ Build completed" -ForegroundColor Green
}

# Function to deploy to Elastic Beanstalk
function Deploy-EB {
    Write-Host "🌱 Deploying to Elastic Beanstalk..." -ForegroundColor Yellow
    
    if (-not (Test-Command "eb")) {
        Write-Host "❌ EB CLI not found. Installing..." -ForegroundColor Red
        pip install awsebcli
    }
    
    # Check if EB is initialized
    if (-not (Test-Path ".elasticbeanstalk\config.yml")) {
        Write-Host "🔧 Initializing Elastic Beanstalk..." -ForegroundColor Yellow
        eb init
    }
    
    # Deploy
    eb deploy
    Write-Host "✅ Deployment to Elastic Beanstalk completed" -ForegroundColor Green
}

# Function to deploy to EC2 with Docker
function Deploy-EC2 {
    Write-Host "🐳 Deploying to EC2 with Docker..." -ForegroundColor Yellow
    
    if (-not (Test-Command "docker")) {
        Write-Host "❌ Docker not found. Please install Docker first." -ForegroundColor Red
        exit 1
    }
    
    # Build Docker image
    Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
    docker build -t admin-portal .
    
    # Run container
    Write-Host "🚀 Starting container..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host "✅ Deployment to EC2 completed" -ForegroundColor Green
}

# Function to deploy to ECS
function Deploy-ECS {
    Write-Host "☁️ Deploying to ECS..." -ForegroundColor Yellow
    
    if (-not (Test-Command "aws")) {
        Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
        exit 1
    }
    
    # Get AWS account ID
    $AccountId = aws sts get-caller-identity --query Account --output text
    $Region = aws configure get region
    
    # Create ECR repository if it doesn't exist
    Write-Host "📦 Creating ECR repository..." -ForegroundColor Yellow
    aws ecr create-repository --repository-name admin-portal --region $Region 2>$null
    
    # Login to ECR
    Write-Host "🔐 Logging into ECR..." -ForegroundColor Yellow
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin ${AccountId}.dkr.ecr.${Region}.amazonaws.com
    
    # Build and tag image
    Write-Host "🔨 Building and tagging image..." -ForegroundColor Yellow
    docker build -t admin-portal .
    docker tag admin-portal:latest ${AccountId}.dkr.ecr.${Region}.amazonaws.com/admin-portal:latest
    
    # Push to ECR
    Write-Host "📤 Pushing to ECR..." -ForegroundColor Yellow
    docker push ${AccountId}.dkr.ecr.${Region}.amazonaws.com/admin-portal:latest
    
    Write-Host "✅ Deployment to ECS completed" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create ECS cluster" -ForegroundColor White
    Write-Host "2. Create task definition" -ForegroundColor White
    Write-Host "3. Create service" -ForegroundColor White
}

# Function to deploy to Lambda
function Deploy-Lambda {
    Write-Host "⚡ Deploying to Lambda..." -ForegroundColor Yellow
    
    if (-not (Test-Command "serverless")) {
        Write-Host "❌ Serverless Framework not found. Installing..." -ForegroundColor Red
        npm install -g serverless
    }
    
    # Deploy using serverless
    serverless deploy
    
    Write-Host "✅ Deployment to Lambda completed" -ForegroundColor Green
}

# Main deployment logic
switch ($DeploymentMethod) {
    "eb" {
        Build-App
        Deploy-EB
    }
    "ec2" {
        Build-App
        Deploy-EC2
    }
    "ecs" {
        Build-App
        Deploy-ECS
    }
    "lambda" {
        Build-App
        Deploy-Lambda
    }
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "🌐 Your application should be available shortly." -ForegroundColor Cyan 