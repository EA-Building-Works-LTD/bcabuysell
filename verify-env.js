/**
 * This script verifies that your environment variables are correctly set up
 * Run with: node verify-env.js
 */

const fs = require('fs');
const path = require('path');

// Define the expected environment variables
const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MONGODB_URI'
];

// Function to check if a variable exists and is not empty
const checkVariable = (name, value) => {
  if (!value || value.trim() === '') {
    console.error(`❌ ${name} is missing or empty`);
    return false;
  }
  console.log(`✓ ${name} is set`);
  return true;
};

// Function to load environment from .env.local file
const loadEnvFile = () => {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found in project root!');
      return null;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      
      // Parse KEY=VALUE format
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        env[key] = value;
      }
    });

    return env;
  } catch (error) {
    console.error('Error reading .env.local file:', error.message);
    return null;
  }
};

// Main function
const main = () => {
  console.log('🔍 Checking environment variables...\n');

  // Load environment variables from .env.local
  const envVars = loadEnvFile();
  if (!envVars) {
    console.error('\n📋 Please create a .env.local file with the following variables:');
    requiredVars.forEach(v => console.log(`  - ${v}`));
    process.exit(1);
  }

  // Check if all required variables are present
  let missingVars = false;
  requiredVars.forEach(name => {
    if (!checkVariable(name, envVars[name])) {
      missingVars = true;
    }
  });

  // Special checks for Google credentials
  if (envVars.GOOGLE_CLIENT_ID && !envVars.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
    console.warn('⚠️ GOOGLE_CLIENT_ID does not look like a valid Google Client ID. It should end with .apps.googleusercontent.com');
    missingVars = true;
  }

  // Special checks for NextAuth URL
  if (envVars.NEXTAUTH_URL && !envVars.NEXTAUTH_URL.startsWith('http')) {
    console.warn('⚠️ NEXTAUTH_URL does not look like a valid URL. It should start with http:// or https://');
    missingVars = true;
  }

  // Results
  console.log('\n📋 Summary:');
  if (missingVars) {
    console.error('❌ Some environment variables are missing or invalid. Please fix them and try again.');
    console.log('\nFormat your .env.local file like this:');
    console.log(`
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database
`);
  } else {
    console.log('✅ All required environment variables are set correctly!');
    console.log('If you are still experiencing issues, make sure your Google OAuth credentials are correct and the API is enabled.');
  }
};

// Run the main function
main(); 