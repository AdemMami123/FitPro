'use server'

import { db } from '@/firebase/admin'
import { getCurrentUser } from './auth.action'
import { cookies } from 'next/headers'

async function verifyUserSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return null
    }

    const decodedClaims = await import('@/firebase/admin').then(m => m.auth.verifySessionCookie(sessionCookie, true))
    return decodedClaims
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

// Social Types
export interface SocialUser {
  id: string
  name: string
  email: string
  avatar?: string
  stats?: {
    totalWorkouts: number
    totalVolume: number
    streak: number
    level: number
  }
}

export interface SharedWorkout {
  id: string
  workoutId: string
  userId: string
  userName: string
  userAvatar?: string
  workoutName: string
  exercises: any[]
  notes?: string
  likes: number
  comments: number
  sharedAt: string
  isPublic: boolean
  tags?: string[]
}

export interface WorkoutComment {
  id: string
  workoutId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  replies?: WorkoutComment[]
}

export interface WorkoutLike {
  id: string
  workoutId: string
  userId: string
  userName: string
  likedAt: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar?: string
  toUserId: string
  toUserName: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface Friendship {
  id: string
  userId1: string
  userId2: string
  createdAt: string
  status: 'active' | 'blocked'
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'workout_count' | 'total_volume' | 'streak' | 'custom'
  target: number
  unit: string
  startDate: string
  endDate: string
  createdBy: string
  participants: string[]
  isPublic: boolean
  prize?: string
  tags?: string[]
  status: 'upcoming' | 'active' | 'completed'
}

export interface ChallengeParticipant {
  id: string
  challengeId: string
  userId: string
  userName: string
  userAvatar?: string
  progress: number
  joinedAt: string
  completedAt?: string
  rank?: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  userAvatar?: string
  score: number
  rank: number
  change: number // +1, -1, 0 for rank change
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  metric: 'workouts' | 'volume' | 'streak' | 'challenges'
}

// =================
// WORKOUT SHARING
// =================

export async function shareWorkout(workoutId: string, notes?: string, tags?: string[]) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the workout details
    const workoutDoc = await db.collection('workouts').doc(workoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }

    const workoutData = workoutDoc.data()
    if (!workoutData || workoutData.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Create shared workout
    const sharedWorkoutData: Omit<SharedWorkout, 'id'> = {
      workoutId,
      userId: user.id,
      userName: user.name,
      workoutName: workoutData.name || 'Unnamed Workout',
      exercises: workoutData.exercises || [],
      notes: notes || workoutData.notes || '',
      likes: 0,
      comments: 0,
      sharedAt: new Date().toISOString(),
      isPublic: true,
      tags: tags || []
    }

    const sharedWorkoutRef = await db.collection('sharedWorkouts').add(sharedWorkoutData)
    
    return { success: true, sharedWorkoutId: sharedWorkoutRef.id }
  } catch (error) {
    console.error('Error sharing workout:', error)
    return { success: false, error: 'Failed to share workout' }
  }
}

export async function getSharedWorkouts(limit: number = 20, lastDoc?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    let query = db.collection('sharedWorkouts')
      .where('isPublic', '==', true)
      .orderBy('sharedAt', 'desc')
      .limit(limit)

    if (lastDoc) {
      const lastDocRef = await db.collection('sharedWorkouts').doc(lastDoc).get()
      if (lastDocRef.exists) {
        query = query.startAfter(lastDocRef)
      }
    }

    const snapshot = await query.get()
    const sharedWorkouts: SharedWorkout[] = []

    snapshot.forEach(doc => {
      sharedWorkouts.push({ id: doc.id, ...doc.data() } as SharedWorkout)
    })

    return { success: true, sharedWorkouts }
  } catch (error) {
    console.error('Error fetching shared workouts:', error)
    return { success: false, error: 'Failed to fetch shared workouts' }
  }
}

export async function unshareWorkout(sharedWorkoutId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const sharedWorkoutDoc = await db.collection('sharedWorkouts').doc(sharedWorkoutId).get()
    if (!sharedWorkoutDoc.exists) {
      return { success: false, error: 'Shared workout not found' }
    }

    const sharedWorkoutData = sharedWorkoutDoc.data()
    if (sharedWorkoutData?.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await db.collection('sharedWorkouts').doc(sharedWorkoutId).delete()
    
    return { success: true }
  } catch (error) {
    console.error('Error unsharing workout:', error)
    return { success: false, error: 'Failed to unshare workout' }
  }
}

// =================
// LIKES & COMMENTS
// =================

export async function likeWorkout(sharedWorkoutId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if already liked
    const existingLike = await db.collection('workoutLikes')
      .where('workoutId', '==', sharedWorkoutId)
      .where('userId', '==', user.id)
      .get()

    if (!existingLike.empty) {
      return { success: false, error: 'Already liked' }
    }

    // Add like
    const likeData: Omit<WorkoutLike, 'id'> = {
      workoutId: sharedWorkoutId,
      userId: user.id,
      userName: user.name,
      likedAt: new Date().toISOString()
    }

    await db.collection('workoutLikes').add(likeData)

    // Update like count
    await db.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      likes: require('firebase-admin').firestore.FieldValue.increment(1)
    })

    return { success: true }
  } catch (error) {
    console.error('Error liking workout:', error)
    return { success: false, error: 'Failed to like workout' }
  }
}

