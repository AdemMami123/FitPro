"use server";

import { db } from '@/firebase/admin';
import { getCurrentUser } from '@/lib/actions/auth.action';

export interface SavedChatMessage {
  id: string;
  userId: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  sessionId: string;
}

export interface SavedWorkoutPlan {
  id: string;
  userId: string;
  workoutType: string;
  duration: number;
  equipment: string;
  generatedPlan: string;
  createdAt: string;
  title?: string;
}

export async function saveChatMessage(
  content: string,
  sender: 'user' | 'ai',
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const messageData: Omit<SavedChatMessage, 'id'> = {
      userId: user.id,
      content,
      sender,
      timestamp: new Date().toISOString(),
      sessionId,
    };

    await db.collection('chatMessages').add(messageData);
    return { success: true };
  } catch (error) {
    console.error('Error saving chat message:', error);
    return { success: false, error: 'Failed to save message' };
  }
}

export async function saveWorkoutPlan(
  workoutType: string,
  duration: number,
  equipment: string,
  generatedPlan: string,
  title?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const planData: Omit<SavedWorkoutPlan, 'id'> = {
      userId: user.id,
      workoutType,
      duration,
      equipment,
      generatedPlan,
      title: title || `${workoutType} - ${duration}min`,
      createdAt: new Date().toISOString(),
    };

    await db.collection('workoutPlans').add(planData);
    return { success: true };
  } catch (error) {
    console.error('Error saving workout plan:', error);
    return { success: false, error: 'Failed to save workout plan' };
  }
}

export async function getChatHistory(
  sessionId: string,
  limit: number = 20
): Promise<{ success: boolean; messages?: SavedChatMessage[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const snapshot = await db
      .collection('chatMessages')
      .where('userId', '==', user.id)
      .where('sessionId', '==', sessionId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const messages: SavedChatMessage[] = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() } as SavedChatMessage);
    });

    return { success: true, messages: messages.reverse() };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, error: 'Failed to get chat history' };
  }
}

export async function getUserWorkoutPlans(
  limit: number = 10
): Promise<{ success: boolean; plans?: SavedWorkoutPlan[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const snapshot = await db
      .collection('workoutPlans')
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const plans: SavedWorkoutPlan[] = [];
    snapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() } as SavedWorkoutPlan);
    });

    return { success: true, plans };
  } catch (error) {
    console.error('Error getting workout plans:', error);
    return { success: false, error: 'Failed to get workout plans' };
  }
}
