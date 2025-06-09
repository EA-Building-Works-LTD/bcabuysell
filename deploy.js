// Simple deployment script to rebuild and redeploy the app
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 BCA Buy Sell Deployment Script 🚀\n');
console.log('This script will help you rebuild and redeploy your application.\n');

// Function to execute commands with error handling
function runCommand(command, description) {
  console.log(`\n📌 ${description}...`);
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Main deployment function
async function deploy() {
  // Step 1: Clean build artifacts
  if (!runCommand('npm run clean', 'Cleaning previous build artifacts')) {
    console.log('Creating clean script...');
    // If clean script doesn't exist, create it in package.json
    runCommand('npm set-script clean "rm -rf .next out"', 'Adding clean script to package.json');
    runCommand('npm run clean', 'Cleaning previous build artifacts');
  }
  
  // Step 2: Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    console.error('Failed to install dependencies. Aborting deployment.');
    process.exit(1);
  }
  
  // Step 3: Build the application
  if (!runCommand('npm run build', 'Building application')) {
    console.error('Build failed. Please fix the errors and try again.');
    process.exit(1);
  }
  
  // Ask if user wants to deploy to Vercel
  rl.question('\nDo you want to deploy to Vercel now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\nDeploying to Vercel...');
      
      // Ask for environment check
      rl.question('\nHave you set the FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Vercel? (y/n): ', (envAnswer) => {
        if (envAnswer.toLowerCase() !== 'y' && envAnswer.toLowerCase() !== 'yes') {
          console.log('\n⚠️ WARNING: Firebase Admin SDK environment variables not set!');
          console.log('Please make sure to set these variables in Vercel before deploying:');
          console.log('  - FIREBASE_CLIENT_EMAIL (from Firebase service account)');
          console.log('  - FIREBASE_PRIVATE_KEY (from Firebase service account, with quotes and \\n)');
          
          rl.question('\nContinue deployment anyway? (y/n): ', (continueAnswer) => {
            if (continueAnswer.toLowerCase() === 'y' || continueAnswer.toLowerCase() === 'yes') {
              runVercelDeploy();
            } else {
              console.log('\nDeployment canceled. Please set the environment variables and try again.');
              rl.close();
            }
          });
        } else {
          runVercelDeploy();
        }
      });
    } else {
      console.log('\nSkipping deployment to Vercel.');
      console.log('You can deploy manually using: vercel --prod');
      rl.close();
    }
  });
}

function runVercelDeploy() {
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('\n❌ Vercel CLI not found. Installing...');
    runCommand('npm install -g vercel', 'Installing Vercel CLI');
  }
  
  // Deploy to Vercel
  if (runCommand('vercel --prod', 'Deploying to Vercel')) {
    console.log('\n✅ Deployment completed successfully!');
  } else {
    console.error('\n❌ Deployment failed. Please check the errors above.');
  }
  
  rl.close();
}

// Start deployment process
deploy(); 