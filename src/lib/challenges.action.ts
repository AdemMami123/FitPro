'use server'

import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'
import { 
  Challenge, 
  ChallengeParticipant, 
  Leaderboard, 
  LeaderboardEntry,
  SocialResponse,
  ChallengeResponse,
  LeaderboardResponse 
} from '@/types/social'

// Initialize Firebase Admin
const auth = getAuth()
const firestore = getFirestore()

// Helper function to get current user
async function getCurrentUser() {
  const sessionCookie = (await cookies()).get('session')?.value

  if (!sessionCookie) {
    throw new Error('No authentication session found')
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
    return decodedClaims
  } catch (error) {
    throw new Error('Invalid session')
  }
}

// Helper function to ensure challenge document has proper structure
async function ensureChallengeStructure(challengeId: string) {
  const challengeRef = firestore.collection('challenges').doc(challengeId)
  const challengeDoc = await challengeRef.get()
  
  if (!challengeDoc.exists) {
    throw new Error('Challenge not found')
  }
  
  const challengeData = challengeDoc.data()
  
  // If participants array doesn't exist, initialize it
  if (!challengeData?.participants) {
    await challengeRef.update({
      participants: []
    })
  }
  
  return challengeData
}

// LEADERBOARD ACTIONS

export async function getLeaderboard(
  type: 'workout_count' | 'total_weight' | 'workout_streak' | 'calories_burned' | 'weekly_volume',
  period: 'weekly' | 'monthly' | 'all_time' = 'weekly'
): Promise<LeaderboardResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Calculate date range for the period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'all_time':
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    }

    // Get all users' workout stats for the period
    const workoutsSnapshot = await firestore
      .collection('workouts')
      .where('date', '>=', startDate.toISOString())
      .get()

    // Calculate stats by user
    const userStats = new Map<string, any>()
    
    for (const doc of workoutsSnapshot.docs) {
      const workout = doc.data()
      const userId = workout.userId
      
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          workoutCount: 0,
          totalWeight: 0,
          workoutStreak: 0,
          caloriesBurned: 0,
          weeklyVolume: 0
        })
      }
      
      const stats = userStats.get(userId)
      stats.workoutCount += 1
      stats.totalWeight += workout.totalWeight || 0
      stats.caloriesBurned += workout.caloriesBurned || 0
      stats.weeklyVolume += workout.duration || 0
    }

    // Calculate streaks (this is simplified - in production you'd want more sophisticated streak calculation)
    for (const [userId, stats] of userStats) {
      const userWorkouts = await firestore
        .collection('workouts')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(30)
        .get()
      
      let streak = 0
      let lastDate = new Date()
      
      for (const workout of userWorkouts.docs) {
        const workoutDate = new Date(workout.data().date)
        const daysDiff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 1) {
          streak++
          lastDate = workoutDate
        } else {
          break
        }
      }
      
      stats.workoutStreak = streak
    }

    // Get user names and avatars
    const entries: LeaderboardEntry[] = []
    
    for (const [userId, stats] of userStats) {
      const userDoc = await firestore.collection('users').doc(userId).get()
      const userData = userDoc.data()
      
      entries.push({
        userId,
        userName: userData?.name || userData?.email || 'Unknown User',
        userAvatar: userData?.avatar,
        metric: type,
        value: stats[type === 'workout_count' ? 'workoutCount' : 
                     type === 'total_weight' ? 'totalWeight' :
                     type === 'workout_streak' ? 'workoutStreak' :
                     type === 'calories_burned' ? 'caloriesBurned' :
                     'weeklyVolume'],
        rank: 0, // Will be set below
        trend: 'same' // Simplified for now
      })
    }

    // Sort by metric value and assign ranks
    entries.sort((a, b) => b.value - a.value)
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Find current user's rank
    const userRank = entries.findIndex(entry => entry.userId === currentUser.uid) + 1

    const leaderboard: Leaderboard = {
      id: `${type}_${period}`,
      type,
      period,
      title: getLeaderboardTitle(type, period),
      description: getLeaderboardDescription(type, period),
      entries: entries.slice(0, 50), // Top 50
      lastUpdated: new Date().toISOString()
    }

    return {
      success: true,
      data: {
        leaderboard,
        userRank: userRank || undefined
      }
    }
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return { success: false, error: 'Failed to load leaderboard' }
  }
}

