import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'
import { redirect } from 'next/navigation'
import NutritionGuide from '@/components/NutritionGuide'
import NutritionCalculator from '@/components/NutritionCalculator'
import MealPlanner from '@/components/MealPlannerNew'
import { UserProfile } from '@/types/fitness'

export default async function NutritionPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const profile = await getUserProfile()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nutrition Guide 🥗
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Get personalized nutrition recommendations based on your fitness goals and profile.
        </p>
      </div>

      {/* Nutrition Calculator */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <NutritionCalculator profile={profile} />
      </div>

      {/* Personalized Nutrition Guide */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <NutritionGuide profile={profile} />
      </div>

      {/* Meal Planner */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md p-6">
        <MealPlanner profile={profile} />
      </div>
    </div>
  )
}
