'use client'

import { useState } from 'react'
import { saveWorkout } from '@/lib/actions/workout.action'

interface WorkoutProgram {
  name: string
  exercises: string[]
  estimatedDuration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface ScheduledWorkout {
  id: string
  name: string
  exercises: any[]
  startTime: Date
  endTime?: Date
  notes?: string
}

const workoutPrograms: WorkoutProgram[] = [
  {
    name: 'Upper Body Strength',
    exercises: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Barbell Rows', 'Bicep Curls'],
    estimatedDuration: 45,
    difficulty: 'intermediate'
  },
  {
    name: 'Lower Body Power',
    exercises: ['Squats', 'Deadlift', 'Lunges', 'Leg Press', 'Calf Raises'],
    estimatedDuration: 50,
    difficulty: 'intermediate'
  },
  {
    name: 'Full Body Circuit',
    exercises: ['Push-ups', 'Squats', 'Burpees', 'Mountain Climbers', 'Plank'],
    estimatedDuration: 30,
    difficulty: 'beginner'
  },
  {
    name: 'HIIT Cardio',
    exercises: ['Jumping Jacks', 'High Knees', 'Burpees', 'Mountain Climbers', 'Jump Squats'],
    estimatedDuration: 25,
    difficulty: 'beginner'
  },
  {
    name: 'Push & Pull',
    exercises: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Lat Pulldowns', 'Tricep Dips'],
    estimatedDuration: 40,
    difficulty: 'intermediate'
  },
  {
    name: 'Core & Cardio',
    exercises: ['Russian Twists', 'Plank', 'Bicycle Crunches', 'Mountain Climbers', 'Dead Bug'],
    estimatedDuration: 35,
    difficulty: 'beginner'
  },
  {
    name: 'Strength Training',
    exercises: ['Deadlift', 'Bench Press', 'Squats', 'Overhead Press', 'Barbell Rows'],
    estimatedDuration: 60,
    difficulty: 'advanced'
  },
  {
    name: 'Functional Fitness',
    exercises: ['Kettlebell Swings', 'Turkish Get-ups', 'Farmer\'s Walk', 'Box Jumps', 'Battle Ropes'],
    estimatedDuration: 40,
    difficulty: 'intermediate'
  },
  {
    name: 'Yoga Flow',
    exercises: ['Sun Salutations', 'Warrior Poses', 'Downward Dog', 'Tree Pose', 'Savasana'],
    estimatedDuration: 45,
    difficulty: 'beginner'
  },
  {
    name: 'Arms & Shoulders',
    exercises: ['Bicep Curls', 'Tricep Extensions', 'Shoulder Press', 'Lateral Raises', 'Face Pulls'],
    estimatedDuration: 35,
    difficulty: 'beginner'
  }
]

export default function WorkoutProgramScheduler() {
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [showScheduler, setShowScheduler] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [customWorkoutName, setCustomWorkoutName] = useState('')
  const [customExercises, setCustomExercises] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleScheduleWorkout = async () => {
    if (!selectedProgram && !customWorkoutName) return
    if (!selectedDate) return

    setIsScheduling(true)
    try {
      const workoutDate = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      workoutDate.setHours(parseInt(hours), parseInt(minutes))
      
      const endTime = new Date(workoutDate)
      if (selectedProgram) {
        endTime.setMinutes(endTime.getMinutes() + selectedProgram.estimatedDuration)
      } else {
        endTime.setMinutes(endTime.getMinutes() + 30) // Default 30 minutes for custom
      }

      const exercises = selectedProgram 
        ? selectedProgram.exercises.map((exerciseName, index) => ({
            id: `ex-${index}`,
            name: exerciseName,
            sets: [],
            notes: ''
          }))
        : customExercises.split(',').map((exerciseName, index) => ({
            id: `ex-${index}`,
            name: exerciseName.trim(),
            sets: [],
            notes: ''
          }))

      const scheduledWorkout: ScheduledWorkout = {
        id: `scheduled-${Date.now()}`,
        name: selectedProgram ? selectedProgram.name : customWorkoutName,
        exercises,
        startTime: workoutDate,
        endTime,
        notes: selectedProgram 
          ? `Scheduled ${selectedProgram.name} workout - ${selectedProgram.difficulty} level`
          : `Custom scheduled workout`
      }

      const result = await saveWorkout(scheduledWorkout)
      console.log('Scheduled workout result:', result)
      console.log('Scheduled workout data:', scheduledWorkout)
      
      if (result.success) {
        // Reset form
        setSelectedProgram(null)
        setSelectedDate('')
        setSelectedTime('09:00')
        setCustomWorkoutName('')
        setCustomExercises('')
        setShowScheduler(false)
        setShowCustomForm(false)
        
        // Emit custom event to update calendar
        window.dispatchEvent(new CustomEvent('workoutUpdated'))
        
        // Show success message
        const workoutName = selectedProgram ? selectedProgram.name : customWorkoutName
        setSuccessMessage(`✅ "${workoutName}" scheduled for ${new Date(selectedDate).toLocaleDateString()}`)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error scheduling workout:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 dark:text-green-200">{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          📅 Schedule Workout Programs
        </h2>
        <button
          onClick={() => setShowScheduler(!showScheduler)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
        >
          {showScheduler ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Schedule Workout
            </>
          )}
        </button>
      </div>

      {showScheduler && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
          {/* Program Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Choose a Workout Program
              </h3>
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                {showCustomForm ? 'Use Pre-built Programs' : 'Create Custom Workout'}
              </button>
            </div>

            {showCustomForm ? (
              <div className="space-y-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={customWorkoutName}
                    onChange={(e) => setCustomWorkoutName(e.target.value)}
                    placeholder="e.g., My Custom Workout"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exercises (comma-separated)
                  </label>
                  <textarea
                    value={customExercises}
                    onChange={(e) => setCustomExercises(e.target.value)}
                    placeholder="e.g., Push-ups, Squats, Plank, Burpees"
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutPrograms.map((program, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedProgram(program)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedProgram?.name === program.name
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                        : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{program.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                        {program.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {program.exercises.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ⏱️ {program.estimatedDuration} minutes
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date and Time Selection */}
          {(selectedProgram || (customWorkoutName && customExercises)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Schedule Button */}
          {(selectedProgram || (customWorkoutName && customExercises)) && selectedDate && (
            <div className="flex justify-end">
              <button
                onClick={handleScheduleWorkout}
                disabled={isScheduling}
                className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors duration-200"
              >
                {isScheduling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Workout
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
