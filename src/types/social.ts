// Social & Community Feature Types

export interface Friend {
  id: string
  userId: string
  friendId: string
  friendName: string
  friendEmail: string
  friendAvatar?: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: string
  acceptedAt?: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  fromUserAvatar?: string
  toUserId: string
  toUserName: string
  toUserEmail: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  respondedAt?: string
}

export interface SharedWorkout {
  id: string
  originalWorkoutId: string
  sharedBy: string
  sharedByName: string
  sharedByAvatar?: string
  workoutName: string
  workoutData: any // Full workout data
  description?: string
  isPublic: boolean
  shareDate: string
  likes: WorkoutLike[]
  comments: WorkoutComment[]
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  category?: string
}

export interface WorkoutLike {
  id: string
  workoutId: string
  userId: string
  userName: string
  userAvatar?: string
  createdAt: string
}

export interface WorkoutComment {
  id: string
  workoutId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  updatedAt?: string
  parentCommentId?: string // For replies
  replies?: WorkoutComment[]
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  metric: string
  value: number
  rank: number
  trend?: 'up' | 'down' | 'same'
  previousRank?: number
}

export interface Leaderboard {
  id: string
  type: 'workout_count' | 'total_weight' | 'workout_streak' | 'calories_burned' | 'weekly_volume'
  period: 'weekly' | 'monthly' | 'all_time'
  title: string
  description: string
  entries: LeaderboardEntry[]
  lastUpdated: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'workout_count' | 'total_weight' | 'exercise_specific' | 'duration' | 'streak'
  target: number
  unit: string
  startDate: string
  endDate: string
  createdBy: string
  createdByName: string
  isPublic: boolean
  participants: ChallengeParticipant[]
  rules?: string[]
  rewards?: string[]
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface ChallengeParticipant {
  userId: string
  userName: string
  userAvatar?: string
  progress: number
  rank: number
  joinedAt: string
  lastUpdated: string
  completed: boolean
  completedAt?: string
}

export interface UserSocialStats {
  userId: string
  friendsCount: number
  followersCount: number
  followingCount: number
  sharedWorkoutsCount: number
  totalLikesReceived: number
  totalCommentsReceived: number
  activeChallenges: number
  completedChallenges: number
  currentStreak: number
  bestStreak: number
  averageWorkoutsPerWeek: number
  lastActiveAt: string
}

export interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  type: 'workout_completed' | 'workout_shared' | 'challenge_completed' | 'achievement_unlocked' | 'friend_added'
  action: string
  metadata?: any
  isPublic: boolean
  createdAt: string
}

export interface SocialFeed {
  activities: Activity[]
  hasMore: boolean
  nextCursor?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  isPublic: boolean
  shareWorkouts: boolean
  allowFriendRequests: boolean
  showOnLeaderboards: boolean
  createdAt: string
  lastActiveAt: string
}

// API Response Types
export interface SocialResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FriendshipResponse extends SocialResponse {
  data?: {
    friend: Friend
    mutualFriends?: number
  }
}

export interface LeaderboardResponse extends SocialResponse {
  data?: {
    leaderboard: Leaderboard
    userRank?: number
  }
}

export interface ChallengeResponse extends SocialResponse {
  data?: {
    challenge: Challenge
    userParticipation?: ChallengeParticipant
  }
}

export interface SharedWorkoutResponse extends SocialResponse {
  data?: {
    sharedWorkout: SharedWorkout
    userInteraction?: {
      liked: boolean
      bookmarked: boolean
    }
  }
}
