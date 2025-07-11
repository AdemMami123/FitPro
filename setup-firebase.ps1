# FitPro Firebase Setup Script for Windows
Write-Host "🏋️‍♂️ FitPro Firebase Setup" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI is installed: $firebaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Firebase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Login to Firebase
Write-Host "🔐 Logging into Firebase..." -ForegroundColor Blue
firebase login

# Initialize Firebase project
Write-Host "🚀 Initializing Firebase project..." -ForegroundColor Blue
firebase init

Write-Host "📝 Firebase project initialized!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy your Firebase configuration from the Firebase Console" -ForegroundColor White
Write-Host "2. Update your .env.local file with the configuration values" -ForegroundColor White
Write-Host "3. Place your Firebase service account key in the project root" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 💪" -ForegroundColor Green
