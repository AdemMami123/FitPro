import { generateText } from 'ai'
import { geminiModel } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for personalization
    const profile = await getUserProfile()
    
    // Get request body
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Create system prompt with user context
    const systemPrompt = `
You are FitPro AI, a direct fitness coach. Answer exactly what ${user.name} asks with short, clear responses.

User: ${profile?.fitnessGoal || 'general fitness'} | ${profile?.experienceLevel || 'beginner'} | ${profile?.gymAccess ? 'Gym' : 'No gym'}

Chat History:
${conversationHistory || 'New conversation'}

User asks: ${message}

Rules:
- Answer EXACTLY what they asked
- Keep responses SHORT (2-4 sentences max)
- Be direct and helpful
- Use simple language
- Only essential information
- End with one encouraging word

Focus: Give them what they need, nothing extra.
`

    // Generate response using Gemini
    const { text } = await generateText({
      model: geminiModel,
      prompt: systemPrompt,
      temperature: 0.3,
      maxTokens: 200,
    })

    return NextResponse.json({ 
      success: true,
      response: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating AI chat response:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
