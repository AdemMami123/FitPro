import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { db } from '@/firebase/admin'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week, month, year
    const metricType = searchParams.get('type')

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    let query = db.collection('health_metrics')
      .where('userId', '==', user.id)
      .where('date', '>=', startDate.toISOString())
      .where('date', '<=', now.toISOString())
      .orderBy('date', 'desc')

    // Add type filter if specified
    if (metricType) {
      query = query.where('type', '==', metricType)
    }

    const snapshot = await query.get()
    const metrics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    const statistics = {
      totalEntries: metrics.length,
      period: period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metricTypes: {} as Record<string, any>,
      dailyAverages: {} as Record<string, any>,
      trends: {} as Record<string, any>
    }

    // Group metrics by type
    const metricsByType = metrics.reduce((acc: Record<string, any[]>, metric: any) => {
      if (!acc[metric.type]) {
        acc[metric.type] = []
      }
      acc[metric.type].push(metric)
      return acc
    }, {})

    // Calculate statistics for each metric type
    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      const values = (typeMetrics as any[]).map((m: any) => m.value)
      const count = values.length
      
      if (count > 0) {
        const sum = values.reduce((a: number, b: number) => a + b, 0)
        const avg = sum / count
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        statistics.metricTypes[type] = {
          count,
          average: parseFloat(avg.toFixed(2)),
          min,
          max,
          sum: parseFloat(sum.toFixed(2)),
          unit: (typeMetrics as any[])[0].unit || ''
        }

        // Calculate trend (simple comparison of first half vs second half)
        if (count >= 4) {
          const midPoint = Math.floor(count / 2)
          const firstHalf = values.slice(0, midPoint)
          const secondHalf = values.slice(midPoint)
          
          const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length
          
          const change = secondAvg - firstAvg
          const percentChange = (change / firstAvg) * 100
          
          statistics.trends[type] = {
            change: parseFloat(change.toFixed(2)),
            percentChange: parseFloat(percentChange.toFixed(2)),
            direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
          }
        }
      }
    }

    // Calculate daily averages for the period
    const dailyGroups = metrics.reduce((acc: Record<string, any[]>, metric: any) => {
      const date = new Date(metric.date).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(metric)
      return acc
    }, {})

    statistics.dailyAverages = Object.entries(dailyGroups).reduce((acc: Record<string, number>, [date, dayMetrics]) => {
      acc[date] = (dayMetrics as any[]).length
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      statistics
    })

  } catch (error) {
    console.error('Health statistics API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
