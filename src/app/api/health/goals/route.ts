import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { db } from '@/firebase/admin'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goalsRef = db.collection('health_goals').doc(user.id)
    const goalsDoc = await goalsRef.get()

    if (!goalsDoc.exists) {
      // Return default goals if none exist
      const defaultGoals = {
        targetWeight: null,
        targetBodyFat: null,
        dailyWaterGoal: 2500,
        sleepGoal: 8,
        stepsGoal: 10000,
        exerciseGoal: 150, // minutes per week
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        goals: defaultGoals
      })
    }

    return NextResponse.json({
      success: true,
      goals: goalsDoc.data()
    })

  } catch (error) {
    console.error('Get health goals API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goals = await request.json()
    
    // Validate goals
    const allowedGoals = [
      'targetWeight', 'targetBodyFat', 'dailyWaterGoal', 
      'sleepGoal', 'stepsGoal', 'exerciseGoal'
    ]
    
    const validatedGoals: Record<string, any> = {}
    for (const [key, value] of Object.entries(goals)) {
      if (allowedGoals.includes(key)) {
        if (typeof value === 'number' && !isNaN(value) && value > 0) {
          validatedGoals[key] = value
        } else if (value === null || value === undefined) {
          validatedGoals[key] = null
        } else {
          return NextResponse.json({
            success: false,
            error: `Invalid value for ${key}: must be a positive number or null`
          }, { status: 400 })
        }
      }
    }

    if (Object.keys(validatedGoals).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid goals provided'
      }, { status: 400 })
    }

    const goalsRef = db.collection('health_goals').doc(user.id)
    const existingGoals = await goalsRef.get()
    
    const updatedGoals: Record<string, any> = {
      ...(existingGoals.exists ? existingGoals.data() : {}),
      ...validatedGoals,
      updatedAt: new Date().toISOString()
    }

    if (!existingGoals.exists) {
      updatedGoals.createdAt = new Date().toISOString()
    }

    await goalsRef.set(updatedGoals)

    return NextResponse.json({
      success: true,
      goals: updatedGoals,
      message: 'Health goals updated successfully'
    })

  } catch (error) {
    console.error('Update health goals API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
