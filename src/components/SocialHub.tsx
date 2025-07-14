'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  Users, 
  Trophy, 
  Share2, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Calendar,
  Target,
  Medal,
  TrendingUp,
  Clock,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  Crown,
  Flame,
  Award,
  Plus,
  Bell,
  Settings
} from 'lucide-react'

// Import action functions
import {
  getLeaderboard,
  getChallenges,
  createChallenge,
  joinChallenge,
  leaveChallenge,
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getFriendRequests,
  shareWorkout,
  getSharedWorkouts,
  likeWorkout,
  unlikeWorkout,
  commentOnWorkout,
  initializeSocialFeatures
} from '@/lib/challenges.action'

interface SocialHubProps {
  initialTab?: 'leaderboard' | 'challenges' | 'friends' | 'shared'
}

export default function SocialHub({ initialTab = 'leaderboard' }: SocialHubProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'shared', label: 'Shared Workouts', icon: Share2 }
  ]

  // Initialize social features on first load
  useEffect(() => {
    const initializeSocial = async () => {
      try {
        await initializeSocialFeatures()
      } catch (error) {
        console.error('Error initializing social features:', error)
      }
    }
    
    if (user) {
      initializeSocial()
    }
  }, [user])

  const handleTabChange = (tabId: 'leaderboard' | 'challenges' | 'friends' | 'shared') => {
    setActiveTab(tabId)
    setError(null)
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to access social features</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Hub</h1>
            <p className="text-blue-100">Connect, compete, and grow together</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'leaderboard' | 'challenges' | 'friends' | 'shared')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'challenges' && <ChallengesTab />}
          {activeTab === 'friends' && <FriendsTab />}
          {activeTab === 'shared' && <SharedWorkoutsTab />}
        </div>
      </div>
    </div>
  )
}

