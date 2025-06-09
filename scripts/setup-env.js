#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔥 Firebase Environment Variables Setup 🔥\n');
console.log('This script will help you set up your Firebase environment variables.');
console.log('Please have your Firebase config object ready from your Firebase project settings.\n');
console.log('Instructions:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Click on the gear icon (⚙️) and select "Project settings"');
console.log('4. Scroll down to "Your apps" section and select your web app');
console.log('5. Under "SDK setup and configuration", select "Config" to see your Firebase configuration\n');

const questions = [
  {
    name: 'apiKey',
    prompt: 'Enter your Firebase API Key (firebaseConfig.apiKey): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_API_KEY'
  },
  {
    name: 'authDomain',
    prompt: 'Enter your Firebase Auth Domain (firebaseConfig.authDomain): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  },
  {
    name: 'projectId',
    prompt: 'Enter your Firebase Project ID (firebaseConfig.projectId): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  },
  {
    name: 'storageBucket',
    prompt: 'Enter your Firebase Storage Bucket (firebaseConfig.storageBucket): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  },
  {
    name: 'messagingSenderId',
    prompt: 'Enter your Firebase Messaging Sender ID (firebaseConfig.messagingSenderId): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  },
  {
    name: 'appId',
    prompt: 'Enter your Firebase App ID (firebaseConfig.appId): ',
    envVar: 'NEXT_PUBLIC_FIREBASE_APP_ID'
  }
];

const config = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(question.prompt, (answer) => {
    if (!answer.trim()) {
      console.log(`⚠️ ${question.envVar} cannot be empty. Please try again.`);
      askQuestion(index);
      return;
    }
    
    // Remove any quotes from the input
    answer = answer.replace(/["']/g, '');
    
    config[question.name] = answer;
    askQuestion(index + 1);
  });
}

function generateEnvFile() {
  const envFilePath = path.join(process.cwd(), '.env.local');
  const envContent = questions.map(q => `${q.envVar}=${config[q.name]}`).join('\n');

  fs.writeFile(envFilePath, envContent, (err) => {
    if (err) {
      console.error('❌ Error writing .env.local file:', err);
      rl.close();
      return;
    }

    console.log('\n✅ .env.local file has been created successfully!');
    console.log(`📝 File location: ${envFilePath}`);
    console.log('\n🚀 You can now run your Next.js application with:');
    console.log('   npm run dev');
    
    // Add to .gitignore if it's not already there
    try {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignoreContent.includes('.env.local')) {
          fs.appendFileSync(gitignorePath, '\n# Local environment variables\n.env.local\n');
          console.log('\n✅ Added .env.local to .gitignore');
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not update .gitignore. Please ensure .env.local is not committed to your repository.');
    }
    
    rl.close();
  });
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Start the Q&A process
askQuestion(0); 