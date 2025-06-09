#!/usr/bin/env node

/**
 * This script tests Firebase connectivity using the environment variables.
 * Run it with: npm run test-firebase
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Get Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Utility function to format time
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function testFirebase() {
  console.log('\n🔥 Firebase Connection Test 🔥\n');
  
  // Validate that required environment variables are set
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease run: npm run setup-env');
    process.exit(1);
  }
  
  try {
    console.log('📌 Initializing Firebase app...');
    const startInit = Date.now();
    const app = initializeApp(firebaseConfig);
    console.log(`✅ Firebase app initialized successfully (${formatTime(Date.now() - startInit)})`);
    
    // Test Authentication
    console.log('\n📌 Testing Firebase Authentication...');
    const startAuth = Date.now();
    const auth = getAuth(app);
    await signInAnonymously(auth);
    console.log(`✅ Authentication working (${formatTime(Date.now() - startAuth)})`);
    
    // Test Firestore
    console.log('\n📌 Testing Firestore connection...');
    const startFirestore = Date.now();
    const db = getFirestore(app);
    
    // Try to get a sample collection (cars)
    const carsQuery = query(collection(db, 'cars'), limit(1));
    const snapshot = await getDocs(carsQuery);
    
    console.log(`✅ Firestore connection successful (${formatTime(Date.now() - startFirestore)})`);
    console.log(`   Retrieved ${snapshot.size} document(s) from 'cars' collection`);
    
    // Overall success
    console.log('\n🎉 SUCCESS: Firebase is properly configured and working!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firebase test failed:');
    console.error(`   ${error.message}`);
    
    if (error.code === 'auth/invalid-api-key') {
      console.error('\n🔑 Your Firebase API key is invalid. Please check for typos in your .env.local file.');
    } else if (error.code === 'auth/project-not-found') {
      console.error('\n🔍 Firebase project not found. Please verify your project ID in the .env.local file.');
    } else if (error.code === 'unavailable') {
      console.error('\n🌐 Network error. Please check your internet connection.');
    }
    
    console.error('\nPlease run: npm run setup-env');
    process.exit(1);
  }
}

testFirebase(); 