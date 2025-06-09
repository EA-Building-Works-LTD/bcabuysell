// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const https = require('https');
const querystring = require('querystring');

// Log all environment variables
console.log('=== Environment Variables ===');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET (first 5 chars):', process.env.GOOGLE_CLIENT_SECRET?.substring(0, 5) + '...');
console.log('\n');

// Verify credentials are set
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
  process.exit(1);
}

// Extract OAuth client details for validation
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`;

console.log('=== OAuth Configuration ===');
console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);

// Directly attempt to exchange with Google's token endpoint
console.log('\n=== Testing Google OAuth Token Endpoint ===');
console.log('This will simulate a token request to verify your credentials are valid');

// Create a test code - this is just for testing the endpoint, not a real exchange
const testAuthCode = 'test_auth_code';

// Prepare the request body
const tokenRequestBody = querystring.stringify({
  code: testAuthCode,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  grant_type: 'authorization_code'
});

// Prepare the HTTP request options
const tokenRequestOptions = {
  hostname: 'oauth2.googleapis.com',
  port: 443,
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(tokenRequestBody)
  }
};

console.log('Testing credentials with Google...');

// Make the request to Google's token endpoint
const req = https.request(tokenRequestOptions, (res) => {
  let responseData = '';
  
  // Collect the response data
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  // Process the complete response
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      console.log('Status Code:', res.statusCode);
      console.log('Response:', response);
      
      // Expected response for an invalid code but valid client credentials
      // would be a 400 with an "invalid_grant" error
      if (res.statusCode === 400 && response.error === 'invalid_grant') {
        console.log('\n✅ GOOD NEWS: Your Google client credentials are valid!');
        console.log('The "invalid_grant" error is expected since we used a fake auth code.');
        console.log('\nThe error in your app is likely caused by:');
        console.log('1. OAuth consent screen configuration issues');
        console.log('2. Redirect URI mismatch (check exact spelling)');
        console.log('3. Missing test users if your app is in "Testing" mode');
      } 
      // If we get "invalid_client", the credentials are wrong
      else if (response.error === 'invalid_client') {
        console.log('\n❌ ERROR: Your Google client credentials are invalid!');
        console.log('This matches the error you\'re seeing in your app.');
        console.log('\nTo fix this:');
        console.log('1. Double-check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
        console.log('2. Ensure there are no extra spaces or quotes in your .env.local file');
        console.log('3. Try creating new OAuth credentials in Google Cloud Console');
      } 
      // Other errors
      else {
        console.log('\n❓ INCONCLUSIVE: Received an unexpected response');
        console.log('Please check your Google Cloud Console configuration');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

// Handle request errors
req.on('error', (error) => {
  console.error('Request error:', error);
});

// Send the request body
req.write(tokenRequestBody);
req.end(); 