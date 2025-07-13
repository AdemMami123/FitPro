import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import HealthInsights from '@/components/HealthInsights'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health Insights - FitPro',
  description: 'Monitor your health metrics and trends',
}

export default async function HealthInsightsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const profile = await getUserProfile()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Health Insights 💚
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Monitor your health metrics and trends to optimize your fitness journey.
            </p>
          </div>

          {/* Health Insights Component */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
            <HealthInsights profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}
