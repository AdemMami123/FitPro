import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile, isProfileComplete } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WorkoutPlanGenerator from '@/components/WorkoutPlanGenerator'
import AIChat from '@/components/AIChat'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  // This check is redundant since the layout already handles authentication,
  // but keeping it for safety
  if (!user) {
    redirect('/sign-in')
  }

  const profile = await getUserProfile()
  const profileComplete = await isProfileComplete()

  // If profile is not complete, redirect to profile setup
  if (!profileComplete) {
    redirect('/profile-setup')
  }
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name}! 🎯
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ready to crush your fitness goals today?
        </p>
        {profile && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Your Profile Summary:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {profile.fitnessGoal && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Goal:</span> {profile.fitnessGoal.replace('_', ' ')}
                </div>
              )}
              {profile.exerciseDaysPerWeek && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Days/Week:</span> {profile.exerciseDaysPerWeek}
                </div>
              )}
              {profile.experienceLevel && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Level:</span> {profile.experienceLevel}
                </div>
              )}
              {profile.weight && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Weight:</span> {profile.weight}kg
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Workout Plan Generator */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <WorkoutPlanGenerator />
        </div>

        {/* AI Chat */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
          <AIChat />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        

        <Link href="/log-workout">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full p-3">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Log Workout</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Track your workouts and monitor your progress.</p>
            <div className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors inline-block">
              Log Workout
            </div>
          </div>
        </Link>

        <Link href="/progress">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Progress Tracking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">View your fitness progress and achievements.</p>
            <div className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-block">
              View Progress
            </div>
          </div>
        </Link>

        <Link href="/calendar">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Workout Calendar</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">View your workout schedule and history.</p>
            <div className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors inline-block">
              View Calendar
            </div>
          </div>
        </Link>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Nutrition Guide</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Get personalized nutrition recommendations.</p>
          <div className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-block">
            View Guide
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Health Insights</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Monitor your health metrics and trends.</p>
          <div className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors inline-block">
            View Insights
          </div>
        </div>
      </div>
    </div>
  )
}
