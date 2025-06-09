#!/usr/bin/env node

/**
 * This script verifies that all required Firebase environment variables are set.
 * Run it with: npm run check-env
 */

require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

function checkEnvVars() {
  console.log('\n🔍 Checking Firebase environment variables...\n');

  let missingVars = [];
  let hasIssues = false;

  // Check for missing variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      missingVars.push(envVar);
      console.error(`❌ Missing: ${envVar}`);
      hasIssues = true;
    } else {
      // Check for common issues with env values
      if (value.includes('"') || value.includes("'")) {
        console.error(`❌ Error: ${envVar} contains quotes. Remove quotes from the value in .env.local`);
        hasIssues = true;
      } else if (value.startsWith(' ') || value.endsWith(' ')) {
        console.error(`❌ Error: ${envVar} has leading/trailing spaces. Remove spaces from the value in .env.local`);
        hasIssues = true;
      } else {
        console.log(`✅ ${envVar} is set properly`);
      }
    }
  }

  console.log('\n');

  if (hasIssues) {
    console.error('❌ Some environment variables are missing or have issues.');
    
    if (missingVars.length > 0) {
      console.log('\n📝 Please create a .env.local file in the project root with the following variables:');
      for (const envVar of missingVars) {
        console.log(`${envVar}=your_value_here`);
      }
      console.log('\nYou can run `npm run setup-env` to create this file interactively.');
    }
    
    process.exit(1);
  } else {
    console.log('✅ All Firebase environment variables are set correctly!');
    console.log('🚀 Your application is ready to use Firebase services.');
  }
}

checkEnvVars(); 