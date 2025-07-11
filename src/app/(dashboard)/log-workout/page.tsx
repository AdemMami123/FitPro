import { Metadata } from 'next'
import WorkoutLogger from '@/components/WorkoutLogger'

export const metadata: Metadata = {
  title: 'Log Workout - FitPro',
  description: 'Track your workouts and monitor your progress',
}

export default function LogWorkoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <WorkoutLogger />
      </div>
    </div>
  )
}
