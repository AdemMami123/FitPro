# Copilot Instructions for FitPro AI Fitness Coach App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js AI Fitness Coach app with Firebase authentication and offline workout tracking capabilities. The app uses TypeScript, Tailwind CSS, and Firebase for backend services.

## Key Technologies
- **Frontend**: Next.js 15 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Admin SDK)
- **AI Integration**: Google Gemini AI API for workout plans and chatbot
- **Offline Storage**: IndexedDB for local workout data

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use server actions for Firebase operations
- Implement proper error handling and loading states
- Use Tailwind CSS for styling with modern, fitness-focused design
- Maintain clean, modular code structure

## Firebase Implementation
- Use Firebase Admin SDK for server-side operations
- Implement session-based authentication with HTTP-only cookies
- Use Firebase Auth for client-side authentication
- Store user profiles and workout data in Firestore
- Implement offline-first approach for workout logging

## Project Structure
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and server actions
- `/src/firebase` - Firebase configuration and initialization
- `/src/types` - TypeScript type definitions

## AI Integration Notes
- Integrate Google Gemini AI for generating personalized workout plans
- Implement AI chatbot for fitness guidance and Q&A
- Use structured prompts for consistent AI responses
- Handle AI API rate limits and errors gracefully

## Security Considerations
- Never expose Firebase private keys in client-side code
- Use environment variables for sensitive configuration
- Implement proper authentication checks on all protected routes
- Validate all user inputs on both client and server sides
