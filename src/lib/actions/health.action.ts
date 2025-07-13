import { db } from '@/firebase/admin'
import { getCurrentUser } from './auth.action'
import { HealthMetric, VitalSigns, SleepData, StressLevel, HydrationEntry, HealthInsight, HealthDashboard } from '@/types/fitness'

export async function getHealthDashboard() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get recent health metrics
    const metricsRef = db.collection('health_metrics')
      .where('userId', '==', user.id)
      .orderBy('date', 'desc')
      .limit(30)

    const metricsSnapshot = await metricsRef.get()
    const metrics: HealthMetric[] = metricsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthMetric[]

    // Get recent insights
    const insightsRef = db.collection('health_insights')
      .where('userId', '==', user.id)
      .where('dismissed', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(10)

    const insightsSnapshot = await insightsRef.get()
    const insights: HealthInsight[] = insightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthInsight[]

    // Calculate current metrics from recent data
    const currentMetrics = calculateCurrentMetrics(metrics)
    
    // Calculate trends
    const trends = calculateTrends(metrics)

    const healthDashboard = {
      userId: user.id,
      lastUpdated: new Date().toISOString(),
      metrics, // Include the raw metrics array for the frontend
      currentMetrics,
      trends,
      insights,
      goals: {
        targetWeight: 75, // This should come from user profile
        targetBodyFat: 15,
        dailyWaterGoal: 2500,
        sleepGoal: 8,
        stepsGoal: 10000
      }
    }

    return { success: true, dashboard: healthDashboard }
  } catch (error) {
    console.error('Error getting health dashboard:', error)
    return { success: false, error: 'Failed to get health dashboard' }
  }
}

export async function addHealthMetric(metric: Omit<HealthMetric, 'id' | 'userId' | 'createdAt'>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const newMetric: Omit<HealthMetric, 'id'> = {
      ...metric,
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('health_metrics').add(newMetric)
    
    // Generate insights based on new metric
    await generateHealthInsights(user.id, newMetric)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding health metric:', error)
    return { success: false, error: 'Failed to add health metric' }
  }
}

export async function addVitalSigns(vitals: Omit<VitalSigns, 'id' | 'userId' | 'createdAt'>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const newVitals: Omit<VitalSigns, 'id'> = {
      ...vitals,
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('vital_signs').add(newVitals)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding vital signs:', error)
    return { success: false, error: 'Failed to add vital signs' }
  }
}

export async function addSleepData(sleepData: Omit<SleepData, 'id' | 'userId' | 'createdAt'>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const newSleepData: Omit<SleepData, 'id'> = {
      ...sleepData,
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('sleep_data').add(newSleepData)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding sleep data:', error)
    return { success: false, error: 'Failed to add sleep data' }
  }
}

export async function addHydrationEntry(hydration: Omit<HydrationEntry, 'id' | 'userId' | 'createdAt'>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const newHydration: Omit<HydrationEntry, 'id'> = {
      ...hydration,
      userId: user.id,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('hydration_entries').add(newHydration)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding hydration entry:', error)
    return { success: false, error: 'Failed to add hydration entry' }
  }
}

export async function dismissHealthInsight(insightId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    await db.collection('health_insights').doc(insightId).update({
      dismissed: true,
      dismissedAt: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    console.error('Error dismissing health insight:', error)
    return { success: false, error: 'Failed to dismiss insight' }
  }
}

// Helper functions
function calculateCurrentMetrics(metrics: HealthMetric[]) {
  const currentMetrics: any = {}
  
  // Get the most recent value for each metric type
  const metricTypes = ['weight', 'body_fat', 'muscle_mass', 'water_weight', 'bone_mass', 'visceral_fat', 'bmr', 'body_age']
  
  metricTypes.forEach(type => {
    const recentMetric = metrics.find(m => m.type === type)
    if (recentMetric) {
      currentMetrics[type === 'body_fat' ? 'bodyFat' : type] = recentMetric.value
    }
  })

  // Calculate BMI if we have weight and height
  if (currentMetrics.weight) {
    // Height should come from user profile - using placeholder for now
    const height = 175 // cm
    currentMetrics.bmi = currentMetrics.weight / Math.pow(height / 100, 2)
  }

  // Add mock data for other metrics
  currentMetrics.restingHeartRate = 65
  currentMetrics.averageSleep = 7.5
  currentMetrics.stressLevel = 3
  currentMetrics.hydrationGoal = 2500
  currentMetrics.dailyHydration = 1800

  return currentMetrics
}

function calculateTrends(metrics: HealthMetric[]) {
  // Simple trend calculation - in a real app, this would be more sophisticated
  const trends = {
    weightTrend: 'stable' as 'up' | 'down' | 'stable',
    fitnessProgress: 'improving' as 'improving' | 'declining' | 'stable',
    sleepQuality: 'stable' as 'improving' | 'declining' | 'stable',
    stressLevel: 'improving' as 'improving' | 'declining' | 'stable'
  }

  // Calculate weight trend
  const weightMetrics = metrics.filter(m => m.type === 'weight').slice(0, 10)
  if (weightMetrics.length >= 2) {
    const recent = weightMetrics[0].value
    const older = weightMetrics[weightMetrics.length - 1].value
    const change = recent - older
    
    if (change > 1) {
      trends.weightTrend = 'up'
    } else if (change < -1) {
      trends.weightTrend = 'down'
    }
  }

  return trends
}

async function generateHealthInsights(userId: string, newMetric: Omit<HealthMetric, 'id'>) {
  // Generate insights based on new metric
  const insights: Omit<HealthInsight, 'id'>[] = []

  // Example insight generation logic
  if (newMetric.type === 'weight') {
    // Get recent weight metrics to check for trends
    const recentWeightMetrics = await db.collection('health_metrics')
      .where('userId', '==', userId)
      .where('type', '==', 'weight')
      .orderBy('date', 'desc')
      .limit(5)
      .get()

    if (recentWeightMetrics.docs.length >= 2) {
      const weights = recentWeightMetrics.docs.map(doc => doc.data().value)
      const trend = weights[0] - weights[weights.length - 1]

      if (Math.abs(trend) > 2) {
        insights.push({
          userId,
          type: 'trend',
          category: 'weight',
          title: trend > 0 ? 'Weight Increasing' : 'Weight Decreasing',
          message: `Your weight has ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)}kg over recent measurements.`,
          severity: Math.abs(trend) > 5 ? 'high' : 'medium',
          actionable: true,
          recommendations: trend > 0 ? 
            ['Review your nutrition plan', 'Consider increasing cardio', 'Track your calorie intake'] :
            ['Ensure adequate protein intake', 'Consider strength training', 'Monitor for muscle loss'],
          createdAt: new Date().toISOString(),
          dismissed: false
        })
      }
    }
  }

  // Save insights to database
  for (const insight of insights) {
    await db.collection('health_insights').add(insight)
  }
}

export async function getHealthMetrics(limit: number = 30, type?: string, startDate?: string, endDate?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    let query = db.collection('health_metrics')
      .where('userId', '==', user.id)
      .orderBy('date', 'desc')

    // Add type filter if specified
    if (type) {
      query = query.where('type', '==', type)
    }

    // Add date range filters if specified
    if (startDate) {
      query = query.where('date', '>=', startDate)
    }
    if (endDate) {
      query = query.where('date', '<=', endDate)
    }

    query = query.limit(limit)

    const snapshot = await query.get()
    const metrics: HealthMetric[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthMetric[]

    return { success: true, metrics }
  } catch (error) {
    console.error('Error getting health metrics:', error)
    return { success: false, error: 'Failed to get health metrics' }
  }
}
