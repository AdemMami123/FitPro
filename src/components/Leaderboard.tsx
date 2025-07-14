'use client'

import { useState, useEffect } from 'react'
import { getLeaderboard } from '@/lib/challenges.action'
import { Leaderboard, LeaderboardEntry } from '@/types/social'
import { Trophy, TrendingUp, TrendingDown, Medal, Crown, Award } from 'lucide-react'

export default function LeaderboardComponent() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null)
  const [userRank, setUserRank] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'workout_count' | 'total_weight' | 'workout_streak' | 'calories_burned' | 'weekly_volume'>('workout_count')
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly')

  useEffect(() => {
    loadLeaderboard()
  }, [selectedType, selectedPeriod])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const result = await getLeaderboard(selectedType, selectedPeriod)
      if (result.success && result.data) {
        setLeaderboard(result.data.leaderboard)
        setUserRank(result.data.userRank)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />
      default:
        return <span className="text-gray-500 font-semibold">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500'
      default:
        return 'bg-gray-50'
    }
  }

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'workout_count':
        return `${value} workouts`
      case 'total_weight':
        return `${value.toLocaleString()} lbs`
      case 'workout_streak':
        return `${value} days`
      case 'calories_burned':
        return `${value.toLocaleString()} cal`
      case 'weekly_volume':
        return `${Math.round(value / 60)} hrs`
      default:
        return value.toString()
    }
  }

  const typeOptions = [
    { value: 'workout_count', label: 'Workout Count' },
    { value: 'total_weight', label: 'Total Weight' },
    { value: 'workout_streak', label: 'Workout Streak' },
    { value: 'calories_burned', label: 'Calories Burned' },
    { value: 'weekly_volume', label: 'Weekly Volume' }
  ]

  const periodOptions = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all_time', label: 'All Time' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="mr-3 h-6 w-6 text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-gray-600 mt-1">
              See how you rank against other fitness enthusiasts
            </p>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Rank */}
          {userRank && (
            <div className="bg-blue-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center text-blue-700">
                  <Trophy className="h-5 w-5 mr-2" />
                  <span className="font-medium">Your Rank: #{userRank}</span>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Content */}
          <div className="p-6">
            {leaderboard && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {leaderboard.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(leaderboard.lastUpdated).toLocaleDateString()}
                  </p>
                </div>

                {leaderboard.entries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No data available for this leaderboard yet.</p>
                    <p className="text-sm mt-2">Complete some workouts to see rankings!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.entries.map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center p-4 rounded-lg ${
                          entry.rank <= 3 ? getRankColor(entry.rank) + ' text-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8 mr-4">
                            {getRankIcon(entry.rank)}
                          </div>

                          {/* User Info */}
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-white/20">
                              {entry.userAvatar ? (
                                <img
                                  src={entry.userAvatar}
                                  alt={entry.userName}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <span className={`font-semibold ${entry.rank <= 3 ? 'text-white' : 'text-gray-700'}`}>
                                  {entry.userName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className={`font-medium truncate ${entry.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                                {entry.userName}
                              </h3>
                              <p className={`text-sm ${entry.rank <= 3 ? 'text-white/80' : 'text-gray-500'}`}>
                                Rank #{entry.rank}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Value and Trend */}
                        <div className="flex items-center ml-4">
                          <div className="text-right mr-3">
                            <p className={`font-semibold ${entry.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                              {formatValue(entry.value, selectedType)}
                            </p>
                            {entry.trend && (
                              <div className="flex items-center justify-end">
                                {entry.trend === 'up' ? (
                                  <TrendingUp className={`h-4 w-4 ${entry.rank <= 3 ? 'text-white/80' : 'text-green-500'}`} />
                                ) : entry.trend === 'down' ? (
                                  <TrendingDown className={`h-4 w-4 ${entry.rank <= 3 ? 'text-white/80' : 'text-red-500'}`} />
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
