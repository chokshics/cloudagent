# Update Server Script for Admin Portal
# This script updates the server with the latest code from GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "ec2-user"
)

Write-Host "🚀 Updating Admin Portal on Amazon Linux EC2..." -ForegroundColor Green

# Function to execute SSH command
function Invoke-SSHCommand {
    param([string]$Command)
    
    $sshCommand = "ssh -i `"$KeyPath`" -o StrictHostKeyChecking=no ${Username}@${EC2IP} `"$Command`""
    Write-Host "Executing: $Command" -ForegroundColor Yellow
    Invoke-Expression $sshCommand
}

try {
    # Test SSH connection
    Write-Host "🔍 Testing SSH connection..." -ForegroundColor Yellow
    Invoke-SSHCommand "echo 'SSH connection successful'"
    
    # Navigate to application directory
    Write-Host "📁 Navigating to application directory..." -ForegroundColor Yellow
    Invoke-SSHCommand "cd /home/ec2-user/admin-portal"
    
    # Stop the current application
    Write-Host "⏹️ Stopping current application..." -ForegroundColor Yellow
    Invoke-SSHCommand "pm2 stop admin-portal || echo 'No running process found'"
    
    # Pull latest changes from GitHub
    Write-Host "📥 Pulling latest changes from GitHub..." -ForegroundColor Yellow
    Invoke-SSHCommand "git pull origin master"
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Invoke-SSHCommand "npm run install-all"
    
    # Build the application
    Write-Host "🔨 Building application..." -ForegroundColor Yellow
    Invoke-SSHCommand "npm run build"
    
    # Start the application with PM2
    Write-Host "🚀 Starting application with PM2..." -ForegroundColor Yellow
    Invoke-SSHCommand "pm2 start server/index.js --name admin-portal"
    
    # Save PM2 configuration
    Write-Host "💾 Saving PM2 configuration..." -ForegroundColor Yellow
    Invoke-SSHCommand "pm2 save"
    
    # Check application status
    Write-Host "📊 Checking application status..." -ForegroundColor Yellow
    Invoke-SSHCommand "pm2 status"
    
    Write-Host "✅ Server update completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your application should be available at: http://$EC2IP:5000" -ForegroundColor Cyan
    Write-Host "📊 Check status: ssh -i `"$KeyPath`" $Username@$EC2IP 'pm2 status'" -ForegroundColor White
    Write-Host "📋 View logs: ssh -i `"$KeyPath`" $Username@$EC2IP 'pm2 logs admin-portal'" -ForegroundColor White
    
} catch {
    Write-Host "❌ Server update failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Check your EC2 instance is running" -ForegroundColor White
    Write-Host "2. Verify your key file path is correct" -ForegroundColor White
    Write-Host "3. Ensure security group allows SSH (port 22)" -ForegroundColor White
    Write-Host "4. Check if the application directory exists" -ForegroundColor White
} 