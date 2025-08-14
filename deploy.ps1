# 🚀 Deployment Helper Script for Windows
# Run this in PowerShell to prepare your app for deployment

Write-Host "🚀 Preparing your app for deployment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first:" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python first:" -ForegroundColor Red
    Write-Host "   Download from: https://python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install

Write-Host "`n🔨 Building frontend..." -ForegroundColor Blue
npm run build

if (Test-Path "build") {
    Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
    Write-Host "   Build folder created at: frontend/build" -ForegroundColor Yellow
} else {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🐍 Installing backend dependencies..." -ForegroundColor Blue
Set-Location ../backend
pip install -r requirements.txt

Write-Host "`n✅ Your app is ready for deployment!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Frontend: Upload the 'frontend/build' folder to Netlify/Vercel" -ForegroundColor White
Write-Host "2. Backend: Deploy to Railway/Render" -ForegroundColor White
Write-Host "3. Database: Set up MongoDB Atlas" -ForegroundColor White
Write-Host "`n📖 See DEPLOYMENT_GUIDE.md for detailed instructions!" -ForegroundColor Cyan

Set-Location ..
