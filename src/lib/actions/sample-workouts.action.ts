'use server'

import { saveWorkout } from '@/lib/actions/workout.action'

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

export async function createSampleWorkouts() {
  const today = new Date()
  
  // Sample workouts for the past month
  const sampleWorkouts: WorkoutSession[] = [
    {
      id: `sample-${Date.now()}-1`,
      name: 'Upper Body Strength',
      exercises: [
        {
          id: 'ex1',
          name: 'Bench Press',
          sets: [
            { reps: 8, weight: 60, completed: true },
            { reps: 8, weight: 65, completed: true },
            { reps: 6, weight: 70, completed: true }
          ]
        },
        {
          id: 'ex2',
          name: 'Pull-ups',
          sets: [
            { reps: 10, weight: 0, completed: true },
            { reps: 8, weight: 0, completed: true },
            { reps: 6, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex3',
          name: 'Overhead Press',
          sets: [
            { reps: 10, weight: 40, completed: true },
            { reps: 8, weight: 45, completed: true },
            { reps: 6, weight: 50, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 30),
      notes: 'Great upper body session, feeling strong!'
    },
    {
      id: `sample-${Date.now()}-2`,
      name: 'Lower Body Power',
      exercises: [
        {
          id: 'ex4',
          name: 'Squats',
          sets: [
            { reps: 12, weight: 80, completed: true },
            { reps: 10, weight: 85, completed: true },
            { reps: 8, weight: 90, completed: true }
          ]
        },
        {
          id: 'ex5',
          name: 'Deadlift',
          sets: [
            { reps: 8, weight: 100, completed: true },
            { reps: 6, weight: 110, completed: true },
            { reps: 4, weight: 120, completed: true }
          ]
        },
        {
          id: 'ex6',
          name: 'Lunges',
          sets: [
            { reps: 12, weight: 20, completed: true },
            { reps: 12, weight: 25, completed: true },
            { reps: 10, weight: 30, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 18, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 19, 45),
      notes: 'Legs feeling the burn, great workout!'
    },
    {
      id: `sample-${Date.now()}-3`,
      name: 'Cardio & Core',
      exercises: [
        {
          id: 'ex7',
          name: 'Burpees',
          sets: [
            { reps: 15, weight: 0, completed: true },
            { reps: 12, weight: 0, completed: true },
            { reps: 10, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex8',
          name: 'Mountain Climbers',
          sets: [
            { reps: 30, weight: 0, completed: true },
            { reps: 25, weight: 0, completed: true },
            { reps: 20, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex9',
          name: 'Plank',
          sets: [
            { reps: 60, weight: 0, completed: true },
            { reps: 45, weight: 0, completed: true },
            { reps: 30, weight: 0, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 7, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 8, 0),
      notes: 'Morning HIIT session, energizing start to the day!'
    },
    {
      id: `sample-${Date.now()}-4`,
      name: 'Push Day',
      exercises: [
        {
          id: 'ex10',
          name: 'Push-ups',
          sets: [
            { reps: 20, weight: 0, completed: true },
            { reps: 18, weight: 0, completed: true },
            { reps: 15, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex11',
          name: 'Tricep Dips',
          sets: [
            { reps: 12, weight: 0, completed: true },
            { reps: 10, weight: 0, completed: true },
            { reps: 8, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex12',
          name: 'Shoulder Shrugs',
          sets: [
            { reps: 15, weight: 30, completed: true },
            { reps: 12, weight: 35, completed: true },
            { reps: 10, weight: 40, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 16, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 17, 15),
      notes: 'Focused on pushing movements, great pump!'
    },
    {
      id: `sample-${Date.now()}-5`,
      name: 'Full Body Circuit',
      exercises: [
        {
          id: 'ex13',
          name: 'Squats',
          sets: [
            { reps: 15, weight: 50, completed: true },
            { reps: 12, weight: 55, completed: true }
          ]
        },
        {
          id: 'ex14',
          name: 'Push-ups',
          sets: [
            { reps: 12, weight: 0, completed: true },
            { reps: 10, weight: 0, completed: true }
          ]
        },
        {
          id: 'ex15',
          name: 'Russian Twists',
          sets: [
            { reps: 30, weight: 10, completed: true },
            { reps: 25, weight: 10, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14, 12, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14, 13, 0),
      notes: 'Quick lunch break workout, efficient and effective!'
    },
    // Add a workout for today
    {
      id: `sample-${Date.now()}-6`,
      name: "Today's Workout",
      exercises: [
        {
          id: 'ex16',
          name: 'Bench Press',
          sets: [
            { reps: 10, weight: 70, completed: true },
            { reps: 8, weight: 75, completed: true },
            { reps: 6, weight: 80, completed: true }
          ]
        },
        {
          id: 'ex17',
          name: 'Barbell Rows',
          sets: [
            { reps: 10, weight: 60, completed: true },
            { reps: 8, weight: 65, completed: true },
            { reps: 6, weight: 70, completed: true }
          ]
        }
      ],
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      notes: 'Strong performance today, feeling great!'
    }
  ]

  // Save each workout
  const results = []
  for (const workout of sampleWorkouts) {
    const result = await saveWorkout(workout)
    results.push(result)
  }

  return { success: true, results }
}
