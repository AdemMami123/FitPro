'use client'

import { useState } from 'react'
import { UserProfile } from '@/types/fitness'

interface ProfileSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void
  initialData?: Partial<UserProfile>
}

export default function ProfileSetup({ onComplete, initialData }: ProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(1)
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

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  const steps = [
    { number: 1, title: 'Basic Info', completed: currentStep > 1 },
    { number: 2, title: 'Fitness Goals', completed: currentStep > 2 },
    { number: 3, title: 'Experience', completed: currentStep > 3 },
    { number: 4, title: 'Preferences', completed: currentStep > 4 }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600 mt-2">Step {currentStep} of 4</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateFormData({ age: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => updateFormData({ gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => updateFormData({ height: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your height"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's your primary fitness goal?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'weight_loss', label: 'Weight Loss', icon: '🏃‍♂️' },
                  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
                  { value: 'strength', label: 'Strength', icon: '🏋️‍♂️' },
                  { value: 'endurance', label: 'Endurance', icon: '🚴‍♂️' },
                  { value: 'maintenance', label: 'Maintenance', icon: '⚖️' }
                ].map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => updateFormData({ fitnessGoal: goal.value as any })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.fitnessGoal === goal.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many days per week do you want to exercise?
              </label>
              <select
                value={formData.exerciseDaysPerWeek || ''}
                onChange={(e) => updateFormData({ exerciseDaysPerWeek: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's your fitness experience level?
              </label>
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a long break' },
                  { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise for 6+ months' },
                  { value: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years' }
                ].map(level => (
                  <button
                    key={level.value}
                    onClick={() => updateFormData({ experienceLevel: level.value as any })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.experienceLevel === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How active are you outside of planned workouts?
              </label>
              <select
                value={formData.activityLevel || ''}
                onChange={(e) => updateFormData({ activityLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Do you have access to a gym?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateFormData({ gymAccess: true })}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    formData.gymAccess === true
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏋️‍♂️</div>
                  <div className="font-medium">Yes, I have gym access</div>
                </button>
                <button
                  onClick={() => updateFormData({ gymAccess: false })}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                    formData.gymAccess === false
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="font-medium">No, home workouts only</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Calorie Goal (optional)
              </label>
              <input
                type="number"
                value={formData.dailyCalorieGoal || ''}
                onChange={(e) => updateFormData({ dailyCalorieGoal: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter daily calorie goal"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Complete Setup
          </button>
        )}
      </div>
    </div>
  )
}
