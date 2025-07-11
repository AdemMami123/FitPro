import { getCurrentUser } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WorkoutCalendar from '@/components/WorkoutCalendar'
import CalendarStats from '@/components/CalendarStats'
import WorkoutProgramScheduler from '@/components/WorkoutProgramScheduler'

export default async function CalendarPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Workout Calendar 📅
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View your workout schedule and track your fitness journey over time.
            </p>
          </div>
          <div>
            <Link href="/log-workout" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log Workout
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Workout Statistics
        </h2>
        <CalendarStats />
      </div>

      {/* Workout Program Scheduler */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <WorkoutProgramScheduler />
      </div>

      {/* Calendar Component */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <WorkoutCalendar />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📝 How to Use the Calendar
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• <strong>Schedule Workouts:</strong> Use the program scheduler above to plan your workouts for specific dates</p>
          <p>• <strong>Log Workouts:</strong> Go to the <Link href="/log-workout" className="underline hover:text-blue-600 dark:hover:text-blue-100">Log Workout</Link> page to record completed workouts</p>
          <p>• <strong>View Details:</strong> Click on any workout in the calendar to see detailed information</p>
          <p>• <strong>Navigate:</strong> Use the arrow buttons to navigate between months</p>
          <p>• <strong>Track Progress:</strong> The statistics section shows your overall workout metrics</p>
        </div>
      </div>
    </div>
  )
}
