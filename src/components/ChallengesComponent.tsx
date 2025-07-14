'use client'

import { useState, useEffect } from 'react'
import { 
  createChallenge, 
  joinChallenge, 
  leaveChallenge, 
  getChallenges 
} from '@/lib/challenges.action'
import { Challenge, ChallengeParticipant } from '@/types/social'
import { 
  Target, 
  Users, 
  Calendar, 
  Plus, 
  Trophy,
  Timer,
  Weight,
  Flame,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function ChallengesComponent() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'my'>('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Create challenge form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'workout_count' as Challenge['type'],
    target: 10,
    unit: 'workouts',
    durationDays: 7,
    isPublic: true,
    rules: [''],
    rewards: ['']
  })

  useEffect(() => {
    loadChallenges()
  }, [activeTab])

  const loadChallenges = async () => {
    setLoading(true)
    try {
      const result = await getChallenges(activeTab)
      if (result.success) {
        setChallenges(result.data || [])
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const result = await createChallenge(
        newChallenge.title,
        newChallenge.description,
        newChallenge.type,
        newChallenge.target,
        newChallenge.unit,
        newChallenge.durationDays,
        newChallenge.isPublic,
        newChallenge.rules.filter(rule => rule.trim()),
        newChallenge.rewards.filter(reward => reward.trim())
      )

      if (result.success) {
        setShowCreateModal(false)
        setNewChallenge({
          title: '',
          description: '',
          type: 'workout_count',
          target: 10,
          unit: 'workouts',
          durationDays: 7,
          isPublic: true,
          rules: [''],
          rewards: ['']
        })
        loadChallenges()
        alert('Challenge created successfully!')
      } else {
        alert(result.error || 'Failed to create challenge')
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
      alert('Failed to create challenge')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const result = await joinChallenge(challengeId)
      if (result.success) {
        loadChallenges()
        alert('Successfully joined challenge!')
      } else {
        alert(result.error || 'Failed to join challenge')
      }
    } catch (error) {
      console.error('Error joining challenge:', error)
      alert('Failed to join challenge')
    }
  }

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to leave this challenge?')) return

    try {
      const result = await leaveChallenge(challengeId)
      if (result.success) {
        loadChallenges()
        alert('Successfully left challenge')
      } else {
        alert(result.error || 'Failed to leave challenge')
      }
    } catch (error) {
      console.error('Error leaving challenge:', error)
      alert('Failed to leave challenge')
    }
  }

  const getChallengeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'workout_count':
        return <Activity className="h-5 w-5" />
      case 'total_weight':
        return <Weight className="h-5 w-5" />
      case 'duration':
        return <Timer className="h-5 w-5" />
      case 'streak':
        return <Flame className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100)
  }

  const isUserParticipating = (challenge: Challenge, userId?: string) => {
    return challenge.participants.some(p => p.userId === userId)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Target className="mr-3 h-6 w-6 text-blue-600" />
                  Challenges
                </h1>
                <p className="text-gray-600 mt-1">
                  Join fitness challenges and compete with others
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Challenges
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'my'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Challenges
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {challenges.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No challenges found.</p>
                <p className="text-sm mt-2">
                  {activeTab === 'active' && "No active challenges available."}
                  {activeTab === 'my' && "You haven't joined any challenges yet."}
                  {activeTab === 'completed' && "No completed challenges."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Challenge Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          {getChallengeIcon(challenge.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{challenge.title}</h3>
                          <p className="text-sm text-gray-500">by {challenge.createdByName}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>

                    {/* Challenge Info */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Target className="h-4 w-4 mr-1" />
                        <span>{challenge.target} {challenge.unit}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{getDaysRemaining(challenge.endDate)} days remaining</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{challenge.participants.length} participants</span>
                      </div>
                    </div>

                    {/* Progress Bar (for participating challenges) */}
                    {challenge.participants.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>
                            {challenge.participants[0]?.progress || 0} / {challenge.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getProgressPercentage(challenge.participants[0]?.progress || 0, challenge.target)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Top Participants */}
                    {challenge.participants.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Participants</h4>
                        <div className="space-y-1">
                          {challenge.participants.slice(0, 3).map((participant, index) => (
                            <div key={participant.userId} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-400 mr-2">#{participant.rank}</span>
                                <span className="text-gray-700">{participant.userName}</span>
                              </div>
                              <span className="text-gray-500">{participant.progress}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex space-x-2">
                      {challenge.status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleJoinChallenge(challenge.id)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Join Challenge
                          </button>
                          <button
                            onClick={() => handleLeaveChallenge(challenge.id)}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                          >
                            Leave
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-500 rounded-md text-sm text-center">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as Challenge['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="workout_count">Workout Count</option>
                    <option value="total_weight">Total Weight</option>
                    <option value="duration">Duration</option>
                    <option value="streak">Streak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    value={newChallenge.target}
                    onChange={(e) => setNewChallenge({...newChallenge, target: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={newChallenge.durationDays}
                  onChange={(e) => setNewChallenge({...newChallenge, durationDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newChallenge.isPublic}
                  onChange={(e) => setNewChallenge({...newChallenge, isPublic: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this challenge public
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
