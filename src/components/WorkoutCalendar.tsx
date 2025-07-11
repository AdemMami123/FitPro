'use client'

import { useState, useEffect, useCallback } from 'react'
import { getWorkoutsByMonth } from '@/lib/actions/workout.action'

interface WorkoutSession {
  id: string
  name: string
  exercises: any[]
  startTime: Date
  endTime?: Date
  notes?: string
}

interface CalendarDay {
  date: Date
  workouts: WorkoutSession[]
  isCurrentMonth: boolean
}

// Custom event for workout updates
declare global {
  interface WindowEventMap {
    'workoutUpdated': CustomEvent
  }
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  useEffect(() => {
    loadWorkouts()
  }, [currentDate])

  // Listen for workout updates
  useEffect(() => {
    const handleWorkoutUpdate = () => {
      loadWorkouts()
    }
    
    window.addEventListener('workoutUpdated', handleWorkoutUpdate)
    return () => window.removeEventListener('workoutUpdated', handleWorkoutUpdate)
  }, [])

  const loadWorkouts = async () => {
    setLoading(true)
    try {
      const result = await getWorkoutsByMonth(currentYear, currentMonth + 1)
      if (result.success) {
        console.log('Loaded workouts for calendar:', result.workouts)
        setWorkouts(result.workouts || [])
      } else {
        console.error('Failed to load workouts:', result.error)
      }
    } catch (error) {
      console.error('Error loading workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, workouts])

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: CalendarDay[] = []

    // Add days from previous month
    const prevMonth = new Date(currentYear, currentMonth - 1, 0)
    const daysInPrevMonth = prevMonth.getDate()
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i)
      days.push({
        date,
        workouts: getWorkoutsForDate(date),
        isCurrentMonth: false
      })
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      days.push({
        date,
        workouts: getWorkoutsForDate(date),
        isCurrentMonth: true
      })
    }

    // Add days from next month
    const totalCells = 42 // 6 rows × 7 days
    const remainingCells = totalCells - days.length
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentYear, currentMonth + 1, day)
      days.push({
        date,
        workouts: getWorkoutsForDate(date),
        isCurrentMonth: false
      })
    }

    setCalendarDays(days)
  }

  const getWorkoutsForDate = (date: Date): WorkoutSession[] => {
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.startTime)
      return workoutDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1)
    } else {
      newDate.setMonth(currentMonth + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  const getWorkoutDuration = (workout: WorkoutSession) => {
    if (!workout.endTime) return 'In progress'
    const duration = Math.floor((workout.endTime.getTime() - workout.startTime.getTime()) / (1000 * 60))
    return `${duration} min`
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week header */}
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                day.isCurrentMonth
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-900/50'
              } ${
                day.date.toDateString() === new Date().toDateString()
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                  : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.workouts.length > 0 && (
                <div className="space-y-1">
                  {day.workouts.slice(0, 2).map((workout, workoutIndex) => (
                    <div
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                      className="text-xs p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors truncate"
                    >
                      {workout.name}
                    </div>
                  ))}
                  {day.workouts.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{day.workouts.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedWorkout.name}
                </h3>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                    <div className="text-gray-900 dark:text-white">
                      {selectedWorkout.startTime.toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                    <div className="text-gray-900 dark:text-white">
                      {formatTime(selectedWorkout.startTime)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                    <div className="text-gray-900 dark:text-white">
                      {getWorkoutDuration(selectedWorkout)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Exercises:</span>
                    <div className="text-gray-900 dark:text-white">
                      {selectedWorkout.exercises.length}
                    </div>
                  </div>
                </div>

                {selectedWorkout.exercises.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Exercises:</h4>
                    <div className="space-y-2">
                      {selectedWorkout.exercises.map((exercise, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </div>
                          {exercise.sets && exercise.sets.length > 0 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {exercise.sets.length} sets
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedWorkout.notes && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h4>
                    <p className="text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {selectedWorkout.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
