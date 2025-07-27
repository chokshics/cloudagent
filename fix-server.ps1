# Simple fix script for the server
param(
    [string]$EC2IP = "65.0.75.100",
    [string]$KeyPath = "C:\Users\chintan\.ssh\cloudagent.pem",
    [string]$Username = "ec2-user"
)

Write-Host "🔧 Fixing server static file issue..." -ForegroundColor Green

# SSH commands to run
$commands = @(
    "cd /home/ec2-user/admin-portal",
    "git pull origin master",
    "npm run install-all",
    "npm run build",
    "pm2 restart admin-portal",
    "pm2 status"
)

foreach ($cmd in $commands) {
    Write-Host "Running: $cmd" -ForegroundColor Yellow
    $sshCmd = "ssh -i `"$KeyPath`" -o StrictHostKeyChecking=no ${Username}@${EC2IP} `"$cmd`""
    Invoke-Expression $sshCmd
    Write-Host ""
}

Write-Host "✅ Server fix completed!" -ForegroundColor Green
Write-Host "🌐 Try accessing: http://$EC2IP:5000" -ForegroundColor Cyan
Write-Host "💡 Clear your browser cache or use incognito mode" -ForegroundColor Yellow 