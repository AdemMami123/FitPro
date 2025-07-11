// Simple test script to verify Firebase configuration
import { auth, db } from './src/firebase/admin.js';

async function testFirebaseConfig() {
  try {
    console.log('Testing Firebase Admin configuration...');
    
    // Test auth
    const authTest = await auth.listUsers(1);
    console.log('✅ Firebase Auth connection successful');
    
    // Test Firestore
    const testDoc = await db.collection('test').doc('test').get();
    console.log('✅ Firestore connection successful');
    
    console.log('🎉 All Firebase connections working properly!');
  } catch (error) {
    console.error('❌ Firebase configuration error:', error);
  }
}

testFirebaseConfig();
