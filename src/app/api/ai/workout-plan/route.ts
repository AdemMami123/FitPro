import { generateText } from 'ai'
import { geminiModel } from '@/lib/ai-config'
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
    const { workoutType, duration, equipment } = await request.json()

    // Create personalized prompt
    const prompt = `
You are a professional fitness coach creating a personalized workout plan. 

User Profile:
- Name: ${user.name}
- Fitness Goal: ${profile?.fitnessGoal || 'general fitness'}
- Experience Level: ${profile?.experienceLevel || 'beginner'}
- Exercise Days Per Week: ${profile?.exerciseDaysPerWeek || 3}
- Weight: ${profile?.weight || 'not specified'}kg
- Height: ${profile?.height || 'not specified'}cm
- Age: ${profile?.age || 'not specified'}
- Gender: ${profile?.gender || 'not specified'}
- Activity Level: ${profile?.activityLevel || 'not specified'}
- Injuries: ${profile?.injuries?.join(', ') || 'none specified'}
- Gym Access: ${profile?.gymAccess ? 'Yes' : 'No'}
- Home Equipment: ${profile?.homeEquipment?.join(', ') || 'none specified'}

Workout Request:
- Type: ${workoutType}
- Duration: ${duration} minutes
- Equipment: ${equipment}

Create a detailed workout plan that includes:
1. Warm-up (5-10 minutes)
2. Main workout exercises with sets, reps, and rest periods
3. Cool-down (5-10 minutes)
4. Safety tips and modifications for the user's experience level
5. Notes about progression

Format the response as a structured workout plan with clear sections and bullet points.
Make it motivating and tailored to the user's goals and fitness level.
`

    // Generate workout plan using Gemini
    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return NextResponse.json({ 
      success: true,
      workoutPlan: text,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating workout plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate workout plan' },
      { status: 500 }
    )
  }
}
