'use server'

import { db, auth } from '@/firebase/admin'
import { cookies } from 'next/headers'

async function verifyUserSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return null
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
    return decodedClaims
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

interface WorkoutSet {
  reps: number
  weight: number
  restTime?: number
  completed: boolean
}

interface Exercise {
  id: string
  name: string
  sets: WorkoutSet[]
  notes?: string
}

interface WorkoutSession {
  id: string
  name: string
  exercises: Exercise[]
  startTime: Date
  endTime?: Date
  notes?: string
}

interface WorkoutStats {
  totalWorkouts: number
  totalExercises: number
  totalSets: number
  totalWeight: number
  averageWorkoutDuration: number
}

export async function saveWorkout(workout: WorkoutSession) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutData = {
      ...workout,
      userId,
      startTime: workout.startTime.toISOString(),
      endTime: workout.endTime ? workout.endTime.toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('workouts').doc(workout.id).set(workoutData)

    return { success: true, workoutId: workout.id }
  } catch (error) {
    console.error('Error saving workout:', error)
    return { success: false, error: 'Failed to save workout' }
  }
}

export async function getWorkoutHistory(limit: number = 10) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutsRef = db.collection('workouts')
    const query = workoutsRef
      .where('userId', '==', userId)
      .orderBy('startTime', 'desc')
      .limit(limit)

    const snapshot = await query.get()
    const workouts: WorkoutSession[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      workouts.push({
        id: doc.id,
        name: data.name,
        exercises: data.exercises || [],
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        notes: data.notes
      })
    })

    return { success: true, workouts }
  } catch (error) {
    console.error('Error fetching workout history:', error)
    return { success: false, error: 'Failed to fetch workout history' }
  }
}

export async function getWorkoutById(workoutId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutDoc = await db.collection('workouts').doc(workoutId).get()

    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }

    const data = workoutDoc.data()
    if (data?.userId !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const workout: WorkoutSession = {
      id: workoutDoc.id,
      name: data.name,
      exercises: data.exercises || [],
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      notes: data.notes
    }

    return { success: true, workout }
  } catch (error) {
    console.error('Error fetching workout:', error)
    return { success: false, error: 'Failed to fetch workout' }
  }
}

export async function updateWorkout(workoutId: string, updates: Partial<WorkoutSession>) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutRef = db.collection('workouts').doc(workoutId)
    const workoutDoc = await workoutRef.get()

    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }

    const data = workoutDoc.data()
    if (data?.userId !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await workoutRef.update(updateData)

    return { success: true }
  } catch (error) {
    console.error('Error updating workout:', error)
    return { success: false, error: 'Failed to update workout' }
  }
}

export async function deleteWorkout(workoutId: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutRef = db.collection('workouts').doc(workoutId)
    const workoutDoc = await workoutRef.get()

    if (!workoutDoc.exists) {
      return { success: false, error: 'Workout not found' }
    }

    const data = workoutDoc.data()
    if (data?.userId !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    await workoutRef.delete()

    return { success: true }
  } catch (error) {
    console.error('Error deleting workout:', error)
    return { success: false, error: 'Failed to delete workout' }
  }
}

export async function getWorkoutStats() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutsRef = db.collection('workouts')
    const query = workoutsRef.where('userId', '==', userId)

    const snapshot = await query.get()
    let totalWorkouts = 0
    let totalExercises = 0
    let totalSets = 0
    let totalWeight = 0
    let totalDuration = 0

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      totalWorkouts++
      
      if (data.exercises) {
        totalExercises += data.exercises.length
        
        data.exercises.forEach((exercise: Exercise) => {
          if (exercise.sets) {
            totalSets += exercise.sets.length
            exercise.sets.forEach((set: WorkoutSet) => {
              if (set.weight) {
                totalWeight += set.weight * set.reps
              }
            })
          }
        })
      }

      if (data.startTime && data.endTime) {
        const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime()
        totalDuration += duration
      }
    })

    const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts / (1000 * 60) : 0

    const stats: WorkoutStats = {
      totalWorkouts,
      totalExercises,
      totalSets,
      totalWeight,
      averageWorkoutDuration
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Error fetching workout stats:', error)
    return { success: false, error: 'Failed to fetch workout stats' }
  }
}

export async function getExerciseHistory(exerciseName: string) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutsRef = db.collection('workouts')
    const query = workoutsRef
      .where('userId', '==', userId)
      .orderBy('startTime', 'desc')

    const snapshot = await query.get()
    const exerciseHistory: any[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      const workoutDate = new Date(data.startTime)
      
      if (data.exercises) {
        data.exercises.forEach((exercise: Exercise) => {
          if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
            exerciseHistory.push({
              workoutId: doc.id,
              workoutDate,
              sets: exercise.sets,
              notes: exercise.notes
            })
          }
        })
      }
    })

    return { success: true, exerciseHistory }
  } catch (error) {
    console.error('Error fetching exercise history:', error)
    return { success: false, error: 'Failed to fetch exercise history' }
  }
}

export async function getWorkoutsByDateRange(startDate: Date, endDate: Date) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decodedToken = await verifyUserSession()
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' }
    }

    const userId = decodedToken.uid
    const workoutsRef = db.collection('workouts')
    const query = workoutsRef
      .where('userId', '==', userId)
      .where('startTime', '>=', startDate.toISOString())
      .where('startTime', '<=', endDate.toISOString())
      .orderBy('startTime', 'desc')

    const snapshot = await query.get()
    const workouts: WorkoutSession[] = []

    snapshot.forEach((doc: any) => {
      const data = doc.data()
      workouts.push({
        id: doc.id,
        name: data.name,
        exercises: data.exercises || [],
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        notes: data.notes
      })
    })

    return { success: true, workouts }
  } catch (error) {
    console.error('Error fetching workouts by date range:', error)
    return { success: false, error: 'Failed to fetch workouts' }
  }
}

export async function getWorkoutsByMonth(year: number, month: number) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    return await getWorkoutsByDateRange(startDate, endDate)
  } catch (error) {
    console.error('Error fetching workouts by month:', error)
    return { success: false, error: 'Failed to fetch workouts for month' }
  }
}
