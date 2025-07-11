'use client'

import { useState, useEffect } from 'react'
import { getWorkoutHistory, getWorkoutStats, getExerciseHistory } from '@/lib/actions/workout.action'
import { useWeightUnit } from '@/contexts/WeightUnitContext'

interface WorkoutStats {
  totalWorkouts: number
  totalExercises: number
  totalSets: number
  totalWeight: number
  averageWorkoutDuration: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'strength' | 'consistency' | 'milestone' | 'progress'
  earned: boolean
  earnedDate?: Date
  progress?: number
  target?: number
}

interface ExerciseProgress {
  exerciseName: string
  bestWeight: number
  bestReps: number
  totalSets: number
  averageWeight: number
  improvement: number
  lastWorkout: Date
  progression: {
    date: Date
    weight: number
    reps: number
  }[]
}

interface WeeklyProgress {
  week: string
  workouts: number
  totalWeight: number
  averageDuration: number
}

export default function ProgressTracker() {
  const { unit, formatWeight } = useWeightUnit()
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'exercises' | 'progress'>('overview')

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    setIsLoading(true)
    try {
      // Load workout stats
      const statsResult = await getWorkoutStats()
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }

      // Load workout history for detailed analysis
      const historyResult = await getWorkoutHistory(50)
      if (historyResult.success && historyResult.workouts) {
        const workouts = historyResult.workouts
        
        // Calculate achievements
        const calculatedAchievements = calculateAchievements(workouts, statsResult.stats || null)
        setAchievements(calculatedAchievements)

        // Calculate exercise progress
        const progressData = await calculateExerciseProgress(workouts)
        setExerciseProgress(progressData)

        // Calculate weekly progress
        const weeklyData = calculateWeeklyProgress(workouts)
        setWeeklyProgress(weeklyData)
      }
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAchievements = (workouts: any[], stats: WorkoutStats | null): Achievement[] => {
    const achievements: Achievement[] = []
    const now = new Date()

    // Consistency achievements
    achievements.push({
      id: 'first-workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: '🎯',
      category: 'milestone',
      earned: (stats?.totalWorkouts || 0) >= 1,
      earnedDate: workouts.length > 0 ? new Date(workouts[workouts.length - 1].startTime) : undefined
    })

    achievements.push({
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Complete 7 workouts',
      icon: '⚡',
      category: 'consistency',
      earned: (stats?.totalWorkouts || 0) >= 7,
      progress: Math.min((stats?.totalWorkouts || 0) / 7 * 100, 100),
      target: 7
    })

    achievements.push({
      id: 'month-master',
      title: 'Month Master',
      description: 'Complete 30 workouts',
      icon: '🏆',
      category: 'consistency',
      earned: (stats?.totalWorkouts || 0) >= 30,
      progress: Math.min((stats?.totalWorkouts || 0) / 30 * 100, 100),
      target: 30
    })

    // Strength achievements
    const totalWeight = stats?.totalWeight || 0
    achievements.push({
      id: 'iron-lifter',
      title: 'Iron Lifter',
      description: 'Lift 5,000 kg total weight',
      icon: '💪',
      category: 'strength',
      earned: totalWeight >= 5000,
      progress: Math.min(totalWeight / 5000 * 100, 100),
      target: 5000
    })

    achievements.push({
      id: 'strength-beast',
      title: 'Strength Beast',
      description: 'Lift 25,000 kg total weight',
      icon: '🦁',
      category: 'strength',
      earned: totalWeight >= 25000,
      progress: Math.min(totalWeight / 25000 * 100, 100),
      target: 25000
    })

    // Progress achievements
    const hasProgressiveOverload = checkProgressiveOverload(workouts)
    achievements.push({
      id: 'progressive-overload',
      title: 'Progressive Overload',
      description: 'Increase weight on the same exercise',
      icon: '📈',
      category: 'progress',
      earned: hasProgressiveOverload,
      progress: hasProgressiveOverload ? 100 : 0,
      target: 1
    })

    // Milestone achievements
    achievements.push({
      id: 'century-club',
      title: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '🌟',
      category: 'milestone',
      earned: (stats?.totalWorkouts || 0) >= 100,
      progress: Math.min((stats?.totalWorkouts || 0) / 100 * 100, 100),
      target: 100
    })

    return achievements
  }

  const checkProgressiveOverload = (workouts: any[]): boolean => {
    // Check if user has increased weight on any exercise over time
    const exerciseData: { [key: string]: { weight: number, date: Date }[] } = {}
    
    workouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = []
        }
        
        exercise.sets?.forEach((set: any) => {
          if (set.weight > 0) {
            exerciseData[exercise.name].push({
              weight: set.weight,
              date: new Date(workout.startTime)
            })
          }
        })
      })
    })

    // Check for weight progression in any exercise
    for (const exerciseName in exerciseData) {
      const data = exerciseData[exerciseName].sort((a, b) => a.date.getTime() - b.date.getTime())
      if (data.length >= 2) {
        const firstWeight = data[0].weight
        const lastWeight = data[data.length - 1].weight
        if (lastWeight > firstWeight) {
          return true
        }
      }
    }

    return false
  }

  const calculateExerciseProgress = async (workouts: any[]): Promise<ExerciseProgress[]> => {
    const exerciseData: { [key: string]: ExerciseProgress } = {}

    workouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = {
            exerciseName: exercise.name,
            bestWeight: 0,
            bestReps: 0,
            totalSets: 0,
            averageWeight: 0,
            improvement: 0,
            lastWorkout: new Date(workout.startTime),
            progression: []
          }
        }

        const exerciseEntry = exerciseData[exercise.name]
        exerciseEntry.lastWorkout = new Date(workout.startTime)

        exercise.sets?.forEach((set: any) => {
          if (set.weight > 0 && set.reps > 0) {
            exerciseEntry.totalSets++
            
            // Update best weight and reps
            if (set.weight > exerciseEntry.bestWeight) {
              exerciseEntry.bestWeight = set.weight
            }
            if (set.reps > exerciseEntry.bestReps) {
              exerciseEntry.bestReps = set.reps
            }

            // Add to progression
            exerciseEntry.progression.push({
              date: new Date(workout.startTime),
              weight: set.weight,
              reps: set.reps
            })
          }
        })
      })
    })

    // Calculate averages and improvements
    Object.values(exerciseData).forEach(exercise => {
      if (exercise.progression.length > 0) {
        const totalWeight = exercise.progression.reduce((sum, p) => sum + p.weight, 0)
        exercise.averageWeight = totalWeight / exercise.progression.length

        // Calculate improvement (compare first and last workout)
        exercise.progression.sort((a, b) => a.date.getTime() - b.date.getTime())
        const firstWeight = exercise.progression[0].weight
        const lastWeight = exercise.progression[exercise.progression.length - 1].weight
        exercise.improvement = ((lastWeight - firstWeight) / firstWeight) * 100
      }
    })

    return Object.values(exerciseData)
      .filter(exercise => exercise.totalSets > 0)
      .sort((a, b) => b.totalSets - a.totalSets)
  }

  const calculateWeeklyProgress = (workouts: any[]): WeeklyProgress[] => {
    const weeklyData: { [key: string]: WeeklyProgress } = {}

    workouts.forEach(workout => {
      const date = new Date(workout.startTime)
      const weekKey = getWeekKey(date)
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          workouts: 0,
          totalWeight: 0,
          averageDuration: 0
        }
      }

      weeklyData[weekKey].workouts++
      
      // Calculate total weight for this workout
      let workoutWeight = 0
      workout.exercises?.forEach((exercise: any) => {
        exercise.sets?.forEach((set: any) => {
          if (set.weight && set.reps) {
            workoutWeight += set.weight * set.reps
          }
        })
      })
      weeklyData[weekKey].totalWeight += workoutWeight

      // Calculate duration
      if (workout.endTime) {
        const duration = (new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / (1000 * 60)
        weeklyData[weekKey].averageDuration += duration
      }
    })

    // Calculate averages
    Object.values(weeklyData).forEach(week => {
      if (week.workouts > 0) {
        week.averageDuration = week.averageDuration / week.workouts
      }
    })

    return Object.values(weeklyData)
      .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
      .slice(0, 12) // Last 12 weeks
  }

  const getWeekKey = (date: Date): string => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)
    return startOfWeek.toISOString().split('T')[0]
  }

  const formatWeightDisplay = (weight: number): string => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}K`
    }
    return weight.toString()
  }

  const getAchievementColor = (category: string): string => {
    switch (category) {
      case 'strength': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      case 'consistency': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      case 'progress': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-3 mr-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'achievements', label: 'Achievements', icon: '🏆' },
            { key: 'exercises', label: 'Exercise Progress', icon: '💪' },
            { key: 'progress', label: 'Weekly Progress', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalWorkouts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Weight Lifted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatWeightDisplay(stats?.totalWeight || 0)} {unit}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats?.averageWorkoutDuration || 0)} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full p-3 mr-3">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalSets || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 ${achievement.earned ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{achievement.icon}</span>
                    <h3 className={`font-semibold ${achievement.earned ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAchievementColor(achievement.category)}`}>
                      {achievement.category}
                    </span>
                    {achievement.earned && (
                      <span className="text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!achievement.earned && achievement.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(achievement.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {exerciseProgress.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No exercise data available yet. Start logging workouts to see your progress!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exerciseProgress.map((exercise) => (
                <div key={exercise.exerciseName} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.exerciseName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last workout: {exercise.lastWorkout.toLocaleDateString()}
                      </p>
                    </div>
                    {exercise.improvement > 0 && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm font-medium">+{exercise.improvement.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.bestWeight}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best Weight ({unit})</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.bestReps}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Best Reps</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.totalSets}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{exercise.averageWeight.toFixed(1)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Weight ({unit})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          {weeklyProgress.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No weekly progress data available yet. Keep logging workouts to see your trends!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Weekly Progress</h3>
              <div className="space-y-4">
                {weeklyProgress.map((week) => (
                  <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Week of {new Date(week.week).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {week.workouts} workouts • {Math.round(week.averageDuration)} min avg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatWeightDisplay(week.totalWeight)} {unit}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total lifted</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
