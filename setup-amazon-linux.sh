#!/bin/bash

# Amazon Linux Setup Script for Admin Portal
# Run this on your Amazon Linux EC2 instance

set -e

echo "🚀 Setting up Admin Portal on Amazon Linux..."

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo dnf install -y git

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ec2-user/admin-portal
cd /home/ec2-user/admin-portal

# Clone repository (replace with your repo URL)
echo "📥 Cloning repository..."
git clone https://github.com/chokshics/cloudagent.git .

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Create environment file
echo "🔧 Creating environment file..."
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=88620138d110da53ab9b68427d42cf5e517bdd303a97abd1dc0edce7dd909a1256c999e8259b8e1a89a6932e9dc7b4295100b9351848ead400d209488f5fc026
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
CLIENT_URL=http://your-ec2-public-ip:5000
EOF

# Build the application
echo "🔨 Building application..."
npm run build

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start server/index.js --name "admin-portal"

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save
pm2 startup

# Configure firewall (if needed)
echo "🔥 Configuring firewall..."
sudo dnf install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

echo "✅ Setup completed successfully!"
echo "🌐 Your application is running on port 5000"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs admin-portal"
echo "🔧 Edit environment variables in: /home/ec2-user/admin-portal/.env" 