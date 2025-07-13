import { NextRequest, NextResponse } from 'next/server'

// Pre-defined workout templates for quick start
const workoutTemplates = [
  {
    id: 'push-day',
    name: 'Push Day',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    estimatedDuration: 60,
    exercises: [
      {
        name: 'Bench Press',
        sets: 4,
        reps: '8-10',
        restTime: 120,
        category: 'compound'
      },
      {
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: '10-12',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Shoulder Press',
        sets: 3,
        reps: '8-10',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Lateral Raises',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      },
      {
        name: 'Tricep Dips',
        sets: 3,
        reps: '10-12',
        restTime: 60,
        category: 'isolation'
      },
      {
        name: 'Tricep Pushdowns',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      }
    ]
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    estimatedDuration: 60,
    exercises: [
      {
        name: 'Pull-ups',
        sets: 4,
        reps: '6-10',
        restTime: 120,
        category: 'compound'
      },
      {
        name: 'Barbell Rows',
        sets: 4,
        reps: '8-10',
        restTime: 120,
        category: 'compound'
      },
      {
        name: 'Lat Pulldowns',
        sets: 3,
        reps: '10-12',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Cable Rows',
        sets: 3,
        reps: '10-12',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Bicep Curls',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      },
      {
        name: 'Hammer Curls',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      }
    ]
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    category: 'strength',
    muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    estimatedDuration: 70,
    exercises: [
      {
        name: 'Squats',
        sets: 4,
        reps: '8-10',
        restTime: 150,
        category: 'compound'
      },
      {
        name: 'Romanian Deadlifts',
        sets: 4,
        reps: '8-10',
        restTime: 120,
        category: 'compound'
      },
      {
        name: 'Leg Press',
        sets: 3,
        reps: '12-15',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Lunges',
        sets: 3,
        reps: '10-12 each leg',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Leg Curls',
        sets: 3,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      },
      {
        name: 'Calf Raises',
        sets: 4,
        reps: '15-20',
        restTime: 60,
        category: 'isolation'
      }
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    category: 'strength',
    muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
    estimatedDuration: 75,
    exercises: [
      {
        name: 'Push-ups',
        sets: 3,
        reps: '10-15',
        restTime: 60,
        category: 'compound'
      },
      {
        name: 'Pull-ups',
        sets: 3,
        reps: '6-10',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Dumbbell Press',
        sets: 3,
        reps: '10-12',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '10-12',
        restTime: 90,
        category: 'compound'
      },
      {
        name: 'Shoulder Press',
        sets: 3,
        reps: '10-12',
        restTime: 60,
        category: 'compound'
      },
      {
        name: 'Bicep Curls',
        sets: 2,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      },
      {
        name: 'Tricep Extensions',
        sets: 2,
        reps: '12-15',
        restTime: 60,
        category: 'isolation'
      }
    ]
  },
  {
    id: 'cardio-hiit',
    name: 'HIIT Cardio',
    category: 'cardio',
    muscleGroups: ['full-body'],
    estimatedDuration: 30,
    exercises: [
      {
        name: 'Burpees',
        sets: 4,
        reps: '30 seconds',
        restTime: 30,
        category: 'cardio'
      },
      {
        name: 'Mountain Climbers',
        sets: 4,
        reps: '30 seconds',
        restTime: 30,
        category: 'cardio'
      },
      {
        name: 'Jump Squats',
        sets: 4,
        reps: '30 seconds',
        restTime: 30,
        category: 'cardio'
      },
      {
        name: 'High Knees',
        sets: 4,
        reps: '30 seconds',
        restTime: 30,
        category: 'cardio'
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '30-60 seconds',
        restTime: 30,
        category: 'core'
      }
    ]
  },
  {
    id: 'core-abs',
    name: 'Core & Abs',
    category: 'strength',
    muscleGroups: ['core', 'abs'],
    estimatedDuration: 25,
    exercises: [
      {
        name: 'Plank',
        sets: 3,
        reps: '30-60 seconds',
        restTime: 60,
        category: 'core'
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20-30',
        restTime: 45,
        category: 'core'
      },
      {
        name: 'Bicycle Crunches',
        sets: 3,
        reps: '20-30',
        restTime: 45,
        category: 'core'
      },
      {
        name: 'Dead Bug',
        sets: 3,
        reps: '10 each side',
        restTime: 45,
        category: 'core'
      },
      {
        name: 'Mountain Climbers',
        sets: 3,
        reps: '20-30',
        restTime: 45,
        category: 'core'
      }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    let filteredTemplates = workoutTemplates
    
    if (category) {
      filteredTemplates = workoutTemplates.filter(template => 
        template.category === category
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      templates: filteredTemplates 
    })
  } catch (error) {
    console.error('Error fetching workout templates:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
