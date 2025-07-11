'use client'

import { useState, useEffect } from 'react'
import { saveWorkout, getWorkoutHistory } from '@/lib/actions/workout.action'
import { useWeightUnit } from '@/contexts/WeightUnitContext'

interface Exercise {
  id: string
  name: string
  sets: WorkoutSet[]
  notes?: string
}

interface WorkoutSet {
  reps: number
  weight: number
  restTime?: number
  completed: boolean
}

interface WorkoutSession {
  id: string
  name: string
  exercises: Exercise[]
  startTime: Date
  endTime?: Date
  notes?: string
}

export default function WorkoutLogger() {
  const { unit, formatWeight } = useWeightUnit()
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null)
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showCreateCustomExercise, setShowCreateCustomExercise] = useState(false)
  const [customExerciseName, setCustomExerciseName] = useState('')
  const [workoutName, setWorkoutName] = useState('')
  const [showNameWorkout, setShowNameWorkout] = useState(false)
  const [isEditingWorkoutName, setIsEditingWorkoutName] = useState(false)
  const [editedWorkoutName, setEditedWorkoutName] = useState('')

  // Common exercises database
  const commonExercises = [
    'Push-ups', 'Squats', 'Lunges', 'Plank', 'Burpees', 'Mountain Climbers',
    'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Rows', 'Pull-ups',
    'Bicep Curls', 'Tricep Dips', 'Leg Press', 'Calf Raises', 'Hip Thrusts',
    'Lat Pulldowns', 'Chest Flyes', 'Shoulder Shrugs', 'Russian Twists'
  ]

  const filteredExercises = commonExercises.filter(exercise =>
    exercise.toLowerCase().includes(exerciseSearch.toLowerCase())
  )

  useEffect(() => {
    loadWorkoutHistory()
  }, [])

  const loadWorkoutHistory = async () => {
    try {
      const history = await getWorkoutHistory()
      if (history.success && history.workouts) {
        setWorkoutHistory(history.workouts)
      }
    } catch (error) {
      console.error('Error loading workout history:', error)
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
  }

  const cancelWorkoutCreation = () => {
    setShowNameWorkout(false)
    setWorkoutName('')
  }

  const addExercise = (exerciseName: string) => {
    if (!currentWorkout) return

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [],
      notes: ''
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

    const newSet: WorkoutSet = {
      reps: 0,
      weight: 0,
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
            return { ...set, [field]: value }
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

      await saveWorkout(completedWorkout)
      setCurrentWorkout(null)
      await loadWorkoutHistory()
    } catch (error) {
      console.error('Error saving workout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelWorkout = () => {
    setCurrentWorkout(null)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full p-3 mr-3">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Logger</h2>
          </div>
          <button
            onClick={startWorkout}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Start New Workout
          </button>
        </div>

        {/* Workout History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
          {workoutHistory.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">No workouts logged yet. Start your first workout!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workoutHistory.slice(0, 5).map((workout) => (
                <div key={workout.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{workout.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(workout.startTime).toLocaleDateString()} • {workout.exercises.length} exercises
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.endTime ? 
                          `${Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / (1000 * 60))} min`
                          : 'In progress'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Active Workout Header */}
      <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {isEditingWorkoutName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedWorkoutName}
                  onChange={(e) => setEditedWorkoutName(e.target.value)}
                  className="text-2xl font-bold bg-white dark:bg-gray-800 text-orange-800 dark:text-orange-200 px-3 py-1 rounded border border-orange-300 dark:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={cancelEditingWorkoutName}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200">{currentWorkout.name}</h2>
                <button
                  onClick={startEditingWorkoutName}
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-orange-600 dark:text-orange-400">
              Started: {currentWorkout.startTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={cancelWorkout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={finishWorkout}
              disabled={isLoading || currentWorkout.exercises.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              {isLoading ? 'Finishing...' : 'Finish Workout'}
            </button>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {currentWorkout.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
              <button
                onClick={() => removeExercise(exercise.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                    Set {setIndex + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">reps</span>
                  </div>
                  <button
                    onClick={() => updateSet(exercise.id, setIndex, 'completed', !set.completed)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                      set.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {set.completed && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => removeSet(exercise.id, setIndex)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Set Button */}
            <button
              onClick={() => addSet(exercise.id)}
              className="mt-3 w-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
            >
              + Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Add Exercise Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            + Add Exercise
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Exercise</h3>
              <button
                onClick={() => setShowAddExercise(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            {/* Exercise List */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => addExercise(exercise)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{exercise}</span>
                  </button>
                ))
              ) : exerciseSearch.trim() ? (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No exercises found for "{exerciseSearch}"</p>
                  <p className="text-sm">Try creating a custom exercise below!</p>
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => addExercise(exercise)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{exercise}</span>
                  </button>
                ))
              )}
            </div>
            
            {/* Custom Exercise Option */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Can't find your exercise? Create a custom one:
              </p>
              <button
                onClick={() => setShowCreateCustomExercise(true)}
                className="w-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 py-2 px-4 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Custom Exercise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
