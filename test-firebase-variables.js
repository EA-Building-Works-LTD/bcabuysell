// test-firebase-variables.js
// This script checks what Firebase environment variables are being loaded

require('dotenv').config({ path: '.env.local' });

console.log('Checking Firebase environment variables...\n');
console.log('Raw environment variable values:');
console.log('-------------------------------------');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'NOT FOUND');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT FOUND');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT FOUND');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NOT FOUND');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'NOT FOUND');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'NOT FOUND');
console.log('-------------------------------------\n');

// Check for common issues
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.log('❌ API KEY is not being loaded from .env.local');
  
  // Try to check if the file exists
  const fs = require('fs');
  
  try {
    if (fs.existsSync('.env.local')) {
      console.log('✅ .env.local file exists');
      
      // Check file content
      const content = fs.readFileSync('.env.local', 'utf8');
      
      console.log('\nChecking .env.local file content:\n');
      
      // Look for common formatting issues
      if (content.includes('NEXT_PUBLIC_FIREBASE_API_KEY=')) {
        console.log('✅ API KEY is defined in the file');
        
        // Check for quoting issues
        if (content.includes('NEXT_PUBLIC_FIREBASE_API_KEY="') || 
            content.includes('NEXT_PUBLIC_FIREBASE_API_KEY=\'')) {
          console.log('❌ API KEY has quotes around it - remove them');
        }
        
        // Check for whitespace issues
        if (content.includes('NEXT_PUBLIC_FIREBASE_API_KEY = ')) {
          console.log('❌ API KEY has spaces around the = sign - remove them');
        }
      } else {
        console.log('❌ API KEY is not defined in the file');
      }
      
      // Check for BOM (Byte Order Mark) - can cause issues with .env files
      const hasBOM = content.charCodeAt(0) === 0xFEFF;
      if (hasBOM) {
        console.log('❌ Your .env.local file has a BOM (Byte Order Mark) which can cause issues');
        console.log('   Try recreating the file in a simple text editor like Notepad');
      }
      
      // Check for other encoding issues
      try {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('NEXT_PUBLIC_FIREBASE_API_KEY=')) {
            console.log(`Line ${i+1} with API KEY:`, JSON.stringify(line));
            console.log('Characters in API KEY value:');
            
            const value = line.substring(line.indexOf('=') + 1);
            for (let j = 0; j < value.length; j++) {
              console.log(`  Char ${j}: ${value[j]} (code: ${value.charCodeAt(j)})`);
            }
          }
        }
      } catch (e) {
        console.log('Error analyzing file content:', e);
      }
      
    } else {
      console.log('❌ .env.local file does not exist in the current directory');
      console.log('Current directory:', process.cwd());
    }
  } catch (err) {
    console.error('Error checking for .env.local file:', err);
  }
}

// Try to print Next.js runtime config to see if it works differently
console.log('\nChecking if this is a Next.js environment issue:');

// Check if we can load directly from node process
console.log('\nChecking Node.js process.env:');
console.log('NEXT_PUBLIC_ variables should be accessible in both Node.js and browser');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Next.js specific check
try {
  if (typeof window !== 'undefined') {
    console.log('\nRunning in browser environment');
    // Try to access env vars through Next public runtime config if in browser
    console.log('Public runtime config:', window.__NEXT_DATA__?.runtimeConfig?.publicRuntimeConfig || 'NOT AVAILABLE');
  } else {
    console.log('\nRunning in Node.js environment');
  }
} catch (e) {
  console.log('Not running in Next.js environment');
}

console.log('\nTry recreating your .env.local file with exactly these lines:');
console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA8ehLTOVc1XFmQn0J2M8W7TUID5nWZ64A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bca-buy-sell-deafa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bca-buy-sell-deafa
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bca-buy-sell-deafa.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=303887781198
NEXT_PUBLIC_FIREBASE_APP_ID=1:303887781198:web:7a9323dee4c34dd67f4a1f
`);
console.log('\nMake sure there are no spaces, quotes, or hidden characters in the file');
console.log('After recreating the file, restart your Next.js server with: npm run dev'); 