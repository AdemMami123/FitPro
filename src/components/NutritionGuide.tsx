'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/fitness'

interface NutritionTip {
  title: string
  description: string
  icon: string
  category: 'general' | 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'strength'
}

const nutritionTips: NutritionTip[] = [
  // General tips
  {
    title: 'Eat a Rainbow',
    description: 'Include colorful fruits and vegetables in your meals to get a variety of vitamins, minerals, and antioxidants.',
    icon: '🌈',
    category: 'general'
  },
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily. More if you\'re active or in hot weather.',
    icon: '💧',
    category: 'general'
  },
  {
    title: 'Plan Your Meals',
    description: 'Meal prep helps you make healthier choices and avoid impulsive food decisions.',
    icon: '📋',
    category: 'general'
  },
  {
    title: 'Listen to Your Body',
    description: 'Pay attention to hunger and fullness cues. Eat when hungry, stop when satisfied.',
    icon: '🎯',
    category: 'general'
  },
  
  // Weight loss tips
  {
    title: 'Control Portions',
    description: 'Use smaller plates and bowls to help control portion sizes without feeling deprived.',
    icon: '🍽️',
    category: 'weight_loss'
  },
  {
    title: 'Eat Protein First',
    description: 'Start meals with protein to increase satiety and preserve muscle mass during weight loss.',
    icon: '🥩',
    category: 'weight_loss'
  },
  {
    title: 'Minimize Liquid Calories',
    description: 'Avoid sugary drinks and excessive alcohol. They add calories without providing satiety.',
    icon: '🥤',
    category: 'weight_loss'
  },
  {
    title: 'Eat Slowly',
    description: 'Take time to chew and savor your food. This helps with digestion and satiety signals.',
    icon: '⏰',
    category: 'weight_loss'
  },
  
  // Muscle gain tips
  {
    title: 'Prioritize Protein',
    description: 'Aim for 1.6-2.2g of protein per kg of body weight to support muscle growth.',
    icon: '💪',
    category: 'muscle_gain'
  },
  {
    title: 'Don\'t Skip Carbs',
    description: 'Carbohydrates fuel your workouts and help with recovery. Include them around training.',
    icon: '🍞',
    category: 'muscle_gain'
  },
  {
    title: 'Time Your Nutrition',
    description: 'Eat protein and carbs within 2 hours post-workout for optimal recovery.',
    icon: '⏱️',
    category: 'muscle_gain'
  },
  {
    title: 'Eat in Surplus',
    description: 'You need extra calories to build muscle. Aim for 300-500 calories above maintenance.',
    icon: '📈',
    category: 'muscle_gain'
  },
  
  // Maintenance tips
  {
    title: 'Balance is Key',
    description: 'Focus on a balanced diet with all macronutrients in appropriate proportions.',
    icon: '⚖️',
    category: 'maintenance'
  },
  {
    title: 'Consistent Meal Times',
    description: 'Try to eat meals at consistent times to help regulate your metabolism.',
    icon: '🕒',
    category: 'maintenance'
  },
  
  // Endurance tips
  {
    title: 'Fuel Your Workouts',
    description: 'Eat carbs 1-3 hours before long training sessions for sustained energy.',
    icon: '⚡',
    category: 'endurance'
  },
  {
    title: 'Recovery Nutrition',
    description: 'Focus on carbs and protein within 30 minutes after endurance training.',
    icon: '🏃‍♂️',
    category: 'endurance'
  }
]

