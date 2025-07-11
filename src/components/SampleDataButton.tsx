'use client'

import { useState } from 'react'
import { createSampleWorkouts } from '@/lib/actions/sample-workouts.action'

export default function SampleDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)

  const handleCreateSampleData = async () => {
    setIsLoading(true)
    try {
      const result = await createSampleWorkouts()
      if (result.success) {
        setIsCreated(true)
        // Reload the page to show the new data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating sample data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCreated) {
    return (
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Sample workouts created!</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleCreateSampleData}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors duration-200"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating Sample Data...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Sample Workouts
        </>
      )}
    </button>
  )
}
