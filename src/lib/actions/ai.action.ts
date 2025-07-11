"use server";

import { generateText } from 'ai';
import { geminiModel } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getUserProfile } from '@/lib/actions/profile.action';
import { UserProfile } from '@/types/fitness';

export interface WorkoutPlan {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  workouts: {
    day: string;
    title: string;
    exercises: {
      name: string;
      sets: string;
      reps: string;
      rest: string;
      instructions: string;
    }[];
  }[];
  nutritionTips: string[];
  progressNotes: string[];
}

export async function generateWorkoutPlan(): Promise<{ success: boolean; plan?: WorkoutPlan; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profile = await getUserProfile();
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const prompt = createWorkoutPlanPrompt(profile);
    
    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse the AI response into a structured workout plan
    const plan = parseWorkoutPlanResponse(text);
    
    return { success: true, plan };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return { success: false, error: 'Failed to generate workout plan' };
  }
}

function createWorkoutPlanPrompt(profile: UserProfile): string {
  return `
As a professional fitness coach, create a personalized workout plan for a user with the following profile:

User Details:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}kg
- Height: ${profile.height || 'Not specified'}cm
- Fitness Goal: ${profile.fitnessGoal || 'general fitness'}
- Exercise Days per Week: ${profile.exerciseDaysPerWeek || 3}
- Experience Level: ${profile.experienceLevel || 'beginner'}
- Activity Level: ${profile.activityLevel || 'moderately active'}
- Gym Access: ${profile.gymAccess ? 'Yes' : 'No'}
- Home Equipment: ${profile.homeEquipment?.join(', ') || 'None specified'}

Please create a comprehensive workout plan that includes:

1. Plan title and description
2. Duration (how many weeks)
3. Difficulty level
4. Weekly workout schedule with specific exercises
5. For each exercise: name, sets, reps, rest periods, and brief instructions
6. Nutrition tips relevant to their goal
7. Progress tracking notes

Format the response as a structured JSON object with the following format:
{
  "title": "Plan Title",
  "description": "Brief description of the plan",
  "duration": "X weeks",
  "difficulty": "beginner/intermediate/advanced",
  "workouts": [
    {
      "day": "Day 1 - Monday",
      "title": "Workout Title",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": "3",
          "reps": "10-12",
          "rest": "60 seconds",
          "instructions": "Brief form instructions"
        }
      ]
    }
  ],
  "nutritionTips": ["Tip 1", "Tip 2"],
  "progressNotes": ["Note 1", "Note 2"]
}

Make sure the plan is safe, appropriate for their experience level, and aligns with their fitness goals.
`;
}

function parseWorkoutPlanResponse(text: string): WorkoutPlan {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If JSON parsing fails, create a basic structure
    return {
      title: "Custom Workout Plan",
      description: "A personalized workout plan generated by AI",
      duration: "4 weeks",
      difficulty: "intermediate",
      workouts: [],
      nutritionTips: [],
      progressNotes: []
    };
  } catch (error) {
    console.error('Error parsing workout plan response:', error);
    return {
      title: "Custom Workout Plan",
      description: "A personalized workout plan generated by AI",
      duration: "4 weeks",
      difficulty: "intermediate",
      workouts: [],
      nutritionTips: [],
      progressNotes: []
    };
  }
}

export async function generateNutritionPlan(): Promise<{ success: boolean; plan?: any; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profile = await getUserProfile();
    if (!profile) {
      return { success: false, error: 'User profile not found' };
    }

    const prompt = createNutritionPlanPrompt(profile);
    
    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    return { success: true, plan: text };
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    return { success: false, error: 'Failed to generate nutrition plan' };
  }
}

function createNutritionPlanPrompt(profile: UserProfile): string {
  return `
As a certified nutritionist, create a personalized nutrition plan for a user with the following profile:

User Details:
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}kg
- Height: ${profile.height || 'Not specified'}cm
- Fitness Goal: ${profile.fitnessGoal || 'general fitness'}
- Activity Level: ${profile.activityLevel || 'moderately active'}
- Dietary Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'None'}
- Daily Calorie Goal: ${profile.dailyCalorieGoal || 'Not specified'}

Please provide:
1. Recommended daily calorie intake
2. Macro breakdown (protein, carbs, fats)
3. Meal timing suggestions
4. Food recommendations
5. Hydration guidelines
6. Supplements (if needed)
7. Tips for their specific fitness goal

Keep the advice practical and achievable.
`;
}