// CHALLENGE ACTIONS

export async function createChallenge(
  title: string,
  description: string,
  type: 'workout_count' | 'total_weight' | 'exercise_specific' | 'duration' | 'streak',
  target: number,
  unit: string,
  durationDays: number,
  isPublic: boolean = true,
  rules?: string[],
  rewards?: string[]
): Promise<ChallengeResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000))

    const challenge: Omit<Challenge, 'id'> = {
      title,
      description,
      type,
      target,
      unit,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdBy: currentUser.uid,
      createdByName: userData?.name || currentUser.email || '',
      isPublic,
      participants: [],
      rules: rules || [],
      rewards: rewards || [],
      status: 'active',
      category: 'fitness',
      difficulty: target > 100 ? 'hard' : target > 50 ? 'medium' : 'easy'
    }

    const challengeRef = await firestore.collection('challenges').add(challenge)

    return {
      success: true,
      message: 'Challenge created successfully',
      data: {
        challenge: { id: challengeRef.id, ...challenge }
      }
    }
  } catch (error) {
    console.error('Error creating challenge:', error)
    return { success: false, error: 'Failed to create challenge' }
  }
}

export async function joinChallenge(challengeId: string): Promise<ChallengeResponse> {
  try {
    const currentUser = await getCurrentUser()
    console.log('🔄 Joining challenge:', challengeId, 'for user:', currentUser.uid)
    
    // Ensure challenge has proper structure
    console.log('🔧 Ensuring challenge structure...')
    const challengeData = await ensureChallengeStructure(challengeId)
    if (!challengeData) {
      console.log('❌ Challenge data not found')
      return { success: false, error: 'Challenge not found' }
    }
    console.log('✅ Challenge data retrieved:', challengeData.title)
    
    // Check if already participating
    const participants = challengeData.participants || []
    if (participants.some((p: ChallengeParticipant) => p.userId === currentUser.uid)) {
      console.log('⚠️ User already participating')
      return { success: false, error: 'Already participating in this challenge' }
    }

    // Check if challenge is still active
    if (challengeData.endDate && new Date(challengeData.endDate) < new Date()) {
      console.log('⚠️ Challenge has ended')
      return { success: false, error: 'Challenge has ended' }
    }

    // Get user data
    console.log('👤 Getting user data...')
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()
    console.log('✅ User data retrieved:', userData?.name)

    // Create participant object without undefined values
    const participant: any = {
      userId: currentUser.uid,
      userName: userData?.name || currentUser.email || '',
      progress: 0,
      rank: participants.length + 1,
      joinedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completed: false
    }

    // Only add userAvatar if it exists
    if (userData?.avatar) {
      participant.userAvatar = userData.avatar
    }

    console.log('👤 Adding participant:', participant)

    // Add participant to challenge
    await firestore.collection('challenges').doc(challengeId).update({
      participants: FieldValue.arrayUnion(participant)
    })

    console.log('✅ Successfully joined challenge')

    return {
      success: true,
      message: 'Successfully joined challenge',
      data: {
        challenge: { ...challengeData as Challenge, id: challengeId },
        userParticipation: participant
      }
    }
  } catch (error) {
    console.error('❌ Error joining challenge:', error)
    return { success: false, error: 'Failed to join challenge' }
  }
}

