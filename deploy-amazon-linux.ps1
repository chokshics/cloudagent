# Amazon Linux EC2 Deployment Script (PowerShell)
# This script helps you deploy to Amazon Linux EC2 instance

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "ec2-user"
)

Write-Host "🚀 Deploying Admin Portal to Amazon Linux EC2..." -ForegroundColor Green

# Function to execute SSH command
function Invoke-SSHCommand {
    param([string]$Command)
    
    $sshCommand = "ssh -i `"$KeyPath`" -o StrictHostKeyChecking=no ${Username}@${EC2IP} `"$Command`""
    Write-Host "Executing: $Command" -ForegroundColor Yellow
    Invoke-Expression $sshCommand
}

# Function to copy file via SCP
function Copy-FileToEC2 {
    param([string]$LocalPath, [string]$RemotePath)
    
    $scpCommand = "scp -i `"$KeyPath`" -o StrictHostKeyChecking=no `"$LocalPath`" ${Username}@${EC2IP}:${RemotePath}"
    Write-Host "Copying: $LocalPath to $RemotePath" -ForegroundColor Yellow
    Invoke-Expression $scpCommand
}

try {
    # Test SSH connection
    Write-Host "🔍 Testing SSH connection..." -ForegroundColor Yellow
    Invoke-SSHCommand "echo 'SSH connection successful'"
    
    # Update system
    Write-Host "📦 Updating system packages..." -ForegroundColor Yellow
    Invoke-SSHCommand "sudo dnf update -y"
    
    # Install Node.js 18
    Write-Host "📦 Installing Node.js 18..." -ForegroundColor Yellow
    Invoke-SSHCommand "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
    Invoke-SSHCommand "sudo dnf install -y nodejs"
    
    # Install Git
    Write-Host "📦 Installing Git..." -ForegroundColor Yellow
    Invoke-SSHCommand "sudo dnf install -y git"
    
    # Install PM2
    Write-Host "📦 Installing PM2..." -ForegroundColor Yellow
    Invoke-SSHCommand "npm install -g pm2"
    
    # Create application directory
    Write-Host "📁 Creating application directory..." -ForegroundColor Yellow
    Invoke-SSHCommand "mkdir -p /home/ec2-user/admin-portal"
    
    # Copy setup script
    Write-Host "📤 Copying setup script..." -ForegroundColor Yellow
    Copy-FileToEC2 "setup-amazon-linux.sh" "/home/ec2-user/admin-portal/setup-amazon-linux.sh"
    
    # Make script executable
    Invoke-SSHCommand "chmod +x /home/ec2-user/admin-portal/setup-amazon-linux.sh"
    
    # Clone repository (you'll need to update this URL)
    Write-Host "📥 Cloning repository..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /home/ec2-user/admin-portal && git clone https://github.com/your-username/your-repo.git ."
    
    # Run setup script
    Write-Host "🔧 Running setup script..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /home/ec2-user/admin-portal && ./setup-amazon-linux.sh"
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your application should be available at: http://$EC2IP:5000" -ForegroundColor Cyan
    Write-Host "📊 Check status: ssh -i `"$KeyPath`" $Username@$EC2IP 'pm2 status'" -ForegroundColor White
    Write-Host "📋 View logs: ssh -i `"$KeyPath`" $Username@$EC2IP 'pm2 logs admin-portal'" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Check your EC2 instance is running" -ForegroundColor White
    Write-Host "2. Verify your key file path is correct" -ForegroundColor White
    Write-Host "3. Ensure security group allows SSH (port 22)" -ForegroundColor White
    Write-Host "4. Check your repository URL is correct" -ForegroundColor White
} 