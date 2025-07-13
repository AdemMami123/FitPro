import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { addHealthMetric } from '@/lib/actions/health.action'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metrics } = await request.json()
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Metrics array is required and cannot be empty' 
      }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i]
      
      // Validate each metric
      if (!metric.type || metric.value === undefined || metric.value === null) {
        errors.push(`Metric ${i + 1}: Missing required fields (type, value)`)
        continue
      }

      if (typeof metric.value !== 'number' || isNaN(metric.value)) {
        errors.push(`Metric ${i + 1}: Value must be a valid number`)
        continue
      }

      try {
        const result = await addHealthMetric({
          type: metric.type,
          value: metric.value,
          date: metric.date || new Date().toISOString(),
          notes: metric.notes || '',
          unit: metric.unit || '',
          source: metric.source || 'bulk_import'
        })

        if (result.success) {
          results.push({ success: true, id: result.id, index: i })
        } else {
          errors.push(`Metric ${i + 1}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`Metric ${i + 1}: Failed to add metric`)
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        successful: results.length,
        failed: errors.length,
        total: metrics.length,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('Bulk health metrics API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
