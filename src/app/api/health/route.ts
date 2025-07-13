import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { addHealthMetric, getHealthMetrics } from '@/lib/actions/health.action'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getHealthMetrics(30)
    if (result.success) {
      return NextResponse.json(result.metrics)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching health metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, value, unit, notes } = body

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await addHealthMetric({ type, value, unit, notes, date: new Date().toISOString() })
    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Error adding health metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
