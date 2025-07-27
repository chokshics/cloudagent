#!/bin/bash

# Fix script for Admin Portal server
# Run this directly on your AWS Linux server

echo "🔧 Fixing server static file issue..."

# Navigate to application directory
cd /home/ec2-user/admin-portal

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin master

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application with PM2
echo "🚀 Restarting application with PM2..."
pm2 restart admin-portal

# Check application status
echo "📊 Checking application status..."
pm2 status

echo "✅ Server fix completed!"
echo "🌐 Your application should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "💡 Clear your browser cache or use incognito mode"
echo "📋 View logs with: pm2 logs admin-portal" 