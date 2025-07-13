import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { addHealthMetric, getHealthMetrics } from '@/lib/actions/health.action'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const result = await getHealthMetrics(limit, type, startDate, endDate)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        metrics: result.metrics 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Get health metrics API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, value, date, notes, unit, source } = await request.json()
    
    // Validate required fields
    if (!type || value === undefined || value === null) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: type and value are required' 
      }, { status: 400 })
    }

    // Validate value is a number
    if (typeof value !== 'number' || isNaN(value)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Value must be a valid number' 
      }, { status: 400 })
    }

    // Validate date format if provided
    if (date && isNaN(Date.parse(date))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid date format' 
      }, { status: 400 })
    }

    const result = await addHealthMetric({ 
      type, 
      value, 
      date: date || new Date().toISOString(), 
      notes: notes || '', 
      unit: unit || '', 
      source: source || 'manual' 
    })
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        id: result.id,
        message: 'Health metric added successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Add health metric API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