const foodRecommendations: Record<string, any> = {
  weight_loss: {
    title: 'Weight Loss Foods',
    foods: [
      { name: 'Lean Proteins', examples: 'Chicken breast, fish, tofu, Greek yogurt', icon: '🐟' },
      { name: 'Vegetables', examples: 'Broccoli, spinach, bell peppers, zucchini', icon: '🥬' },
      { name: 'Whole Grains', examples: 'Quinoa, brown rice, oats, whole wheat bread', icon: '🌾' },
      { name: 'Healthy Fats', examples: 'Avocado, nuts, olive oil, seeds', icon: '🥑' },
      { name: 'Fruits', examples: 'Berries, apples, oranges, bananas', icon: '🍎' }
    ]
  },
  muscle_gain: {
    title: 'Muscle Building Foods',
    foods: [
      { name: 'High-Protein Foods', examples: 'Eggs, lean meats, protein powder, legumes', icon: '🥚' },
      { name: 'Complex Carbs', examples: 'Sweet potatoes, rice, pasta, oats', icon: '🍠' },
      { name: 'Healthy Fats', examples: 'Nuts, nut butters, fatty fish, olive oil', icon: '🥜' },
      { name: 'Dairy/Alternatives', examples: 'Milk, yogurt, cheese, fortified plant milks', icon: '🥛' },
      { name: 'Calorie-Dense Foods', examples: 'Granola, dried fruits, energy bars', icon: '🍫' }
    ]
  },
  maintenance: {
    title: 'Balanced Nutrition Foods',
    foods: [
      { name: 'Lean Proteins', examples: 'Fish, poultry, beans, tofu', icon: '🐟' },
      { name: 'Whole Grains', examples: 'Brown rice, quinoa, whole wheat, oats', icon: '🌾' },
      { name: 'Healthy Fats', examples: 'Olive oil, avocado, nuts, seeds', icon: '🥑' },
      { name: 'Fruits & Vegetables', examples: 'Variety of colorful produce', icon: '🥗' },
      { name: 'Dairy/Alternatives', examples: 'Greek yogurt, milk, cheese', icon: '🧀' }
    ]
  },
  endurance: {
    title: 'Endurance Performance Foods',
    foods: [
      { name: 'Complex Carbs', examples: 'Pasta, rice, quinoa, sweet potatoes', icon: '🍝' },
      { name: 'Quick Energy', examples: 'Bananas, dates, energy gels, honey', icon: '🍌' },
      { name: 'Lean Proteins', examples: 'Chicken, fish, eggs, Greek yogurt', icon: '🐟' },
      { name: 'Electrolyte Rich', examples: 'Coconut water, sports drinks, salty snacks', icon: '🥥' },
      { name: 'Anti-inflammatory', examples: 'Berries, leafy greens, fatty fish', icon: '🫐' }
    ]
  },
  strength: {
    title: 'Strength Building Foods',
    foods: [
      { name: 'High-Protein Foods', examples: 'Eggs, lean meats, protein powder, legumes', icon: '🥚' },
      { name: 'Complex Carbs', examples: 'Sweet potatoes, rice, pasta, oats', icon: '🍠' },
      { name: 'Healthy Fats', examples: 'Nuts, nut butters, fatty fish, olive oil', icon: '🥜' },
      { name: 'Dairy/Alternatives', examples: 'Milk, yogurt, cheese, fortified plant milks', icon: '🥛' },
      { name: 'Recovery Foods', examples: 'Tart cherry juice, turmeric, ginger', icon: '🍒' }
    ]
  }
}

export default function NutritionGuide({ profile }: { profile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<'tips' | 'foods'>('tips')
  
  const getRelevantTips = () => {
    if (!profile?.fitnessGoal) return nutritionTips.filter(tip => tip.category === 'general')
    
    return nutritionTips.filter(tip => 
      tip.category === 'general' || tip.category === profile.fitnessGoal
    )
  }

  const getFoodRecommendations = () => {
    if (!profile?.fitnessGoal) return foodRecommendations.maintenance
    
    return foodRecommendations[profile.fitnessGoal] || foodRecommendations.maintenance
  }

  const getGoalTitle = () => {
    if (!profile?.fitnessGoal) return 'General Nutrition Guide'
    
    const titles: Record<string, string> = {
      weight_loss: 'Weight Loss Nutrition Guide',
      muscle_gain: 'Muscle Building Nutrition Guide',
      maintenance: 'Maintenance Nutrition Guide',
      endurance: 'Endurance Nutrition Guide',
      strength: 'Strength Building Nutrition Guide'
    }
    
    return titles[profile.fitnessGoal] || 'Nutrition Guide'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📚 {getGoalTitle()}
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            💡 Tips
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'foods'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🍽️ Foods
          </button>
        </div>
      </div>

      {activeTab === 'tips' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getRelevantTips().map((tip, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {getFoodRecommendations().title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFoodRecommendations().foods.map((food: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{food.icon}</span>
                    <h4 className="font-medium text-gray-900 dark:text-white">{food.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{food.examples}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Timing Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⏰ Meal Timing Guide
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Breakfast:</span>
                <span className="text-gray-600 dark:text-gray-400">Within 1 hour of waking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-medium">Pre-workout:</span>
                <span className="text-gray-600 dark:text-gray-400">1-3 hours before exercise</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Post-workout:</span>
                <span className="text-gray-600 dark:text-gray-400">Within 30 minutes after exercise</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Dinner:</span>
                <span className="text-gray-600 dark:text-gray-400">2-3 hours before bed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Resources */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-4">
          📖 Additional Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 dark:text-purple-400">📱</span>
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-200">Track Your Food</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Use food tracking apps to monitor your nutrition intake
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 dark:text-purple-400">👨‍⚕️</span>
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-200">Consult a Professional</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Consider working with a registered dietitian for personalized advice
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 dark:text-purple-400">🧪</span>
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-200">Listen to Your Body</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Adjust recommendations based on how you feel and perform
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-600 dark:text-purple-400">📊</span>
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-200">Monitor Progress</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Track energy levels, performance, and how you feel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
