'use client'

import { useState, useEffect } from 'react'
import { 
  shareWorkout, 
  getSharedWorkouts, 
  likeWorkout, 
  unlikeWorkout, 
  addWorkoutComment 
} from '@/lib/social.action'
import { SharedWorkout } from '@/types/social'
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  User, 
  Clock, 
  Target,
  Send,
  Bookmark,
  Calendar
} from 'lucide-react'

export default function SharedWorkouts() {
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadSharedWorkouts()
  }, [])

  const loadSharedWorkouts = async () => {
    setLoading(true)
    try {
      const result = await getSharedWorkouts(20)
      if (result.success) {
        setSharedWorkouts(result.data || [])
      }
    } catch (error) {
      console.error('Error loading shared workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLikeWorkout = async (workoutId: string, isLiked: boolean) => {
    try {
      const result = isLiked ? await unlikeWorkout(workoutId) : await likeWorkout(workoutId)
      if (result.success) {
        // Update local state
        setSharedWorkouts(prev => 
          prev.map(workout => 
            workout.id === workoutId 
              ? { ...workout, likes: isLiked 
                  ? workout.likes.filter(like => like.userId !== 'current_user') // Simplified
                  : [...workout.likes, { id: 'temp', workoutId, userId: 'current_user', userName: 'You', createdAt: new Date().toISOString() }]
                }
              : workout
          )
        )
      }
    } catch (error) {
      console.error('Error liking workout:', error)
    }
  }

  const handleAddComment = async (workoutId: string) => {
    const comment = newComment[workoutId]?.trim()
    if (!comment) return

    setCommentLoading(workoutId)
    try {
      const result = await addWorkoutComment(workoutId, comment)
      if (result.success) {
        // Update local state
        setSharedWorkouts(prev => 
          prev.map(workout => 
            workout.id === workoutId 
              ? { ...workout, comments: [...workout.comments, result.data] }
              : workout
          )
        )
        setNewComment(prev => ({ ...prev, [workoutId]: '' }))
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getExerciseCount = (workoutData: any) => {
    return workoutData?.exercises?.length || 0
  }

  const getTotalSets = (workoutData: any) => {
    return workoutData?.exercises?.reduce((total: number, exercise: any) => 
      total + (exercise.sets?.length || 0), 0
    ) || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
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
              <Share2 className="mr-3 h-6 w-6 text-blue-600" />
              Shared Workouts
            </h1>
            <p className="text-gray-600 mt-1">
              Discover and get inspired by workouts shared by the community
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {sharedWorkouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Share2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No shared workouts yet.</p>
                <p className="text-sm mt-2">Be the first to share your workout with the community!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sharedWorkouts.map(workout => (
                  <div key={workout.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                          {workout.sharedByAvatar ? (
                            <img 
                              src={workout.sharedByAvatar} 
                              alt={workout.sharedByName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            workout.sharedByName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{workout.sharedByName}</h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(workout.shareDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {workout.difficulty && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workout.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          workout.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {workout.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Workout Title and Description */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{workout.workoutName}</h2>
                      {workout.description && (
                        <p className="text-gray-600 mb-3">{workout.description}</p>
                      )}
                    </div>

                    {/* Workout Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Target className="h-4 w-4 mr-1" />
                          Exercises
                        </div>
                        <p className="font-semibold text-gray-900">{getExerciseCount(workout.workoutData)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Duration
                        </div>
                        <p className="font-semibold text-gray-900">
                          {workout.duration ? formatDuration(workout.duration) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <User className="h-4 w-4 mr-1" />
                          Sets
                        </div>
                        <p className="font-semibold text-gray-900">{getTotalSets(workout.workoutData)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Target className="h-4 w-4 mr-1" />
                          Category
                        </div>
                        <p className="font-semibold text-gray-900">{workout.category || 'General'}</p>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    {workout.workoutData?.exercises && workout.workoutData.exercises.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Exercises</h4>
                        <div className="space-y-2">
                          {workout.workoutData.exercises.slice(0, 3).map((exercise: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{exercise.name}</span>
                              <span className="text-gray-500">
                                {exercise.sets?.length || 0} sets
                              </span>
                            </div>
                          ))}
                          {workout.workoutData.exercises.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{workout.workoutData.exercises.length - 3} more exercises
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {workout.tags && workout.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {workout.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLikeWorkout(workout.id, workout.likes.some(like => like.userId === 'current_user'))}
                          className={`flex items-center space-x-1 text-sm ${
                            workout.likes.some(like => like.userId === 'current_user')
                              ? 'text-red-600'
                              : 'text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${workout.likes.some(like => like.userId === 'current_user') ? 'fill-current' : ''}`} />
                          <span>{workout.likes.length}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                          <MessageCircle className="h-4 w-4" />
                          <span>{workout.comments.length}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600">
                          <Bookmark className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments */}
                    {workout.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                        <div className="space-y-3">
                          {workout.comments.slice(0, 3).map(comment => (
                            <div key={comment.id} className="flex items-start space-x-3">
                              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                                {comment.userAvatar ? (
                                  <img 
                                    src={comment.userAvatar} 
                                    alt={comment.userName}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  comment.userName.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {workout.comments.length > 3 && (
                            <p className="text-sm text-gray-500 ml-9">
                              +{workout.comments.length - 3} more comments
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newComment[workout.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [workout.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(workout.id)}
                        />
                        <button
                          onClick={() => handleAddComment(workout.id)}
                          disabled={commentLoading === workout.id || !newComment[workout.id]?.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {commentLoading === workout.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
