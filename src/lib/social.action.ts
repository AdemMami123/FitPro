'use server'

import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'
import { 
  Friend, 
  FriendRequest, 
  SharedWorkout, 
  WorkoutLike, 
  WorkoutComment,
  SocialResponse,
  FriendshipResponse 
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

// FRIEND SYSTEM ACTIONS

export async function searchUsers(searchTerm: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!searchTerm.trim()) {
      return { success: false, error: 'Search term is required' }
    }

    // Search by email or name
    const usersRef = firestore.collection('users')
    const emailQuery = usersRef.where('email', '>=', searchTerm.toLowerCase())
      .where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
      .limit(10)
    
    const nameQuery = usersRef.where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .limit(10)

    const [emailResults, nameResults] = await Promise.all([
      emailQuery.get(),
      nameQuery.get()
    ])

    const users = new Map()
    
    // Combine and deduplicate results
    emailResults.docs.forEach(doc => {
      if (doc.id !== currentUser.uid) {
        users.set(doc.id, { id: doc.id, ...doc.data() })
      }
    })
    
    nameResults.docs.forEach(doc => {
      if (doc.id !== currentUser.uid) {
        users.set(doc.id, { id: doc.id, ...doc.data() })
      }
    })

    return {
      success: true,
      data: Array.from(users.values()).slice(0, 10)
    }
  } catch (error) {
    console.error('Error searching users:', error)
    return { success: false, error: 'Failed to search users' }
  }
}

export async function sendFriendRequest(friendId: string): Promise<FriendshipResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Check if already friends or request exists
    const existingFriendship = await firestore
      .collection('friends')
      .where('userId', '==', currentUser.uid)
      .where('friendId', '==', friendId)
      .get()

    if (!existingFriendship.empty) {
      return { success: false, error: 'Already friends or request pending' }
    }

    // Get friend's user data
    const friendDoc = await firestore.collection('users').doc(friendId).get()
    if (!friendDoc.exists) {
      return { success: false, error: 'User not found' }
    }

    const friendData = friendDoc.data()
    const currentUserDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const currentUserData = currentUserDoc.data()

    // Create friend request
    const friendRequest: Omit<FriendRequest, 'id'> = {
      fromUserId: currentUser.uid,
      fromUserName: currentUserData?.name || currentUser.email || '',
      fromUserEmail: currentUser.email || '',
      fromUserAvatar: currentUserData?.avatar,
      toUserId: friendId,
      toUserName: friendData?.name || friendData?.email || '',
      toUserEmail: friendData?.email || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    const requestRef = await firestore.collection('friend_requests').add(friendRequest)

    return {
      success: true,
      message: 'Friend request sent successfully'
    }
  } catch (error) {
    console.error('Error sending friend request:', error)
    return { success: false, error: 'Failed to send friend request' }
  }
}

export async function acceptFriendRequest(requestId: string): Promise<FriendshipResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get the friend request
    const requestDoc = await firestore.collection('friend_requests').doc(requestId).get()
    if (!requestDoc.exists) {
      return { success: false, error: 'Friend request not found' }
    }

    const requestData = requestDoc.data() as FriendRequest
    
    // Verify this request is for the current user
    if (requestData.toUserId !== currentUser.uid) {
      return { success: false, error: 'Unauthorized' }
    }

    const batch = firestore.batch()
    
    // Create friendship records for both users
    const friend1: Omit<Friend, 'id'> = {
      userId: currentUser.uid,
      friendId: requestData.fromUserId,
      friendName: requestData.fromUserName,
      friendEmail: requestData.fromUserEmail,
      friendAvatar: requestData.fromUserAvatar,
      status: 'accepted',
      createdAt: requestData.createdAt,
      acceptedAt: new Date().toISOString()
    }

    const friend2: Omit<Friend, 'id'> = {
      userId: requestData.fromUserId,
      friendId: currentUser.uid,
      friendName: requestData.toUserName,
      friendEmail: requestData.toUserEmail,
      status: 'accepted',
      createdAt: requestData.createdAt,
      acceptedAt: new Date().toISOString()
    }

    // Add both friendship records
    const friend1Ref = firestore.collection('friends').doc()
    const friend2Ref = firestore.collection('friends').doc()
    
    batch.set(friend1Ref, friend1)
    batch.set(friend2Ref, friend2)

    // Update friend request status
    batch.update(requestDoc.ref, {
      status: 'accepted',
      respondedAt: new Date().toISOString()
    })

    await batch.commit()

    return {
      success: true,
      message: 'Friend request accepted',
      data: { friend: { id: friend1Ref.id, ...friend1 } }
    }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return { success: false, error: 'Failed to accept friend request' }
  }
}

export async function declineFriendRequest(requestId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    const requestDoc = await firestore.collection('friend_requests').doc(requestId).get()
    if (!requestDoc.exists) {
      return { success: false, error: 'Friend request not found' }
    }

    const requestData = requestDoc.data() as FriendRequest
    
    if (requestData.toUserId !== currentUser.uid) {
      return { success: false, error: 'Unauthorized' }
    }

    await firestore.collection('friend_requests').doc(requestId).update({
      status: 'declined',
      respondedAt: new Date().toISOString()
    })

    return { success: true, message: 'Friend request declined' }
  } catch (error) {
    console.error('Error declining friend request:', error)
    return { success: false, error: 'Failed to decline friend request' }
  }
}

