'use client'

import { useState, useEffect } from 'react'
import { useWeightUnit } from '@/contexts/WeightUnitContext'
import { UserProfile } from '@/types/fitness'

interface NutritionNeeds {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  water: number
}

export default function NutritionCalculator({ profile }: { profile: UserProfile | null }) {
  const { unit, convertWeight, formatWeight } = useWeightUnit()
  const [nutritionNeeds, setNutritionNeeds] = useState<NutritionNeeds | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      calculateNutritionNeeds()
    }
  }, [profile, unit])

  const calculateNutritionNeeds = () => {
    if (!profile || !profile.weight || !profile.height || !profile.age || !profile.gender) {
      return
    }

    setLoading(true)
    
    try {
      // Calculate BMR using Mifflin-St Jeor Equation
      const weightInKg = unit === 'kg' ? profile.weight : profile.weight * 0.453592
      const heightInCm = profile.height
      const age = profile.age
      
      let bmr: number
      if (profile.gender === 'male') {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5
      } else {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161
      }

      // Apply activity factor
      const activityFactors: Record<string, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9
      }

      const activityFactor = activityFactors[profile.activityLevel || 'moderately_active'] || 1.55
      let maintenanceCalories = bmr * activityFactor

      // Adjust based on fitness goal
      let targetCalories = maintenanceCalories
      if (profile.fitnessGoal === 'weight_loss') {
        targetCalories = maintenanceCalories - 500 // 1 lb per week
      } else if (profile.fitnessGoal === 'muscle_gain') {
        targetCalories = maintenanceCalories + 300 // Lean bulk
      }

      // Calculate macronutrients
      const proteinRatio = profile.fitnessGoal === 'muscle_gain' ? 0.3 : 0.25
      const fatRatio = 0.25
      const carbRatio = 1 - proteinRatio - fatRatio

      const protein = Math.round((targetCalories * proteinRatio) / 4) // 4 calories per gram
      const fat = Math.round((targetCalories * fatRatio) / 9) // 9 calories per gram
      const carbs = Math.round((targetCalories * carbRatio) / 4) // 4 calories per gram

      // Calculate fiber and water needs
      const fiber = Math.round(targetCalories / 1000 * 14) // 14g per 1000 calories
      const water = Math.round(weightInKg * 35) // 35ml per kg body weight

      setNutritionNeeds({
        calories: Math.round(targetCalories),
        protein,
        carbs,
        fat,
        fiber,
        water
      })
    } catch (error) {
      console.error('Error calculating nutrition needs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGoalDescription = () => {
    if (!profile?.fitnessGoal) return ''
    
    const descriptions: Record<string, string> = {
      weight_loss: 'Calorie deficit for sustainable weight loss',
      muscle_gain: 'Calorie surplus with high protein for muscle building',
      maintenance: 'Balanced nutrition to maintain current weight',
      endurance: 'Carb-focused nutrition for endurance performance',
      strength: 'High protein nutrition for strength building'
    }
    
    return descriptions[profile.fitnessGoal] || ''
  }

  const getNutrientColor = (nutrient: string) => {
    switch (nutrient) {
      case 'protein':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
      case 'carbs':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      case 'fat':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
      case 'fiber':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      case 'water':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
    }
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Please complete your profile to get personalized nutrition recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🧮 Nutrition Calculator
        </h2>
        <button
          onClick={calculateNutritionNeeds}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors duration-200 flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recalculate
            </>
          )}
        </button>
      </div>

      {nutritionNeeds ? (
        <div className="space-y-6">
          {/* Goal Description */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Your Nutrition Plan
            </h3>
            <p className="text-blue-800 dark:text-blue-300">{getGoalDescription()}</p>
          </div>

          {/* Daily Calorie Target */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">
                Daily Calorie Target
              </h3>
              <div className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                {nutritionNeeds.calories}
              </div>
              <p className="text-purple-700 dark:text-purple-300 mt-2">calories per day</p>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Protein</h4>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{nutritionNeeds.protein}g</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((nutritionNeeds.protein * 4 / nutritionNeeds.calories) * 100)}% of calories
                  </p>
                </div>
                <div className="text-red-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Carbs</h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{nutritionNeeds.carbs}g</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((nutritionNeeds.carbs * 4 / nutritionNeeds.calories) * 100)}% of calories
                  </p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Fat</h4>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{nutritionNeeds.fat}g</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round((nutritionNeeds.fat * 9 / nutritionNeeds.calories) * 100)}% of calories
                  </p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Nutrients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-200">Fiber</h4>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">{nutritionNeeds.fiber}g per day</p>
                </div>
              </div>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-cyan-100 dark:bg-cyan-900/50 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-900 dark:text-cyan-200">Water</h4>
                  <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{nutritionNeeds.water}ml per day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Tips */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Spread protein intake throughout the day for better absorption</li>
              <li>• Focus on complex carbs for sustained energy</li>
              <li>• Include healthy fats like avocados, nuts, and olive oil</li>
              <li>• Drink water consistently throughout the day</li>
              <li>• Adjust portions based on your hunger and energy levels</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            Click "Calculate" to get your personalized nutrition recommendations.
          </p>
        </div>
      )}
    </div>
  )
}
