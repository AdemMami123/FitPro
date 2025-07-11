'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/fitness'

interface MealPlan {
  day: string
  meals: {
    breakfast: string[]
    lunch: string[]
    dinner: string[]
    snacks: string[]
  }
}

const mealPlans: Record<string, any> = {
  weight_loss: {
    title: 'Weight Loss Meal Plan',
    description: 'Lower calorie, high protein meals to support weight loss',
    plans: [
      {
        day: 'Monday',
        meals: {
          breakfast: [
            '🥚 Scrambled eggs with spinach',
            '🍞 1 slice whole grain toast',
            '🥑 1/2 avocado sliced',
            '☕ Black coffee or green tea'
          ],
          lunch: [
            '🥗 Grilled chicken salad',
            '🥬 Mixed greens, cucumber, tomatoes',
            '🫒 Olive oil and lemon dressing',
            '🥜 Handful of almonds'
          ],
          dinner: [
            '🐟 Baked salmon (4oz)',
            '🥦 Steamed broccoli',
            '🍠 Roasted sweet potato',
            '🥒 Side salad with vinaigrette'
          ],
          snacks: [
            '🍎 Apple with almond butter',
            '🫐 Greek yogurt with berries'
          ]
        }
      },
      {
        day: 'Tuesday',
        meals: {
          breakfast: [
            '🥣 Overnight oats with berries',
            '🥜 Chia seeds and almonds',
            '🥛 Unsweetened almond milk',
            '🍌 Sliced banana'
          ],
          lunch: [
            '🌯 Turkey and veggie wrap',
            '🥬 Lettuce, tomato, cucumber',
            '🥑 Avocado spread',
            '🥕 Baby carrots'
          ],
          dinner: [
            '🐔 Grilled chicken breast',
            '🥒 Zucchini noodles',
            '🍅 Marinara sauce',
            '🧀 Parmesan cheese'
          ],
          snacks: [
            '🥒 Cucumber with hummus',
            '🥤 Protein smoothie'
          ]
        }
      }
    ]
  },
  muscle_gain: {
    title: 'Muscle Building Meal Plan',
    description: 'Higher calorie, protein-rich meals to support muscle growth',
    plans: [
      {
        day: 'Monday',
        meals: {
          breakfast: [
            '🥞 Protein pancakes (3 large)',
            '🍌 Banana slices',
            '🥜 Peanut butter drizzle',
            '🥛 Protein shake'
          ],
          lunch: [
            '🍚 Chicken and rice bowl',
            '🐔 Grilled chicken breast (6oz)',
            '🥦 Steamed vegetables',
            '🥑 Avocado slices'
          ],
          dinner: [
            '🥩 Lean beef stir-fry',
            '🍜 Brown rice noodles',
            '🥕 Mixed vegetables',
            '🥜 Cashews'
          ],
          snacks: [
            '🥪 Protein sandwich',
            '🥛 Chocolate milk',
            '🍌 Banana with peanut butter'
          ]
        }
      },
      {
        day: 'Tuesday',
        meals: {
          breakfast: [
            '🍳 Breakfast burrito',
            '🥚 3 eggs, cheese, beans',
            '🌶️ Salsa and sour cream',
            '🥤 Orange juice'
          ],
          lunch: [
            '🥪 Tuna melt sandwich',
            '🐟 Tuna salad with cheese',
            '🍞 Whole grain bread',
            '🥔 Sweet potato fries'
          ],
          dinner: [
            '🐟 Salmon with quinoa',
            '🌾 Quinoa pilaf',
            '🥬 Roasted Brussels sprouts',
            '🥖 Dinner roll'
          ],
          snacks: [
            '🥜 Trail mix',
            '🧀 Cheese and crackers',
            '🥤 Protein smoothie'
          ]
        }
      }
    ]
  },
  maintenance: {
    title: 'Balanced Meal Plan',
    description: 'Well-balanced meals for maintaining current weight',
    plans: [
      {
        day: 'Monday',
        meals: {
          breakfast: [
            '🥣 Steel-cut oats',
            '🫐 Fresh berries',
            '🥜 Chopped walnuts',
            '🍯 Drizzle of honey'
          ],
          lunch: [
            '🥗 Mediterranean bowl',
            '🍚 Quinoa base',
            '🥒 Cucumber, olives, feta',
            '🫒 Olive oil dressing'
          ],
          dinner: [
            '🐔 Herb-crusted chicken',
            '🥔 Roasted potatoes',
            '🥕 Glazed carrots',
            '🥬 Side salad'
          ],
          snacks: [
            '🍎 Apple slices',
            '🥤 Herbal tea'
          ]
        }
      },
      {
        day: 'Tuesday',
        meals: {
          breakfast: [
            '🥚 Vegetable omelet',
            '🍅 Tomatoes, peppers, onions',
            '🍞 Whole grain toast',
            '🥤 Fresh orange juice'
          ],
          lunch: [
            '🥪 Grilled veggie sandwich',
            '🥬 Spinach, tomato, hummus',
            '🥨 Baked chips',
            '🥒 Pickle spear'
          ],
          dinner: [
            '🐟 Baked cod',
            '🍚 Wild rice',
            '🥦 Steamed broccoli',
            '🍋 Lemon wedge'
          ],
          snacks: [
            '🧀 String cheese',
            '🥨 Whole grain crackers'
          ]
        }
      }
    ]
  },
  endurance: {
    title: 'Endurance Athlete Meal Plan',
    description: 'Carb-focused meals to fuel endurance performance',
    plans: [
      {
        day: 'Monday',
        meals: {
          breakfast: [
            '🥞 Large stack of pancakes',
            '🍌 Banana slices',
            '🍯 Maple syrup',
            '🥤 Sports drink'
          ],
          lunch: [
            '🍝 Pasta with marinara',
            '🐔 Grilled chicken strips',
            '🥖 Garlic bread',
            '🥗 Caesar salad'
          ],
          dinner: [
            '🍚 Teriyaki salmon bowl',
            '🍚 Brown rice',
            '🥕 Stir-fried vegetables',
            '🥟 Vegetable dumplings'
          ],
          snacks: [
            '🍌 Banana with honey',
            '🥨 Energy bars',
            '🥤 Electrolyte drink'
          ]
        }
      },
      {
        day: 'Tuesday',
        meals: {
          breakfast: [
            '🥣 Large bowl of oatmeal',
            '🍓 Fresh berries',
            '🥜 Granola topping',
            '🥛 Whole milk'
          ],
          lunch: [
            '🥪 Turkey sandwich',
            '🍞 Whole grain bread',
            '🍌 Banana',
            '🥤 Chocolate milk'
          ],
          dinner: [
            '🍖 Lean beef with pasta',
            '🍝 Whole wheat pasta',
            '🥦 Steamed vegetables',
            '🥖 Dinner roll'
          ],
          snacks: [
            '🍇 Grapes',
            '🥨 Pretzels',
            '🥤 Sports drink'
          ]
        }
      }
    ]
  },
  strength: {
    title: 'Strength Building Meal Plan',
    description: 'High protein meals optimized for strength training and muscle building',
    plans: [
      {
        day: 'Monday',
        meals: {
          breakfast: [
            '🥚 4 whole eggs + 2 egg whites',
            '🥓 Turkey bacon (3 strips)',
            '🍞 Whole grain toast',
            '🥛 Protein shake'
          ],
          lunch: [
            '🍚 Chicken and quinoa bowl',
            '🐔 Grilled chicken breast (8oz)',
            '🥦 Steamed broccoli',
            '🥑 Avocado slices'
          ],
          dinner: [
            '🥩 Lean beef steak (6oz)',
            '🍠 Sweet potato',
            '🥕 Roasted vegetables',
            '🥗 Mixed green salad'
          ],
          snacks: [
            '🥜 Mixed nuts',
            '🧀 Greek yogurt with berries',
            '🥛 Casein protein shake'
          ]
        }
      },
      {
        day: 'Tuesday',
        meals: {
          breakfast: [
            '🥞 Protein pancakes (4 large)',
            '🍌 Banana slices',
            '🥜 Almond butter',
            '🥛 Whole milk'
          ],
          lunch: [
            '🥪 Turkey and avocado wrap',
            '🦃 Sliced turkey breast (6oz)',
            '🥒 Cucumber and tomato',
            '🧀 Cheese stick'
          ],
          dinner: [
            '🐟 Grilled salmon (6oz)',
            '🍚 Brown rice',
            '🥦 Steamed vegetables',
            '🥜 Almonds'
          ],
          snacks: [
            '🥚 Hard-boiled eggs (2)',
            '🍌 Banana with peanut butter',
            '🥛 Protein smoothie'
          ]
        }
      }
    ]
  }
}