// Notification Bell Component
function NotificationBell() {
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    // Load notification count
    const loadNotifications = async () => {
      try {
        const requests = await getFriendRequests()
        if (requests.success) {
          setNotifications(requests.data?.length || 0)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()
  }, [])

  return (
    <div className="relative">
      <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
        <Bell className="w-5 h-5" />
      </button>
      {notifications > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notifications}
        </span>
      )}
    </div>
  )
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState<any>(null)
  const [selectedType, setSelectedType] = useState('workout_count')
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')
  const [loading, setLoading] = useState(true)

  const leaderboardTypes = [
    { id: 'workout_count', label: 'Workout Count', icon: Target },
    { id: 'total_weight', label: 'Total Weight', icon: Trophy },
    { id: 'workout_streak', label: 'Streak', icon: Flame },
    { id: 'calories_burned', label: 'Calories', icon: TrendingUp },
    { id: 'weekly_volume', label: 'Volume', icon: Clock }
  ]

  const periods = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'all_time', label: 'All Time' }
  ]

  useEffect(() => {
    loadLeaderboard()
  }, [selectedType, selectedPeriod])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const result = await getLeaderboard(
        selectedType as any,
        selectedPeriod as any
      )
      
      if (result.success) {
        setLeaderboardData(result.data)
      } else {
        console.error('Failed to load leaderboard:', result.error)
        // Set empty leaderboard data
        setLeaderboardData({
          leaderboard: {
            title: 'Leaderboard',
            entries: []
          },
          userRank: null
        })
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      setLeaderboardData({
        leaderboard: {
          title: 'Leaderboard',
          entries: []
        },
        userRank: null
      })
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />
      case 2: return <Medal className="w-5 h-5 text-gray-400" />
      case 3: return <Award className="w-5 h-5 text-orange-500" />
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>
    }
  }

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'total_weight':
        return `${value.toLocaleString()} lbs`
      case 'calories_burned':
        return `${value.toLocaleString()} cal`
      case 'weekly_volume':
        return `${Math.round(value)} min`
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Metric</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {leaderboardTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {leaderboardData?.leaderboard?.title || 'Leaderboard'}
          </h3>
          {leaderboardData?.userRank && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Your rank: #{leaderboardData.userRank}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-600 h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboardData?.leaderboard?.entries?.length > 0 ? (
              leaderboardData.leaderboard.entries.map((entry: any, index: number) => (
                <div
                  key={entry.userId}
                  className={`flex items-center p-4 rounded-lg transition-colors ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    {entry.userAvatar ? (
                      <img
                        src={entry.userAvatar}
                        alt={entry.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <div className="font-medium">{entry.userName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatValue(entry.value, selectedType)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {entry.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {entry.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No leaderboard data yet</p>
                <p className="text-sm text-gray-400 mt-2">Complete some workouts to see rankings!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Challenges Tab Component
function ChallengesTab() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filters = [
    { id: 'active', label: 'Active' },
    { id: 'my', label: 'My Challenges' },
    { id: 'completed', label: 'Completed' }
  ]

  useEffect(() => {
    loadChallenges()
  }, [filter])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const result = await getChallenges(filter as any)
      
      if (result.success) {
        setChallenges(result.data || [])
      } else {
        console.error('Failed to load challenges:', result.error)
        // Set empty array instead of failing completely
        setChallenges([])
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
      setChallenges([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const result = await joinChallenge(challengeId)
      if (result.success) {
        loadChallenges() // Refresh challenges
      } else {
        console.error('Failed to join challenge:', result.error)
      }
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {filters.map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Challenges List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-600 h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No challenges found</p>
            </div>
          ) : (
            challenges.map((challenge: any) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={() => handleJoinChallenge(challenge.id)}
                getDifficultyColor={getDifficultyColor}
                formatTimeRemaining={formatTimeRemaining}
              />
            ))
          )}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadChallenges()
          }}
        />
      )}
    </div>
  )
}

// Challenge Card Component
function ChallengeCard({ challenge, onJoin, getDifficultyColor, formatTimeRemaining }: any) {
  const { user } = useAuth()
  const isParticipating = challenge.participants?.some((p: any) => p.userId === user?.id)
  const userProgress = challenge.participants?.find((p: any) => p.userId === user?.id)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold">{challenge.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">{challenge.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {challenge.participants?.length || 0} participants
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatTimeRemaining(challenge.endDate)}
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {challenge.target} {challenge.unit}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isParticipating ? (
            <button
              onClick={onJoin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Challenge
            </button>
          ) : (
            <div className="text-right">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                Joined
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Progress: {userProgress?.progress || 0}/{challenge.target}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      {isParticipating && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Your Progress</span>
            <span>{Math.round(((userProgress?.progress || 0) / challenge.target) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((userProgress?.progress || 0) / challenge.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Top Participants */}
      {challenge.participants?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium mb-2">Top Participants</div>
          <div className="flex items-center space-x-3">
            {challenge.participants
              .sort((a: any, b: any) => b.progress - a.progress)
              .slice(0, 5)
              .map((participant: any) => (
                <div key={participant.userId} className="flex items-center">
                  {participant.userAvatar ? (
                    <img
                      src={participant.userAvatar}
                      alt={participant.userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Create Challenge Modal Component
function CreateChallengeModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workout_count',
    target: 10,
    unit: 'workouts',
    durationDays: 7,
    isPublic: true
  })
  const [loading, setLoading] = useState(false)

  const challengeTypes = [
    { id: 'workout_count', label: 'Workout Count', unit: 'workouts' },
    { id: 'total_weight', label: 'Total Weight', unit: 'lbs' },
    { id: 'duration', label: 'Duration', unit: 'minutes' },
    { id: 'streak', label: 'Streak', unit: 'days' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createChallenge(
        formData.title,
        formData.description,
        formData.type as any,
        formData.target,
        formData.unit,
        formData.durationDays,
        formData.isPublic
      )

      if (result.success) {
        onSuccess()
      } else {
        console.error('Failed to create challenge:', result.error)
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Create New Challenge</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => {
                const selectedType = challengeTypes.find(t => t.id === e.target.value)
                setFormData({ 
                  ...formData, 
                  type: e.target.value,
                  unit: selectedType?.unit || 'workouts'
                })
              }}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              {challengeTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duration (days)</label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this challenge public
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Friends Tab Component
function FriendsTab() {
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFriend, setShowAddFriend] = useState(false)

  useEffect(() => {
    loadFriendsData()
  }, [])

  const loadFriendsData = async () => {
    try {
      setLoading(true)
      const [friendsResult, requestsResult] = await Promise.all([
        getFriends(),
        getFriendRequests()
      ])

      if (friendsResult.success) {
        setFriends(friendsResult.data || [])
      } else {
        console.error('Failed to load friends:', friendsResult.error)
        setFriends([])
      }
      
      if (requestsResult.success) {
        setFriendRequests(requestsResult.data || [])
      } else {
        console.error('Failed to load friend requests:', requestsResult.error)
        setFriendRequests([])
      }
    } catch (error) {
      console.error('Error loading friends data:', error)
      setFriends([])
      setFriendRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, response: 'accept' | 'decline') => {
    try {
      const result = await respondToFriendRequest(requestId, response)
      if (result.success) {
        loadFriendsData() // Refresh data
      }
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Friends</h3>
        <button
          onClick={() => setShowAddFriend(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </button>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
          <h4 className="font-medium mb-3">Friend Requests</h4>
          <div className="space-y-3">
            {friendRequests.map((request: any) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  {request.fromUserAvatar ? (
                    <img
                      src={request.fromUserAvatar}
                      alt={request.fromUserName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="font-medium">{request.fromUserName}</div>
                    <div className="text-sm text-gray-500">{request.fromUserEmail}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'decline')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-600 h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No friends yet. Add some friends to get started!</p>
            </div>
          ) : (
            friends.map((friend: any) => (
              <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  {friend.friendAvatar ? (
                    <img
                      src={friend.friendAvatar}
                      alt={friend.friendName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="font-medium">{friend.friendName}</div>
                    <div className="text-sm text-gray-500">{friend.friendEmail}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Friends since {new Date(friend.acceptedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onSuccess={() => {
            setShowAddFriend(false)
            loadFriendsData()
          }}
        />
      )}
    </div>
  )
}

// Add Friend Modal Component
function AddFriendModal({ onClose, onSuccess }: any) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendFriendRequest(email)
      if (result.success) {
        onSuccess()
      } else {
        console.error('Failed to send friend request:', result.error)
        alert(`Failed to send friend request: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      alert('Error sending friend request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Add Friend</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Friend's Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="Enter friend's email address"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Shared Workouts Tab Component
function SharedWorkoutsTab() {
  const [sharedWorkouts, setSharedWorkouts] = useState<any[]>([])
  const [filter, setFilter] = useState('public')
  const [loading, setLoading] = useState(true)

  const filters = [
    { id: 'public', label: 'Public' },
    { id: 'friends', label: 'Friends' },
    { id: 'my', label: 'My Shared' }
  ]

  useEffect(() => {
    loadSharedWorkouts()
  }, [filter])

  const loadSharedWorkouts = async () => {
    try {
      setLoading(true)
      const result = await getSharedWorkouts(filter as any)
      
      if (result.success) {
        setSharedWorkouts(result.data || [])
      }
    } catch (error) {
      console.error('Error loading shared workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (workoutId: string, isLiked: boolean) => {
    try {
      const result = isLiked 
        ? await unlikeWorkout(workoutId)
        : await likeWorkout(workoutId)
      
      if (result.success) {
        loadSharedWorkouts() // Refresh workouts
      }
    } catch (error) {
      console.error('Error liking workout:', error)
    }
  }

  const handleComment = async (workoutId: string, comment: string) => {
    try {
      const result = await commentOnWorkout(workoutId, comment)
      if (result.success) {
        loadSharedWorkouts() // Refresh workouts
      }
    } catch (error) {
      console.error('Error commenting on workout:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {filters.map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shared Workouts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-600 h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sharedWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No shared workouts found</p>
            </div>
          ) : (
            sharedWorkouts.map((workout: any) => (
              <SharedWorkoutCard
                key={workout.id}
                workout={workout}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Shared Workout Card Component
function SharedWorkoutCard({ workout, onLike, onComment }: any) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Check if current user has liked this workout
    const userLike = workout.likes?.find((like: any) => like.userId === user?.id)
    setIsLiked(!!userLike)
  }, [workout.likes, user?.id])

  const handleLikeClick = () => {
    onLike(workout.id, isLiked)
    setIsLiked(!isLiked)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onComment(workout.id, newComment)
      setNewComment('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {workout.sharedByAvatar ? (
            <img
              src={workout.sharedByAvatar}
              alt={workout.sharedByName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div className="ml-3">
            <div className="font-medium">{workout.sharedByName}</div>
            <div className="text-sm text-gray-500">
              {new Date(workout.shareDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Workout Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{workout.workoutName}</h3>
        {workout.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-3">{workout.description}</p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {workout.duration ? `${workout.duration} min` : 'N/A'}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            {workout.workoutData?.exercises?.length || 0} exercises
          </div>
          {workout.difficulty && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              workout.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              workout.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {workout.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {workout.tags && workout.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {workout.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{workout.likes?.length || 0}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{workout.comments?.length || 0}</span>
          </button>
        </div>
        
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Use Workout
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {workout.comments?.map((comment: any) => (
              <div key={comment.id} className="flex items-start space-x-3">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.commentedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
