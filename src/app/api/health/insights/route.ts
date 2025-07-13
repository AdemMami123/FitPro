import { NextRequest, NextResponse } from 'next/server'
import { dismissHealthInsight } from '@/lib/actions/health.action'

export async function POST(request: NextRequest) {
  try {
    const { insightId } = await request.json()
    
    const result = await dismissHealthInsight(insightId)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Health insight dismissed successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Dismiss health insight API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