export async function leaveChallenge(challengeId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get challenge
    const challengeDoc = await firestore.collection('challenges').doc(challengeId).get()
    if (!challengeDoc.exists) {
      return { success: false, error: 'Challenge not found' }
    }

    const challengeData = challengeDoc.data() as Challenge
    
    // Find participant
    const participant = challengeData.participants.find(p => p.userId === currentUser.uid)
    if (!participant) {
      return { success: false, error: 'Not participating in this challenge' }
    }

    // Remove participant from challenge
    await firestore.collection('challenges').doc(challengeId).update({
      participants: FieldValue.arrayRemove(participant)
    })

    return { success: true, message: 'Successfully left challenge' }
  } catch (error) {
    console.error('Error leaving challenge:', error)
    return { success: false, error: 'Failed to leave challenge' }
  }
}

export async function updateChallengeProgress(challengeId: string, progress: number): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get challenge
    const challengeDoc = await firestore.collection('challenges').doc(challengeId).get()
    if (!challengeDoc.exists) {
      return { success: false, error: 'Challenge not found' }
    }

    const challengeData = challengeDoc.data() as Challenge
    
    // Find and update participant
    const updatedParticipants = challengeData.participants.map(p => {
      if (p.userId === currentUser.uid) {
        return {
          ...p,
          progress,
          lastUpdated: new Date().toISOString(),
          completed: progress >= challengeData.target,
          completedAt: progress >= challengeData.target ? new Date().toISOString() : undefined
        }
      }
      return p
    })

    // Sort by progress and update ranks
    updatedParticipants.sort((a, b) => b.progress - a.progress)
    updatedParticipants.forEach((p, index) => {
      p.rank = index + 1
    })

    // Update challenge
    await firestore.collection('challenges').doc(challengeId).update({
      participants: updatedParticipants
    })

    return { success: true, message: 'Progress updated successfully' }
  } catch (error) {
    console.error('Error updating challenge progress:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}

export async function getChallenges(filter: 'active' | 'completed' | 'my' = 'active'): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    let query = firestore.collection('challenges').orderBy('startDate', 'desc')
    
    if (filter === 'active') {
      query = query.where('status', '==', 'active')
    } else if (filter === 'completed') {
      query = query.where('status', '==', 'completed')
    }

    const challengesSnapshot = await query.limit(50).get()
    
    let challenges = challengesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Challenge & { id: string })[]

    // Filter for user's challenges if requested
    if (filter === 'my') {
      challenges = challenges.filter(challenge => 
        challenge.createdBy === currentUser.uid ||
        (challenge.participants && challenge.participants.some((p: ChallengeParticipant) => p.userId === currentUser.uid))
      )
    }

    return { success: true, data: challenges }
  } catch (error) {
    console.error('Error getting challenges:', error)
    return { success: false, error: 'Failed to load challenges' }
  }
}

// FRIEND SYSTEM ACTIONS

export async function sendFriendRequest(friendEmail: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Find friend by email
    const usersSnapshot = await firestore
      .collection('users')
      .where('email', '==', friendEmail)
      .limit(1)
      .get()
    
    if (usersSnapshot.empty) {
      return { success: false, error: 'User not found' }
    }
    
    const friendDoc = usersSnapshot.docs[0]
    const friendData = friendDoc.data()
    const friendId = friendDoc.id
    
    // Check if they're already friends
    const existingFriendship = await firestore
      .collection('friends')
      .where('userId', '==', currentUser.uid)
      .where('friendId', '==', friendId)
      .get()
    
    if (!existingFriendship.empty) {
      return { success: false, error: 'Already friends or request pending' }
    }
    
    // Check if friend request already exists
    const existingRequest = await firestore
      .collection('friendRequests')
      .where('fromUserId', '==', currentUser.uid)
      .where('toUserId', '==', friendId)
      .where('status', '==', 'pending')
      .get()
    
    if (!existingRequest.empty) {
      return { success: false, error: 'Friend request already sent' }
    }
    
    // Get current user data
    const currentUserDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const currentUserData = currentUserDoc.data()
    
    // Create friend request
    const friendRequest = {
      fromUserId: currentUser.uid,
      fromUserName: currentUserData?.name || currentUser.email || '',
      fromUserEmail: currentUser.email || '',
      fromUserAvatar: currentUserData?.avatar,
      toUserId: friendId,
      toUserName: friendData.name || friendData.email || '',
      toUserEmail: friendData.email || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    await firestore.collection('friendRequests').add(friendRequest)
    
    return { success: true, message: 'Friend request sent successfully' }
  } catch (error) {
    console.error('Error sending friend request:', error)
    return { success: false, error: 'Failed to send friend request' }
  }
}

