# 🚀 Full Stack Deployment Script for Windows
# This will deploy BOTH frontend and backend

Write-Host "🚀 Starting Full Stack Deployment..." -ForegroundColor Green

# Step 1: Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Blue
Set-Location frontend
npm install
npm run build

if (Test-Path "build") {
    Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Prepare Backend
Write-Host "`n🐍 Preparing Backend..." -ForegroundColor Blue
Set-Location ../backend
pip install -r requirements.txt

Write-Host "`n✅ Your app is ready for full stack deployment!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. 🚂 Deploy Backend to Railway:" -ForegroundColor White
Write-Host "   - Go to railway.app" -ForegroundColor White
Write-Host "   - Sign up with GitHub" -ForegroundColor White
Write-Host "   - Deploy from your repo" -ForegroundColor White
Write-Host "   - Get your backend URL" -ForegroundColor White

Write-Host "`n2. 🗄️ Set up MongoDB Atlas:" -ForegroundColor White
Write-Host "   - Go to mongodb.com/atlas" -ForegroundColor White
Write-Host "   - Create free cluster" -ForegroundColor White
Write-Host "   - Get connection string" -ForegroundColor White

Write-Host "`n3. 🔧 Add Environment Variables in Railway:" -ForegroundColor White
Write-Host "   MONGO_URL=your_mongodb_connection_string" -ForegroundColor Cyan
Write-Host "   DEEPSEEK_API_KEY=your_api_key" -ForegroundColor Cyan
Write-Host "   DB_NAME=orbsocial" -ForegroundColor Cyan

Write-Host "`n4. 🌐 Update Netlify Environment Variable:" -ForegroundColor White
Write-Host "   REACT_APP_BACKEND_URL=https://your-railway-app.railway.app" -ForegroundColor Cyan

Write-Host "`n5. 🚀 Redeploy Netlify (it will auto-update)" -ForegroundColor White

Write-Host "`n📖 See DEPLOYMENT_GUIDE.md for detailed instructions!" -ForegroundColor Cyan

Set-Location ..
