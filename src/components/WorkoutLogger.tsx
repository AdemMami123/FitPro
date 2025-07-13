'use client'

import { useState, useEffect } from 'react'
import { saveWorkout, getWorkoutHistory } from '@/lib/actions/workout.action'
import { useWeightUnit } from '@/contexts/WeightUnitContext'
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Edit2, 
  Save, 
  X, 
  Timer, 
  Dumbbell, 
  Target, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react'

interface Exercise {
  id: string
  name: string
  sets: WorkoutSet[]
  notes?: string
  restTime?: number
  targetReps?: string
  targetWeight?: number
}

interface WorkoutSet {
  reps: number
  weight: number
  restTime?: number
  completed: boolean
  rpe?: number // Rate of Perceived Exertion (1-10)
  notes?: string
}

interface WorkoutSession {
  id: string
  name: string
  exercises: Exercise[]
  startTime: Date | string
  endTime?: Date | string
  notes?: string
  totalVolume?: number
  estimatedCalories?: number
}

interface WorkoutTemplate {
  id: string
  name: string
  category: string
  muscleGroups: string[]
  estimatedDuration: number
  exercises: {
    name: string
    sets: number
    reps: string
    restTime: number
    category: string
  }[]
}

export default function WorkoutLogger() {
  const { unit, formatWeight } = useWeightUnit()
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null)
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showCreateCustomExercise, setShowCreateCustomExercise] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [customExerciseName, setCustomExerciseName] = useState('')
  const [workoutName, setWorkoutName] = useState('')
  const [showNameWorkout, setShowNameWorkout] = useState(false)
  const [isEditingWorkoutName, setIsEditingWorkoutName] = useState(false)
  const [editedWorkoutName, setEditedWorkoutName] = useState('')
  const [activeTab, setActiveTab] = useState<'current' | 'templates' | 'history'>('current')
  const [restTimer, setRestTimer] = useState<number>(0)
  const [isRestTimerActive, setIsRestTimerActive] = useState(false)
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(null)
  const [workoutTimer, setWorkoutTimer] = useState<number>(0)
  const [isWorkoutTimerActive, setIsWorkoutTimerActive] = useState(false)

  // Common exercises database with categories
  const commonExercises = [
    // Chest
    { name: 'Bench Press', category: 'Chest', type: 'compound' },
    { name: 'Incline Dumbbell Press', category: 'Chest', type: 'compound' },
    { name: 'Push-ups', category: 'Chest', type: 'bodyweight' },
    { name: 'Chest Flyes', category: 'Chest', type: 'isolation' },
    { name: 'Dips', category: 'Chest', type: 'compound' },
    
    // Back
    { name: 'Pull-ups', category: 'Back', type: 'compound' },
    { name: 'Barbell Rows', category: 'Back', type: 'compound' },
    { name: 'Lat Pulldowns', category: 'Back', type: 'compound' },
    { name: 'Cable Rows', category: 'Back', type: 'compound' },
    { name: 'Deadlift', category: 'Back', type: 'compound' },
    
    // Shoulders
    { name: 'Overhead Press', category: 'Shoulders', type: 'compound' },
    { name: 'Lateral Raises', category: 'Shoulders', type: 'isolation' },
    { name: 'Rear Delt Flyes', category: 'Shoulders', type: 'isolation' },
    { name: 'Front Raises', category: 'Shoulders', type: 'isolation' },
    { name: 'Shoulder Shrugs', category: 'Shoulders', type: 'isolation' },
    
    // Arms
    { name: 'Bicep Curls', category: 'Arms', type: 'isolation' },
    { name: 'Tricep Dips', category: 'Arms', type: 'compound' },
    { name: 'Hammer Curls', category: 'Arms', type: 'isolation' },
    { name: 'Tricep Extensions', category: 'Arms', type: 'isolation' },
    { name: 'Close-Grip Bench Press', category: 'Arms', type: 'compound' },
    
    // Legs
    { name: 'Squats', category: 'Legs', type: 'compound' },
    { name: 'Lunges', category: 'Legs', type: 'compound' },
    { name: 'Leg Press', category: 'Legs', type: 'compound' },
    { name: 'Leg Curls', category: 'Legs', type: 'isolation' },
    { name: 'Calf Raises', category: 'Legs', type: 'isolation' },
    { name: 'Romanian Deadlifts', category: 'Legs', type: 'compound' },
    
    // Core
    { name: 'Plank', category: 'Core', type: 'bodyweight' },
    { name: 'Russian Twists', category: 'Core', type: 'bodyweight' },
    { name: 'Bicycle Crunches', category: 'Core', type: 'bodyweight' },
    { name: 'Mountain Climbers', category: 'Core', type: 'cardio' },
    { name: 'Dead Bug', category: 'Core', type: 'bodyweight' },
    
    // Cardio
    { name: 'Burpees', category: 'Cardio', type: 'cardio' },
    { name: 'Jump Squats', category: 'Cardio', type: 'cardio' },
    { name: 'High Knees', category: 'Cardio', type: 'cardio' },
    { name: 'Jumping Jacks', category: 'Cardio', type: 'cardio' }
  ]

  const filteredExercises = commonExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    exercise.category.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRestTimerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(timer => timer - 1)
      }, 1000)
    } else if (restTimer === 0 && isRestTimerActive) {
      setIsRestTimerActive(false)
      // Show notification that rest is over
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest time over!', {
          body: 'Time to start your next set.',
          icon: '/fitness-icon.png'
        })
      }
    }
    return () => clearInterval(interval)
  }, [isRestTimerActive, restTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorkoutTimerActive && currentWorkout) {
      interval = setInterval(() => {
        setWorkoutTimer(timer => timer + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorkoutTimerActive, currentWorkout])

  useEffect(() => {
    loadWorkoutHistory()
    loadWorkoutTemplates()
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const loadWorkoutHistory = async () => {
    try {
      const response = await fetch('/api/workouts?limit=20')
      const result = await response.json()
      if (result.success && result.workouts) {
        // Convert string dates back to Date objects for proper handling
        const workoutsWithDates = result.workouts.map((workout: any) => ({
          ...workout,
          startTime: new Date(workout.startTime),
          endTime: workout.endTime ? new Date(workout.endTime) : undefined
        }))
        setWorkoutHistory(workoutsWithDates)
      }
    } catch (error) {
      console.error('Error loading workout history:', error)
    }
  }

  const loadWorkoutTemplates = async () => {
    try {
      const response = await fetch('/api/workouts/templates')
      const result = await response.json()
      if (result.success && result.templates) {
        setWorkoutTemplates(result.templates)
      }
    } catch (error) {
      console.error('Error loading workout templates:', error)
    }
  }

  const startWorkout = () => {
    setShowNameWorkout(true)
  }

  const createWorkout = () => {
    const finalWorkoutName = workoutName.trim() || `Workout ${new Date().toLocaleDateString()}`
    
    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      name: finalWorkoutName,
      exercises: [],
      startTime: new Date(),
      notes: ''
    }
    setCurrentWorkout(newWorkout)
    setShowNameWorkout(false)
    setWorkoutName('')
    setWorkoutTimer(0)
    setIsWorkoutTimerActive(true)
  }

  const cancelWorkoutCreation = () => {
    setShowNameWorkout(false)
    setWorkoutName('')
  }

  const addExercise = (exerciseName: string, targetReps?: string, targetWeight?: number) => {
    if (!currentWorkout) return

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [],
      notes: '',
      targetReps,
      targetWeight
    }

    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, newExercise]
    })
    setShowAddExercise(false)
    setExerciseSearch('')
  }

  const createCustomExercise = () => {
    if (!customExerciseName.trim()) return
    
    addExercise(customExerciseName.trim())
    setCustomExerciseName('')
    setShowCreateCustomExercise(false)
  }

  const cancelCustomExercise = () => {
    setShowCreateCustomExercise(false)
    setCustomExerciseName('')
  }

  // Timer functions
  const startRestTimer = (exerciseId: string, duration: number = 90) => {
    setCurrentExerciseId(exerciseId)
    setRestTimer(duration)
    setIsRestTimerActive(true)
  }

  const stopRestTimer = () => {
    setIsRestTimerActive(false)
    setRestTimer(0)
    setCurrentExerciseId(null)
  }

  // Helper function to safely convert date objects
  const safeDate = (date: Date | string): Date => {
    return date instanceof Date ? date : new Date(date)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Enhanced set management
  const addSetFromTemplate = (exerciseId: string, template: { reps: string; weight?: number }) => {
    if (!currentWorkout) return

    const repsNum = parseInt(template.reps.split('-')[0]) || 0
    const newSet: WorkoutSet = {
      reps: repsNum,
      weight: template.weight || 0,
      completed: false
    }

    const updatedExercises = currentWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        }
      }
      return exercise
    })

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  const duplicateLastSet = (exerciseId: string) => {
    if (!currentWorkout) return

    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId)
    if (!exercise || exercise.sets.length === 0) return

    const lastSet = exercise.sets[exercise.sets.length - 1]
    const newSet: WorkoutSet = {
      ...lastSet,
      completed: false
    }

    const updatedExercises = currentWorkout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, newSet]
        }
      }
      return ex
    })

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  // Workout completion with enhanced statistics
  const calculateWorkoutStats = (workout: WorkoutSession) => {
    let totalVolume = 0
    let totalSets = 0
    let completedSets = 0

    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSets++
        if (set.completed) {
          completedSets++
          totalVolume += (set.weight || 0) * (set.reps || 0)
        }
      })
    })

    // Ensure we're working with Date objects
    const startTime = safeDate(workout.startTime)
    const endTime = workout.endTime ? safeDate(workout.endTime) : null
    
    const duration = endTime && startTime 
      ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : 0

    // Rough calorie estimation (very basic)
    const estimatedCalories = Math.round(duration * 5 + totalVolume * 0.1)

    return {
      totalVolume,
      totalSets,
      completedSets,
      duration,
      estimatedCalories,
      completionRate: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
    }
  }

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      name: template.name,
      exercises: template.exercises.map((templateExercise, index) => ({
        id: `${Date.now()}-${index}`,
        name: templateExercise.name,
        sets: [],
        notes: '',
        targetReps: templateExercise.reps,
        restTime: templateExercise.restTime
      })),
      startTime: new Date(),
      notes: `Based on ${template.name} template`
    }
    
    setCurrentWorkout(newWorkout)
    setShowTemplates(false)
    setWorkoutTimer(0)
    setIsWorkoutTimerActive(true)
  }

  const startEditingWorkoutName = () => {
    if (currentWorkout) {
      setEditedWorkoutName(currentWorkout.name)
      setIsEditingWorkoutName(true)
    }
  }

  const saveWorkoutName = () => {
    if (currentWorkout && editedWorkoutName.trim()) {
      setCurrentWorkout({
        ...currentWorkout,
        name: editedWorkoutName.trim()
      })
    }
    setIsEditingWorkoutName(false)
    setEditedWorkoutName('')
  }

  const cancelEditingWorkoutName = () => {
    setIsEditingWorkoutName(false)
    setEditedWorkoutName('')
  }

  const addSet = (exerciseId: string) => {
    if (!currentWorkout) return

    // Get the exercise to determine default values
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId)
    const lastSet = exercise?.sets[exercise.sets.length - 1]

    const newSet: WorkoutSet = {
      reps: lastSet?.reps || 0,
      weight: lastSet?.weight || 0,
      completed: false
    }

    const updatedExercises = currentWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, newSet]
        }
      }
      return exercise
    })

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => {
    if (!currentWorkout) return

    const updatedExercises = currentWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map((set, index) => {
          if (index === setIndex) {
            const updatedSet = { ...set, [field]: value }
            
            // If marking as completed, start rest timer
            if (field === 'completed' && value === true && exercise.restTime) {
              startRestTimer(exerciseId, exercise.restTime)
            }
            
            return updatedSet
          }
          return set
        })
        return { ...exercise, sets: updatedSets }
      }
      return exercise
    })

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!currentWorkout) return

    const updatedExercises = currentWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.filter((_, index) => index !== setIndex)
        return { ...exercise, sets: updatedSets }
      }
      return exercise
    })

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  const removeExercise = (exerciseId: string) => {
    if (!currentWorkout) return

    const updatedExercises = currentWorkout.exercises.filter(exercise => exercise.id !== exerciseId)
    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises
    })
  }

  const finishWorkout = async () => {
    if (!currentWorkout) return

    setIsLoading(true)
    try {
      const completedWorkout = {
        ...currentWorkout,
        endTime: new Date()
      }

      // Calculate workout statistics
      const stats = calculateWorkoutStats(completedWorkout)
      completedWorkout.totalVolume = stats.totalVolume
      completedWorkout.estimatedCalories = stats.estimatedCalories

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completedWorkout)
      })

      const result = await response.json()
      
      if (result.success) {
        setCurrentWorkout(null)
        setIsWorkoutTimerActive(false)
        setWorkoutTimer(0)
        stopRestTimer()
        await loadWorkoutHistory()
        
        // Show completion notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Workout Complete!', {
            body: `Great job! You completed ${stats.completedSets} sets with ${stats.completionRate}% completion rate.`,
            icon: '/fitness-icon.png'
          })
        }
      } else {
        throw new Error(result.error || 'Failed to save workout')
      }
    } catch (error) {
      console.error('Error saving workout:', error)
      alert(`Failed to save workout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      setCurrentWorkout(null)
      setIsWorkoutTimerActive(false)
      setWorkoutTimer(0)
      stopRestTimer()
    }
  }

  if (showNameWorkout) {
    return (
      <div className="space-y-6">
        {/* Workout Name Dialog */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Name Your Workout</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Give your workout a custom name (e.g., "Push Day", "Leg Day", "Full Body")
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="e.g., Push Day, Leg Day, Full Body..."
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createWorkout()
                }
              }}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={createWorkout}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                {workoutName.trim() ? 'Create Workout' : 'Create Unnamed Workout'}
              </button>
              <button
                onClick={cancelWorkoutCreation}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          
          {/* Quick Name Suggestions */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Core'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setWorkoutName(suggestion)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentWorkout) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-3 mr-3">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Logger</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your exercises and progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startWorkout}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <Play className="w-4 h-4" />
              Start New Workout
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              <Target className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'current', label: 'Quick Start', icon: Play },
              { id: 'templates', label: 'Templates', icon: Target },
              { id: 'history', label: 'History', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'current' | 'templates' | 'history')}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Start Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500 rounded-full p-2">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Start</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start a custom workout and add exercises as you go.
              </p>
              <button
                onClick={startWorkout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Create Custom Workout
              </button>
            </div>

            {/* Templates Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 rounded-full p-2">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Templates</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose from pre-built workouts for faster setup.
              </p>
              <div className="space-y-2 mb-4">
                {workoutTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{template.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{template.estimatedDuration}min</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('templates')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Browse Templates
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutTemplates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.category === 'strength' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                    template.category === 'cardio' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                  }`}>
                    {template.category}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{template.estimatedDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Activity className="w-4 h-4" />
                    <span>{template.exercises.length} exercises</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.muscleGroups.slice(0, 3).map((muscle) => (
                      <span key={muscle} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {muscle}
                      </span>
                    ))}
                    {template.muscleGroups.length > 3 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        +{template.muscleGroups.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => startWorkoutFromTemplate(template)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Start Workout
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {workoutHistory.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No workouts logged yet</p>
                <p className="text-gray-500 dark:text-gray-500">Start your first workout to see it here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutHistory.slice(0, 12).map((workout) => {
                  const stats = calculateWorkoutStats(workout)
                  return (
                    <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{workout.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(workout.startTime instanceof Date ? workout.startTime : new Date(workout.startTime)).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Duration</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stats.duration > 0 ? `${stats.duration}min` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Exercises</span>
                          <p className="font-medium text-gray-900 dark:text-white">{workout.exercises.length}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Sets</span>
                          <p className="font-medium text-gray-900 dark:text-white">{stats.completedSets}/{stats.totalSets}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Volume</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatWeight(stats.totalVolume)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => startWorkoutFromTemplate({
                          id: `repeat-${workout.id}`,
                          name: `${workout.name} (Repeat)`,
                          category: 'strength',
                          muscleGroups: [],
                          estimatedDuration: stats.duration || 60,
                          exercises: workout.exercises.map(ex => ({
                            name: ex.name,
                            sets: ex.sets.length || 3,
                            reps: ex.targetReps || '8-12',
                            restTime: ex.restTime || 90,
                            category: 'strength'
                          }))
                        })}
                        className="w-full mt-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Repeat Workout
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Templates</h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workoutTemplates.map((template) => (
                    <div key={template.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.category === 'strength' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                          template.category === 'cardio' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                        }`}>
                          {template.category}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{template.estimatedDuration} minutes</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>{template.exercises.length} exercises:</strong>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 max-h-20 overflow-y-auto">
                          {template.exercises.map((ex, idx) => (
                            <div key={idx}>{ex.name}</div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => startWorkoutFromTemplate(template)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                      >
                        Start Workout
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workout Header with Timer */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            {isEditingWorkoutName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedWorkoutName}
                  onChange={(e) => setEditedWorkoutName(e.target.value)}
                  className="text-2xl font-bold bg-white/20 text-white px-3 py-1 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70"
                  placeholder="Workout name..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveWorkoutName()
                    } else if (e.key === 'Escape') {
                      cancelEditingWorkoutName()
                    }
                  }}
                />
                <button
                  onClick={saveWorkoutName}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEditingWorkoutName}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{currentWorkout.name}</h2>
                <button
                  onClick={startEditingWorkoutName}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}              <div className="flex items-center gap-4 mt-2 text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Started: {(currentWorkout.startTime instanceof Date ? currentWorkout.startTime : new Date(currentWorkout.startTime)).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>Duration: {formatTime(workoutTimer)}</span>
                </div>
              </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Rest Timer */}
            {isRestTimerActive && (
              <div className="bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <Timer className="w-4 h-4 text-yellow-300" />
                <span className="font-mono text-lg">{formatTime(restTimer)}</span>
                <button
                  onClick={stopRestTimer}
                  className="text-white/80 hover:text-white"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={cancelWorkout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={finishWorkout}
              disabled={isLoading || currentWorkout.exercises.length === 0}
              className="bg-white text-orange-600 hover:bg-white/90 disabled:bg-white/50 disabled:text-orange-400 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
                  Finishing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finish Workout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currentWorkout.exercises.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {currentWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Sets</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currentWorkout.exercises.reduce((total, ex) => total + ex.sets.filter(s => s.completed).length, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatWeight(currentWorkout.exercises.reduce((total, ex) => 
              total + ex.sets.filter(s => s.completed).reduce((setTotal, set) => 
                setTotal + (set.weight || 0) * (set.reps || 0), 0), 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {currentWorkout.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
                  {exercise.targetReps && (
                    <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                      Target: {exercise.targetReps} reps
                    </span>
                  )}
                </div>
                {exercise.sets.length > 0 && (
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {exercise.sets.filter(s => s.completed).length} of {exercise.sets.length} sets completed
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => duplicateLastSet(exercise.id)}
                  disabled={exercise.sets.length === 0}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Duplicate last set"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove exercise"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2 mb-4">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 shrink-0">
                      Set {setIndex + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">reps</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={set.rpe || ''}
                      onChange={(e) => updateSet(exercise.id, setIndex, 'rpe', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">RPE</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => updateSet(exercise.id, setIndex, 'completed', !set.completed)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      set.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {set.completed && <CheckCircle className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => removeSet(exercise.id, setIndex)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Remove set"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <div className="flex gap-2">
              <button
                onClick={() => addSet(exercise.id)}
                className="flex-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
              {exercise.sets.length > 0 && (
                <button
                  onClick={() => duplicateLastSet(exercise.id)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
              )}
            </div>

            {/* Rest Timer for this exercise */}
            {currentExerciseId === exercise.id && isRestTimerActive && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Rest time: {formatTime(restTimer)}
                    </span>
                  </div>
                  <button
                    onClick={stopRestTimer}
                    className="text-yellow-600 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Exercise Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Exercise</h3>
              <button
                onClick={() => setShowAddExercise(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Activity className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => addExercise(exercise.name)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{exercise.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                            {exercise.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            exercise.type === 'compound' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                            exercise.type === 'isolation' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                            exercise.type === 'cardio' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                            'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                          }`}>
                            {exercise.type}
                          </span>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </div>
                  </button>
                ))
              ) : exerciseSearch.trim() ? (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2" />
                  <p>No exercises found for "{exerciseSearch}"</p>
                  <p className="text-sm">Try creating a custom exercise below!</p>
                </div>
              ) : null}
            </div>
            
            {/* Custom Exercise Option */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Can't find your exercise? Create a custom one:
              </p>
              <button
                onClick={() => setShowCreateCustomExercise(true)}
                className="w-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 py-2 px-4 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Custom Exercise
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Exercise Creation Modal */}
      {showCreateCustomExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Custom Exercise</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter the name of your custom exercise. You can add sets and reps after creating it.
            </p>
            
            <input
              type="text"
              placeholder="e.g., Cable Lateral Raises, Farmer's Walk..."
              value={customExerciseName}
              onChange={(e) => setCustomExerciseName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createCustomExercise()
                }
              }}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={createCustomExercise}
                disabled={!customExerciseName.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Create Exercise
              </button>
              <button
                onClick={cancelCustomExercise}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
