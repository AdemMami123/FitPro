'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/fitness'

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void
  initialData?: Partial<UserProfile>
}

export default function ProfileSetup({ onComplete, initialData }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    ...initialData
  })

  const updateFormData = (data: Partial<UserProfile>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.gender && formData.weight && formData.height
      case 2:
        return formData.fitnessGoal && formData.exerciseDaysPerWeek
      case 3:
        return formData.experienceLevel && formData.activityLevel
      case 4:
        return formData.gymAccess !== undefined
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!isCurrentStepValid()) return
    
    setIsSubmitting(true)
    try {
      await onComplete(formData)
    } catch (error) {
      console.error('Profile setup error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', completed: currentStep > 1 },
    { number: 2, title: 'Fitness Goals', completed: currentStep > 2 },
    { number: 3, title: 'Experience', completed: currentStep > 3 },
    { number: 4, title: 'Preferences', completed: currentStep > 4 }
  ]

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                currentStep >= step.number 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white scale-110' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step.completed ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-500 ${
                  currentStep > step.number 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Step {currentStep} of 4</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-10">
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => updateFormData({ gender: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Enter your weight"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => updateFormData({ height: parseFloat(e.target.value) || undefined })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Enter your height"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What's your primary fitness goal?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us create the perfect workout plan for you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { value: 'weight_loss', label: 'Weight Loss', icon: '🏃‍♂️', description: 'Burn calories and shed pounds' },
                { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪', description: 'Build lean muscle mass' },
                { value: 'strength', label: 'Strength', icon: '🏋️‍♂️', description: 'Increase power and lifting capacity' },
                { value: 'endurance', label: 'Endurance', icon: '🚴‍♂️', description: 'Improve cardiovascular fitness' },
                { value: 'maintenance', label: 'Maintenance', icon: '⚖️', description: 'Stay fit and healthy' }
              ].map(goal => (
                <div
                  key={goal.value}
                  onClick={() => updateFormData({ fitnessGoal: goal.value as any })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.fitnessGoal === goal.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{goal.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {goal.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                How many days per week do you want to exercise?
              </label>
              <select
                value={formData.exerciseDaysPerWeek || ''}
                onChange={(e) => updateFormData({ exerciseDaysPerWeek: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                <option value="">Select days per week</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                What's your fitness experience level?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us adjust the intensity of your workouts
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  value: 'beginner', 
                  label: 'Beginner', 
                  description: 'New to fitness or returning after a long break',
                  icon: '🌱'
                },
                { 
                  value: 'intermediate', 
                  label: 'Intermediate', 
                  description: 'Regular exercise for 6+ months',
                  icon: '💪'
                },
                { 
                  value: 'advanced', 
                  label: 'Advanced', 
                  description: 'Consistent training for 2+ years',
                  icon: '🏆'
                }
              ].map(level => (
                <div
                  key={level.value}
                  onClick={() => updateFormData({ experienceLevel: level.value as any })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.experienceLevel === level.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{level.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {level.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                How active are you outside of planned workouts?
              </label>
              <select
                value={formData.activityLevel || ''}
                onChange={(e) => updateFormData({ activityLevel: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (desk job, minimal activity)</option>
                <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Equipment & Preferences
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Let's customize your workout environment
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Do you have access to a gym?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => updateFormData({ gymAccess: true })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.gymAccess === true
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏋️‍♂️</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Yes, I have gym access
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access to full gym equipment
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => updateFormData({ gymAccess: false })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    formData.gymAccess === false
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏠</div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No, home workouts only
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bodyweight and basic equipment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Daily Calorie Goal (optional)
              </label>
              <input
                type="number"
                value={formData.dailyCalorieGoal || ''}
                onChange={(e) => updateFormData({ dailyCalorieGoal: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="Enter daily calorie goal"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                We'll help you track your nutrition based on this goal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
            currentStep === 1
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
          }`}
        >
          ← Previous
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            disabled={!isCurrentStepValid()}
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
              !isCurrentStepValid()
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-lg'
            }`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentStepValid() || isSubmitting}
            className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
              !isCurrentStepValid() || isSubmitting
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up...
              </div>
            ) : (
              'Complete Setup 🎉'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
