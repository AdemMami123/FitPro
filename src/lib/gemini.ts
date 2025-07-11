import { google } from '@ai-sdk/google';

// Initialize the Google AI client with the model
export const geminiModel = google('models/gemini-1.5-flash');

// Generation config for consistent responses
export const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};