export async function unlikeWorkout(sharedWorkoutId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find and remove like
    const likeQuery = await db.collection('workoutLikes')
      .where('workoutId', '==', sharedWorkoutId)
      .where('userId', '==', user.id)
      .get()

    if (likeQuery.empty) {
      return { success: false, error: 'Like not found' }
    }

    await likeQuery.docs[0].ref.delete()

    // Update like count
    await db.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      likes: require('firebase-admin').firestore.FieldValue.increment(-1)
    })

    return { success: true }
  } catch (error) {
    console.error('Error unliking workout:', error)
    return { success: false, error: 'Failed to unlike workout' }
  }
}

export async function addWorkoutComment(sharedWorkoutId: string, content: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const commentData: Omit<WorkoutComment, 'id'> = {
      workoutId: sharedWorkoutId,
      userId: user.id,
      userName: user.name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    }

    await db.collection('workoutComments').add(commentData)

    // Update comment count
    await db.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      comments: require('firebase-admin').firestore.FieldValue.increment(1)
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}

export async function getWorkoutComments(sharedWorkoutId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const commentsSnapshot = await db.collection('workoutComments')
      .where('workoutId', '==', sharedWorkoutId)
      .orderBy('createdAt', 'desc')
      .get()

    const comments: WorkoutComment[] = []
    commentsSnapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() } as WorkoutComment)
    })

    return { success: true, comments }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: 'Failed to fetch comments' }
  }
}

// =================
// FRIEND SYSTEM
// =================

export async function sendFriendRequest(toUserId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (user.id === toUserId) {
      return { success: false, error: 'Cannot send friend request to yourself' }
    }

    // Check if request already exists
    const existingRequest = await db.collection('friendRequests')
      .where('fromUserId', '==', user.id)
      .where('toUserId', '==', toUserId)
      .get()

    if (!existingRequest.empty) {
      return { success: false, error: 'Friend request already sent' }
    }

    // Check if already friends
    const existingFriendship = await db.collection('friendships')
      .where('userId1', 'in', [user.id, toUserId])
      .where('userId2', 'in', [user.id, toUserId])
      .get()

    if (!existingFriendship.empty) {
      return { success: false, error: 'Already friends' }
    }

    // Get target user info
    const targetUser = await db.collection('users').doc(toUserId).get()
    if (!targetUser.exists) {
      return { success: false, error: 'User not found' }
    }

    const targetUserData = targetUser.data()

    // Create friend request
    const friendRequestData: Omit<FriendRequest, 'id'> = {
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      toUserName: targetUserData?.name || 'Unknown',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('friendRequests').add(friendRequestData)

    return { success: true }
  } catch (error) {
    console.error('Error sending friend request:', error)
    return { success: false, error: 'Failed to send friend request' }
  }
}

export async function respondToFriendRequest(requestId: string, response: 'accepted' | 'rejected') {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const requestDoc = await db.collection('friendRequests').doc(requestId).get()
    if (!requestDoc.exists) {
      return { success: false, error: 'Friend request not found' }
    }

    const requestData = requestDoc.data() as FriendRequest
    if (requestData.toUserId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update request status
    await db.collection('friendRequests').doc(requestId).update({
      status: response,
      updatedAt: new Date().toISOString()
    })

    // If accepted, create friendship
    if (response === 'accepted') {
      const friendshipData: Omit<Friendship, 'id'> = {
        userId1: requestData.fromUserId,
        userId2: requestData.toUserId,
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      await db.collection('friendships').add(friendshipData)
    }

    return { success: true }
  } catch (error) {
    console.error('Error responding to friend request:', error)
    return { success: false, error: 'Failed to respond to friend request' }
  }
}

export async function getFriendRequests() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const requestsSnapshot = await db.collection('friendRequests')
      .where('toUserId', '==', user.id)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get()

    const requests: FriendRequest[] = []
    requestsSnapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() } as FriendRequest)
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return { success: false, error: 'Failed to fetch friend requests' }
  }
}

export async function getFriends() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const friendshipsSnapshot = await db.collection('friendships')
      .where('userId1', '==', user.id)
      .where('status', '==', 'active')
      .get()

    const friendshipsSnapshot2 = await db.collection('friendships')
      .where('userId2', '==', user.id)
      .where('status', '==', 'active')
      .get()

    const friendIds = new Set<string>()
    friendshipsSnapshot.forEach(doc => {
      const data = doc.data()
      friendIds.add(data.userId2)
    })
    friendshipsSnapshot2.forEach(doc => {
      const data = doc.data()
      friendIds.add(data.userId1)
    })

    // Get friend user details
    const friends: SocialUser[] = []
    if (friendIds.size > 0) {
      const friendsSnapshot = await db.collection('users')
        .where('id', 'in', Array.from(friendIds))
        .get()

      friendsSnapshot.forEach(doc => {
        friends.push({ id: doc.id, ...doc.data() } as SocialUser)
      })
    }

    return { success: true, friends }
  } catch (error) {
    console.error('Error fetching friends:', error)
    return { success: false, error: 'Failed to fetch friends' }
  }
}

