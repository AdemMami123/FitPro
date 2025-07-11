'use client'

import { useState } from 'react'
import { saveWorkoutPlan } from '@/lib/actions/database.action'

export default function WorkoutPlanGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [workoutPlan, setWorkoutPlan] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [workoutType, setWorkoutType] = useState('full_body')
  const [duration, setDuration] = useState(30)
  const [equipment, setEquipment] = useState('bodyweight')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutType,
          duration,
          equipment,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setWorkoutPlan(data.workoutPlan)
      } else {
        setError(data.error || 'Failed to generate workout plan')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Workout plan generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const savePlan = async () => {
    if (!workoutPlan) return
    
    setIsSaving(true)
    try {
      await saveWorkoutPlan(
        workoutType,
        duration,
        equipment,
        workoutPlan,
        `${workoutType} - ${duration}min`
      )
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving workout plan:', error)
      setError('Failed to save workout plan')
    } finally {
      setIsSaving(false)
    }
  }

  const parseWorkoutPlan = (plan: string) => {
    const lines = plan.split('\n').filter(line => line.trim())
    const exercises: any[] = []
    let currentExercise: any = null
    
    lines.forEach(line => {
      const trimmed = line.trim()
      
      // Check if this is an exercise name (numbered or bullet point)
      if (trimmed.match(/^\d+\.|^-\s|\*\s/)) {
        if (currentExercise) {
          exercises.push(currentExercise)
        }
        currentExercise = {
          name: trimmed.replace(/^\d+\.|^-\s|\*\s/, '').trim(),
          sets: '',
          reps: '',
          instructions: ''
        }
      } else if (currentExercise) {
        // Look for sets/reps information
        if (trimmed.toLowerCase().includes('sets') || trimmed.toLowerCase().includes('reps')) {
          const setsMatch = trimmed.match(/(\d+)\s*sets?/i)
          const repsMatch = trimmed.match(/(\d+)\s*reps?/i)
          
          if (setsMatch) currentExercise.sets = setsMatch[1]
          if (repsMatch) currentExercise.reps = repsMatch[1]
        } else if (trimmed.length > 0) {
          // Add to instructions
          currentExercise.instructions += (currentExercise.instructions ? ' ' : '') + trimmed
        }
      }
    })
    
    if (currentExercise) {
      exercises.push(currentExercise)
    }
    
    return exercises
  }

  const displayWorkoutPlan = () => {
    const exercises = parseWorkoutPlan(workoutPlan)
    
    if (exercises.length === 0) {
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed overflow-hidden">
              {workoutPlan}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {index + 1}. {exercise.name}
                </h4>
                <div className="flex space-x-3 text-xs">
                  {exercise.sets && (
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {exercise.sets} sets
                    </span>
                  )}
                  {exercise.reps && (
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      {exercise.reps} reps
                    </span>
                  )}
                </div>
              </div>
              {exercise.instructions && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {exercise.instructions}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const downloadPlan = () => {
    if (!workoutPlan) return

    const blob = new Blob([workoutPlan], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout_plan_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 mr-3">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Workout Plan Generator</h2>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workout Type
          </label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="full_body">Full Body</option>
            <option value="upper_body">Upper Body</option>
            <option value="lower_body">Lower Body</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="hiit">HIIT</option>
            <option value="yoga">Yoga</option>
            <option value="pilates">Pilates</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (minutes)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Equipment
          </label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="bodyweight">Bodyweight Only</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="resistance_bands">Resistance Bands</option>
            <option value="gym_equipment">Full Gym Equipment</option>
            <option value="home_gym">Home Gym Setup</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGeneratePlan}
        disabled={isGenerating}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Your Workout Plan...
          </div>
        ) : (
          'Generate Personalized Workout Plan'
        )}
      </button>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
          Workout plan saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Workout Plan Display */}
      {workoutPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Personalized Workout Plan
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={savePlan}
                disabled={isSaving}
                className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
              <button
                onClick={downloadPlan}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
              >
                Download
              </button>
              <button
                onClick={() => setWorkoutPlan('')}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs"
              >
                Generate New
              </button>
            </div>
          </div>
          
          {displayWorkoutPlan()}
        </div>
      )}
    </div>
  )
}