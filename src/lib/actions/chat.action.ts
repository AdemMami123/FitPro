"use server";

import { generateText } from 'ai';
import { geminiModel } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getUserProfile } from '@/lib/actions/profile.action';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendChatMessage(message: string, chatHistory: ChatMessage[] = []): Promise<ChatResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profile = await getUserProfile();
    
    // Create context-aware prompt
    const prompt = createChatPrompt(message, profile, chatHistory);
    
    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 200,
    });

    return { success: true, message: text };
  } catch (error) {
    console.error('Error in AI chat:', error);
    return { success: false, error: 'Failed to get AI response' };
  }
}

function createChatPrompt(userMessage: string, profile: any, chatHistory: ChatMessage[]): string {
  const contextInfo = profile ? `
User Profile: ${profile.fitnessGoal || 'general fitness'} | ${profile.experienceLevel || 'beginner'} | ${profile.gymAccess ? 'Gym access' : 'No gym'}
` : '';

  const conversationHistory = chatHistory.slice(-3).map(msg => 
    `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`
  ).join('\n');

  return `You are FitPro AI, a direct and helpful fitness coach. Answer exactly what they ask with clear, short phrases.

${contextInfo}

${conversationHistory ? `Recent chat:\n${conversationHistory}\n` : ''}

User asks: "${userMessage}"

Instructions:
1. Answer EXACTLY what they asked - no extra topics
2. Keep responses SHORT (2-4 sentences max)
3. Use simple, clear language
4. Be direct and to the point
5. Only give essential information
6. No long explanations unless specifically asked
7. Use bullet points (•) only for lists of 3+ items
8. End with one short encouraging phrase

Focus: Give them exactly what they need, nothing more.`;
}

export async function getWorkoutSuggestions(muscleGroup?: string): Promise<ChatResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profile = await getUserProfile();
    
    const prompt = `
Give me 3 quick ${muscleGroup || 'full body'} exercises.

User: ${profile?.experienceLevel || 'beginner'} | ${profile?.gymAccess ? 'Gym' : 'No gym'}

Format:
**1. [Exercise Name]**
• [What to do]
• [Sets x Reps]

**2. [Exercise Name]** 
• [What to do]
• [Sets x Reps]

**3. [Exercise Name]**
• [What to do]
• [Sets x Reps]

Keep it simple and short.
`;

    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 300,
    });

    return { success: true, message: text };
  } catch (error) {
    console.error('Error getting workout suggestions:', error);
    return { success: false, error: 'Failed to get workout suggestions' };
  }
}

export async function getNutritionAdvice(query: string): Promise<ChatResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profile = await getUserProfile();
    
    const prompt = `
Answer this nutrition question: "${query}"

User goal: ${profile?.fitnessGoal || 'general fitness'}

Give a short, direct answer in 2-3 sentences. Include one quick tip. No long explanations.

Format:
**Quick Answer:** [Direct response]
**Tip:** [One practical tip]

Keep it simple and helpful.
`;

    const { text } = await generateText({
      model: geminiModel,
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 250,
    });

    return { success: true, message: text };
  } catch (error) {
    console.error('Error getting nutrition advice:', error);
    return { success: false, error: 'Failed to get nutrition advice' };
  }
}
