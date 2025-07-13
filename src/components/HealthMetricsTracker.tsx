'use client'

import { useState, useEffect } from 'react'
import { addHealthMetric, getHealthMetrics } from '@/lib/actions/health.action'
import { useWeightUnit } from '@/contexts/WeightUnitContext'
import { HealthMetric } from '@/types/fitness'

interface HealthMetricsTrackerProps {
  onMetricAdded?: () => void
}

export default function HealthMetricsTracker(props: HealthMetricsTrackerProps = {}) {
  const { onMetricAdded } = props
  const { unit, convertWeight, formatWeight } = useWeightUnit()
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add')
  const [newMetric, setNewMetric] = useState({
    type: 'weight' as const,
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  const metricTypes = [
    { value: 'weight', label: 'Weight', unit: unit, icon: '⚖️' },
    { value: 'body_fat', label: 'Body Fat %', unit: '%', icon: '📊' },
    { value: 'muscle_mass', label: 'Muscle Mass', unit: unit, icon: '💪' },
    { value: 'water_weight', label: 'Water Weight', unit: '%', icon: '💧' },
    { value: 'bmi', label: 'BMI', unit: 'kg/m²', icon: '📏' },
    { value: 'body_age', label: 'Body Age', unit: 'years', icon: '🎂' }
  ]

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const result = await getHealthMetrics(50)
      if (result.success && result.metrics) {
        setMetrics(result.metrics)
      }
    } catch (error) {
      console.error('Error loading health metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMetric = async () => {
    if (!newMetric.value || !newMetric.type) return

    setIsAddingMetric(true)
    try {
      let value = parseFloat(newMetric.value)
      
      // Convert weight to kg if needed
      if (newMetric.type === 'weight' && unit === 'lbs') {
        value = convertWeight(value, 'lbs', 'kg')
      }

      const metricData = {
        type: newMetric.type,
        value: value,
        unit: newMetric.type === 'weight' ? 'kg' : metricTypes.find(t => t.value === newMetric.type)?.unit || '',
        date: newMetric.date,
        source: 'manual' as const,
        notes: newMetric.notes || undefined
      }

      const result = await addHealthMetric(metricData)
      
      if (result.success) {
        // Reset form
        setNewMetric({
          type: 'weight',
          value: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        })
        
        // Reload metrics
        await loadMetrics()
        
        // Call callback if provided
        if (onMetricAdded) {
          onMetricAdded()
        }
        
        // Show success message
        alert('Health metric added successfully!')
      } else {
        alert('Failed to add health metric: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding health metric:', error)
      alert('Error adding health metric')
    } finally {
      setIsAddingMetric(false)
    }
  }

  const formatMetricValue = (metric: HealthMetric) => {
    if (metric.type === 'weight') {
      return formatWeight(metric.value) + ' ' + unit
    }
    return metric.value + ' ' + metric.unit
  }

  const getMetricIcon = (type: string) => {
    return metricTypes.find(t => t.value === type)?.icon || '📊'
  }

  const getMetricLabel = (type: string) => {
    return metricTypes.find(t => t.value === type)?.label || type
  }

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.type]) {
      acc[metric.type] = []
    }
    acc[metric.type].push(metric)
    return acc
  }, {} as Record<string, HealthMetric[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading health metrics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 mr-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health Metrics</h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'add', label: 'Add Metric', icon: '➕' },
            { id: 'history', label: 'History', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'add' | 'history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Metric Tab */}
      {activeTab === 'add' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Health Metric</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metric Type
              </label>
              <select
                value={newMetric.type}
                onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {metricTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value ({metricTypes.find(t => t.value === newMetric.type)?.unit})
              </label>
              <input
                type="number"
                value={newMetric.value}
                onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter value"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newMetric.date}
                onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={newMetric.notes}
                onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Add any notes about this measurement..."
              />
            </div>

            <button
              onClick={handleAddMetric}
              disabled={isAddingMetric || !newMetric.value}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isAddingMetric ? 'Adding...' : 'Add Metric'}
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {Object.keys(groupedMetrics).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Health Metrics Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start adding your health metrics to track your progress over time.</p>
            </div>
          ) : (
            Object.entries(groupedMetrics).map(([type, typeMetrics]) => (
              <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">{getMetricIcon(type)}</span>
                  {getMetricLabel(type)}
                </h3>
                
                <div className="space-y-3">
                  {typeMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatMetricValue(metric)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(metric.date).toLocaleDateString()}
                        </div>
                        {metric.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {metric.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {metric.source === 'manual' ? '✏️ Manual' : '📱 Auto'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simple trend indicator */}
                {typeMetrics.length >= 2 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Trend: {typeMetrics[0].value > typeMetrics[1].value ? '📈 Increasing' : 
                              typeMetrics[0].value < typeMetrics[1].value ? '📉 Decreasing' : '➡️ Stable'}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Change: {(typeMetrics[0].value - typeMetrics[1].value).toFixed(1)} {typeMetrics[0].unit}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