export default function MealPlanner({ profile }: { profile: UserProfile | null }) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [showShoppingList, setShowShoppingList] = useState(false)
  
  const getMealPlan = () => {
    if (!profile?.fitnessGoal) return mealPlans.maintenance
    return mealPlans[profile.fitnessGoal] || mealPlans.maintenance
  }

  const currentPlan = getMealPlan()
  const selectedPlan = currentPlan.plans[selectedDay]

  const generateShoppingList = () => {
    const ingredients = new Set<string>()
    
    currentPlan.plans.forEach((plan: any) => {
      Object.values(plan.meals).flat().forEach((meal: any) => {
        // Extract ingredients from meal descriptions (simplified)
        const words = meal.split(' ')
        words.forEach((word: any) => {
          if (word.length > 3 && !['with', 'and', 'the', 'or'].includes(word.toLowerCase())) {
            ingredients.add(word.replace(/[🥚🍞🥑☕🥗🥬🫒🥜🐟🥦🍠🥒🍎🫐🥣🌯🐔🥕🧀🥤🥞🍌🍚🥩🍜🥪🐟🌾🥖🍳🥔🥟🍓🥛🍖🍝🍇🥨]/g, ''))
          }
        })
      })
    })

    return Array.from(ingredients).filter(item => item.length > 0).sort()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🍽️ Weekly Meal Planner
        </h2>
        <button
          onClick={() => setShowShoppingList(!showShoppingList)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {showShoppingList ? 'Hide' : 'Show'} Shopping List
        </button>
      </div>

      {/* Plan Description */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-200 mb-2">
          {currentPlan.title}
        </h3>
        <p className="text-orange-700 dark:text-orange-300">{currentPlan.description}</p>
      </div>

      {/* Shopping List */}
      {showShoppingList && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🛒 Shopping List
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {generateShoppingList().map((item, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {currentPlan.plans.map((plan: any, index: number) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedDay === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {plan.day}
          </button>
        ))}
      </div>

      {/* Meal Plan for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakfast */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🌅</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Breakfast</h3>
          </div>
          <ul className="space-y-2">
            {selectedPlan.meals.breakfast.map((item: any, index: number) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lunch */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">☀️</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lunch</h3>
          </div>
          <ul className="space-y-2">
            {selectedPlan.meals.lunch.map((item: any, index: number) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dinner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🌙</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dinner</h3>
          </div>
          <ul className="space-y-2">
            {selectedPlan.meals.dinner.map((item: any, index: number) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Snacks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🍎</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Snacks</h3>
          </div>
          <ul className="space-y-2">
            {selectedPlan.meals.snacks.map((item: any, index: number) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Meal Prep Tips */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-4">
          👨‍🍳 Meal Prep Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 dark:text-yellow-400">📦</span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Batch Cook</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Prepare proteins and grains in bulk on weekends
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 dark:text-yellow-400">🥄</span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Portion Control</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Use containers to pre-portion meals and snacks
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 dark:text-yellow-400">❄️</span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Freeze Extras</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Freeze individual portions for quick future meals
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 dark:text-yellow-400">🔄</span>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200">Mix It Up</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Rotate ingredients to keep meals interesting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
