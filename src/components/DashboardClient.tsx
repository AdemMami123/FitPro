'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import WorkoutPlanGenerator from '@/components/WorkoutPlanGenerator'
import AIChat from '@/components/AIChat'
import { useAuth } from '@/lib/auth-context'
import { getWorkoutStats, getWorkoutHistory } from '@/lib/actions/workout.action'
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity, 
  Clock, 
  Award,
  Play,
  BarChart3,
  Flame,
  Users,
  Heart,
  Zap,
  ChevronRight,
  Trophy,
  Timer,
  Weight
} from 'lucide-react'

interface DashboardStats {
  totalWorkouts: number
  totalExercises: number
  totalSets: number
  totalWeight: number
  averageWorkoutDuration: number
}

interface RecentWorkout {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  exercises: any[]
}

interface DashboardClientProps {
  user: any
  profile: any
}

export default function DashboardClient({ user: initialUser, profile: initialProfile }: DashboardClientProps) {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Use context data if available, otherwise fallback to props
  const currentUser = user || initialUser
  const currentProfile = profile || initialProfile

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load workout stats
      const statsResult = await getWorkoutStats()
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }

      // Load recent workouts
      const historyResult = await getWorkoutHistory(5)
      if (historyResult.success && historyResult.workouts) {
        setRecentWorkouts(historyResult.workouts)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}/${year}`
  }

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}k kg`
    }
    return `${weight} kg`
  }

  const [greeting, setGreeting] = useState('Hello')
  const [motivationMessage, setMotivationMessage] = useState("Ready to crush your fitness goals!")

  useEffect(() => {
    // Set greeting and motivation message on client side to avoid hydration mismatch
    const hour = new Date().getHours()
    let greetingText = 'Hello'
    if (hour < 12) greetingText = 'Good morning'
    else if (hour < 17) greetingText = 'Good afternoon'
    else greetingText = 'Good evening'
    setGreeting(greetingText)

    const messages = [
      "Ready to crush your fitness goals?",
      "Every workout counts toward your progress!",
      "Your strongest muscle is your consistency!",
      "Transform your body, transform your life!",
      "Progress, not perfection!",
      "Your only competition is who you were yesterday!"
    ]
    setMotivationMessage(messages[Math.floor(Math.random() * messages.length)])
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {greeting}, {currentUser?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-xl text-blue-100 mb-4 max-w-2xl">
                {motivationMessage}
              </p>
              {currentProfile && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {currentProfile.fitnessGoal && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Target className="w-4 h-4" />
                      <span>{currentProfile.fitnessGoal.replace('_', ' ')}</span>
                    </div>
                  )}
                  {currentProfile.exerciseDaysPerWeek && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Calendar className="w-4 h-4" />
                      <span>{currentProfile.exerciseDaysPerWeek} days/week</span>
                    </div>
                  )}
                  {currentProfile.experienceLevel && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                      <Award className="w-4 h-4" />
                      <span>{currentProfile.experienceLevel}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 lg:mt-0">
              <Link href="/log-workout">
                <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-3 shadow-lg">
                  <Play className="w-5 h-5" />
                  Start Workout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
              <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : stats?.totalWorkouts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3">
              <Weight className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : formatWeight(stats?.totalWeight || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3">
              <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : formatDuration(stats?.averageWorkoutDuration || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full p-3">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : stats?.totalSets || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h2>
              <Link href="/progress" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg h-16"></div>
                ))}
              </div>
            ) : recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2 mr-3">
                      <Dumbbell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{workout.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.exercises.length} exercises • {formatDate(workout.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workout.endTime ? 
                          `${Math.round((workout.endTime.getTime() - workout.startTime.getTime()) / 60000)}min` : 
                          'In progress'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No workouts yet. Start your first workout!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/log-workout" className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                <Play className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">Start Workout</span>
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link href="/progress" className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-green-600 dark:text-green-400 font-medium">View Progress</span>
                <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link href="/calendar" className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                <span className="text-purple-600 dark:text-purple-400 font-medium">Schedule</span>
                <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </h2>
            {stats?.totalWorkouts ? (
              <div className="space-y-3">
                {stats.totalWorkouts >= 1 && (
                  <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-2xl mr-3">🎯</span>
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">First Steps</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Completed your first workout!</p>
                    </div>
                  </div>
                )}
                {stats.totalWorkouts >= 7 && (
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-2xl mr-3">⚡</span>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Week Warrior</p>
                      <p className="text-sm text-green-600 dark:text-green-400">7 workouts completed!</p>
                    </div>
                  </div>
                )}
                {stats.totalWeight >= 1000 && (
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-2xl mr-3">💪</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Strength Builder</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">1,000kg total volume!</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">Start working out to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Workout Plan Generator */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 mr-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Workout Planner</h2>
          </div>
          <WorkoutPlanGenerator />
        </div>

        {/* AI Chat */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-2 mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Fitness Coach</h2>
          </div>
          <AIChat />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/log-workout" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Log Workout</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Track your workouts with advanced timers and exercise database.</p>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Logging
            </div>
          </div>
        </Link>

        <Link href="/progress" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Progress Tracking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Visualize your fitness journey with detailed analytics and insights.</p>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Progress
            </div>
          </div>
        </Link>

        <Link href="/calendar" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Workout Calendar</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Schedule and track your workouts with an intuitive calendar view.</p>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              View Calendar
            </div>
          </div>
        </Link>

        <Link href="/nutrition" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Nutrition Guide</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Get personalized nutrition recommendations and meal planning.</p>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all inline-flex items-center gap-2">
              <Flame className="w-4 h-4" />
              View Guide
            </div>
          </div>
        </Link>

        <Link href="/health-insights" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Health Insights</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Monitor your health metrics and get personalized insights.</p>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all inline-flex items-center gap-2">
              <Heart className="w-4 h-4" />
              View Insights
            </div>
          </div>
        </Link>

        <Link href="/profile" prefetch={true}>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 group">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Profile Settings</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your profile, preferences, and fitness goals.</p>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              Edit Profile
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