export async function respondToFriendRequest(
  requestId: string, 
  response: 'accept' | 'decline'
): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get friend request
    const requestDoc = await firestore.collection('friendRequests').doc(requestId).get()
    if (!requestDoc.exists) {
      return { success: false, error: 'Friend request not found' }
    }
    
    const requestData = requestDoc.data()
    
    // Verify this request is for current user
    if (requestData?.toUserId !== currentUser.uid) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Update request status
    await firestore.collection('friendRequests').doc(requestId).update({
      status: response === 'accept' ? 'accepted' : 'declined',
      respondedAt: new Date().toISOString()
    })
    
    // If accepted, create friendship
    if (response === 'accept') {
      const now = new Date().toISOString()
      
      // Create friendship for both users
      await Promise.all([
        firestore.collection('friends').add({
          userId: currentUser.uid,
          friendId: requestData.fromUserId,
          friendName: requestData.fromUserName,
          friendEmail: requestData.fromUserEmail,
          friendAvatar: requestData.fromUserAvatar,
          status: 'accepted',
          createdAt: now,
          acceptedAt: now
        }),
        firestore.collection('friends').add({
          userId: requestData.fromUserId,
          friendId: currentUser.uid,
          friendName: requestData.toUserName,
          friendEmail: requestData.toUserEmail,
          friendAvatar: requestData.toUserAvatar,
          status: 'accepted',
          createdAt: now,
          acceptedAt: now
        })
      ])
    }
    
    return { 
      success: true, 
      message: response === 'accept' ? 'Friend request accepted' : 'Friend request declined' 
    }
  } catch (error) {
    console.error('Error responding to friend request:', error)
    return { success: false, error: 'Failed to respond to friend request' }
  }
}

export async function getFriends(): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    const friendsSnapshot = await firestore
      .collection('friends')
      .where('userId', '==', currentUser.uid)
      .where('status', '==', 'accepted')
      .get()
    
    const friends = friendsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: friends }
  } catch (error) {
    console.error('Error getting friends:', error)
    return { success: false, error: 'Failed to load friends' }
  }
}

export async function getFriendRequests(): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    const requestsSnapshot = await firestore
      .collection('friendRequests')
      .where('toUserId', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get()
    
    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: requests }
  } catch (error) {
    console.error('Error getting friend requests:', error)
    return { success: false, error: 'Failed to load friend requests' }
  }
}

// WORKOUT SHARING ACTIONS

export async function shareWorkout(
  workoutId: string,
  description?: string,
  isPublic: boolean = true,
  tags?: string[]
): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get workout data
    const workoutDoc = await firestore.collection('workouts').doc(workoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }
    
    const workoutData = workoutDoc.data()
    
    // Verify ownership
    if (workoutData?.userId !== currentUser.uid) {
      return { success: false, error: 'Can only share your own workouts' }
    }
    
    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()
    
    // Create shared workout
    const sharedWorkout = {
      originalWorkoutId: workoutId,
      sharedBy: currentUser.uid,
      sharedByName: userData?.name || currentUser.email || '',
      sharedByAvatar: userData?.avatar,
      workoutName: workoutData.name,
      workoutData: workoutData,
      description: description || '',
      isPublic,
      shareDate: new Date().toISOString(),
      likes: [],
      comments: [],
      tags: tags || [],
      difficulty: workoutData.difficulty || 'intermediate',
      duration: workoutData.duration,
      category: workoutData.category || 'general'
    }
    
    const sharedWorkoutRef = await firestore.collection('sharedWorkouts').add(sharedWorkout)
    
    return { 
      success: true, 
      message: 'Workout shared successfully',
      data: { id: sharedWorkoutRef.id, ...sharedWorkout }
    }
  } catch (error) {
    console.error('Error sharing workout:', error)
    return { success: false, error: 'Failed to share workout' }
  }
}

