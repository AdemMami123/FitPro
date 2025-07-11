import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Server-only utility function to load Firebase service account credentials
 * This file should only be imported by server-side code
 */
export function loadFirebaseServiceAccount() {
  try {
    // Look for Firebase service account key in the project root
    const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  } catch (error) {
    console.log('No Firebase service account file found. Using environment variables.');
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }
}

/**
 * Validate Firebase configuration
 */
export function validateFirebaseConfig() {
  const config = loadFirebaseServiceAccount();
  
  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    throw new Error(
      'Missing Firebase configuration. Please ensure you have either:\n' +
      '1. A firebase-service-account.json file in the project root, or\n' +
      '2. Environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }
  
  return config;
}
