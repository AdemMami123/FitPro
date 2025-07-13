import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { geminiModel } from '@/lib/gemini'
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getUserProfile } from '@/lib/actions/profile.action'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const profile = await getUserProfile()
    if (!profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 })
    }

    const prompt = `
As a professional fitness and health coach, analyze this user's profile and provide personalized health insights:

User Profile:
- Name: ${profile.name}
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}  
- Weight: ${profile.weight || 'Not specified'}kg
- Height: ${profile.height || 'Not specified'}cm
- Fitness Goal: ${profile.fitnessGoal || 'Not specified'}
- Activity Level: ${profile.activityLevel || 'Not specified'}
- Exercise Days Per Week: ${profile.exerciseDaysPerWeek || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'Not specified'}
- Target Weight: ${profile.targetWeight || 'Not specified'}kg
- Daily Calorie Goal: ${profile.dailyCalorieGoal || 'Not specified'}
- Dietary Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'None'}
- Injuries: ${profile.injuries?.join(', ') || 'None'}

Based on this profile, generate 3-5 personalized health insights in the following JSON format:
{
  "insights": [
    {
      "type": "recommendation|trend|alert|achievement",
      "category": "fitness|nutrition|health|wellness",
      "title": "Insight Title",
      "message": "Detailed personalized message based on their profile",
      "severity": "low|medium|high",
      "actionable": true|false,
      "recommendations": ["specific action 1", "specific action 2", "specific action 3"]
    }
  ]
}

Make the insights:
1. Highly personalized to their specific profile
2. Actionable with concrete recommendations
3. Encouraging and motivating
4. Based on fitness science and best practices
5. Relevant to their goals and current status

Focus on areas like:
- BMI and weight management recommendations
- Workout frequency optimization
- Nutrition suggestions based on their goals
- Recovery and rest recommendations
- Goal-specific training advice
- Potential health considerations based on their profile

Return only the JSON object, no additional text.
`

    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      maxTokens: 2000,
      temperature: 0.7,
    })

    try {
      // Clean the text response from markdown code blocks
      let cleanedText = text.trim()
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '')
      }
      
      const insights = JSON.parse(cleanedText)
      return NextResponse.json({ 
        success: true, 
        insights: insights.insights 
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI response text:', text)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to generate insights' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('AI health insights generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
