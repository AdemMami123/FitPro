# 🏋️‍♂️ FitPro - AI Fitness Coach App

A comprehensive fitness coaching application built with Next.js 15, Firebase, and Google Gemini AI. This app provides personalized workout plans, AI-powered fitness guidance, and offline workout tracking capabilities.

## 🌟 Core Features

### 1. User Profile & Fitness Input
- **Personal Information**: Weight, height, age, fitness goals
- **Fitness Preferences**: Exercise days per week, experience level
- **Goal Setting**: Weight loss, muscle gain, strength, endurance
- **Secure Storage**: User data stored in Firebase Firestore

### 2. AI-Powered Plan Generator (Gemini)
- **Personalized Workouts**: Custom workout plans based on user profile
- **Nutrition Guidance**: Daily macronutrient recommendations
- **Dynamic Adaptation**: Plans adjust based on progress and feedback
- **Exercise Library**: Comprehensive exercise database with instructions

### 3. AI Chatbot (Gemini Chat Integration)
- **24/7 Fitness Support**: Answer fitness and nutrition questions
- **Exercise Guidance**: Tips for proper form and injury prevention
- **Plan Clarification**: Help understanding workout routines
- **Progress Motivation**: Encouraging feedback and suggestions

### 4. Offline Workout Logger
- **Local-First Storage**: IndexedDB for offline workout logging
- **Comprehensive Tracking**: Weight, sets, reps, rest times
- **Workout History**: Complete exercise history and progress
- **Smart Sync**: Automatic cloud synchronization when online
- **Conflict Resolution**: Intelligent merging of offline and online data

### 5. Progress Tracking & Analytics
- **Visual Progress**: Charts and graphs for key metrics
- **Body Metrics**: Weight, body fat, measurements tracking
- **Performance Analytics**: Strength progression, volume trends
- **Calendar View**: Visual workout schedule and completion

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with modern UI components
- **Backend**: Firebase (Authentication, Firestore, Admin SDK)
- **AI Integration**: Google Gemini AI API for workout plans and chat
- **Offline Storage**: IndexedDB for local workout data
- **Authentication**: Firebase Auth with session-based cookies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication enabled
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and Gemini AI credentials in `.env.local`:
   ```env
   # Firebase Client Configuration (Public)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin Configuration (Private)
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

   # Google Gemini AI API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── sign-in/       # Sign-in page
│   │   ├── sign-up/       # Sign-up page
│   │   └── layout.tsx     # Auth layout
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Main dashboard
│   │   └── layout.tsx     # Dashboard layout
│   ├── api/               # API routes
│   │   └── auth/          # Authentication APIs
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── firebase/              # Firebase configuration
│   ├── admin.ts           # Firebase Admin SDK
│   └── client.ts          # Firebase client SDK
├── lib/                   # Utility functions
│   └── actions/           # Server actions
│       └── auth.action.ts # Authentication actions
└── types/                 # TypeScript definitions
    └── auth.ts            # Authentication types
```

## 🔐 Authentication System

### Session-Based Authentication
- **HTTP-Only Cookies**: Secure session management
- **Server-Side Verification**: Protected routes with server actions
- **Automatic Redirects**: Seamless user experience

### Security Features
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Secure cookie configuration
- **Route Protection**: Authentication checks on all protected routes

## 🔧 Firebase Configuration

### Firestore Collections
```
users/
├── {userId}/
│   ├── id: string
│   ├── name: string
│   ├── email: string
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

userProfiles/
├── {userId}/
│   ├── weight: number
│   ├── height: number
│   ├── fitnessGoal: string
│   ├── exerciseDaysPerWeek: number
│   ├── experienceLevel: string
│   └── ...

workouts/
├── {workoutId}/
│   ├── userId: string
│   ├── name: string
│   ├── exercises: array
│   ├── completedAt: timestamp
│   └── ...
```

### Authentication Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🤖 AI Integration

### Google Gemini AI Features
- **Workout Plan Generation**: Personalized exercise routines
- **Nutritional Guidance**: Macro and meal recommendations
- **Exercise Explanations**: Detailed form and technique instructions
- **Progress Analysis**: AI-powered insights and suggestions

### Chat Implementation
- **Context-Aware Responses**: Maintains conversation context
- **Fitness Expertise**: Specialized knowledge in fitness and nutrition
- **Safety Guidelines**: Injury prevention and proper form emphasis

## 📱 Offline Capabilities

### IndexedDB Storage
- **Local Workout Logging**: Continue tracking without internet
- **Data Synchronization**: Automatic sync when connection restored
- **Conflict Resolution**: Smart merging of local and cloud data

### PWA Features (Future)
- **Service Worker**: Background sync and caching
- **Install Prompt**: Add to home screen functionality
- **Push Notifications**: Workout reminders and motivation

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1E40AF)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale (#F8FAFC to #0F172A)

### Typography
- **Primary Font**: Geist Sans (Modern, clean)
- **Monospace**: Geist Mono (Code and data)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 📊 Analytics & Tracking

### Progress Metrics
- **Strength Progress**: Weight lifted over time
- **Volume Tracking**: Total sets and reps
- **Body Composition**: Weight, body fat, measurements
- **Workout Frequency**: Consistency tracking

### Data Visualization
- **Charts**: Progress graphs and trend analysis
- **Heatmaps**: Workout frequency calendar
- **Achievements**: Milestone tracking and badges

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**: Link your Git repository
2. **Environment Variables**: Add all required env vars
3. **Build Settings**: Default Next.js configuration
4. **Deploy**: Automatic deployment on push

### Environment Configuration
```bash
# Production environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
FIREBASE_PROJECT_ID=production_project_id
GEMINI_API_KEY=production_gemini_key
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the robust backend services
- Google for the Gemini AI API
- Tailwind CSS for the utility-first styling
- The open-source community for inspiration and tools

---

**Happy Fitness Tracking! 💪**