export async function getSharedWorkouts(filter: 'public' | 'friends' | 'my' = 'public'): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    let query = firestore
      .collection('sharedWorkouts')
      .orderBy('shareDate', 'desc')
    
    if (filter === 'public') {
      query = query.where('isPublic', '==', true)
    } else if (filter === 'my') {
      query = query.where('sharedBy', '==', currentUser.uid)
    } else if (filter === 'friends') {
      // Get user's friends first
      const friendsSnapshot = await firestore
        .collection('friends')
        .where('userId', '==', currentUser.uid)
        .where('status', '==', 'accepted')
        .get()
      
      const friendIds = friendsSnapshot.docs.map(doc => doc.data().friendId)
      
      if (friendIds.length === 0) {
        return { success: true, data: [] }
      }
      
      // Get shared workouts from friends (Firestore 'in' query limited to 10 items)
      const batches = []
      for (let i = 0; i < friendIds.length; i += 10) {
        const batch = friendIds.slice(i, i + 10)
        const batchQuery = firestore
          .collection('sharedWorkouts')
          .where('sharedBy', 'in', batch)
          .orderBy('shareDate', 'desc')
          .limit(20)
        batches.push(batchQuery.get())
      }
      
      const batchResults = await Promise.all(batches)
      const allDocs = batchResults.flatMap(snapshot => snapshot.docs)
      
      const workouts = allDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort by date
      workouts.sort((a: any, b: any) => 
        new Date(b.shareDate).getTime() - new Date(a.shareDate).getTime()
      )
      
      return { success: true, data: workouts.slice(0, 50) }
    }
    
    const workoutsSnapshot = await query.limit(50).get()
    const workouts = workoutsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { success: true, data: workouts }
  } catch (error) {
    console.error('Error getting shared workouts:', error)
    return { success: false, error: 'Failed to load shared workouts' }
  }
}

export async function likeWorkout(sharedWorkoutId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get shared workout
    const workoutDoc = await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Shared workout not found' }
    }
    
    const workoutData = workoutDoc.data()
    const likes = workoutData?.likes || []
    
    // Check if already liked
    const existingLike = likes.find((like: any) => like.userId === currentUser.uid)
    if (existingLike) {
      return { success: false, error: 'Already liked this workout' }
    }
    
    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()
    
    // Add like
    const newLike = {
      id: `${sharedWorkoutId}_${currentUser.uid}`,
      workoutId: sharedWorkoutId,
      userId: currentUser.uid,
      userName: userData?.name || currentUser.email || '',
      userAvatar: userData?.avatar,
      likedAt: new Date().toISOString()
    }
    
    await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      likes: FieldValue.arrayUnion(newLike)
    })
    
    return { success: true, message: 'Workout liked successfully' }
  } catch (error) {
    console.error('Error liking workout:', error)
    return { success: false, error: 'Failed to like workout' }
  }
}