export async function getFriends(): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    const friendsSnapshot = await firestore
      .collection('friends')
      .where('userId', '==', currentUser.uid)
      .where('status', '==', 'accepted')
      .orderBy('acceptedAt', 'desc')
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
      .collection('friend_requests')
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

export async function removeFriend(friendId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Find and delete both friendship records
    const friendships = await firestore
      .collection('friends')
      .where('userId', 'in', [currentUser.uid, friendId])
      .where('friendId', 'in', [currentUser.uid, friendId])
      .get()

    const batch = firestore.batch()
    
    friendships.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    return { success: true, message: 'Friend removed successfully' }
  } catch (error) {
    console.error('Error removing friend:', error)
    return { success: false, error: 'Failed to remove friend' }
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
    
    // Get the original workout
    const workoutDoc = await firestore.collection('workouts').doc(workoutId).get()
    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }

    const workoutData = workoutDoc.data()
    
    // Verify workout belongs to current user
    if (workoutData?.userId !== currentUser.uid) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()

    const sharedWorkout: Omit<SharedWorkout, 'id'> = {
      originalWorkoutId: workoutId,
      sharedBy: currentUser.uid,
      sharedByName: userData?.name || currentUser.email || '',
      sharedByAvatar: userData?.avatar,
      workoutName: workoutData?.name || 'Workout',
      workoutData,
      description,
      isPublic,
      shareDate: new Date().toISOString(),
      likes: [],
      comments: [],
      tags: tags || [],
      difficulty: workoutData?.difficulty,
      duration: workoutData?.duration,
      category: workoutData?.category
    }

    const sharedRef = await firestore.collection('shared_workouts').add(sharedWorkout)

    return {
      success: true,
      message: 'Workout shared successfully',
      data: { id: sharedRef.id, ...sharedWorkout }
    }
  } catch (error) {
    console.error('Error sharing workout:', error)
    return { success: false, error: 'Failed to share workout' }
  }
}

export async function getSharedWorkouts(limit: number = 20): Promise<SocialResponse> {
  try {
    const sharedWorkoutsSnapshot = await firestore
      .collection('shared_workouts')
      .where('isPublic', '==', true)
      .orderBy('shareDate', 'desc')
      .limit(limit)
      .get()

    const sharedWorkouts = sharedWorkoutsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, data: sharedWorkouts }
  } catch (error) {
    console.error('Error getting shared workouts:', error)
    return { success: false, error: 'Failed to load shared workouts' }
  }
}

// WORKOUT INTERACTION ACTIONS

export async function likeWorkout(sharedWorkoutId: string): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()

    const like: Omit<WorkoutLike, 'id'> = {
      workoutId: sharedWorkoutId,
      userId: currentUser.uid,
      userName: userData?.name || currentUser.email || '',
      userAvatar: userData?.avatar,
      createdAt: new Date().toISOString()
    }

    // Add like to shared workout
    const sharedWorkoutRef = firestore.collection('shared_workouts').doc(sharedWorkoutId)
    await sharedWorkoutRef.update({
      likes: FieldValue.arrayUnion(like)
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
    
    // Get the shared workout to find the like to remove
    const sharedWorkoutDoc = await firestore.collection('shared_workouts').doc(sharedWorkoutId).get()
    if (!sharedWorkoutDoc.exists) {
      return { success: false, error: 'Shared workout not found' }
    }

    const sharedWorkoutData = sharedWorkoutDoc.data() as SharedWorkout
    const likeToRemove = sharedWorkoutData.likes?.find(like => like.userId === currentUser.uid)

    if (!likeToRemove) {
      return { success: false, error: 'Like not found' }
    }

    // Remove like from shared workout
    await firestore.collection('shared_workouts').doc(sharedWorkoutId).update({
      likes: FieldValue.arrayRemove(likeToRemove)
    })

    return { success: true, message: 'Workout unliked successfully' }
  } catch (error) {
    console.error('Error unliking workout:', error)
    return { success: false, error: 'Failed to unlike workout' }
  }
}

export async function addWorkoutComment(
  sharedWorkoutId: string, 
  content: string,
  parentCommentId?: string
): Promise<SocialResponse> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!content.trim()) {
      return { success: false, error: 'Comment content is required' }
    }

    // Get user data
    const userDoc = await firestore.collection('users').doc(currentUser.uid).get()
    const userData = userDoc.data()

    const comment: Omit<WorkoutComment, 'id'> = {
      workoutId: sharedWorkoutId,
      userId: currentUser.uid,
      userName: userData?.name || currentUser.email || '',
      userAvatar: userData?.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      parentCommentId
    }

    // Add comment to shared workout
    const sharedWorkoutRef = firestore.collection('shared_workouts').doc(sharedWorkoutId)
    await sharedWorkoutRef.update({
      comments: FieldValue.arrayUnion(comment)
    })

    return { success: true, message: 'Comment added successfully', data: comment }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}
