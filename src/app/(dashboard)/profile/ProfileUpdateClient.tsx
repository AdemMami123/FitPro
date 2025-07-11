'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/fitness'
import { updateUserProfile, calculateBMI } from '@/lib/actions/profile.action'
import { useWeightUnit } from '@/contexts/WeightUnitContext'

interface ProfileUpdateClientProps {
  initialData: UserProfile | null
}

export default function ProfileUpdateClient({ initialData }: ProfileUpdateClientProps) {
  const router = useRouter()
  const { unit, convertWeight, formatWeight } = useWeightUnit()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    weight: initialData?.weight || undefined,
    height: initialData?.height || undefined,
    age: initialData?.age || undefined,
    gender: initialData?.gender || undefined,
    fitnessGoal: initialData?.fitnessGoal || undefined,
    exerciseDaysPerWeek: initialData?.exerciseDaysPerWeek || undefined,
    experienceLevel: initialData?.experienceLevel || undefined,
    activityLevel: initialData?.activityLevel || undefined,
    gymAccess: initialData?.gymAccess || undefined,
    dailyCalorieGoal: initialData?.dailyCalorieGoal || undefined,
    preferredWorkoutDuration: initialData?.preferredWorkoutDuration || undefined,
    preferredWorkoutTime: initialData?.preferredWorkoutTime || undefined,
    targetWeight: initialData?.targetWeight || undefined,
    startingWeight: initialData?.startingWeight || undefined,
    ...initialData
  })

  const [currentBMI, setCurrentBMI] = useState<number | null>(null)

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (formData.weight && formData.height) {
      calculateBMI(formData.weight, formData.height).then(bmi => {
        setCurrentBMI(bmi)
      })
    }
  }, [formData.weight, formData.height])

  const updateFormData = (data: Partial<UserProfile>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await updateUserProfile(formData)
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Profile update error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your age"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => updateFormData({ gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight ({unit})
              </label>
              <input
                type="number"
                value={formData.weight ? (unit === 'lbs' ? convertWeight(formData.weight, 'kg', 'lbs') : formData.weight) : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value)) {
                    const weightInKg = unit === 'lbs' ? convertWeight(value, 'lbs', 'kg') : value
                    updateFormData({ weight: weightInKg })
                  } else {
                    updateFormData({ weight: undefined })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={`Enter weight in ${unit}`}
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height || ''}
                onChange={(e) => updateFormData({ height: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter height in cm"
                min="50"
                max="250"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Weight ({unit})
              </label>
              <input
                type="number"
                value={formData.targetWeight ? (unit === 'lbs' ? convertWeight(formData.targetWeight, 'kg', 'lbs') : formData.targetWeight) : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value)) {
                    const weightInKg = unit === 'lbs' ? convertWeight(value, 'lbs', 'kg') : value
                    updateFormData({ targetWeight: weightInKg })
                  } else {
                    updateFormData({ targetWeight: undefined })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder={`Target weight in ${unit}`}
                step="0.1"
              />
            </div>

            {/* BMI Display */}
            {currentBMI && (
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current BMI
                </label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentBMI.toFixed(1)}
                  </div>
                  <div className={`text-sm ${getBMICategory(currentBMI).color}`}>
                    {getBMICategory(currentBMI).category}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fitness Goals */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Fitness Goals & Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Primary Fitness Goal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { value: 'weight_loss', label: 'Weight Loss', icon: '🏃‍♂️' },
                  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
                  { value: 'strength', label: 'Strength', icon: '🏋️‍♂️' },
                  { value: 'endurance', label: 'Endurance', icon: '🚴‍♂️' },
                  { value: 'maintenance', label: 'Maintenance', icon: '⚖️' }
                ].map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => updateFormData({ fitnessGoal: goal.value as any })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.fitnessGoal === goal.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{goal.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercise Days Per Week
                </label>
                <select
                  value={formData.exerciseDaysPerWeek || ''}
                  onChange={(e) => updateFormData({ exerciseDaysPerWeek: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select days per week</option>
                  {[1, 2, 3, 4, 5, 6, 7].map(days => (
                    <option key={days} value={days}>{days} day{days > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel || ''}
                  onChange={(e) => updateFormData({ experienceLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level
                </label>
                <select
                  value={formData.activityLevel || ''}
                  onChange={(e) => updateFormData({ activityLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (desk job, minimal activity)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Workout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.preferredWorkoutDuration || ''}
                  onChange={(e) => updateFormData({ preferredWorkoutDuration: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., 60"
                  min="15"
                  max="180"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Workout Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Workout Time
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'morning', label: 'Morning', icon: '🌅' },
                  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
                  { value: 'evening', label: 'Evening', icon: '🌙' }
                ].map(time => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => updateFormData({ preferredWorkoutTime: time.value as any })}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.preferredWorkoutTime === time.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{time.icon}</div>
                    <div className="font-medium text-gray-900 dark:text-white">{time.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Gym Access
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: true, label: 'Yes, I have gym access', icon: '🏋️‍♂️' },
                  { value: false, label: 'No, home workouts only', icon: '🏠' }
                ].map(option => (
                  <button
                    key={option.value.toString()}
                    type="button"
                    onClick={() => updateFormData({ gymAccess: option.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.gymAccess === option.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Goals */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Nutrition Goals
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Calorie Goal (optional)
            </label>
            <input
              type="number"
              value={formData.dailyCalorieGoal || ''}
              onChange={(e) => updateFormData({ dailyCalorieGoal: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., 2000"
              min="1000"
              max="5000"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Leave blank for automatic calculation based on your goals
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
