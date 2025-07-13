import { NextRequest, NextResponse } from 'next/server'
import { getWorkoutHistory, saveWorkout } from '@/lib/actions/workout.action'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const result = await getWorkoutHistory(limit)
    
    if (result.success && result.workouts) {
      // Ensure dates are properly serialized and handle invalid dates
      const serializedWorkouts = result.workouts.map(workout => ({
        ...workout,
        startTime: workout.startTime instanceof Date && !isNaN(workout.startTime.getTime()) 
          ? workout.startTime.toISOString() 
          : workout.startTime,
        endTime: workout.endTime 
          ? (workout.endTime instanceof Date && !isNaN(workout.endTime.getTime())
            ? workout.endTime.toISOString() 
            : workout.endTime)
          : undefined
      }))
      
      return NextResponse.json({ 
        success: true, 
        workouts: serializedWorkouts 
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.exercises || !Array.isArray(body.exercises)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid workout data' 
      }, { status: 400 })
    }

    const workout = {
      id: body.id || Date.now().toString(),
      name: body.name,
      exercises: body.exercises,
      startTime: body.startTime ? new Date(body.startTime) : new Date(),
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      notes: body.notes || '',
      totalVolume: body.totalVolume || 0,
      estimatedCalories: body.estimatedCalories || 0
    }

    const result = await saveWorkout(workout)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        workoutId: result.workoutId,
        workout: {
          ...workout,
          startTime: workout.startTime.toISOString(),
          endTime: workout.endTime ? workout.endTime.toISOString() : undefined
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error saving workout:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
