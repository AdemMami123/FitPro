'use client'

import { useState, useEffect } from 'react'
import { getWorkoutStats } from '@/lib/actions/workout.action'

interface WorkoutStats {
  totalWorkouts: number
  totalExercises: number
  totalSets: number
  totalWeight: number
  averageWorkoutDuration: number
}

export default function CalendarStats() {
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const result = await getWorkoutStats()
      if (result.success && result.stats) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No workout data available</p>
      </div>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}k kg`
    }
    return `${weight} kg`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Workouts</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalWorkouts}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Exercises</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalExercises}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-2">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Weight</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatWeight(stats.totalWeight)}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full p-2">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Duration</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatDuration(stats.averageWorkoutDuration)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
