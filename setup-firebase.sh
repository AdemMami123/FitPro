#!/bin/bash

# FitPro Firebase Setup Script
echo "🏋️‍♂️ FitPro Firebase Setup"
echo "=========================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Initialize Firebase project
echo "🚀 Initializing Firebase project..."
firebase init

echo "📝 Firebase project initialized!"
echo ""
echo "Next steps:"
echo "1. Copy your Firebase configuration from the Firebase Console"
echo "2. Update your .env.local file with the configuration values"
echo "3. Place your Firebase service account key in the project root"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "Happy coding! 💪"
