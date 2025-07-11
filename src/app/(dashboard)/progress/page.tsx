import { Metadata } from 'next'
import ProgressTracker from '@/components/ProgressTracker'

export const metadata: Metadata = {
  title: 'Progress Tracking - FitPro',
  description: 'View your fitness progress and achievements',
}

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ProgressTracker />
      </div>
    </div>
  )
}
