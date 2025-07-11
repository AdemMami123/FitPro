'use client'

import { useWeightUnit } from '@/contexts/WeightUnitContext'

export default function WeightUnitSelector() {
  const { unit, setUnit } = useWeightUnit()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight Unit:</span>
      <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setUnit('kg')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            unit === 'kg'
              ? 'bg-orange-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          kg
        </button>
        <button
          onClick={() => setUnit('lbs')}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            unit === 'lbs'
              ? 'bg-orange-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          lbs
        </button>
      </div>
    </div>
  )
}
