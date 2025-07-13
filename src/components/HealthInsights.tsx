'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Heart, 
  Droplets, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Target,
  RefreshCw,
  Plus,
  X,
  Edit,
  Save,
  Weight,
  Zap,
  Brain,
  Timer,
  BarChart3,
  Sparkles,
  ChevronRight,
  Info,
  Download
} from 'lucide-react'

interface HealthMetric {
  id: string
  type: string
  value: number
  unit: string
  date: string
  notes?: string
  source?: string
}

interface HealthInsight {
  id: string
  type: string
  category: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  recommendations?: string[]
  createdAt: string
  dismissed: boolean
}

interface HealthDashboard {
  metrics: HealthMetric[]
  insights: HealthInsight[]
  currentMetrics: any
  trends: any
  goals: any
  lastUpdated?: string
  userId?: string
}

interface HealthInsightsProps {
  profile: any
}

interface AddMetricForm {
  type: string
  value: string
  unit: string
  notes: string
  date: string
}

export default function HealthInsights({ profile }: HealthInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [addMetricForm, setAddMetricForm] = useState<AddMetricForm>({
    type: 'weight',
    value: '',
    unit: 'kg',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showGoalSettings, setShowGoalSettings] = useState(false)
  const [bulkMetrics, setBulkMetrics] = useState('')
  const [goals, setGoals] = useState({
    targetWeight: '',
    targetBodyFat: '',
    dailyWaterGoal: '',
    sleepGoal: '',
    stepsGoal: ''
  })

  const metricTypes = [
    { value: 'weight', label: 'Weight', unit: 'kg', icon: Weight },
    { value: 'body_fat', label: 'Body Fat', unit: '%', icon: Activity },
    { value: 'muscle_mass', label: 'Muscle Mass', unit: 'kg', icon: Zap },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Heart },
    { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', icon: Heart },
    { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', icon: Heart },
    { value: 'sleep_duration', label: 'Sleep Duration', unit: 'hours', icon: Moon },
    { value: 'water_intake', label: 'Water Intake', unit: 'l', icon: Droplets },
    { value: 'stress_level', label: 'Stress Level', unit: '1-10', icon: Brain },
    { value: 'energy_level', label: 'Energy Level', unit: '1-10', icon: Zap },
    { value: 'mood', label: 'Mood', unit: '1-10', icon: Brain },
    { value: 'steps', label: 'Steps', unit: 'steps', icon: Activity },
    { value: 'calories_burned', label: 'Calories Burned', unit: 'kcal', icon: Activity },
    { value: 'workout_duration', label: 'Workout Duration', unit: 'minutes', icon: Timer }
  ]

  const fetchHealthDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/health/dashboard', {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch health dashboard')
      }
      
      const result = await response.json()
      if (result.success) {
        console.log('Dashboard data received:', result.dashboard) // Debug log
        setDashboard(result.dashboard)
      } else {
        setError(result.error || 'Failed to load health dashboard')
      }
    } catch (err) {
      console.error('Error fetching health dashboard:', err)
      setError('Unable to load health dashboard. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAIInsights = async () => {
    try {
      setLoadingInsights(true)
      const response = await fetch('/api/ai/health-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights')
      }
      
      const result = await response.json()
      if (result.success) {
        setAiInsights(result.insights)
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err)
    } finally {
      setLoadingInsights(false)
    }
  }

  const addHealthMetric = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!addMetricForm.value || !addMetricForm.type) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsAddingMetric(true)
      
      console.log('Adding metric:', addMetricForm) // Debug log
      
      const response = await fetch('/api/health/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: addMetricForm.type,
          value: parseFloat(addMetricForm.value),
          unit: addMetricForm.unit,
          notes: addMetricForm.notes,
          date: addMetricForm.date,
          source: 'manual'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add metric')
      }

      const result = await response.json()
      console.log('Metric added successfully:', result) // Debug log
      
      if (result.success) {
        // Reset form
        setShowAddMetric(false)
        setAddMetricForm({
          type: 'weight',
          value: '',
          unit: 'kg',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        })
        
        // Refresh dashboard data
        await fetchHealthDashboard()
        
        // Show success message
        alert('Metric added successfully!')
      } else {
        throw new Error(result.error || 'Failed to add metric')
      }
    } catch (err) {
      console.error('Error adding metric:', err)
      alert(`Failed to add metric: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsAddingMetric(false)
    }
  }

  const dismissInsight = async (insightId: string) => {
    try {
      const response = await fetch('/api/health/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ insightId })
      })

      if (response.ok) {
        await fetchHealthDashboard()
      }
    } catch (err) {
      console.error('Error dismissing insight:', err)
    }
  }

  const getMetricIcon = (type: string) => {
    const metricType = metricTypes.find(mt => mt.value === type)
    return metricType ? metricType.icon : Activity
  }

  const getMetricLabel = (type: string) => {
    const metricType = metricTypes.find(mt => mt.value === type)
    return metricType ? metricType.label : type
  }

  const formatTrendValue = (value: number, unit: string) => {
    if (unit === '%') return `${value}%`
    if (unit === 'kg') return `${value}kg`
    if (unit === 'bpm') return `${value} bpm`
    if (unit === 'hours') return `${value}h`
    if (unit === 'ml') return `${value}l`
    return `${value} ${unit}`
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const exportMetrics = () => {
    if (!dashboard?.metrics || dashboard.metrics.length === 0) {
      alert('No metrics to export')
      return
    }
    
    const csvHeaders = 'Type,Value,Unit,Date,Notes,Source\n'
    const csvData = dashboard.metrics.map(metric => 
      `${metric.type},${metric.value},${metric.unit || ''},${metric.date},${metric.notes || ''},${metric.source || ''}`
    ).join('\n')
    
    const csv = csvHeaders + csvData
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-metrics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatistics = () => {
    if (!dashboard?.metrics) return null
    
    const stats = {
      totalEntries: dashboard.metrics.length,
      uniqueDays: new Set(dashboard.metrics.map(m => new Date(m.date).toDateString())).size,
      avgEntriesPerDay: 0,
      mostTrackedMetric: '',
      trackingStreak: 0
    }
    
    if (stats.uniqueDays > 0) {
      stats.avgEntriesPerDay = Math.round(stats.totalEntries / stats.uniqueDays)
    }
    
    // Find most tracked metric
    const metricCounts = dashboard.metrics.reduce((acc, metric) => {
      acc[metric.type] = (acc[metric.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    stats.mostTrackedMetric = Object.entries(metricCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    
    // Calculate tracking streak (consecutive days with entries)
    const days = Array.from(new Set(dashboard.metrics.map(m => new Date(m.date).toDateString())))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (days.includes(today) || days.includes(yesterday)) {
      for (let i = 0; i < days.length; i++) {
        const expectedDate = new Date(Date.now() - (i * 86400000)).toDateString()
        if (days.includes(expectedDate)) {
          streak++
        } else {
          break
        }
      }
    }
    
    stats.trackingStreak = streak
    return stats
  }

  useEffect(() => {
    fetchHealthDashboard()
    fetchAIInsights()
  }, [])

  const handleBulkImport = async () => {
    try {
      const lines = bulkMetrics.trim().split('\n')
      const metrics = []
      
      for (const line of lines) {
        const parts = line.split(',').map(part => part.trim())
        if (parts.length >= 3) {
          const [type, value, date, unit, notes] = parts
          const metric = {
            type: type.toLowerCase().replace(' ', '_'),
            value: parseFloat(value),
            date: date || new Date().toISOString().split('T')[0],
            unit: unit || 'kg',
            notes: notes || '',
            source: 'bulk_import'
          }
          
          if (!isNaN(metric.value)) {
            metrics.push(metric)
          }
        }
      }
      
      if (metrics.length === 0) {
        alert('No valid metrics found. Please check your format.')
        return
      }
      
      const response = await fetch('/api/health/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      })
      
      const result = await response.json()
      if (result.success) {
        alert(`Successfully imported ${result.results.successful} metrics`)
        setBulkMetrics('')
        setShowBulkImport(false)
        await fetchHealthDashboard()
      }
    } catch (err) {
      console.error('Bulk import error:', err)
      alert('Failed to import metrics')
    }
  }

  const updateGoals = async () => {
    try {
      const validGoals: Record<string, number> = {}
      Object.entries(goals).forEach(([key, value]) => {
        if (value && !isNaN(parseFloat(value))) {
          validGoals[key] = parseFloat(value)
        }
      })
      
      const response = await fetch('/api/health/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validGoals)
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Goals updated successfully!')
        setShowGoalSettings(false)
        await fetchHealthDashboard()
      }
    } catch (err) {
      console.error('Goal update error:', err)
      alert('Failed to update goals')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading health insights...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertTriangle className="h-12 w-12 text-orange-500" />
        <p className="text-lg text-center">{error}</p>
        <button 
          onClick={fetchHealthDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Activity className="h-12 w-12 text-gray-400" />
        <p className="text-lg text-center">No health data available</p>
        <p className="text-sm text-gray-500 text-center">
          Start tracking your health metrics to see insights here
        </p>
        <button 
          onClick={() => setShowAddMetric(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Your First Metric
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Health Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your health metrics and discover insights
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddMetric(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Metric
          </button>
          <button 
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Bulk Import
          </button>
          <button 
            onClick={() => setShowGoalSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Target className="h-4 w-4" />
            Goals
          </button>
          <button 
            onClick={fetchHealthDashboard}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button 
            onClick={exportMetrics}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Health Metric
              </h3>
              <button 
                onClick={() => setShowAddMetric(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={addHealthMetric} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric Type
                </label>
                <select
                  value={addMetricForm.type}
                  onChange={(e) => {
                    const selectedType = metricTypes.find(mt => mt.value === e.target.value)
                    setAddMetricForm({
                      ...addMetricForm,
                      type: e.target.value,
                      unit: selectedType?.unit || 'kg'
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {metricTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={addMetricForm.value}
                    onChange={(e) => setAddMetricForm({...addMetricForm, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={addMetricForm.unit}
                    onChange={(e) => setAddMetricForm({...addMetricForm, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={addMetricForm.date}
                  onChange={(e) => setAddMetricForm({...addMetricForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={addMetricForm.notes}
                  onChange={(e) => setAddMetricForm({...addMetricForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isAddingMetric}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isAddingMetric ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isAddingMetric ? 'Adding...' : 'Add Metric'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMetric(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bulk Import Metrics
              </h3>
              <button 
                onClick={() => setShowBulkImport(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSV Data (one metric per line)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Format: type, value, date, unit, notes (e.g., "weight, 70.5, 2024-07-13, kg, morning weight")
                </p>
                <textarea
                  value={bulkMetrics}
                  onChange={(e) => setBulkMetrics(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={8}
                  placeholder={`weight, 70.5, 2024-07-13, kg, morning weight
heart_rate, 65, 2024-07-13, bpm, resting
sleep_duration, 7.5, 2024-07-12, hours, good sleep
water_intake, 2500, 2024-07-13, l, daily total`}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleBulkImport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Import Metrics
                </button>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Settings Modal */}
      {showGoalSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Set Health Goals
              </h3>
              <button 
                onClick={() => setShowGoalSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goals.targetWeight}
                  onChange={(e) => setGoals({...goals, targetWeight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goals.targetBodyFat}
                  onChange={(e) => setGoals({...goals, targetBodyFat: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Water Goal (l)
                </label>
                <input
                  type="number"
                  step="100"
                  value={goals.dailyWaterGoal}
                  onChange={(e) => setGoals({...goals, dailyWaterGoal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sleep Goal (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={goals.sleepGoal}
                  onChange={(e) => setGoals({...goals, sleepGoal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Steps Goal
                </label>
                <input
                  type="number"
                  step="1000"
                  value={goals.stepsGoal}
                  onChange={(e) => setGoals({...goals, stepsGoal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={updateGoals}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save Goals
                </button>
                <button
                  onClick={() => setShowGoalSettings(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Card */}
          {(() => {
            const stats = getStatistics()
            return stats ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tracking Statistics</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalEntries}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueDays}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Days Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.trackingStreak}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgEntriesPerDay}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg/Day</div>
                  </div>
                </div>
              </div>
            ) : null
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Metrics Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Weight</h3>
                <Weight className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard.currentMetrics?.weight || dashboard.metrics?.find(m => m.type === 'weight')?.value || '--'} kg
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {dashboard.trends?.weightTrend === 'down' ? '↓ Decreasing' : 
                 dashboard.trends?.weightTrend === 'up' ? '↑ Increasing' : '→ Stable'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Heart Rate</h3>
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard.currentMetrics?.restingHeartRate || dashboard.metrics?.find(m => m.type === 'heart_rate')?.value || '--'} BPM
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Resting rate
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Hydration</h3>
                <Droplets className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard.currentMetrics?.dailyHydration || dashboard.metrics?.filter(m => m.type === 'water_intake' && 
                  new Date(m.date).toDateString() === new Date().toDateString())
                  .reduce((sum, entry) => sum + entry.value, 0) || 0}l
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Today's intake
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Sleep</h3>
                <Moon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboard.currentMetrics?.averageSleep || dashboard.metrics?.find(m => m.type === 'sleep_duration')?.value || '--'}h
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Average sleep
              </p>
            </div>
          </div>

          {/* Health Goals Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Goals</h3>
            </div>
            <div className="space-y-4">
              {dashboard.goals && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Daily Water Goal</span>
                      <span className="text-gray-900 dark:text-white">
                        {dashboard.currentMetrics?.dailyHydration || 0}l / {dashboard.goals.dailyWaterGoal || 2500}l
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${calculateProgress(dashboard.currentMetrics?.dailyHydration || 0, dashboard.goals?.dailyWaterGoal || 2500)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Sleep Goal</span>
                      <span className="text-gray-900 dark:text-white">
                        {dashboard.currentMetrics?.averageSleep || 0}h / {dashboard.goals.sleepGoal || 8}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${calculateProgress(dashboard.currentMetrics?.averageSleep || 0, dashboard.goals?.sleepGoal || 8)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {dashboard.goals.targetWeight && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Weight Goal</span>
                        <span className="text-gray-900 dark:text-white">
                          {dashboard.currentMetrics?.weight || 0}kg / {dashboard.goals.targetWeight}kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${calculateProgress(dashboard.currentMetrics?.weight || 0, dashboard.goals.targetWeight)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Insights</h3>
            </div>
            <div className="space-y-4">
              {dashboard.insights?.filter(insight => !insight.dismissed).slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start justify-between space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {insight.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{insight.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{insight.message}</p>
                  </div>
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )) || (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No insights available yet. Keep tracking your metrics!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Debug Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Debug Info</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Total metrics: {dashboard.metrics?.length || 0} | 
              Dashboard loaded: {dashboard ? 'Yes' : 'No'} | 
              Last updated: {dashboard?.lastUpdated ? new Date(dashboard.lastUpdated).toLocaleString() : 'Never'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Metrics</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboard.metrics && dashboard.metrics.length > 0 ? (
                  dashboard.metrics.slice(0, 10).map((metric, index) => {
                    const Icon = getMetricIcon(metric.type)
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getMetricLabel(metric.type)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(metric.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatTrendValue(metric.value, metric.unit)}
                          </p>
                          {metric.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
                              {metric.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No metrics recorded yet
                    </p>
                    <button 
                      onClick={() => setShowAddMetric(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Add your first metric
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metric Types</h3>
              <div className="space-y-3">
                {metricTypes.map((type) => {
                  const Icon = type.icon
                  const count = dashboard.metrics?.filter(m => m.type === type.value).length || 0
                  return (
                    <div key={type.value} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {count} entries
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Trends</h3>
              </div>
              <div className="space-y-4">
                {dashboard.trends && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Weight</span>
                      <div className="flex items-center gap-2">
                        {dashboard.trends.weightTrend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : dashboard.trends.weightTrend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <span className="h-4 w-4 text-gray-400">→</span>
                        )}
                        <span className={`text-sm ${
                          dashboard.trends.weightTrend === 'down' ? 'text-green-600' :
                          dashboard.trends.weightTrend === 'up' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {dashboard.trends.weightTrend}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Fitness Progress</span>
                      <div className="flex items-center gap-2">
                        {dashboard.trends.fitnessProgress === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : dashboard.trends.fitnessProgress === 'declining' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <span className="h-4 w-4 text-gray-400">→</span>
                        )}
                        <span className={`text-sm ${
                          dashboard.trends.fitnessProgress === 'improving' ? 'text-green-600' :
                          dashboard.trends.fitnessProgress === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {dashboard.trends.fitnessProgress}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Sleep Quality</span>
                      <div className="flex items-center gap-2">
                        {dashboard.trends.sleepQuality === 'improving' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : dashboard.trends.sleepQuality === 'declining' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <span className="h-4 w-4 text-gray-400">→</span>
                        )}
                        <span className={`text-sm ${
                          dashboard.trends.sleepQuality === 'improving' ? 'text-green-600' :
                          dashboard.trends.sleepQuality === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {dashboard.trends.sleepQuality}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Stress Level</span>
                      <div className="flex items-center gap-2">
                        {dashboard.trends.stressLevel === 'improving' ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : dashboard.trends.stressLevel === 'declining' ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <span className="h-4 w-4 text-gray-400">→</span>
                        )}
                        <span className={`text-sm ${
                          dashboard.trends.stressLevel === 'improving' ? 'text-green-600' :
                          dashboard.trends.stressLevel === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {dashboard.trends.stressLevel}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Total Entries</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dashboard.metrics?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Most Tracked</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dashboard.metrics?.length > 0 ? (
                      Object.entries(
                        dashboard.metrics.reduce((acc, metric) => {
                          acc[metric.type] = (acc[metric.type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                    ) : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tracking Days</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dashboard.metrics?.length > 0 ? (
                      new Set(dashboard.metrics.map(m => new Date(m.date).toDateString())).size
                    ) : 0} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Avg Daily Entries</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dashboard.metrics?.length > 0 ? (
                      Math.round(dashboard.metrics.length / Math.max(1, new Set(dashboard.metrics.map(m => new Date(m.date).toDateString())).size))
                    ) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h3>
              </div>
              <button
                onClick={fetchAIInsights}
                disabled={loadingInsights}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loadingInsights ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loadingInsights ? 'Generating...' : 'Generate AI Insights'}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Database Insights */}
              {dashboard.insights?.filter(insight => !insight.dismissed).map((insight, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{insight.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {insight.message}
                      </p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendations:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {insight.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <ChevronRight className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* AI Generated Insights */}
              {aiInsights.map((insight, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 bg-orange-50 dark:bg-orange-900/20 rounded-r-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-orange-600" />
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{insight.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          insight.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {insight.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {insight.message}
                      </p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AI Recommendations:</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {insight.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <ChevronRight className="h-3 w-3 mt-0.5 text-orange-400 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!dashboard.insights || dashboard.insights.filter(i => !i.dismissed).length === 0) && aiInsights.length === 0 && (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No insights available yet. Keep tracking your metrics to get personalized recommendations!
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowAddMetric(true)}
                      className="block mx-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Add some health metrics first
                    </button>
                    <button 
                      onClick={fetchAIInsights}
                      disabled={loadingInsights}
                      className="block mx-auto text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                    >
                      Or generate AI insights from your profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
