'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/fitness'

interface MealNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  name: string
  ingredients: string[]
  instructions: string
  nutrition: MealNutrition
}

interface DayMeals {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
}

interface WeeklyMealPlan {
  [day: string]: DayMeals
}

interface MealPlanResponse {
  weeklyPlan: WeeklyMealPlan
  weeklyTotals: {
    averageCalories: number
    averageProtein: number
    averageCarbs: number
    averageFat: number
  }
  shoppingList: string[]
  tips: string[]
}

export default function MealPlanner({ profile }: { profile: UserProfile | null }) {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [preferences, setPreferences] = useState('')
  const [servings, setServings] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null)
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [activeTab, setActiveTab] = useState('plan')
  const [error, setError] = useState<string | null>(null)

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient('')
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const generateMealPlan = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          preferences,
          servings,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.parsed) {
          setMealPlan(data.mealPlan)
          setActiveTab('view')
        } else {
          setError('Generated meal plan but could not parse. Please try again.')
        }
      } else {
        setError(data.error || 'Failed to generate meal plan')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Meal plan generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🍽️ AI Weekly Meal Planner
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'plan'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Generate Plan
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'view'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            View Plan
          </button>
        </div>
      </div>

      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Ingredients Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Ingredients & Foods
            </h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="Enter ingredient (e.g., chicken, rice, broccoli)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addIngredient}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Add
                </button>
              </div>
              
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preferences & Requirements
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Preferences (Optional)
                </label>
                <textarea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., vegetarian, low carb, quick meals, spicy food, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Servings
                </label>
                <select
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>1 person</option>
                  <option value={2}>2 people</option>
                  <option value={3}>3 people</option>
                  <option value={4}>4 people</option>
                  <option value={5}>5+ people</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateMealPlan}
              disabled={isGenerating || ingredients.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Your Meal Plan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate AI Meal Plan</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && mealPlan && (
        <div className="space-y-6">
          {/* Weekly Totals */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Nutrition Averages
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mealPlan.weeklyTotals.averageCalories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Calories/day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {mealPlan.weeklyTotals.averageProtein}g
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Protein/day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {mealPlan.weeklyTotals.averageCarbs}g
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Carbs/day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {mealPlan.weeklyTotals.averageFat}g
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fat/day</div>
              </div>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Selected Day Meals */}
          {mealPlan.weeklyPlan[selectedDay] && (
            <div className="space-y-4">
              {/* Breakfast */}
              <MealCard
                title="🍳 Breakfast"
                meal={mealPlan.weeklyPlan[selectedDay].breakfast}
                color="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              />
              
              {/* Lunch */}
              <MealCard
                title="🥗 Lunch"
                meal={mealPlan.weeklyPlan[selectedDay].lunch}
                color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              />
              
              {/* Dinner */}
              <MealCard
                title="🍽️ Dinner"
                meal={mealPlan.weeklyPlan[selectedDay].dinner}
                color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              />
              
              {/* Snacks */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                  🍎 Snacks
                </h4>
                <div className="space-y-3">
                  {mealPlan.weeklyPlan[selectedDay].snacks.map((snack, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-100 dark:border-purple-700">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white">{snack.name}</h5>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {snack.nutrition.calories} cal
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Ingredients:</strong> {snack.ingredients.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {snack.instructions}
                      </p>
                      <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>P: {snack.nutrition.protein}g</span>
                        <span>C: {snack.nutrition.carbs}g</span>
                        <span>F: {snack.nutrition.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shopping List */}
          {mealPlan.shoppingList && mealPlan.shoppingList.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                🛒 Additional Shopping List
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mealPlan.shoppingList.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {mealPlan.tips && mealPlan.tips.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                💡 Meal Prep Tips
              </h4>
              <ul className="space-y-2">
                {mealPlan.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && !mealPlan && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No meal plan generated yet.
          </p>
          <button
            onClick={() => setActiveTab('plan')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Generate Your First Meal Plan
          </button>
        </div>
      )}
    </div>
  )
}

// Helper component for meal cards
function MealCard({ title, meal, color }: { title: string; meal: Meal; color: string }) {
  return (
    <div className={`rounded-lg p-4 border ${color}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {meal.nutrition.calories} cal
        </div>
      </div>
      <h5 className="font-medium text-gray-900 dark:text-white mb-2">{meal.name}</h5>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <strong>Ingredients:</strong> {meal.ingredients.join(', ')}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {meal.instructions}
      </p>
      <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">P: {meal.nutrition.protein}g</span>
        <span className="font-medium">C: {meal.nutrition.carbs}g</span>
        <span className="font-medium">F: {meal.nutrition.fat}g</span>
      </div>
    </div>
  )
}
