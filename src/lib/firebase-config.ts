/**
 * Client-side Firebase configuration utilities
 * This file should not import any Node.js modules
 */

/**
 * Get Firebase client configuration from environment variables
 * This function should only be used on the server side
 */
export function getFirebaseClientConfig() {
  // Only allow this function to run on server side
  if (typeof window !== 'undefined') {
    throw new Error('getFirebaseClientConfig should only be called on the server side');
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validate client config
  const missingKeys = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase client configuration: ${missingKeys.join(', ')}\n` +
      'Please check your environment variables.'
    );
  }

  return config;
}