export async function removeFriend(friendId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Find and remove friendship
    const friendshipQuery = await db.collection('friendships')
      .where('userId1', 'in', [user.id, friendId])
      .where('userId2', 'in', [user.id, friendId])
      .get()

    if (friendshipQuery.empty) {
      return { success: false, error: 'Friendship not found' }
    }

    await friendshipQuery.docs[0].ref.delete()

    return { success: true }
  } catch (error) {
    console.error('Error removing friend:', error)
    return { success: false, error: 'Failed to remove friend' }
  }
}

// =================
// CHALLENGES
// =================

export async function createChallenge(challengeData: Omit<Challenge, 'id' | 'createdBy' | 'participants'>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const challenge: Omit<Challenge, 'id'> = {
      ...challengeData,
      createdBy: user.id,
      participants: [user.id]
    }

    const challengeRef = await db.collection('challenges').add(challenge)

    // Add creator as participant
    const participantData: Omit<ChallengeParticipant, 'id'> = {
      challengeId: challengeRef.id,
      userId: user.id,
      userName: user.name,
      progress: 0,
      joinedAt: new Date().toISOString()
    }

    await db.collection('challengeParticipants').add(participantData)

    return { success: true, challengeId: challengeRef.id }
  } catch (error) {
    console.error('Error creating challenge:', error)
    return { success: false, error: 'Failed to create challenge' }
  }
}

export async function joinChallenge(challengeId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if already joined
    const existingParticipant = await db.collection('challengeParticipants')
      .where('challengeId', '==', challengeId)
      .where('userId', '==', user.id)
      .get()

    if (!existingParticipant.empty) {
      return { success: false, error: 'Already joined challenge' }
    }

    // Add participant
    const participantData: Omit<ChallengeParticipant, 'id'> = {
      challengeId,
      userId: user.id,
      userName: user.name,
      progress: 0,
      joinedAt: new Date().toISOString()
    }

    await db.collection('challengeParticipants').add(participantData)

    // Update challenge participants list
    await db.collection('challenges').doc(challengeId).update({
      participants: require('firebase-admin').firestore.FieldValue.arrayUnion(user.id)
    })

    return { success: true }
  } catch (error) {
    console.error('Error joining challenge:', error)
    return { success: false, error: 'Failed to join challenge' }
  }
}

export async function getChallenges(type: 'active' | 'upcoming' | 'completed' = 'active') {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const challengesSnapshot = await db.collection('challenges')
      .where('status', '==', type)
      .where('isPublic', '==', true)
      .orderBy('startDate', 'desc')
      .get()

    const challenges: Challenge[] = []
    challengesSnapshot.forEach(doc => {
      challenges.push({ id: doc.id, ...doc.data() } as Challenge)
    })

    return { success: true, challenges }
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return { success: false, error: 'Failed to fetch challenges' }
  }
}

export async function getChallengeParticipants(challengeId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const participantsSnapshot = await db.collection('challengeParticipants')
      .where('challengeId', '==', challengeId)
      .orderBy('progress', 'desc')
      .get()

    const participants: ChallengeParticipant[] = []
    participantsSnapshot.docs.forEach((doc, index) => {
      participants.push({ 
        id: doc.id, 
        ...doc.data(), 
        rank: index + 1 
      } as ChallengeParticipant)
    })

    return { success: true, participants }
  } catch (error) {
    console.error('Error fetching challenge participants:', error)
    return { success: false, error: 'Failed to fetch challenge participants' }
  }
}

// =================
// LEADERBOARDS
// =================

export async function getLeaderboard(
  period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly',
  metric: 'workouts' | 'volume' | 'streak' | 'challenges' = 'workouts'
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // This is a simplified implementation
    // In a real app, you'd have a more complex aggregation system
    const leaderboardSnapshot = await db.collection('leaderboard')
      .where('period', '==', period)
      .where('metric', '==', metric)
      .orderBy('score', 'desc')
      .limit(100)
      .get()

    const leaderboard: LeaderboardEntry[] = []
    leaderboardSnapshot.docs.forEach((doc, index) => {
      leaderboard.push({ 
        ...doc.data(), 
        rank: index + 1 
      } as LeaderboardEntry)
    })

    return { success: true, leaderboard }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return { success: false, error: 'Failed to fetch leaderboard' }
  }
}

export async function searchUsers(query: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Simple search by name - in production, use more sophisticated search
    const usersSnapshot = await db.collection('users')
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .limit(20)
      .get()

    const users: SocialUser[] = []
    usersSnapshot.forEach(doc => {
      if (doc.id !== user.id) { // Exclude current user
        users.push({ id: doc.id, ...doc.data() } as SocialUser)
      }
    })

    return { success: true, users }
  } catch (error) {
    console.error('Error searching users:', error)
    return { success: false, error: 'Failed to search users' }
  }
}