export async function unlikeWorkout(sharedWorkoutId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get shared workout
    const workoutDoc = await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Shared workout not found' }
    }
    
    const workoutData = workoutDoc.data()
    const likes = workoutData?.likes || []
    
    // Find the like to remove
    const likeToRemove = likes.find((like: any) => like.userId === currentUser.uid)
    if (!likeToRemove) {
      return { success: false, error: 'Not liked yet' }
    }
    
    // Remove like
    await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      likes: FieldValue.arrayRemove(likeToRemove)
    })
    
    return { success: true, message: 'Workout unliked successfully' }
  } catch (error) {
    console.error('Error unliking workout:', error)
    return { success: false, error: 'Failed to unlike workout' }
  }
}

export async function commentOnWorkout(
  sharedWorkoutId: string,
  comment: string
): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get shared workout
    const workoutDoc = await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Shared workout not found' }
    }
    
    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()
    
    // Create comment
    const newComment = {
      id: `${sharedWorkoutId}_${currentUser.uid}_${Date.now()}`,
      workoutId: sharedWorkoutId,
      userId: currentUser.uid,
      userName: userData?.name || currentUser.email || '',
      userAvatar: userData?.avatar,
      comment: comment.trim(),
      commentedAt: new Date().toISOString()
    }
    
    await firestore.collection('sharedWorkouts').doc(sharedWorkoutId).update({
      comments: FieldValue.arrayUnion(newComment)
    })
    
    return { success: true, message: 'Comment added successfully' }
  } catch (error) {
    console.error('Error commenting on workout:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}

// INITIALIZATION FUNCTION FOR DEMO PURPOSES

export async function initializeSocialFeatures(): Promise<SocialResponse> {
  try {
    console.log('🔄 Initializing social features...')
    const currentUser = await getCurrentUser()
    
    // Initialize user document if it doesn't exist
    const userRef = firestore.collection('users').doc(currentUser.uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      console.log('👤 Creating user document...')
      await userRef.set({
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.name || 'User',
        avatar: null,
        createdAt: new Date().toISOString(),
        totalWorkouts: 0,
        totalWeight: 0,
        currentStreak: 0,
        caloriesBurned: 0,
        weeklyVolume: 0,
        friends: [],
        achievements: []
      })
    }

    // Create a sample challenge if none exist
    const challengesSnapshot = await firestore.collection('challenges').limit(1).get()
    
    if (challengesSnapshot.empty) {
      console.log('🏆 Creating sample challenge...')
      const sampleChallenge = {
        title: 'Push-Up Challenge',
        description: 'Complete 100 push-ups in a day',
        type: 'workout' as const,
        target: 100,
        unit: 'reps',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'medium' as const,
        createdBy: currentUser.uid,
        participants: [],
        createdAt: new Date().toISOString(),
        status: 'active' as const,
        category: 'strength',
        reward: 'Push-Up Master Badge'
      }
      
      await firestore.collection('challenges').add(sampleChallenge)
    }

    console.log('✅ Social features initialized successfully')
    return { success: true, message: 'Social features initialized' }
  } catch (error) {
    console.error('❌ Error initializing social features:', error)
    return { success: false, error: 'Failed to initialize social features' }
  }
}

// Helper functions
function getLeaderboardTitle(type: string, period: string): string {
  const typeMap = {
    workout_count: 'Workout Count',
    total_weight: 'Total Weight Lifted',
    workout_streak: 'Workout Streak',
    calories_burned: 'Calories Burned',
    weekly_volume: 'Weekly Volume'
  }
  
  const periodMap = {
    weekly: 'This Week',
    monthly: 'This Month',
    all_time: 'All Time'
  }
  
  return `${typeMap[type as keyof typeof typeMap]} - ${periodMap[period as keyof typeof periodMap]}`
}

function getLeaderboardDescription(type: string, period: string): string {
  const descriptions = {
    workout_count: 'Number of workouts completed',
    total_weight: 'Total weight lifted across all exercises',
    workout_streak: 'Consecutive days with workouts',
    calories_burned: 'Total calories burned during workouts',
    weekly_volume: 'Total workout duration in minutes'
  }
  
  return descriptions[type as keyof typeof descriptions] || 'Fitness leaderboard'
}
